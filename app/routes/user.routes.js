const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateRegistration, validateLogin } = require('../utils/validation');
const { validationResult } = require('express-validator');

// Register
router.post('/register', validateRegistration, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                isAdmin: false
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register Admin (Protected by API_KEY)
router.post('/register-admin', async (req, res) => {
    // Verify API_KEY
    const apiKey = req.headers['api_key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                isAdmin: true  // This user will be an admin
            }
        });

        res.status(201).json({ message: 'Admin user registered successfully' });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Username already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { sub: user.id, isAdmin: user.isAdmin },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userDetails = {
            id: req.user.id,
            username: req.user.username,
            isAdmin: req.user.isAdmin,
        };
        res.json(userDetails);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;