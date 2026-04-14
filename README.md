# Smart Lost and Found System

Full-stack web application with user auth, lost/found item reporting, smart matching, dashboard.

## Tech Stack
- Frontend: HTML/CSS/JS + Bootstrap 5
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- File Upload: Multer

## Local Setup

1. Copy `.env.example` to `.env` and update:
```
MONGO_URI=mongodb://localhost:27017/lostfound  # or MongoDB Atlas URI
JWT_SECRET=your_very_long_secret_key_here
PORT=5001
UPLOAD_PATH=./uploads
```

2. Install MongoDB locally or use MongoDB Atlas (recommended for deployment)

3. Install dependencies:
```bash
npm install
```

### 🌱 Seed Database (Dummy Data)
**Auto-seeding**: Runs on first `npm start` if DB empty.

**Manual seeding**:
```bash
node seedData.js          # Standalone
node server.js --seed     # Via server
```

**Test Credentials**:
- Email: `john@example.com` / Password: `password123`
- Email: `jane@example.com` / Password: `password123`

4. Run development server:
```bash
npm run dev    # or npm start
```

5. Open http://localhost:5001

## Features
- ✅ User register/login
- ✅ Post lost/found items with image upload
- ✅ Smart matching (title + location fuzzy match)
- ✅ Dashboard with stats
- ✅ Responsive Bootstrap UI
- ✅ JWT auth protected routes

## API Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/lost (multipart/form-data)
POST /api/found (multipart/form-data)
GET  /api/lost
GET  /api/found  
GET  /api/dashboard
```

## Deployment (Render/Railway)

1. Push to GitHub
2. Connect repo to Render/Railway
3. Set env vars (MONGO_URI with Atlas, JWT_SECRET)
4. Build command: `npm install`
5. Start command: `npm start`
6. Add PORT binding for Railway

## MongoDB Atlas Setup
1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist 0.0.0.0/0 (or your IP)
4. Get connection string for `.env`

## Folder Structure
```
├── controllers/     # Business logic
├── models/          # Mongoose schemas
├── middleware/      # Auth middleware
├── routes/          # Express routes
├── utils/           # Multer config
├── public/          # Frontend files
├── uploads/         # Images
├── server.js        # Entry point
├── package.json
└── README.md
```

Enjoy finding your lost items! 🚀

