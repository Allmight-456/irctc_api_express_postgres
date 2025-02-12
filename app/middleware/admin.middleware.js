// app/middleware/admin.middleware.js
const config = require('../../config/config');
const db = require('../models')
const adminRequired = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'API Key is missing' });
    }

    if (apiKey !== config.apiKey) {
        return res.status(401).json({ message: 'Invalid API Key' });
    }


    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required!' });
    }

    next();
};

module.exports = { adminRequired };