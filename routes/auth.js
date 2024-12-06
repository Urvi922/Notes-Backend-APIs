const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

//Signup API
router.post('/signup', authController.signup);

//Login API 
router.post('/login', authController.login);

//Logout API 
router.post('/logout', authController.logout);

module.exports = router;