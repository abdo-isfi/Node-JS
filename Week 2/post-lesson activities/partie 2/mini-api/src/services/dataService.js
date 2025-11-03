const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../../data/products.json');

function readProducts() {
    const data = fs.readFileSync(productsPath, 'utf8');
    return JSON.parse(data);
}

function filterProducts(query) {
    console.log("Request received for products with query:", query);
    let products = readProducts();

    if (query.category) {
        products = products.filter(product => product.category === query.category);
    }

    if (query.minPrice) {
        products = products.filter(product => product.price >= parseFloat(query.minPrice));
    }

    if (query.maxPrice) {
        products = products.filter(product => product.price <= parseFloat(query.maxPrice));
    }

    if (query.sort) {
        const sortOrder = query.sort === 'desc' ? -1 : 1;
        products.sort((a, b) => sortOrder * (a.price - b.price));
    }
    console.log(`Found ${products.length} results.`);
    return products;
}

module.exports = {
    filterProducts
};
