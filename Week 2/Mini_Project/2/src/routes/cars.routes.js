const express = require('express');
const router = express.Router();

const carsController = require('../controllers/cars.controller');
const auth = require('../middleware/auth');

// GET all cars with filters
router.get('/', carsController.getAllCars);

// GET car by ID
router.get('/:id', carsController.getCarById);

// POST create a new car (protected)
router.post('/', auth.authenticate, auth.authorize('admin'), carsController.createCar);

// PUT update a car (protected)
router.put('/:id', auth.authenticate, auth.authorize('admin'), carsController.updateCar);

// DELETE a car (protected)
router.delete('/:id', auth.authenticate, auth.authorize('admin'), carsController.deleteCar);

module.exports = router;
