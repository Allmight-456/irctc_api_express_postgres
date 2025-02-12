// app/routes/booking.routes.js
const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const { authenticateToken } = require('../middleware/auth.middleware');
const { validateBookSeat } = require('../utils/validation');
const { validationResult } = require('express-validator');

// Book a Seat
router.post('/', authenticateToken, validateBookSeat, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { trainId, seats } = req.body;
    const userId = req.user.id;

    try {
        const train = await prisma.train.findUnique({
            where: { id: parseInt(trainId) }
        });

        if (!train || train.seats < seats) {
            return res.status(400).json({ message: 'No seats available' });
        }

        const booking = await prisma.booking.create({
            data: {
                userId: userId,
                trainId: parseInt(trainId),
                seats: seats,
                status: 'CONFIRMED'
            }
        });

        // Update train seats
        await prisma.train.update({
            where: { id: parseInt(trainId) },
            data: { seats: train.seats - seats }
        });

        res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
        console.error("Error booking seat:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Booking Details
router.get('/:bookingId', authenticateToken, async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.id;

    try {
        const booking = await prisma.booking.findFirst({
            where: {
                id: parseInt(bookingId),
                userId: userId
            },
            include: {
                train: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found or not authorized' });
        }

        return res.json({
            bookingId: booking.id,
            trainName: booking.train.name,
            seats: booking.seats,
            status: booking.status,
            createdAt: booking.createdAt
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;