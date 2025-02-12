const express = require('express');
const router = express.Router();
const userRoutes = require('./user.routes');
const trainRoutes = require('./train.routes');
const bookingRoutes = require('./booking.routes');

router.use('/users', userRoutes);
router.use('/trains', trainRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;