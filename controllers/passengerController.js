const client = require('../config/db');

const createPassenger = async (req, res) => {
    const { user_id, first_name, last_name, second_name, email } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO passengers (user_id, first_name, last_name, second_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [user_id, first_name, last_name, second_name, email]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Error creating passenger', err);
        res.status(500).json({ error: 'Failed to create passenger' });
    }
};

module.exports = { createPassenger };