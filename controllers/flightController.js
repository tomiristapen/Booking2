const { searchFlights } = require('../amadeus');
const client = require('../config/db');

const getFlights = async (req, res) => {
    const { origin, destination, date } = req.query;

    try {
        const flights = await searchFlights(origin, destination, date);
        res.json({ data: flights });
    } catch (error) {
        console.error('Error fetching flights:', error.message);
        res.status(500).send('Error fetching flight data');
    }
};

const createFlight = async (req, res) => {
    const { departureDate, price, direction } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO flights (departureDate, price, direction) VALUES ($1, $2, $3) RETURNING id',
            [departureDate, price, direction]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Error creating flight', err);
        res.status(500).json({ error: 'Failed to create flight' });
    }
};

module.exports = { getFlights, createFlight };