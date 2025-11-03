const fs = require("fs");
const path = require("path");
const express = require("express");

const auth = require("../middlewares/auth");
const timeLimiter = require("../middlewares/timeLimiter");
const AppError = require("../utils/AppError");
const dataService = require("../services/dataService");

const router = express.Router();
const dataPath = path.join(__dirname, "../../data.json");

function readData() {
  const data = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
}


function validateResource(resource) {
  if (!resource.name || !resource.description ) {
    return false;
  }
  return true;
}

router.get("/resources", (req, res) => {
  const data = readData();
  res.json(data.items);
});

router.post("/resources", (req, res, next) => {
  const data = readData();
  const newItem = req.body;

  if (!validateResource(newItem)) {
    return next(new AppError('Invalid resource data', 400));
  }

  const maxId = data.items.reduce((max, item) => Math.max(max, parseInt(item.id)), 0);
  const newId = (maxId + 1).toString();
  const itemWithId = { id: newId, ...newItem };

  data.items.push(itemWithId);
  writeData(data);
  res.status(201).json(itemWithId);
});

router.put("/resources/:id", (req, res, next) => {
  const data = readData();
  const itemId = req.params.id;
  const updatedItem = req.body;

  const itemIndex = data.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return next(new AppError('Resource not found', 404));
  }

  data.items[itemIndex] = { ...data.items[itemIndex], ...updatedItem };
  writeData(data);
  res.json(data.items[itemIndex]);
});

router.delete("/resources/:id", (req, res, next) => {
  const data = readData();
  const itemId = req.params.id;

  const itemIndex = data.items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return next(new AppError('Resource not found', 404));
  }

  const deletedItem = data.items.splice(itemIndex, 1);
  writeData(data);
  res.json(deletedItem[0]);
});

// Private route with authentication and time limiting
router.get("/private/data", auth, timeLimiter, (req, res) => {
  res.json({ message: "This is private data from main routes file!" });
});

// New route for products with filtering and sorting
router.get("/products", (req, res) => {
  const filteredProducts = dataService.filterProducts(req.query);
  res.json(filteredProducts);
});

module.exports = router;
