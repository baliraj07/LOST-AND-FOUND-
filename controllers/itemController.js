
const Item = require('../models/Item');
const upload = require('../utils/multerConfig');

const postItem = async (req, res) => {
  try {
    const { title, description, location, date, type } = req.body;
    const userId = req.user._id;
    
    const newItem = new Item({
      title,
      description,
      location,
      date: new Date(date),
      type,
      user: userId,
      image: req.file ? `/uploads/${req.file.filename}` : `https://source.unsplash.com/400x300/?${encodeURIComponent(title.toLowerCase())}`
    });
    
    await newItem.save();
    
    // Smart matching for LOST items
    if (type === 'lost') {
      const matches = await Item.find({
        type: 'found',
        title: { $regex: title, $options: 'i' },
        location: { $regex: location, $options: 'i' }
      }).populate('user', 'name email');
      
      newItem.matches = matches.map(m => m._id);
      await newItem.save();
    }
    
    const item = await Item.findById(newItem._id)
      .populate('user', 'name email')
      .populate({
        path: 'matches',
        populate: { path: 'user', select: 'name email' }
      });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { type, limit } = req.query;
    const query = type ? { type } : {};
    const limitNum = limit ? parseInt(limit) : undefined;
    const items = await Item.find(query)
      .populate('user', 'name email')
      .populate({
        path: 'matches',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(limitNum);
    res.json(items);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'matches',
        populate: { path: 'user', select: 'name email' }
      });
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { postItem, getItems, getItem };

