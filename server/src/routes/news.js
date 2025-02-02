const express = require('express');
const { getNews, getNewById } = require('../controllers/newsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getNews);
router.get('/:id', getNewById);

module.exports = router; 