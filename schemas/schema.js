const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float
    lastOrderDate: String
  }

  type TopProduct {
    productId: ID!
    name: String!
    totalSold: Int!
  }

  type CategoryBreakdown {
    category: String!
    revenue: Float!
  }

  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryBreakdown!]!
  }

  type Order {
    _id: ID!
    customerId: ID!
    products: [ProductItem!]!
    totalAmount: Float!
    orderDate: String!
    status: String!
  }

  type ProductItem {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  type CustomerOrders {
    orders: [Order!]!
    total: Int!
    page: Int!
    totalPages: Int!
  }

  input ProductInput {
    productId: ID!
    quantity: Int!
  }

  type Mutation {
    placeOrder(customerId: ID!, products: [ProductInput!]!): Order
  }

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [TopProduct!]!
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getCustomerOrders(customerId: ID!, page: Int!, limit: Int!): CustomerOrders
  }
`);
