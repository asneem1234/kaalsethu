import fs from 'fs';
import path from 'path';

export function getContextFromDecade(decade) {
    try {
        const filePath = path.join(process.cwd(), 'data', `${decade}.json`);
        console.log(`Looking for data file at: ${filePath}`);
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Extract all relevant information from the JSON data
        let context = {
            stories: data.stories?.map(s => ({title: s.title, text: s.text})) || [],
            culture: data.culture?.map(c => ({topic: c.topic, text: c.text})) || [],
            lifestyle: data.lifestyle?.map(l => ({topic: l.topic, text: l.text})) || [],
            currency: data.currency?.map(c => ({name: c.name, value: c.value})) || [],
            food: data.food?.map(f => ({topic: f.topic, text: f.text})) || [],
            phrases: data.phrases?.map(p => ({phrase: p.phrase, meaning: p.meaning})) || []
        };
        
        console.log(`Successfully loaded context for ${decade}`);
        return context;
    } catch (error) {
        console.error(`Error loading context for decade ${decade}:`, error);
        // Return minimal context to avoid breaking the application
        return {
            stories: [{
                title: `Life in the ${decade}s`, 
                text: `This was an interesting time period.`
            }],
            phrases: [{
                phrase: "Common greeting",
                meaning: "How people greeted each other"
            }]
        };
    }
}
