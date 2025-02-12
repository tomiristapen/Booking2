const client = require('../config/db');

const createPayment = async (req, res) => {
    const { user_id, card_number_last4, card_holder_name, expiry_date, payment_date } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO payments (user_id, card_number_last4, card_holder_name, expiry_date, payment_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [user_id, card_number_last4, card_holder_name, expiry_date, payment_date]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Error creating payment', err);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};

module.exports = { createPayment };