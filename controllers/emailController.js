const nodemailer = require('nodemailer');
const crypto = require('crypto');
const client = require('../config/db');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationCode = async (req, res) => {
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
};

const verifyCode = async (req, res) => {
    const { email, code } = req.body;

    const result = await client.query('SELECT * FROM verification_codes WHERE email = $1', [email]);
    const verification = result.rows[0];

    if (!verification) return res.status(400).json({ error: 'Код не найден. Запросите новый.' });

    if (new Date() > verification.expires_at) {
        await client.query('DELETE FROM verification_codes WHERE email = $1', [email]);
        return res.status(400).json({ error: 'Код истек. Запросите новый.' });
    }

    if (verification.code !== code) {
        return res.status(400).json({ error: 'Неверный код' });
    }

    await client.query(`
        UPDATE payments SET verified = TRUE WHERE user_id = (SELECT id FROM users WHERE email = $1) AND verified = FALSE
    `, [email]);

    await client.query('DELETE FROM verification_codes WHERE email = $1', [email]);

    res.json({ message: 'Код подтвержден, платеж авторизован' });
};

module.exports = { sendVerificationCode, verifyCode };