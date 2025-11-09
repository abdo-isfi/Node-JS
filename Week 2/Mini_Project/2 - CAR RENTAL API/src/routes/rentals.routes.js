const express = require('express');
const router = express.Router();

const rentalsController = require('../controllers/rentals.controller');
const auth = require('../middleware/auth');

// GET all rentals with filters
router.get('/', rentalsController.getAllRentals);

// GET rental by IDrentles
router.get('/:id', rentalsController.getRentalById);

// POST create a new rental
router.post('/', auth.authenticate, auth.authorize('admin'), rentalsController.createRental);

// PUT return a car
router.put('/:id/return', auth.authenticate, auth.authorize('admin'), rentalsController.returnCar);

// DELETE cancel a rental
router.delete('/:id', auth.authenticate, auth.authorize('admin'), rentalsController.cancelRental);

module.exports = router;
