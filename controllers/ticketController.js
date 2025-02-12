const client = require('../config/db');

const createTicket = async (req, res) => {
    const { user_id, flight_id, passenger_id, seat_number, payments_id } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO tickets (user_id, flight_id, passenger_id, seat_number, payments_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [user_id, flight_id, passenger_id, seat_number, payments_id]
        );
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error('Error creating ticket', err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

const getTicketHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const ticketQuery = await client.query(`
            SELECT 
                f.direction, 
                f.price, 
                f.departuredate, 
                COUNT(t.id) AS passenger_count,
                json_agg(
                    json_build_object(
                        'first_name', p.first_name,
                        'last_name', p.last_name,
                        'seat_number', t.seat_number
                    )
                ) AS passengers
            FROM tickets t
            JOIN flights f ON t.flight_id = f.id
            JOIN passengers p ON t.passenger_id = p.id
            WHERE t.user_id = $1
            GROUP BY f.direction, f.price, f.departuredate
            ORDER BY f.departuredate DESC
        `, [userId]);

        res.json({ tickets: ticketQuery.rows });
    } catch (error) {
        console.error('Ошибка при получении истории билетов:', error.message);
        res.status(500).json({ message: 'Ошибка при получении истории билетов' });
    }
};

module.exports = { createTicket, getTicketHistory };