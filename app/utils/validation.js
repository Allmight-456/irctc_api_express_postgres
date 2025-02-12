const { body } = require('express-validator');

const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const validateAddTrain = [
  body('name').trim().notEmpty().withMessage('Train name is required'),
  body('source').trim().notEmpty().withMessage('Source station is required'),
  body('destination').trim().notEmpty().withMessage('Destination station is required'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
];

const validateBookSeat = [
    body('trainId').isInt().withMessage('Train ID must be an integer'),
    body('seats')
        .isInt({ min: 1 })
        .withMessage('Number of seats must be at least 1')
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateAddTrain,
    validateBookSeat
};