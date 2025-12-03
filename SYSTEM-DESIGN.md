# 🌌 KAAL SETHU - System Design Documentation

> *Connecting Past to Future through Technology*

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Frontend Layer](#frontend-layer)
4. [Backend Layer](#backend-layer)
5. [AI Integration Layer](#ai-integration-layer)
6. [Database Layer](#database-layer)
7. [Cloud Storage Layer](#cloud-storage-layer)
8. [Request Flow](#request-flow)
9. [Key Design Decisions](#key-design-decisions)
10. [Environment Configuration](#environment-configuration)

---

## 🎯 System Overview

**KAAL SETHU** is an immersive time-travel web application that allows users to explore different decades through a 3D galaxy interface. The system combines modern web technologies with AI-powered content generation to create historically accurate, engaging experiences.

### Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, CSS3, Three.js, GSAP, Vanilla JavaScript |
| **Backend** | Node.js, Express.js, ES Modules |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 2.0 Flash |
| **Storage** | Azure Blob Storage |
| **Auth** | JWT, bcrypt |
| **Deployment** | Vercel |

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KAAL SETHU ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   Express    │────▶│  Middleware  │────▶│  Controller  │
│   (Client)   │     │   Server     │     │  (Auth/Val)  │     │   (Logic)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                           ┌──────────────────────────────────────────┼────────┐
                           │                                          ▼        │
                           │  ┌──────────────┐     ┌──────────────┐           │
                           │  │   Supabase   │◀───▶│   Gemini AI  │           │
                           │  │  (Database)  │     │  (Content)   │           │
                           │  └──────────────┘     └──────────────┘           │
                           │                                                   │
                           │  ┌──────────────┐                                │
                           │  │  Azure Blob  │                                │
                           │  │  (Storage)   │                                │
                           │  └──────────────┘                                │
                           └───────────────────────────────────────────────────┘
```

---

## 🌐 Frontend Layer

### 1. Three.js 3D Galaxy Visualization

**File:** `index.html`, `time-explorer.html`

```javascript
// Three.js scene setup for immersive space experience
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

// Create dense star field
const starsCount = 20000;
const starsGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 2000;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true
});
starsMaterial.blending = THREE.AdditiveBlending;
```

**💡 WHY Three.js?**
- Enables WebGL-powered 3D graphics without low-level WebGL code
- Large community and extensive documentation
- Built-in support for particles, lighting, and camera controls
- Perfect for creating immersive space environments

---

### 2. Shooting Stars Animation

**File:** `index.html` (CSS + JavaScript)

```css
/* CSS Animation for shooting star effect */
@keyframes shootingStar {
    0% {
        transform: translateX(0) translateY(0);
        opacity: 1;
    }
    100% {
        transform: translateX(300px) translateY(300px);
        opacity: 0;
    }
}

.shooting-star {
    position: fixed;
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, rgba(255,255,255,0), #fff);
    animation: shootingStar 3s ease-out forwards;
    pointer-events: none;
}
```

```javascript
// Dynamic shooting star creation
function createShootingStar() {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = Math.random() * window.innerWidth + 'px';
    star.style.top = Math.random() * (window.innerHeight / 2) + 'px';
    star.style.transform = `rotate(${45 + Math.random() * 20}deg)`;
    document.body.appendChild(star);
    
    setTimeout(() => star.remove(), 3000);
}

// Spawn shooting stars periodically with probability
setInterval(() => {
    if (Math.random() > 0.5) {
        createShootingStar();
    }
}, 5000);
```

**💡 WHY CSS Animations?**
- GPU-accelerated for smooth 60fps performance
- No JavaScript overhead during animation
- Easy to customize timing and easing
- Works seamlessly across all modern browsers

---

### 3. GSAP Animation Library

**File:** `index.html`, `time-explorer.html`

```javascript
// Smooth camera zoom into galaxy
gsap.to(camera.position, {
    z: 5,
    duration: 10,
    ease: "power1.in",
    onComplete: () => {
        navigateToDecade();
    }
});

// Fade in elements with stagger
gsap.from('.decade-card', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.1,
    ease: "back.out(1.7)"
});

// Timeline for complex sequences
const tl = gsap.timeline();
tl.to('.hero-title', { opacity: 1, y: 0, duration: 1 })
  .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
  .to('.cta-button', { opacity: 1, scale: 1, duration: 0.6 }, "-=0.3");
```

**💡 WHY GSAP?**
- Professional-grade animations with precise timing control
- Powerful easing functions and timeline sequencing
- Better performance than CSS for complex animations
- Cross-browser consistency

---

## 🚀 Backend Layer

### 1. Express Server Setup

**File:** `server.js`

```javascript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES Module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());                          // Enable CORS for all routes
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));  // Serve static files

// Routes
import authRoutes from './backend/routes/authRoutes.js';
import decadesRoutes from './backend/routes/decades.js';
import chatbotRoutes from './backend/routes/chatbot.js';

app.use('/api/auth', authRoutes);
app.use('/api/decades', decadesRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
```

**💡 WHY Express.js?**
- Lightweight and unopinionated framework
- Massive ecosystem of middleware
- Easy to set up and maintain
- Perfect for REST APIs and static file serving
- Excellent documentation and community support

---

### 2. JWT Authentication

**File:** `backend/controllers/authController.js`

```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/UserSupabase.js';

// Register new user
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
```

**💡 WHY JWT + bcrypt?**
- **JWT**: Stateless authentication, no server-side session storage needed
- **JWT**: Easily scalable across multiple servers
- **bcrypt**: Industry-standard password hashing with salt
- **bcrypt**: Configurable cost factor for future-proofing

---

### 3. Middleware Protection

**File:** `backend/middleware/authMiddleware.js`

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/UserSupabase.js';

export const protect = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to request
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Usage in routes
// app.get('/api/profile', protect, getProfile);
```

**💡 WHY Middleware Pattern?**
- Clean separation of authentication logic from business logic
- Reusable across multiple routes
- Easy to test independently
- Follows Express.js conventions

---

## 🤖 AI Integration Layer

### 1. Google Gemini AI Integration

**File:** `backend/utils/llmClient.js`

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function generateYearContent(year) {
    const prompt = `Generate detailed historical content for the year ${year}.
    
    Return a JSON object with the following structure:
    {
        "music": ["Popular songs and artists"],
        "events": ["Major world events"],
        "fashion": ["Fashion trends"],
        "technology": ["Tech innovations"],
        "dailyLife": ["What daily life was like"],
        "funFacts": ["Interesting trivia"]
    }
    
    Be historically accurate and engaging.`;
    
    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Invalid JSON response');
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

export async function generateChatResponse(message, year, context) {
    const prompt = `You are a knowledgeable historian specializing in the year ${year}.
    
    Context about ${year}:
    ${JSON.stringify(context)}
    
    User question: ${message}
    
    Provide an informative, engaging response about life in ${year}.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
}
```

**💡 WHY Gemini 2.0 Flash?**
- Fast response times for real-time applications
- Large context window for historical data
- Excellent at structured JSON output
- Cost-effective for high-volume requests
- Strong factual accuracy for historical content

---

### 2. RAG (Retrieval Augmented Generation) Helper

**File:** `backend/utils/ragHelper.js`

```javascript
import fs from 'fs/promises';
import path from 'path';

// Cache for loaded context data
const contextCache = new Map();

export async function getHistoricalContext(year) {
    // Calculate decade
    const decade = Math.floor(year / 10) * 10;
    
    // Check cache first
    if (contextCache.has(decade)) {
        return contextCache.get(decade);
    }
    
    try {
        const filePath = path.join(process.cwd(), 'data', 'culture', `${decade}.json`);
        const data = await fs.readFile(filePath, 'utf-8');
        const context = JSON.parse(data);
        
        // Cache for future requests
        contextCache.set(decade, context);
        
        return context;
    } catch (error) {
        console.warn(`No context file for decade ${decade}`);
        return null;
    }
}

export async function enrichPromptWithContext(basePrompt, year) {
    const context = await getHistoricalContext(year);
    
    if (!context) {
        return basePrompt;
    }
    
    return `
Historical Context for ${year}:
${JSON.stringify(context, null, 2)}

---

${basePrompt}
`;
}
```

**💡 WHY RAG Pattern?**
- Grounds AI responses in verified historical data
- Reduces hallucination in AI outputs
- Allows for curated, fact-checked content
- Combines AI creativity with factual accuracy
- Improves response relevance for specific years

---

## 💾 Database Layer

### 1. Supabase Configuration

**File:** `backend/config/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Test connection
supabase.from('users').select('count').single()
    .then(() => console.log('✅ Supabase connected'))
    .catch(err => console.error('❌ Supabase error:', err.message));
```

**💡 WHY Supabase?**
- PostgreSQL database with modern features
- Built-in authentication system
- Real-time subscriptions out of the box
- Row Level Security (RLS) for data protection
- Free tier perfect for development
- Easy migration from Firebase

---

### 2. User Model

**File:** `backend/models/UserSupabase.js`

```javascript
import { supabase } from '../config/supabase.js';

class User {
    static async create({ name, email, password }) {
        const { data, error } = await supabase
            .from('users')
            .insert([{ name, email, password }])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
    
    static async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, created_at')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async update(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
}

export default User;
```

**💡 WHY This Pattern?**
- Fluent API makes queries readable and maintainable
- Static methods encapsulate database logic
- Error handling at the model level
- Easy to switch database providers if needed
- Consistent interface across all models

---

### 3. Database Schema

**File:** `backend/config/supabase-schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Capsules table
CREATE TABLE time_capsules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    media_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts table
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    decade INTEGER NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view public capsules" ON time_capsules
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own capsules" ON time_capsules
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**💡 WHY This Schema Design?**
- **UUID**: Prevents ID enumeration attacks
- **RLS**: Security enforced at database level, not just application
- **Foreign Keys**: Referential integrity with CASCADE delete
- **Timestamps**: Audit trail for all records
- **Indexes**: Optimized for common query patterns

---

## ☁️ Cloud Storage Layer

### Azure Blob Storage Integration

**File:** `backend/routes/upload.js`

```javascript
import { BlobServiceClient } from '@azure/storage-blob';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Initialize Azure Blob client
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient('timecapsule-files');

export const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const filename = `${uuidv4()}-${file.originalname}`;
        
        // Get blob client
        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        
        // Upload file
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype
            }
        });
        
        // Return public URL
        const url = blockBlobClient.url;
        
        res.json({
            message: 'File uploaded successfully',
            url,
            filename
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

// Route setup
// router.post('/upload', protect, upload.single('file'), uploadFile);
```

**💡 WHY Azure Blob Storage?**
- **Scalability**: Handles files of any size
- **CDN Integration**: Global edge caching for fast delivery
- **Cost Effective**: Pay only for what you use
- **Security**: SAS tokens for temporary access
- **Redundancy**: Multiple copies across data centers

**💡 WHY Multer?**
- Industry standard for handling multipart/form-data
- Memory storage for direct cloud upload (no temp files)
- Built-in file filtering and size limits
- Easy integration with Express

---

## 🔄 Request Flow

### Complete Request Lifecycle

```
1. CLIENT REQUEST
   ├── Browser sends HTTPS request
   └── Headers include JWT token

2. EXPRESS SERVER (server.js:3000)
   ├── CORS middleware validates origin
   └── JSON parser processes body

3. ROUTE MATCHING
   ├── /api/auth/* → authRoutes
   ├── /api/decades/* → decadesRoutes
   └── /api/chatbot/* → chatbotRoutes

4. MIDDLEWARE CHAIN
   ├── protect() - Validates JWT
   ├── Extracts user from token
   └── Attaches to req.user

5. CONTROLLER
   ├── Validates input
   ├── Calls appropriate service
   └── Handles errors

6. SERVICE LAYER
   ├── Database queries (Supabase)
   ├── AI generation (Gemini)
   └── File operations (Azure)

7. RESPONSE
   ├── JSON formatted
   ├── Appropriate status code
   └── Error messages if failed
```

### Example: Chat Message Flow

```javascript
// 1. Client sends message
POST /api/chatbot/message
Headers: { Authorization: 'Bearer <token>' }
Body: { message: "What was popular music in 1985?", year: 1985 }

// 2. Middleware validates token
// 3. Controller processes request
// 4. RAG loads 1980s context
// 5. Gemini generates response
// 6. Response returned to client
Response: {
    response: "In 1985, popular music included...",
    sources: ["data/culture/1980.json"]
}
```

---

## 🎯 Key Design Decisions

### 1. Monolithic Architecture

**Decision:** Single Express server handles all functionality

**Rationale:**
- ✅ Simple deployment to Vercel
- ✅ Easy debugging and development
- ✅ Lower operational complexity
- ✅ Faster initial development
- ✅ No inter-service communication overhead

**Trade-offs:**
- ❌ Scaling requires scaling entire app
- ❌ Single point of failure

---

### 2. AI-First Content Generation

**Decision:** Dynamic content via Gemini API instead of pre-generated

**Rationale:**
- ✅ No need to pre-generate content for all years (1900-2024)
- ✅ Fresh, contextual responses
- ✅ Scales to any historical period
- ✅ Personalized interactions
- ✅ Reduced storage requirements

**Trade-offs:**
- ❌ API costs for each request
- ❌ Latency for AI responses
- ❌ Potential for AI inaccuracies

---

### 3. Security-First Database Design

**Decision:** Supabase with Row Level Security

**Rationale:**
- ✅ Data isolation per user at database level
- ✅ SQL injection prevention built-in
- ✅ Secure password storage with bcrypt
- ✅ Defense in depth approach
- ✅ Auditable access patterns

---

### 4. Hybrid Storage Strategy

**Decision:** Azure Blob for media, Supabase for structured data

**Rationale:**
- ✅ Optimized for each data type
- ✅ No file size limits on server
- ✅ Global CDN for media delivery
- ✅ Cost-effective storage tiers
- ✅ Better separation of concerns

---

## 🔐 Environment Configuration

### Required Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database - Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-anon-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI - Google Gemini
GEMINI_API_KEY=your-gemini-api-key

# Storage - Azure Blob
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER=timecapsule-files
```

### Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/asneem1234/kaalsethu.git
cd kaalsethu

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Fill in environment variables
# Edit .env with your credentials

# 5. Run database migrations
# Execute supabase-schema.sql in Supabase SQL editor

# 6. Start development server
npm start
```

---

## 📊 Performance Considerations

| Component | Optimization | Benefit |
|-----------|-------------|---------|
| Three.js | BufferGeometry | Reduced memory usage |
| Stars | AdditiveBlending | Better visual quality |
| API | Response caching | Faster repeat requests |
| Images | Azure CDN | Global edge delivery |
| Database | Connection pooling | Better concurrency |
| AI | Gemini Flash | Lower latency |

---

## 🚀 Deployment

### Vercel Configuration

**File:** `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

## 📝 Conclusion

KAAL SETHU's architecture balances simplicity with scalability, using modern technologies to create an immersive time-travel experience. The combination of Three.js for visuals, Gemini AI for content, and Supabase for data management provides a solid foundation for future growth.

---

*✨ KAAL SETHU - Connecting Past to Future ✨*
