const jwt = require('jsonwebtoken');
const client = require('../config/db');
const secretKey = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(403).json({ message: 'Access denied, no token provided.' });
    }

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        const tokenCheck = await client.query('SELECT * FROM active_tokens WHERE user_id = $1 AND token = $2', [decoded.id, token]);
        if (tokenCheck.rows.length === 0) {
            return res.status(401).json({ message: 'Token invalid or expired.' });
        }

        req.user = decoded;
        next();
    });
};

module.exports = verifyToken;