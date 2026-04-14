
const express = require('express');
const { postItem, getItems, getItem } = require('../controllers/itemController');
const auth = require('../middleware/auth');
const upload = require('../utils/multerConfig');
const router = express.Router();

router.post('/', auth, upload.single('image'), (req, res, next) => postItem.call(this, { ...req, body: { ...req.body, type: 'lost' } }, res));
router.get('/', getItems);
router.get('/:id', getItem);

module.exports = router;

