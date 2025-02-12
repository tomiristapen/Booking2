const { sequelize } = require('../config/db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const createUser = async (username, email, hashedPassword) => {
    return await User.create({ username, email, password: hashedPassword });
};

const getUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

module.exports = { createUser, getUserByEmail };