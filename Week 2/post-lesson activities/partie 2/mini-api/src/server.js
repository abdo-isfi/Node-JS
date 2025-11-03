const express = require("express");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = 3000;

// Error handler for uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
// parse application/json
app.use(bodyParser.json());

// Error handling middleware
app.use(errorHandler);

// Start the server
const server = app
  .listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });
