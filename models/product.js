const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: String,
    category: String,
    price: Number,
    stock: Number,
  },
  { _id: false }
);

module.exports = mongoose.model("Product", productSchema);
