//activité 1

const express = require("express");
const app = express();

//activité 5
const fs = require('fs');

app.get("/", (req, res) => {
  res.send("Bienvenue sur mon premier serveur Express !");
});

//activité 2
app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Laptop" },
    { id: 2, name: "Smartphone" },
    { id: 3, name: "Tablet" },
  ]);
});

app.get("/api/products/:id", (req, res) => {
  res.json({ message: `Product ${req.params.id}` });
});


//activité 3 
app.use ((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

app.get('/ping', (req, res) => {
  const duration = Date.now() - req.startTime;
  res.json({ message: 'pong', duration: `${duration}ms` });
});


//activité 4
app.get('/api/crash', (req, res) => {
  const err = new Error("Erreur simulée");
  next(err);
});


app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

//activité 5
app.use(express.static('public'));
app.get('/api/products', (req, res) => {
  const data = fs.readFileSync('data/products.json');
  const products = JSON.parse(data);
  res.json(products);
});



app.listen(3000, () => console.log("Serveur en écoute sur le port 3000"));
