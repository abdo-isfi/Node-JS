const express = require('express');
const logger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const app = express();


const port = process.env.PORT || 3000;

const { initializeTodos } = require('./services/todos.services');

app.use(express.json());
app.use(logger);

const routes = require('./routes/todos.routes');  
app.use('/api', routes);

// app.get('/', (req, res) => {
//     res.send('Hello World');
// });

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    initializeTodos(); // Initialize todos when server starts
});