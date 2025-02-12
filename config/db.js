const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database successfully.');
    })
    .catch((err) => {
        console.error('Failed to connect to PostgreSQL database:', err.message);
        process.exit(1);
    });

module.exports = client;