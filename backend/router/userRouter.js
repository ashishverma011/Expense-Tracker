const express = require('express');
const { signupController, loginController, updateBudget, getProfile } = require('../controller/userController');
const authMiddleware = require('../utils/authMiddleware');
const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/profile', authMiddleware, getProfile);
router.put('/budget', authMiddleware, updateBudget);

module.exports = router;
