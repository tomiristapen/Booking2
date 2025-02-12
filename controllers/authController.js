const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../config/db');
const secretKey = process.env.JWT_SECRET_KEY;

const register = async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const emailCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            'INSERT INTO users (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, surname, email, hashedPassword]
        );

        const userId = result.rows[0].id;

        const userProfile = { id: userId, name, surname, email, tickets: [] };

        res.status(200).json({ success: true, message: 'Registration successful!', profile: userProfile });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ success: false, message: 'There was an error saving the user.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const userQuery = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const deviceId = req.headers['user-agent'];
        const token = jwt.sign({ id: user.id, email: user.email, deviceId }, secretKey, { expiresIn: '1h' });

        await client.query('DELETE FROM active_tokens WHERE user_id = $1', [user.id]);

        await client.query('INSERT INTO active_tokens (user_id, token, device_id) VALUES ($1, $2, $3)', [user.id, token, deviceId]);

        const userProfile = { id: user.id, name: user.name, surname: user.surname, email: user.email, tickets: [] };

        res.status(200).json({ token, message: 'Login successful!', profile: userProfile });
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { register, login };