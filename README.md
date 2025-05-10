# E-commerce GraphQL API

This project is a GraphQL API for an e-commerce platform, providing queries for customer spending, top-selling products, sales analytics, and customer orders. It also includes a mutation for placing new orders and uses Redis for caching analytics queries.

## Setup

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     MONGODB_URI=mongodb://localhost:27017/ecommerce
     REDIS_URL=redis://localhost:6379
     ```
4. **Place the CSV files:**
   - Ensure `customers.csv`, `products.csv`, and `orders.csv` are in the project root directory.
5. **Seed the database:**
   ```bash
   npm run seed
   ```
6. **Start the server:**
   ```bash
   npm start
   ```
7. **Access the GraphQL API:**
   - Visit `http://localhost:4000/graphql` for the GraphiQL interface.

## Queries

### 1. `getCustomerSpending(customerId: ID!): CustomerSpending`

- **Description**: Returns total spending, average order value, and last order date for a given customer.
- **Example**:
  ```graphql
  query {
    getCustomerSpending(customerId: "7895595e-7f25-47fe-a6f8-94b31bfab736") {
      customerId
      totalSpent
      averageOrderValue
      lastOrderDate
    }
  }
  ```

### 2. `getTopSellingProducts(limit: Int!): [TopProduct!]!`

- **Description**: Returns the top-selling products based on the total quantity sold.
- **Example**:
  ```graphql
  query {
    getTopSellingProducts(limit: 5) {
      productId
      name
      totalSold
    }
  }
  ```

### 3. `getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics`

- **Description**: Returns total revenue, number of completed orders, and revenue breakdown by product category within a date range.
- **Example**:
  ```graphql
  query {
    getSalesAnalytics(startDate: "2024-01-01", endDate: "2024-12-31") {
      totalRevenue
      completedOrders
      categoryBreakdown {
        category
        revenue
      }
    }
  }
  ```

### 4. `getCustomerOrders(customerId: ID!, page: Int!, limit: Int!): CustomerOrders`

- **Description**: Returns paginated orders for a specific customer.
- **Example**:
  ```graphql
  query {
    getCustomerOrders(
      customerId: "7895595e-7f25-47fe-a6f8-94b31bfab736"
      page: 1
      limit: 10
    ) {
      orders {
        _id
        customerId
        totalAmount
        orderDate
        status
      }
      total
      page
      totalPages
    }
  }
  ```

## Mutations

### 1. `placeOrder(customerId: ID!, products: [ProductInput!]!): Order`

- **Description**: Places a new order for a customer with the specified products.
- **Example**:
  ```graphql
  mutation {
    placeOrder(
      customerId: "7895595e-7f25-47fe-a6f8-94b31bfab736"
      products: [
        { productId: "1e2c1b29-ec24-40dc-b2fc-1a3c17c3093c", quantity: 2 }
        { productId: "5af13f8d-d1cc-4d7a-bc64-89cf3154077d", quantity: 1 }
      ]
    ) {
      _id
      customerId
      products {
        productId
        quantity
        priceAtPurchase
      }
      totalAmount
      orderDate
      status
    }
  }
  ```

## Bonus Features

- **Mutation for placing an order**: Implemented as `placeOrder`.
- **Pagination for customer orders**: Implemented in `getCustomerOrders`.
- **Redis caching for analytics queries**: Implemented in `getSalesAnalytics` to cache results for 1 hour.

## Testing

- Use the GraphiQL interface at `http://localhost:4000/graphql` to test the queries and mutations.
- Sample queries are provided in `queries.graphql` for reference.
