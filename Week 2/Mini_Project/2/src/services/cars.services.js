const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/jsonHandler');

const carsFilePath = path.join(__dirname, '../data/cars.json');

const readCars = async () => await readJsonFile(carsFilePath);

const writeCars = async (cars) => await writeJsonFile(carsFilePath, cars);

exports.getAllCars = async (query) => {
    const { category, available, minPrice, maxPrice, q } = query;
    let cars = await readCars();

    let filteredCars = cars.filter(car => {
        let match = true;

        if (category && car.category.toLowerCase() !== category.toLowerCase()) {
            match = false;
        }
        if (available && car.available.toString() !== available) {
            match = false;
        }
        if (minPrice && car.pricePerDay < parseFloat(minPrice)) {
            match = false;
        }
        if (maxPrice && car.pricePerDay > parseFloat(maxPrice)) {
            match = false;
        }
        if (q && !(car.plate.toLowerCase().includes(q.toLowerCase()) || car.model.toLowerCase().includes(q.toLowerCase()))) {
            match = false;
        }
        return match;
    });

    return filteredCars;
};

exports.getCarById = async (id) => {
    const cars = await readCars();
    const car = cars.find(c => c.id == id);
    if (!car) {
        throw new Error('Car not found');
    }
    return car;
};

exports.createCar = async (newCarData) => {
    let cars = await readCars();

    const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;

    const carToSave = {
        id: newId,
        ...newCarData,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    cars.push(carToSave);
    await writeCars(cars);
    return carToSave;
};

exports.updateCar = async (id, updatedCarData) => {
    let cars = await readCars();
    const carIndex = cars.findIndex(c => c.id == id);

    if (carIndex !== -1) {
        cars[carIndex] = { ...cars[carIndex], ...updatedCarData, updatedAt: new Date().toISOString() };
        await writeCars(cars);
        return cars[carIndex];
    }
    return null;
};

exports.deleteCar = async (id) => {
    let cars = await readCars();
    const carIndex = cars.findIndex(c => c.id == id);

    if (carIndex !== -1) {
        cars[carIndex].available = false;
        cars[carIndex].updatedAt = new Date().toISOString();
        await writeCars(cars);
        return cars[carIndex];
    }
    return null;
};

