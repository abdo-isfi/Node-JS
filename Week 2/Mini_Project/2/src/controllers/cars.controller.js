const carsService = require('../services/cars.services');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

const validateCarInput = asyncHandler(async (req, res, next) => {
    const { brand, model, category, pricePerDay, plate } = req.body;

    if (!brand || !model || !category || !pricePerDay || !plate) {
        throw new HttpError(400, 'Missing required car fields.');
    }

    const validCategories = ['eco', 'sedan', 'suv', 'van'];
    if (!validCategories.includes(category.toLowerCase())) {
        throw new HttpError(400, 'Invalid car category. Must be one of: eco, sedan, suv, van.');
    }

    if (typeof pricePerDay !== 'number' || pricePerDay <= 0) {
        throw new HttpError(400, 'Price per day must be a positive number.');
    }

    // Check for unique plate (only for create, or if plate is updated for update)
    if (req.method === 'POST' || (req.method === 'PUT' && req.body.plate)) {
        const cars = await carsService.getAllCars({}); // Get all cars to check for plate uniqueness
        const existingCar = cars.find(car => car.plate.toLowerCase() === plate.toLowerCase() && car.id != req.params.id);
        if (existingCar) {
            throw new HttpError(409, 'Car with this plate already exists.');
        }
    }

    next();
});

exports.getAllCars = asyncHandler(async (req, res) => {
    const filteredCars = await carsService.getAllCars(req.query);
    res.json(filteredCars);
});

exports.getCarById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const car = await carsService.getCarById(id);
        res.json(car);
    } catch (error) {
        if (error.message === 'Car not found') {
            throw new HttpError(404, error.message);
        } else {
            throw error;
        }
    }
});

exports.createCar = [
    validateCarInput,
    asyncHandler(async (req, res) => {
        const newCar = await carsService.createCar(req.body);
        res.status(201).json(newCar);
    })
];

exports.updateCar = [
    validateCarInput,
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const updatedCar = await carsService.updateCar(id, req.body);
            res.json(updatedCar);
        } catch (error) {
            if (error.message === 'Car not found') {
                throw new HttpError(404, error.message);
            } else {
                throw error;
            }
        }
    })
];

exports.deleteCar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const car = await carsService.deleteCar(id);
        res.json({ message: 'Car availability set to false', car });
    } catch (error) {
        if (error.message === 'Car not found') {
            throw new HttpError(404, error.message);
        } else {
            throw error;
        }
    }
});
