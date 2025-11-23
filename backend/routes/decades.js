import express from 'express';
import { generateYearContent } from '../utils/llmClient.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Generate year-specific historical content
router.post('/api/generate-year-content', async (req, res) => {
    try {
        console.log("Generate year content API request received:", req.body);

        const { year } = req.body;

        if (!year) {
            return res.status(400).json({ error: "Missing year in request body" });
        }

        // Validate year range
        if (year < 1950 || year > 2025) {
            return res.status(400).json({ error: "Year must be between 1950 and 2025" });
        }

        console.log(`Generating content for year: ${year}`);

        let content;
        try {
            content = await generateYearContent(year);
            console.log("Content generated successfully for year:", year);
        } catch (generationError) {
            console.error("Error generating content:", generationError);
            return res.status(500).json({ 
                error: "Error generating AI content",
                details: generationError.message 
            });
        }

        res.json({ 
            success: true,
            year: year,
            content: content
        });

    } catch (error) {
        console.error("API Error in /api/generate-year-content:", error);
        res.status(500).json({ 
            error: "Internal server error", 
            details: error.message 
        });
    }
});

export default router;
