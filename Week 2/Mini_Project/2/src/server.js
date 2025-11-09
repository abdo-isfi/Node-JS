require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const HttpError = require('./utils/HttpError');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('apa');
});

const carsRoutes = require('./routes/cars.routes');
const rentalsRoutes = require('./routes/rentals.routes');

app.use('/api/cars', carsRoutes);
app.use('/api/rentals', rentalsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use((err, req, res, next) => {
    console.error('Error caught:', err.message);

    if (err instanceof HttpError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            code: err.statusCode,
            timestamp: new Date().toISOString(),
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong.',
            code: 500,
            timestamp: new Date().toISOString(),
        });
    }
});

module.exports = app;
