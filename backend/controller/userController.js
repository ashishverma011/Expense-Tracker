const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../db/userModel');
const { error, success } = require('../utils/handler');

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    return typeof password === 'string' && password.length >= 6;
};

const validateUsername = (username) => {
    return typeof username === 'string' && username.trim().length >= 3;
};

const signupController = async (req, res) => {
    try {
        const username = String(req.body.username || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!username || !email || !password)
            return res.send(error(400, 'All fields are required'));
        if (!validateUsername(username))
            return res.send(error(400, 'Username must be at least 3 characters'));
        if (!validateEmail(email))
            return res.send(error(400, 'Please enter a valid email address'));
        if (!validatePassword(password))
            return res.send(error(400, 'Password must be at least 6 characters'));

        const existing = await userModel.findOne({ email });
        if (existing)
            return res.send(error(400, 'Email already registered'));

        const hashed = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hashed });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.send(success(201, { token, user: { _id: user._id, username: user.username, email: user.email, budget: user.budget } }));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const loginController = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!email || !password)
            return res.send(error(400, 'Email and password required'));
        if (!validateEmail(email))
            return res.send(error(400, 'Please enter a valid email address'));
        if (!validatePassword(password))
            return res.send(error(400, 'Password must be at least 6 characters'));

        const user = await userModel.findOne({ email });
        if (!user)
            return res.send(error(401, 'User not found. Please sign up'));

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.send(error(401, 'Invalid password'));

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.send(success(200, { token, user: { _id: user._id, username: user.username, email: user.email, budget: user.budget } }));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const updateBudget = async (req, res) => {
    try {
        const { budget } = req.body;
        const user = await userModel.findByIdAndUpdate(req.userId, { budget }, { new: true });
        return res.send(success(200, { budget: user.budget }));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        return res.send(success(200, user));
    } catch (err) {
        return res.send(error(500, err.message));
    }
};

module.exports = { signupController, loginController, updateBudget, getProfile };
