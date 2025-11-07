const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/jsonHandler');

const rentalsFilePath = path.join(__dirname, '../data/rentals.json');
const carsFilePath = path.join(__dirname, '../data/cars.json');

const readRentals = async () => await readJsonFile(rentalsFilePath);

const writeRentals = async (rentals) => await writeJsonFile(rentalsFilePath, rentals);

const readCars = async () => await readJsonFile(carsFilePath);

const writeCars = async (cars) => await writeJsonFile(carsFilePath, cars);

exports.getAllRentals = async (query) => {
    const { status, from, to, carId } = query;
    let rentals = await readRentals();

    let filteredRentals = rentals.filter(rental => {
        let match = true;

        if (status && rental.status !== status) {
            match = false;
        }
        if (from && new Date(rental.from) < new Date(from)) {
            match = false;
        }
        if (to && new Date(rental.to) > new Date(to)) {
            match = false;
        }
        if (carId && rental.carID != carId) {
            match = false;
        }
        return match;
    });

    return filteredRentals;
};

exports.getRentalById = async (id) => {
    const rentals = await readRentals();
    const rental = rentals.find(r => r.id == id);
    if (!rental) {
        throw new Error('Rental not found');
    }
    return rental;
};

exports.createRental = async (rentalData) => {
    const { carID, customer, from, to } = rentalData;

    const parsedStartDate = new Date(from);
    const parsedEndDate = new Date(to);

    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD.');
    }
    if (parsedStartDate >= parsedEndDate) {
        throw new Error('Start date must be before end date.');
    }
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((parsedEndDate - parsedStartDate) / oneDay));
    if (diffDays < 1) {
        throw new Error('Rental duration must be at least 1 day.');
    }

    let cars = await readCars();
    const car = cars.find(c => c.id == carID);

    if (!car) {
        throw new Error('Car not found.');
    }

    if (!car.available) {
        throw new Error('Car is not available for rent.');
    }

    let rentals = await readRentals();
    const overlappingRental = rentals.some(r =>
        r.carID == carID &&
        ((parsedStartDate < new Date(r.to) && parsedEndDate > new Date(r.from)))
    );

    if (overlappingRental) {
        throw new Error('Car is already rented for the selected dates.');
    }

    const dailyRate = car.pricePerDay;
    const total = diffDays * dailyRate;

    const newRental = {
        id: rentals.length > 0 ? Math.max(...rentals.map(r => r.id)) + 1 : 1,
        carID,
        customer,
        from,
        to,
        days: diffDays,
        daillyRate: dailyRate,
        total,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    rentals.push(newRental);
    await writeRentals(rentals);

    car.available = false;
    car.updatedAt = new Date().toISOString();
    await writeCars(cars);

    return newRental;
};

exports.returnCar = async (id) => {
    let rentals = await readRentals();
    const rentalIndex = rentals.findIndex(r => r.id == id);

    if (rentalIndex === -1) {
        throw new Error('Rental not found');
    }
    const rental = rentals[rentalIndex];
    if (rental.status === 'returned' || rental.status === 'cancelled') {
        throw new Error('Rental is already returned or cancelled.');
    }

    rental.status = 'returned';
    rental.updatedAt = new Date().toISOString();

    let cars = await readCars();
    const car = cars.find(c => c.id == rental.carID);
    if (car) {
        car.available = true;
        car.updatedAt = new Date().toISOString();
        await writeCars(cars);
    }
    await writeRentals(rentals);
    return rental;
};

exports.cancelRental = async (id) => {
    let rentals = await readRentals();
    const rentalIndex = rentals.findIndex(r => r.id == id);

    if (rentalIndex === -1) {
        throw new Error('Rental not found');
    }
    const rental = rentals[rentalIndex];
    if (rental.status === 'returned' || rental.status === 'cancelled') {
        throw new Error('Rental is already returned or cancelled.');
    }

    rental.status = 'cancelled';
    rental.updatedAt = new Date().toISOString();

    let cars = await readCars();
    const car = cars.find(c => c.id == rental.carID);
    if (car && rental.status === 'active') {
        car.available = true;
        car.updatedAt = new Date().toISOString();
        await writeCars(cars);
    }
    await writeRentals(rentals);
    return rental;
};
