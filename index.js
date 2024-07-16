const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;
const testServerURL = 'http://20.244.56.144/test/companies';

const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];

app.get('/categories/:category/products', async (req, res) => {
    const { category } = req.params;
    const { n, minPrice, maxPrice, sort, order, page } = req.query;

    if (!n || n < 1) {
        return res.status(400).json({ error: 'Invalid number of products requested' });
    }

    const limit = parseInt(n, 10);
    const productsPerPage = limit > 10 ? 10 : limit;
    const currentPage = page ? parseInt(page, 10) : 1;

    try {
        const allProducts = [];

        for (const company of companies) {
            const response = await axios.get(`${testServerURL}/${company}/categories/${category}/products`, {
                params: { top: 50, minPrice, maxPrice }
            });
            const products = response.data.map(product => ({ ...product, id: uuidv4(), company }));
            allProducts.push(...products);
        }

        if (sort && order) {
            allProducts.sort((a, b) => {
                if (order === 'asc') return a[sort] - b[sort];
                return b[sort] - a[sort];
            });
        }

        const start = (currentPage - 1) * productsPerPage;
        const paginatedProducts = allProducts.slice(start, start + productsPerPage);

        res.json(paginatedProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/categories/:category/products/:productId', async (req, res) => {
    const { category, productId } = req.params;

    try {
        const response = await axios.get(`${testServerURL}/${category}/products/${productId}`);
        const product = response.data;
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
});

function mockProductRetrieval(productId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const product = retrieveProduct(productId);
            if (product) {
                resolve(product);
            } else {
                reject(new Error('Product not found'));
            }
        }, 1000);
    });
}

function retrieveProduct(productId) {
    const products = [
        { id: '1', name: 'Product 1', price: 100 },
        { id: '2', name: 'Product 2', price: 200 },
        { id: '3', name: 'Product 3', price: 300 },
        { id: '4', name: 'Product 4', price: 400 },
        { id: '5', name: 'Product 5', price: 500 },
    ];
    return products.find(product => product.id === productId);
}

app.get('/categories/:category/products/:productId', async (req, res) => {
    const { category, productId } = req.params;
    try {
        const product = await mockProductRetrieval(productId);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
