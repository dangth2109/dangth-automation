const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const baseUrl = process.env.SHOPIFY_URL;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

const orderCount = 1; // order count
const productsPerOrder = 5; // products per order


function getVersionShopify() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

async function getAllProducts() {
    const getVersion = getVersionShopify();
    const url = `${baseUrl}/admin/api/${getVersion}/products.json`;
    try {
        const response = await axios({
            method: "get",
            url,
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken
            },
            params: {
                limit: productsPerOrder + 20
            }
        });

        return response.data.products;
    } catch (error) {
        return error.message;
    }

};

async function createListProduct(allProducts) {
    const products = [];
    const availableProducts = [...allProducts];

    for (let i = 0; i < productsPerOrder; i++) {
        if (availableProducts.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableProducts.length);
        const product = availableProducts.splice(randomIndex, 1)[0];
        products.push({
            title: product.title,
            price: parseFloat(product.variants[0].price),
            grams: String(product.variants[0].grams),
            quantity: Math.floor(Math.random() * 10) + 1,
            tax_lines: [
                {
                    "price": 1.5,
                    "rate": 0.06,
                    "title": "State tax"
                }
            ]
        });
    }

    return products;
}

async function createOrders(products) {
    const getVersion = getVersionShopify();
    const url = `${baseUrl}/admin/api/${getVersion}/orders.json`;
    const requestBody = JSON.stringify({
        order: {
            "line_items": products,
            "transactions": [
                {
                    "kind": "sale",
                    "status": "success",
                    "amount": 238.47
                }
            ],
            "total_tax": 1.5,
            "currency": "USD",
            "customer": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "dangth@foobla.com",
                "phone": "+84343210597"
            },
            "billing_address": {
                "first_name": "John",
                "last_name": "Doe",
                "address1": "969 Market St",
                "city": "San Francisco",
                "province": "CA",
                "country": "US",
                "zip": "94103",
                "phone": "+84343210597"
            },
            "shipping_address": {
                "first_name": "John",
                "last_name": "Doe",
                "address1": "969 Market St",
                "city": "San Francisco",
                "province": "CA",
                "country": "US",
                "zip": "94103",
                "phone": "+84343210597"
            }
        }
    })
    try {
        const response = await axios({
            method: "post",
            url,
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken
            },
            data: requestBody
        });

        return response;
    } catch (err) {
        return err.message;
    }

};

(async () => {
    const filePath = path.join(__dirname, 'result.json');
    fs.writeFileSync(filePath, JSON.stringify('', null, 2), 'utf8');
    const allProducts = await getAllProducts();

    const orderCreated = [];
    for (let i = 0; i < orderCount; i++) {
        const products = await createListProduct(allProducts);
        const createOrder = await createOrders(products);

        if (createOrder.status === 201) {
            console.log(`Order ${i + 1} created successfully`);
            const result = {
                order_id: createOrder.data.order.id,
                products: createOrder.data.order.line_items
            }
            orderCreated.push(result);
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(orderCreated, null, 2), 'utf8');
    console.log("Done ................")
})();

