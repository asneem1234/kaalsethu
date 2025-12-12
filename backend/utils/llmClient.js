import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define valid models - Using Gemini 2.5 Flash Lite only
const MODELS = [
  "gemini-2.5-flash-lite" // Latest Gemini 2.5 Flash Lite model
];

export async function generateChatResponse(context, userQuestion, decade) {
    console.log("Called generateChatResponse with models:", MODELS);
    console.trace("Stack trace for generateChatResponse call:");

    // Make sure context is stringified
    let contextString;
    try {
        contextString = JSON.stringify(context, null, 2);
    } catch (err) {
        contextString = String(context); // fallback just in case
    }
    
    // Truncate context if very large
    const trimmedContext = contextString.length > 2000 
        ? contextString.slice(0, 2000) + "..." 
        : contextString;

    const prompt = `You are a friendly Indian person living in ${decade}, casually chatting. 
Use the following historical context to inform your responses:
${trimmedContext}

User question: ${userQuestion}

Respond in a conversational, period-appropriate way as someone from the ${decade}s India.`;

    let lastError = null;

    for (const modelName of MODELS) {
        try {
            console.log(`\nAttempting to use model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            let retries = 0;
            const maxRetries = 3;

            while (retries <= maxRetries) {
                try {
                    // Race with timeout
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timeout')), 30000)
                    );

                    const result = await Promise.race([
                        model.generateContent(prompt),
                        timeoutPromise
                    ]);

                    console.log(`✅ Successfully generated response using ${modelName}`);
                    return result.response.text();
                } catch (err) {
                    // Retry on rate limit
                    if (err.status === 429 && retries < maxRetries) {
                        retries++;
                        const delay = Math.pow(2, retries) * 1000;
                        console.log(`⚠️ Rate limited. Retrying in ${delay / 1000} seconds... (${retries}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err) {
            console.error(`❌ Error with model ${modelName}:`, err.message || err);
            lastError = err;

            if (modelName === MODELS[MODELS.length - 1]) {
                console.error("🚨 All models failed. Last error:", err);
                return "I'm sorry, I'm having trouble connecting to my knowledge system right now. Please try again in a few moments.";
            } else {
                console.log(`➡️ Falling back to next available model...`);
            }
        }
    }

    // If loop exits without return, throw last error
    throw lastError || new Error("Failed to generate response with any model.");
}

// Validate content specificity - ensures AI generated year-specific content
function validateYearSpecificity(content, year) {
    const validationErrors = [];
    const yearStr = year.toString();

    // Check if content mentions the specific year
    const contentStr = JSON.stringify(content).toLowerCase();
    if (!contentStr.includes(yearStr)) {
        validationErrors.push("Content does not mention the specific year");
    }

    // Validate major events have specific dates
    if (content.majorEvents && Array.isArray(content.majorEvents)) {
        content.majorEvents.forEach((event, index) => {
            if (!event.date || !event.date.includes(yearStr)) {
                validationErrors.push(`Event ${index + 1} missing specific ${year} date`);
            }
        });
    } else {
        validationErrors.push("Missing or invalid majorEvents structure");
    }

    // Check music hits exist and have descriptions
    if (!content.music || !content.music.hits || content.music.hits.length < 2) {
        validationErrors.push("Insufficient music hits (need at least 2)");
    }

    // Check for generic phrases that indicate non-specific content
    const genericPhrases = [
        "throughout the decade",
        "during this era",
        "in these years",
        "the entire decade",
        "this period saw"
    ];
    
    genericPhrases.forEach(phrase => {
        if (contentStr.includes(phrase.toLowerCase())) {
            validationErrors.push(`Generic phrase detected: "${phrase}"`);
        }
    });

    // Calculate specificity score (0-100)
    let specificityScore = 100;
    specificityScore -= validationErrors.length * 10; // -10 per error
    
    // Bonus points for year mentions
    const yearMentions = (contentStr.match(new RegExp(yearStr, 'g')) || []).length;
    specificityScore += Math.min(yearMentions * 2, 20); // Up to +20 for multiple year mentions

    specificityScore = Math.max(0, Math.min(100, specificityScore));

    return {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        specificityScore: specificityScore,
        requiresRegeneration: specificityScore < 60
    };
}

// Generate comprehensive year-specific content for the feed templates
export async function generateYearContent(year) {
    console.log(`Generating comprehensive content for year: ${year}`);

    const decade = Math.floor(year / 10) * 10;
    
    const prompt = `You are a historian specializing in Indian history. Generate HIGHLY SPECIFIC content ONLY about the year ${year} in India.

⚠️ CRITICAL REQUIREMENTS - CONTENT MUST BE ${year}-SPECIFIC:
1. ALL events MUST include the exact year ${year} in dates (format: "Month ${year}" or "Season ${year}")
2. ALL songs/movies MUST be released specifically in ${year}
3. ALL fashion trends MUST be specific to ${year}, not general ${decade}s trends
4. ALL technology MUST be innovations from ${year} specifically
5. DO NOT use phrases like "during the decade", "throughout the era", "in these years"
6. MENTION the year ${year} multiple times throughout the content
7. Include EXACT dates where possible (e.g., "January 15, ${year}", "March ${year}")

Provide detailed information in the following JSON format:

{
    "introduction": "A 2-3 paragraph introduction SPECIFICALLY about ${year} in India. Must mention ${year} at least 3 times. Highlight specific events, cultural moments, and significance of THIS EXACT YEAR ${year}.",
    "music": {
        "hits": [
            {"title": "Exact song name released in ${year}", "description": "Specific details about this ${year} song - who sang it, film name if applicable, why it was significant in ${year}"},
            {"title": "Another ${year} hit song", "description": "Details specific to ${year}"},
            {"title": "Third ${year} popular song", "description": "More ${year} specifics"}
        ],
        "trends": ["Music trend specific to ${year}", "Genre popular in ${year}", "Artist who dominated ${year}"]
    },
    "majorEvents": [
        {"date": "January ${year}", "title": "Specific event name", "description": "DETAILED description of what happened in this month of ${year} and its impact"},
        {"date": "March ${year}", "title": "Another event", "description": "What happened in ${year} specifically"},
        {"date": "June ${year}", "title": "Major milestone", "description": "Significance of this ${year} event"},
        {"date": "October ${year}", "title": "Important occurrence", "description": "Impact on India in ${year}"}
    ],
    "fashion": {
        "mens": ["Fashion trend popular among Indian men in ${year}", "Specific clothing style of ${year}", "Accessory trend in ${year}"],
        "womens": ["Women's fashion in India during ${year}", "Saree style of ${year}", "Modern trend emerging in ${year}"],
        "accessories": ["Popular accessory in ${year}", "Jewelry trend specific to ${year}"]
    },
    "ideologies": {
        "political": ["Political movement or ideology dominant in ${year} India", "Government policy focus in ${year}"],
        "social": ["Social movement active in ${year}", "Cultural shift happening in ${year} India"],
        "economic": ["Economic policy of ${year} India", "Business trend in ${year}"]
    },
    "technology": {
        "innovations": ["Technology introduced or popular in India in ${year}", "Scientific achievement of ${year}", "Modern convenience arriving in ${year}"],
        "dailyLife": ["How ${year} technology affected Indian homes", "Communication method in ${year} India"]
    },
    "dailyLife": {
        "morning": "Describe a typical morning for an Indian family in ${year}. Be specific to ${year} - mention technologies, routines, breakfast habits of that exact year.",
        "afternoon": "Typical afternoon in ${year} India - work culture, school life, lunch routines specific to ${year}.",
        "evening": "Evening activities in ${year} - entertainment options, family time, TV shows or radio programs of ${year}.",
        "lifestyle": ["Lifestyle aspect unique to ${year}", "Daily habit common in ${year} India", "Social norm of ${year}"]
    },
    "memories": [
        {"name": "Indian name", "city": "Indian city", "memory": "A vivid personal memory from ${year} mentioning specific events, songs, or moments from that year (3-4 sentences, must feel authentic to ${year})"},
        {"name": "Another Indian name", "city": "Different city", "memory": "Another ${year}-specific memory with details"},
        {"name": "Third Indian name", "city": "Another city", "memory": "Emotional memory from ${year} with specific details"}
    ]
}

STRICT REQUIREMENTS:
✅ Every section MUST reference ${year} specifically
✅ Use actual historical events from ${year}
✅ Reference real movies, songs, politicians, events from ${year} India
✅ Include EXACT DATES (Month ${year}) for all major events
✅ Memories must feel authentic to someone who lived through ${year}
✅ NO generic decade-wide content - ONLY ${year}
❌ DO NOT say "throughout the ${decade}s" or "during this decade"
❌ DO NOT include content from other years in the ${decade}s
❌ DO NOT be vague - be SPECIFIC to ${year}

Return ONLY valid JSON, no additional text or markdown.`;

    let lastError = null;

    for (const modelName of MODELS) {
        try {
            console.log(`Attempting to generate year content using model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            let retries = 0;
            const maxRetries = 3;

            while (retries <= maxRetries) {
                try {
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Request timeout')), 45000) // Longer timeout for comprehensive content
                    );

                    const result = await Promise.race([
                        model.generateContent(prompt),
                        timeoutPromise
                    ]);

                    const responseText = result.response.text();
                    console.log(`✅ Successfully generated year content using ${modelName}`);
                    
                    // Parse JSON response
                    let parsedContent;
                    try {
                        // Remove markdown code blocks if present
                        let cleanedResponse = responseText.trim();
                        if (cleanedResponse.startsWith('```json')) {
                            cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
                        } else if (cleanedResponse.startsWith('```')) {
                            cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
                        }
                        
                        parsedContent = JSON.parse(cleanedResponse);
                    } catch (parseError) {
                        console.error("❌ Error parsing JSON response:", parseError);
                        console.log("Raw response:", responseText);
                        throw new Error("Failed to parse AI response as JSON");
                    }

                    // Validate year specificity
                    const validation = validateYearSpecificity(parsedContent, year);
                    console.log(`📊 Content Specificity Score: ${validation.specificityScore}/100`);
                    
                    if (validation.errors.length > 0) {
                        console.warn(`⚠️ Validation warnings for ${year}:`, validation.errors);
                    }

                    // Reject if specificity score is too low
                    if (validation.requiresRegeneration) {
                        console.error(`❌ Content too generic (score: ${validation.specificityScore}). Errors:`, validation.errors);
                        throw new Error(`Generated content not specific enough to ${year}. Score: ${validation.specificityScore}/100`);
                    }

                    console.log(`✅ Content validation passed! Specificity score: ${validation.specificityScore}/100`);
                    return parsedContent;

                } catch (err) {
                    if (err.status === 429 && retries < maxRetries) {
                        retries++;
                        const delay = Math.pow(2, retries) * 1000;
                        console.log(`⚠️ Rate limited. Retrying in ${delay / 1000} seconds... (${retries}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        throw err;
                    }
                }
            }
        } catch (err) {
            console.error(`❌ Error with model ${modelName}:`, err.message || err);
            lastError = err;

            if (modelName === MODELS[MODELS.length - 1]) {
                console.error("🚨 All models failed for year content generation. Last error:", err);
                // Return fallback content instead of throwing
                return generateFallbackContent(year);
            } else {
                console.log(`➡️ Falling back to next available model...`);
            }
        }
    }

    throw lastError || new Error("Failed to generate year content with any model.");
}

// Fallback content if AI generation fails
function generateFallbackContent(year) {
    const decade = Math.floor(year / 10) * 10;
    return {
        introduction: `The year ${year} was a significant period in India's history during the ${decade}s. This was a time of change and development across various aspects of Indian society, culture, and politics.`,
        music: {
            hits: [
                {"title": "Popular Song", "description": `A memorable song from ${year}`}
            ],
            trends: ["Film music dominated", "Radio was primary medium"]
        },
        majorEvents: [
            {"date": `${year}`, "title": "Historical Events", "description": `Significant events occurred in India during ${year}`}
        ],
        fashion: {
            mens: ["Traditional wear remained popular"],
            womens: ["Sarees and traditional attire"],
            accessories: ["Classic accessories"]
        },
        ideologies: {
            political: ["Post-independence development"],
            social: ["Traditional values"],
            economic: ["Economic development"]
        },
        technology: {
            innovations: ["Gradual technological progress"],
            dailyLife: ["Technology slowly entering daily life"]
        },
        dailyLife: {
            morning: `Mornings in ${year} India started early with traditional routines.`,
            afternoon: `Afternoons were spent at work or in daily activities.`,
            evening: `Evenings brought families together.`,
            lifestyle: ["Simple living", "Community focused"]
        },
        memories: [
            {"name": "Anonymous", "city": "India", "memory": `A memorable moment from ${year}`}
        ]
    };
}
