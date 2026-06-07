const jwt = require('jsonwebtoken');
const { error } = require('./handler');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.send(error(401, 'No token provided'));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        return res.send(error(401, 'Invalid token'));
    }
};

module.exports = authMiddleware;
