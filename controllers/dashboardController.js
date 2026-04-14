
const Item = require('../models/Item');

const getDashboard = async (req, res) => {
  try {
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const totalMatches = await Item.countDocuments({ matches: { $exists: true, $ne: [] } });
    
    res.json({ totalLost, totalFound, totalMatches });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = { getDashboard };

