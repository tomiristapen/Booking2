const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();
const { getAccessToken, getAirportCodeByCityOrAirport, searchFlights } = require('./amadeus');


const nodemailer = require('nodemailer');
const app = express();
const port = 3006;
const secretKey = process.env.JWT_SECRET_KEY
const crypto = require('crypto');



const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database successfully.');
    })
    .catch((err) => {
        console.error('Failed to connect to PostgreSQL database:', err.message);
        process.exit(1);
    });

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

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


let userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    tickets: [
        "Flight from New York to Los Angeles on 2024-12-20",
        "Train from San Francisco to Seattle on 2024-11-15",
        "Bus from Chicago to Detroit on 2024-10-10"
    ]
};


app.post('/api/register', async (req, res) => {
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
});


app.post('/api/auth/login', async (req, res) => {
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
});

app.post('/api/auth/logout', verifyToken, async (req, res) => {
    try {
        await client.query('DELETE FROM active_tokens WHERE user_id = $1 AND token = $2', [req.user.id, req.header('Authorization').replace('Bearer ', '')]);
        res.json({ message: 'Successfully logged out.' });
    } catch (error) {
        console.error('Error during logout:', error.message);
        res.status(500).json({ message: 'Error logging out.' });
    }
});


app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
    res.redirect('/profile');
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'profile.html'));
});

app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from token
        const userQuery = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];

        if (user) {
            const userProfile = {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                tickets: [] // Add logic if tickets are stored in the database
            };
            res.json(userProfile);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});


app.post('/api/profile', verifyToken, async (req, res) => {
    const { name, surname, email } = req.body;
    try {
        const result = await client.query(
            'UPDATE users SET name = $1, surname = $2, email = $3 WHERE id = $4 RETURNING id',
            [name, surname, email, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Error updating profile' });
    }
});



app.get('/api/flights', async (req, res) => {
    const { origin, destination, date } = req.query;

    try {
        const flights = await searchFlights(origin, destination, date);
        res.json({ data: flights });
    } catch (error) {
        console.error('Error fetching flights:', error.message);
        res.status(500).send('Error fetching flight data');
    }
});

app.post('/api/flights', async (req, res) => {
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
});


app.post('/api/passengers', async (req, res) => {
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
});

app.post('/api/payments', async (req, res) => {
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
});


app.post('/api/tickets', async (req, res) => {
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
});

app.get('/api/tickets/history', verifyToken, async (req, res) => {
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
});




app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));

const transporter = nodemailer.createTransport({
    host: "smtp.mail.ru", // Указываем хост Mail.ru
    port: 465, // Используем 465 (SSL) или 587 (TLS)
    secure: true, // true для 465 (SSL), false для 587 (TLS)
    auth: {
        user: process.env.EMAIL_USER, // Ваш email
        pass: process.env.EMAIL_PASS, // Пароль для внешних приложений
    },
});


app.post('/api/send-verification-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email обязателен' });

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await client.query(`
        INSERT INTO verification_codes (email, code, expires_at)
        VALUES ($1, $2, $3)
            ON CONFLICT (email) DO UPDATE
            SET code = $2, expires_at = $3
    `, [email, code, expiresAt]);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Код подтверждения оплаты',
        text: `Ваш код подтверждения: ${code}\nЭтот код действителен в течение 5 минут.`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Код отправлен' });
    } catch (error) {
        console.error('Ошибка отправки email:', error);
        res.status(500).json({ error: 'Ошибка при отправке email' });
    }
});

app.post('/api/verify-code', async (req, res) => {
    const { email, code } = req.body;

    try {
        const result = await client.query('SELECT * FROM verification_codes WHERE email = $1', [email]);
        const verification = result.rows[0];

        if (!verification) {
            return res.status(400).json({ error: 'Код не найден. Запросите новый.' });
        }

        if (new Date() > verification.expires_at) {
            await client.query('DELETE FROM verification_codes WHERE email = $1', [email]);
            return res.status(400).json({ error: 'Код истёк. Запросите новый.' });
        }

        if (verification.code !== code) {
            return res.status(400).json({ error: 'Неверный код' });
        }

        // 📌 Подтверждаем платёж в базе данных
        await client.query(`
            UPDATE payments 
            SET verified = TRUE 
            WHERE user_id = (SELECT id FROM users WHERE email = $1) AND verified = FALSE
        `, [email]);

        // 📌 Удаляем использованный код
        await client.query('DELETE FROM verification_codes WHERE email = $1', [email]);

        res.json({ message: 'Код подтверждён, платёж авторизован!' });
    } catch (error) {
        console.error('Ошибка верификации кода:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.listen(3000, () => console.log("Сервер запущен на порту 3000"));



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});