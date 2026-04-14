# Deployment TODO

## [ ] 1. MongoDB Atlas Setup
- Sign up at cloud.mongodb.com
- Create free M0 cluster
- Create DB user
- Whitelist 0.0.0.0/0
- Get connection string → Update .env

## [x] 2. Local Test (npm install done)
- Copy .env.example → .env, fill MONGO_URI (Atlas), JWT_SECRET
- `npm start`
- Test http://localhost:5001 (register/upload/check dashboard)

## [ ] 3. Git Push
- `git add .`
- `git commit -m "Prepare deployment"`
- `git push origin main`

## [ ] 4. Deploy Render
- render.com → New Web Service → Connect GitHub repo
- Runtime: Node
- Build: `npm install`
- Start: `npm start`
- Env vars: MONGO_URI, JWT_SECRET, UPLOAD_PATH=./uploads
- Deploy → Get URL

## [ ] 5. Test Deployed App
- Visit URL
- Register/login
- Post lost/found item w/ image
- Check dashboard matching

Updated as steps complete.

