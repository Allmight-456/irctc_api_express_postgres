// app/routes/train.routes.js
const express = require('express');
const router = express.Router();
const prisma = require('../../prisma/client');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getAvailableTrains } = require('../services/train.service');

// Get all trains
router.get('/', async (req, res) => {
    try {
        const trains = await prisma.train.findMany();
        res.json(trains);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new train (admin only)
router.post('/', authenticateToken, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }

    try {
        const { trainNumber, name, source, destination, seats, fare } = req.body;
        const train = await prisma.train.create({
            data: {
                trainNumber,
                name,
                source,
                destination,
                seats: parseInt(seats),
                fare: parseFloat(fare)
            }
        });
        res.status(201).json(train);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Train number already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Seat Availability
router.get('/availability', authenticateToken, async (req, res) => {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ message: 'Source and destination are required' });
  }

  try {
      const trains = await getAvailableTrains(source, destination);
      const result = trains.map(train => ({
          train_id: train.id,
          train_name: train.name,
          available_seats: train.availableSeats,
      }));
      res.json(result);
  } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;