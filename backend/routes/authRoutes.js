const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { login } = require('../controllers/authController');

// Public login route
router.post('/login', login);


module.exports = router;