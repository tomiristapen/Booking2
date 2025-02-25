const client = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const userQuery = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];

        if (user) {
            const userProfile = {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                tickets: []
            };
            res.json(userProfile);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

const updateProfile = async (req, res) => {
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
};

const renderProfilePage = async (req, res) => {
    try {
        const userId = req.user.id;
        const userQuery = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userQuery.rows[0];

        if (user) {
            const userProfile = {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                tickets: [] // Assuming you have a way to fetch tickets
            };
            res.render('profile', { profile: userProfile, message: req.query.message });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error rendering profile page:', error.message);
        res.status(500).json({ message: 'Error rendering profile page' });
    }
};


module.exports = { getProfile, updateProfile, renderProfilePage};