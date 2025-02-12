const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL ? { rejectUnauthorized: false } : false
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