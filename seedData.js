const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Item = require('./models/Item');

const seedDatabase = async () => {
  // Already connected via server.js
  try {
    // Clear DB
    await User.deleteMany({});
    await Item.deleteMany({});

    // Users
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10)
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10)
    });

    // Image URLs (better than base64)
    const airpodsImg = "https://images.unsplash.com/photo-1588156979435-379b9d802b4a";
    const walletImg = "https://images.unsplash.com/photo-1601597111158-2fceff292cdc";
    const backpackImg = "https://images.unsplash.com/photo-1581605405669-fcdf81165afa";
    const laptopImg = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8";
    const keysImg = "https://images.unsplash.com/photo-1583835746434-cf153467ab46";
    const umbrellaImg = "https://images.unsplash.com/photo-1507679799987-c73779587ccf";
    const chargerImg = "https://images.unsplash.com/photo-1580910051074-3eb694886505";

    // LOST ITEMS
    const lostItems = await Item.insertMany([
      {
        title: 'AirPods Pro',
        description: 'Lost earbuds at mall',
        location: 'Mall',
        date: new Date(),
        type: 'lost',
        image: airpodsImg,
        user: user1._id
      },
      {
        title: 'Wallet',
        description: 'Leather wallet',
        location: 'Park',
        date: new Date(),
        type: 'lost',
        image: walletImg,
        user: user2._id
      },
      {
        title: 'Backpack',
        description: 'Blue backpack',
        location: 'Bus stop',
        date: new Date(),
        type: 'lost',
        image: backpackImg,
        user: user1._id
      },
      {
        title: 'Laptop',
        description: 'Dell laptop',
        location: 'Library',
        type: 'lost',
        image: laptopImg,
        user: user2._id
      },
      {
        title: 'Car Keys',
        description: 'BMW keys',
        location: 'Parking',
        type: 'lost',
        image: keysImg,
        user: user1._id
      },
      {
        title: 'Umbrella',
        description: 'Black umbrella',
        location: 'Cafe',
        type: 'lost',
        image: umbrellaImg,
        user: user2._id
      },
      {
        title: 'Charger',
        description: 'USB-C charger',
        location: 'Gym',
        type: 'lost',
        image: chargerImg,
        user: user1._id
      }
    ]);

    // FOUND ITEMS + MATCHING
    const found1 = await Item.create({
      title: 'Found AirPods',
      description: 'Black AirPods case found in mall',
      location: 'City Mall',
      type: 'found',
      date: new Date(),
      image: airpodsImg,
      user: user2._id,
      matches: [lostItems[0]._id]
    });

    lostItems[0].matches = [found1._id];
    await lostItems[0].save();

    console.log('✅ Database Seeded Successfully!');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = { seedDatabase };
