
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, type: String,
  default: 'No description provided' },
  location: { type: String, type: String,
  default: 'Unknown location' },
  date: { type: Date, default: Date.now
 },
  image: String,
  type: { type: String, enum: ['lost', 'found'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);

