const rentalsService = require('../services/rentals.services');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

const validateRentalInput = asyncHandler(async (req, res, next) => {
    const { carID, customer, from, to } = req.body;

    if (!carID || !customer || !customer.name || !customer.email || !from || !to) {
        throw new HttpError(400, 'Missing required rental fields.');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
        throw new HttpError(400, 'Invalid customer email format.');
    }

    // Date format and logic validation (YYYY-MM-DD)
    const dateFormatRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    if (!dateFormatRegex.test(from) || !dateFormatRegex.test(to)) {
        throw new HttpError(400, 'Invalid date format. Use YYYY-MM-DD.');
    }

    const parsedStartDate = new Date(from);
    const parsedEndDate = new Date(to);

    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        throw new HttpError(400, 'Invalid date.');
    }

    if (parsedStartDate >= parsedEndDate) {
        throw new HttpError(400, 'Start date must be before end date.');
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((parsedEndDate - parsedStartDate) / oneDay));
    if (diffDays < 1) {
        throw new HttpError(400, 'Rental duration must be at least 1 day.');
    }

    next();
});

exports.getAllRentals = asyncHandler(async (req, res) => {
    const filteredRentals = await rentalsService.getAllRentals(req.query);
    res.json(filteredRentals);
});

exports.getRentalById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const rental = await rentalsService.getRentalById(id);
        res.json(rental);
    } catch (error) {
        if (error.message === 'Rental not found') {
            throw new HttpError(404, error.message);
        } else {
            throw error;
        }
    }
});

exports.createRental = [
    validateRentalInput,
    asyncHandler(async (req, res) => {
        try {
            const newRental = await rentalsService.createRental(req.body);
            res.status(201).json(newRental);
        } catch (error) {
            let statusCode = 500; // Default to Internal Server Error
            if (error.message === 'Car not found' || error.message === 'Rental not found') {
                statusCode = 404;
            } else if (error.message === 'Car is not available for rent.' || error.message === 'Car is already rented for the selected dates.' || error.message.includes('Invalid date') || error.message.includes('Start date must be before end date') || error.message.includes('Rental duration must be at least 1 day')) {
                statusCode = 400;
            }
            throw new HttpError(statusCode, error.message);
        }
    })
];

exports.returnCar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const rental = await rentalsService.returnCar(id);
        res.json({ message: 'Car returned and rental status updated', rental });
    } catch (error) {
        let statusCode = 500;
        if (error.message === 'Rental not found') {
            statusCode = 404;
        } else if (error.message === 'Rental is already returned or cancelled.') {
            statusCode = 400;
        }
        throw new HttpError(statusCode, error.message);
    }
});

exports.cancelRental = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const rental = await rentalsService.cancelRental(id);
        res.json({ message: 'Rental cancelled successfully', rental });
    } catch (error) {
        let statusCode = 500;
        if (error.message === 'Rental not found') {
            statusCode = 404;
        } else if (error.message === 'Rental is already returned or cancelled.') {
            statusCode = 400;
        }
        throw new HttpError(statusCode, error.message);
    }
});
