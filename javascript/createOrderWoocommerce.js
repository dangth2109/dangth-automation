const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const baseUrl = process.env.WOOCOMMERCE_URL;
const consumerKey = process.env.WOOCOMMERCE_COMSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_COMSUMER_SECRET;

const orderCount = 1; // order count
const productsPerOrder = 2; // products per order
const billingAddress = {
  "first_name": "John",
  "last_name": "Doe",
  "address_1": "969 Market",
  "address_2": "",
  "city": "San Francisco",
  "state": "CA",
  "postcode": "94103",
  "country": "US",
  "email": "dangth@foobla.com",
  "phone": "(555) 555-5555"
};
const shippingAddress = {
  "first_name": "John",
  "last_name": "Doe",
  "address_1": "969 Market",
  "address_2": "",
  "city": "San Francisco",
  "state": "CA",
  "postcode": "94103",
  "country": "US"
};

async function getAllProducts() {
  const url = `${baseUrl}/wp-json/wc/v3/products`;
  try {
    const response = await axios({
      method: "get",
      url,
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      params: {
        per_page: productsPerOrder + 20
      }
    });

    return response.data;
  } catch (error) {
    return error.message;
  }

};

async function createListProduct(allProducts, numberOfProducts) {
  const products = [];
  const availableProducts = [...allProducts];

  for (let i = 0; i < productsPerOrder; i++) {
    if (availableProducts.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    const product = availableProducts.splice(randomIndex, 1)[0];
    products.push({
      product_id: product.id,
      quantity: Math.floor(Math.random() * 10) + 1 //Quantity per product (random 1-10)
    });
  }

  return products;
}

async function createOrders(products) {
  const url = `${baseUrl}/wp-json/wc/v3/orders`;
  const requestBody = JSON.stringify({
    "payment_method": "bacs",
    "payment_method_title": "Direct Bank Transfer",
    "set_paid": true,
    "billing": billingAddress,
    "shipping": shippingAddress,
    "line_items": products,
    "shipping_lines": [
      {
        "method_id": "flat_rate",
        "method_title": "Flat Rate",
        "total": "10.00"
      }
    ]
  })
  try {
    const response = await axios({
      method: "post",
      url,
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
      headers: {
        "Content-Type": "application/json"
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
    const products = await createListProduct(allProducts, productsPerOrder);
    const createOrder = await createOrders(products);

    if (createOrder.status === 201) {
      console.log(`Order ${i + 1} created successfully`);
      const result = {
        order_id: createOrder.data.id,
        products: createOrder.data.line_items
      }
      orderCreated.push(result);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(orderCreated, null, 2), 'utf8');
  console.log("Done ................")
})();

