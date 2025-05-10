const Order = require("../models/order");
const Product = require("../models/product");
const { v4: uuidv4 } = require("uuid");
const { redisClient } = require("../utils/redis");

module.exports = {
  async getCustomerSpending(args) {
    const { customerId } = args;
    const result = await Order.aggregate([
      { $match: { customerId, status: "completed" } },
      {
        $group: {
          _id: "$customerId",
          totalSpent: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          lastOrderDate: { $max: "$orderDate" },
        },
      },
    ]);
    if (result.length === 0) {
      return {
        customerId,
        totalSpent: 0,
        averageOrderValue: null,
        lastOrderDate: null,
      };
    }
    const { totalSpent, averageOrderValue, lastOrderDate } = result[0];
    return {
      customerId,
      totalSpent,
      averageOrderValue,
      lastOrderDate: lastOrderDate ? lastOrderDate.toISOString() : null,
    };
  },

  async getTopSellingProducts(args) {
    const { limit } = args;
    const result = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          totalSold: 1,
        },
      },
    ]);
    return result;
  },

  async getSalesAnalytics(args) {
    const { startDate, endDate } = args;
    const cacheKey = `salesAnalytics:${startDate}:${endDate}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    const result = await Order.aggregate([
      {
        $match: {
          status: "completed",
          orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                completedOrders: { $sum: 1 },
              },
            },
          ],
          categoryBreakdown: [
            { $unwind: "$products" },
            {
              $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "productInfo",
              },
            },
            { $unwind: "$productInfo" },
            {
              $group: {
                _id: "$productInfo.category",
                revenue: {
                  $sum: {
                    $multiply: [
                      "$products.quantity",
                      "$products.priceAtPurchase",
                    ],
                  },
                },
              },
            },
            {
              $project: {
                category: "$_id",
                revenue: 1,
              },
            },
          ],
        },
      },
    ]);
    const overall = result[0].overall[0] || {
      totalRevenue: 0,
      completedOrders: 0,
    };
    const categoryBreakdown = result[0].categoryBreakdown;
    const analytics = {
      totalRevenue: overall.totalRevenue,
      completedOrders: overall.completedOrders,
      categoryBreakdown,
    };
    await redisClient.set(cacheKey, JSON.stringify(analytics), "EX", 3600); // Cache for 1 hour
    return analytics;
  },

  async getCustomerOrders(args) {
    const { customerId, page, limit } = args;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ customerId }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ customerId }),
    ]);
    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async placeOrder(args) {
    const { customerId, products } = args;
    const productIds = products.map((p) => p.productId);
    const productDocs = await Product.find({ _id: { $in: productIds } });
    const productMap = productDocs.reduce((map, p) => {
      map[p._id] = p;
      return map;
    }, {});
    let totalAmount = 0;
    const orderProducts = products.map((p) => {
      const product = productMap[p.productId];
      if (!product) throw new Error(`Product not found: ${p.productId}`);
      const priceAtPurchase = product.price;
      totalAmount += priceAtPurchase * p.quantity;
      return {
        productId: p.productId,
        quantity: p.quantity,
        priceAtPurchase,
      };
    });
    const newOrder = new Order({
      _id: uuidv4(),
      customerId,
      products: orderProducts,
      totalAmount,
      orderDate: new Date(),
      status: "pending",
    });
    await newOrder.save();
    return newOrder;
  },
};
