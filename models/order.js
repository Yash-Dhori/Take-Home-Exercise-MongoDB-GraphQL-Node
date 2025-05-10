const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    customerId: { type: String, ref: "Customer" },
    products: [
      {
        productId: { type: String, ref: "Product" },
        quantity: Number,
        priceAtPurchase: Number,
      },
    ],
    totalAmount: Number,
    orderDate: Date,
    status: String,
  },
  { _id: false }
);

// Add indexes for performance
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ status: 1, orderDate: 1 });

module.exports = mongoose.model("Order", orderSchema);
