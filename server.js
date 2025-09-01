import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';

// Import routes - Fix path to point to backend/routes
import authRoutes from './backend/routes/authRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths - HTML files are in the same directory as server.js
const PUBLIC_DIR = __dirname;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 3 // Max 3 files
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Azure Blob Storage setup
let containerClient;
if (process.env.AZURE_STORAGE_CONNECTION_STRING && process.env.AZURE_CONTAINER_NAME) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);
        console.log('✅ Azure Blob Storage configured');
    } catch (error) {
        console.error('❌ Azure Blob Storage configuration failed:', error.message);
    }
}

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Time Capsule Schema
const timeCapsuleSchema = new mongoose.Schema({
    message: { type: String, required: true },
    recipientType: { type: String, required: true },
    recipientEmail: { type: String },
    openDate: { type: Date, required: true },
    audioFileUrl: { type: String },
    videoFileUrl: { type: String },
    imageFileUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    isSent: { type: Boolean, default: false }
});

// Create the model
const TimeCapsule = mongoose.model('TimeCapsule', timeCapsuleSchema);

// API Routes
app.use('/api/auth', authRoutes);

// Define the root route FIRST to ensure it takes priority
app.get('/', async (req, res) => {
    console.log('Root route accessed - attempting to serve landing.html');
    
    // Add no-cache headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    // Check if file exists first with detailed error logging
    const landingPath = path.join(__dirname, 'landing.html');
    console.log(`Full landing.html path: ${landingPath}`);
    console.log(`Does the file exist on disk? Checking...`);
    
    try {
        // Check if file exists
        const stats = await fs.stat(landingPath);
        console.log(`✅ landing.html found: ${stats.size} bytes, isFile: ${stats.isFile()}`);
        
        // List directory contents to verify
        console.log('Directory contents:');
        const files = await fs.readdir(__dirname);
        files.forEach(file => console.log(` - ${file}`));
        
        // Serve the file with absolute path to avoid any ambiguity
        console.log('Serving landing.html directly');
        return res.sendFile(landingPath, { dotfiles: 'allow' });
    } catch (err) {
        console.error(`❌ Error with landing.html: ${err.message}`);
        console.error(`Error code: ${err.code}`);
        
        // Show a clear error instead of falling back to index.html
        return res.status(404).send(`
            <h1>Error: landing.html not found</h1>
            <p>Could not find landing.html at: ${landingPath}</p>
            <p>Error: ${err.message}</p>
            <p>Please check the file location and server configuration.</p>
        `);
    }
});

// IMPORTANT: NOW add static middleware AFTER specific routes
// This ensures your route handlers take precedence over static file serving
app.use(express.static(PUBLIC_DIR, {
    index: false  // Disable automatic serving of index.html files
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Time Capsule Server is running', 
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/health',
            'POST /api/time-capsule',
            'GET /api/time-capsules',
            'GET /api/year'
        ]
    });
});

// Helper function to upload file to Azure Blob Storage
async function uploadToAzure(file, fileName) {
    try {
        if (!containerClient) {
            throw new Error('Azure Blob Storage not configured');
        }
        
        const blockBlobClient = containerClient.getBlockBlobClient(fileName);
        const uploadResponse = await blockBlobClient.upload(file.buffer, file.size, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype
            }
        });
        
        console.log(`✅ File uploaded to Azure: ${fileName}`);
        return blockBlobClient.url;
    } catch (error) {
        console.error('❌ Error uploading to Azure:', error);
        throw error;
    }
}

// API endpoint to get year data
app.get('/api/year', async (req, res) => {
    const year = parseInt(req.query.year);
    
    // Validate year
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
        return res.status(400).json({
            error: 'Invalid year. Please provide a year between 1900 and the near future.'
        });
    }

    try {
        // Determine decade based on the year
        const decade = Math.floor(year / 10) * 10;
        
        // Check if the decade template exists
        const templateFile = `${decade}.html`;
        const templatePath = path.join(__dirname, 'decades', templateFile);
        
        let templateExists = false;
        try {
            await fs.access(templatePath);
            templateExists = true;
        } catch (err) {
            // Template doesn't exist
            templateExists = false;
        }

        // Generate response data
        const response = {
            year,
            decade,
            template: templateExists ? templateFile : 'default.html',
            events: getEventsForYear(year),
            topSong: getTopSongForYear(year),
            fashionImage: getFashionImageForDecade(decade)
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error processing year request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions to generate sample data
function getEventsForYear(year) {
    return [
        `${year}: Major political event happened`,
        `${year}: Popular cultural milestone occurred`,
        `${year}: Significant technological advancement`,
        `${year}: Notable world event took place`
    ];
}

function getTopSongForYear(year) {
    const songsByDecade = {
        1950: 'Rock Around the Clock',
        1960: 'I Want to Hold Your Hand',
        1970: 'Stayin\' Alive',
        1980: 'Billie Jean',
        1990: 'Smells Like Teen Spirit',
        2000: 'Beautiful Day',
        2010: 'Rolling in the Deep',
        2020: 'Blinding Lights'
    };
    
    const decade = Math.floor(year / 10) * 10;
    return songsByDecade[decade] || 'Unknown';
}

function getFashionImageForDecade(decade) {
    return `/images/fashion-${decade}.jpg`;
}

// Test route to verify server operation
app.get('/test-server', (req, res) => {
    res.send(`
        <h1>Server Test Page</h1>
        <p>The server is running correctly.</p>
        <p>Server time: ${new Date().toISOString()}</p>
        <p>Looking for landing.html at: ${path.join(__dirname, 'landing.html')}</p>
    `);
});

// Now add specific static middleware for assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/decades', express.static(path.join(__dirname, 'decades')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve decade pages
app.get('/decades/:decade/*', (req, res) => {
    const decade = req.params.decade;
    const filePath = path.join(__dirname, `decades/${decade}/index.html`);
    res.sendFile(filePath);
});

// Create a specific route to serve decade templates directly
app.get('/decades/:template', async (req, res) => {
    const templatePath = path.join(__dirname, 'decades', req.params.template);
    
    try {
        await fs.access(templatePath);
        res.sendFile(templatePath);
    } catch (err) {
        res.status(404).send(`Template '${req.params.template}' not found`);
    }
});

// Handle time-explorer with template parameter
app.get('/time-explorer.html', async (req, res) => {
    const { template, year } = req.query;
    
    console.log(`Accessing time-explorer with params: year=${year}, template=${template}`);
    
    if (template) {
        try {
            // Check if the template file exists in the decades directory
            const templatePath = path.join(__dirname, 'decades', template);
            console.log(`Looking for template at: ${templatePath}`);
            
            // Check if file exists before trying to serve it
            await fs.access(templatePath);
            console.log(`Template file found, serving: ${templatePath}`);
            
            // If the template exists, serve it directly
            return res.sendFile(templatePath);
        } catch (err) {
            console.error(`Error serving template '${template}': ${err.message}`);
            // If template doesn't exist, fall back to default time-explorer.html
        }
    }
    
    console.log('Falling back to default time-explorer.html');
    // Default behavior - serve the regular time-explorer.html
    res.sendFile(path.join(__dirname, 'time-explorer.html'));
});

// POST route for time capsule form submission
app.post('/api/time-capsule', upload.fields([
    { name: 'audioFile', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 },
    { name: 'imageFile', maxCount: 1 }
]), async (req, res) => {
    console.log('📨 Received time capsule submission');
    console.log('📝 Form data:', {
        message: req.body.message ? `${req.body.message.substring(0, 50)}...` : 'No message',
        recipientType: req.body.recipientType,
        recipientEmail: req.body.recipientEmail,
        openDate: `${req.body.openDay}/${req.body.openMonth}/${req.body.openYear}`,
        files: req.files ? Object.keys(req.files) : 'No files'
    });
    
    try {
        const { message, recipientType, recipientEmail, openDay, openMonth, openYear } = req.body;
        
        // Validate required fields
        if (!message || !recipientType || !openDay || !openMonth || !openYear) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: message, recipientType, and date components are required' 
            });
        }

        // Validate recipient email if sending to someone else
        if (recipientType === 'other' && !recipientEmail) {
            console.log('❌ Missing recipient email');
            return res.status(400).json({ 
                success: false, 
                message: 'Recipient email is required when sending to someone else' 
            });
        }

        // Create the open date
        const openDate = new Date(parseInt(openYear), parseInt(openMonth) - 1, parseInt(openDay));
        console.log('📅 Open date:', openDate);
        
        // Validate that the date is at least 1 hour in the future
        const oneHourFromNow = new Date(Date.now() + (60 * 60 * 1000));
        if (openDate <= oneHourFromNow) {
            console.log('❌ Invalid date - must be in future');
            return res.status(400).json({ 
                success: false, 
                message: 'Open date must be at least 1 hour in the future' 
            });
        }

        // Prepare time capsule data
        const timeCapsuleData = {
            message,
            recipientType,
            recipientEmail: recipientType === 'other' ? recipientEmail : undefined,
            openDate
        };

        // Upload files to Azure Blob Storage if they exist
        const files = req.files;
        const timestamp = Date.now();

        if (files && files.audioFile && files.audioFile[0]) {
            const audioFile = files.audioFile[0];
            const audioFileName = `audio_${timestamp}_${audioFile.originalname}`;
            timeCapsuleData.audioFileUrl = await uploadToAzure(audioFile, audioFileName);
        }

        if (files && files.videoFile && files.videoFile[0]) {
            const videoFile = files.videoFile[0];
            const videoFileName = `video_${timestamp}_${videoFile.originalname}`;
            timeCapsuleData.videoFileUrl = await uploadToAzure(videoFile, videoFileName);
        }

        if (files && files.imageFile && files.imageFile[0]) {
            const imageFile = files.imageFile[0];
            const imageFileName = `image_${timestamp}_${imageFile.originalname}`;
            timeCapsuleData.imageFileUrl = await uploadToAzure(imageFile, imageFileName);
        }

        // Save to MongoDB
        const timeCapsule = new TimeCapsule(timeCapsuleData);
        await timeCapsule.save();
        
        console.log('✅ Time capsule saved to database');

        // Return success response
        res.json({
            success: true,
            message: 'Time capsule created successfully!',
            data: {
                id: timeCapsule._id,
                openDate: openDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            }
        });
    } catch (error) {
        console.error('❌ Error creating time capsule:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error: ' + error.message 
        });
    }
});

// Route to get all received time capsules for the authenticated user
app.get('/api/my-received-capsules', async (req, res) => {
    try {
        const userEmail = req.query.email;
        
        if (!userEmail) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const now = new Date();
        const query = { 
            recipientEmail: userEmail, 
            openDate: { $lte: now } 
        };

        // If model has isSent, require it to be true
        const hasIsSent = !!TimeCapsule.schema.path('isSent');
        if (hasIsSent) query.isSent = true;

        const capsules = await TimeCapsule.find(query)
            .select('message recipientEmail audioFileUrl videoFileUrl imageFileUrl openDate createdAt')
            .sort({ openDate: -1 })
            .lean();

        return res.json({ success: true, capsules });
    } catch (err) {
        console.error('Error fetching received capsules:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Route to get all time capsules (for testing)
app.get('/api/time-capsules', async (req, res) => {
    try {
        const timeCapsules = await TimeCapsule.find().sort({ createdAt: -1 });
        res.json({ success: true, data: timeCapsules });
    } catch (error) {
        console.error('Error fetching time capsules:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('🚨 Global error handler:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    console.log('❌ 404 - API endpoint not found:', req.path);
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Handle general 404s
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🌟 Time Capsule Server running on port ${PORT}`);
    console.log(`📱 Root URL: http://localhost:${PORT}/`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
