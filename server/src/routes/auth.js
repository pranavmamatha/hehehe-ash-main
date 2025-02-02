const express = require('express');
const { register, login, logout, updateTags, getTags } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.put('/tags', auth, updateTags);
router.get('/tags', auth, getTags);

module.exports = router; 