// const { Client } = require('pg');
// const dotenv = require('dotenv');
// dotenv.config();

// const client = new Client({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT || 5432,
// });

// client.connect()
//     .then(() => {
//         console.log('Connected to PostgreSQL database successfully.');
//     })
//     .catch((err) => {
//         console.error('Failed to connect to PostgreSQL database:', err.message);
//         process.exit(1);
//     });

// module.exports = client;


const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Use DATABASE_URL if provided, otherwise build it using other variables
const connectionString =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;

const client = new Client({
    connectionString,
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
