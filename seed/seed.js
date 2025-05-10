require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Order = require("../models/order");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    seedData();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

async function seedData() {
  try {
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    await seedCustomers();
    await seedProducts();
    await seedOrders();

    console.log("All data seeded");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.disconnect();
  }
}

function seedCustomers() {
  return new Promise((resolve, reject) => {
    const customers = [];
    fs.createReadStream("./customers.csv")
      .pipe(csv())
      .on("data", (row) => customers.push(row))
      .on("end", async () => {
        try {
          await Customer.insertMany(customers);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

function seedProducts() {
  return new Promise((resolve, reject) => {
    const products = [];
    fs.createReadStream("./products.csv")
      .pipe(csv())
      .on("data", (row) => products.push(row))
      .on("end", async () => {
        try {
          await Product.insertMany(products);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

function seedOrders() {
  return new Promise((resolve, reject) => {
    const orders = [];
    fs.createReadStream("./orders.csv")
      .pipe(csv())
      .on("data", (row) => {
        row.products = JSON.parse(row.products.replace(/'/g, '"'));
        row.orderDate = new Date(row.orderDate);
        orders.push(row);
      })
      .on("end", async () => {
        try {
          await Order.insertMany(orders);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}
