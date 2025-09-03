# Time Capsule Application

A digital time capsule and historical memory application that serves as a bridge between the past, present, and future. In this rapidly evolving era where we often progress so quickly, this application helps users preserve memories and explore the richness of bygone times.

## Project Vision

This project serves as a memory repository for the world. As we evolve and move forward at an increasingly rapid pace, we sometimes miss the simplicity and charm of days gone by. Time Capsule offers two main experiences:

1. **Future Messaging**: Users can send videos, images, text, or audio to their future selves or to someone in the future, creating a personal time capsule.

2. **Time Travel Experience**: Users can explore the past by clicking on the galaxy interface and "traveling" to a specific year (e.g., 1951). This reveals a rich template displaying information about that era, including:
   - Popular music and songs
   - Movies and entertainment
   - Cultural trends and phenomena
   - Prevailing ideologies
   - Fashion styles and trends
   - A community tab where users can share personal memories or family stories about that year (similar to conversations we have with our grandparents about their youth)

The application acts as a mini time travel experience, connecting generations and preserving cultural memory while allowing for personal storytelling.

## Features

- Create time capsules with text messages
- Upload audio, video, and image files
- Store files in Azure Blob Storage
- Save capsule data in MongoDB
- Schedule capsules to open at future dates
- Interactive galaxy interface for "time travel" exploration
- Historical templates for different decades and years
- Community sharing functionality for collective memories
- Responsive web interface with immersive 3D effects

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Make sure your `.env` file contains:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   MONGO_URI=your_mongodb_connection_string
   AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
   AZURE_CONTAINER_NAME=your_container_name
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   EMAIL_SERVICE=gmail
   ```

3. **Start the Server**
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser and go to `http://localhost:3000` to view the landing page
   Or go directly to the time explorer at `http://localhost:3000/time-explorer.html`

## API Endpoints

- `POST /api/time-capsule` - Create a new time capsule
- `GET /api/time-capsules` - Get all time capsules
- `GET /api/year/:year` - Get historical information for a specific year
- `POST /api/community/post` - Add a community memory post
- `GET /api/community/:year` - Get community memories for a specific year

## File Upload Limits

- Maximum file size: 50MB per file
- Supported formats:
  - Audio: any audio format
  - Video: any video format  
  - Images: any image format

## Project Philosophy

In our fast-paced world, this application serves as both a personal time capsule and a collective memory bank. It bridges generations by allowing users to preserve their experiences for the future while exploring and connecting with the past. Through its immersive interface and community features, Time Capsule creates a living historical archive that combines factual information with personal narratives, making history more relatable and preserving the richness of human experience across time.

## User Experience Journey

### For Future Messaging
1. Users create an account
2. They compose messages and upload media intended for future delivery
3. They select a recipient (themselves or others) and a future date
4. The content is securely stored until the scheduled delivery date

### For Historical Exploration
1. Users navigate to the main interface with the galaxy visualization
2. They select a year or decade they wish to explore
3. The application transports them to a rich historical template for that time period
4. Users can explore various aspects of life during that era through curated sections
5. They can contribute their own memories or family stories about that time period
6. Community contributions create a living, growing archive of personal historical narratives

## Technologies Used

- Node.js & Express.js
- MongoDB with Mongoose
- Azure Blob Storage
- Multer for file uploads
- Three.js for 3D galaxy visualization
- GSAP for smooth animations
- HTML5, CSS3, JavaScript (Frontend)

## Project Structure

```
/Time-Capsule/
├── server.js                 # Main server file
├── index.html                # Main landing page
├── landing.html              # Introduction page
├── time-explorer.html        # Time capsule creation interface
├── feed/                     # Historical content by decade
│   ├── 1950s.html
│   ├── 1960s_new.html
│   ├── 1970s.html
│   └── 1980s.html
├── decades/                  # Decade-specific exploration pages
│   ├── 1950/
│   ├── 1960/
│   └── ...
├── api/                      # API endpoints
├── backend/                  # Backend logic
├── css/                      # Styling files
├── js/                       # JavaScript files
├── assets/                   # Media assets
├── data/                     # Historical data
├── package.json              # Dependencies
├── .env                      # Environment variables
└── README.md                 # This file
```