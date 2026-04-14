const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db');
const { seedDatabase } = require('./seedData.js');

// Load env vars FIRST
dotenv.config({ path: '.env' });

console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

// Parse CLI args
const args = process.argv.slice(2);
const shouldSeed = args.includes('--seed');

// Create app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Optional seeding
async function maybeSeed() {
  if (shouldSeed) {
    console.log('🧑‍🌾 Manual seeding requested...');
    await seedDatabase();
    console.log('✅ Manual seeding completed.');
    return;
  }

  // Auto-seed if no users (for fresh DB)
  const mongoose = require('mongoose');
  const User = mongoose.model('User');
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('🧑‍🌾 No users found, auto-seeding database...');
    await seedDatabase();
    console.log('✅ Auto-seeding completed.');
  } else {
    console.log(`ℹ️  Database already has ${userCount} users, skipping auto-seed.`);
  }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lost', require('./routes/lost'));
app.use('/api/found', require('./routes/found'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server after DB connection
(async () => {
  await connectDB();
  await maybeSeed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`💡 Test users: john@example.com / jane@example.com (password: password123)`);
    console.log(`💡 Seed manually: node server.js --seed`);
  });
})();

