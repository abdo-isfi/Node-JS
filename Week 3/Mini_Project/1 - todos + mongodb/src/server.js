const express = require('express');
const morgan = require('morgan'); 
const errorHandler = require('./middlewares/errorHandler');
const helmet = require('helmet');
const cors = require('cors'); 
const rateLimit = require('express-rate-limit'); 
const mongoose = require('mongoose'); 
require('dotenv').config(); 
const app = express();


const port = process.env.PORT || 3000;


app.use(express.json());
app.use(helmet()); // Use helmet for security headers


const corsOptions = {
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // Use CORS with specific options

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Limit each IP to 100 requests per 15 minutes
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

if (process.env.NODE_ENV !== 'test') {
  app.use(limiter); // Apply rate limiting to all requests only if not in test environment
}

app.use(morgan('dev')); 

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

const todoRoutes = require('./routes/todos.routes');  
app.use('/api', todoRoutes);

// app.get('/', (req, res) => {
//     res.send('appa');
// });

app.use(errorHandler);

if (require.main === module) {
    // Connect to MongoDB and start the server only if this file is run directly
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });
}

module.exports = app;