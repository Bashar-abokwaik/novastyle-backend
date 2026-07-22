# NovaStyle API

Backend API for the NovaStyle E-Commerce platform.

This project provides a complete RESTful API built with Express.js, TypeScript, and MongoDB to power the NovaStyle online store. It handles authentication, product management, orders, shopping cart, contact messages, newsletter subscriptions, and the admin dashboard.

---

## Live API

https://novastyle-api.onrender.com

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Express Validator
- Nodemailer
- Helmet
- CORS
- Express Rate Limit

---

## Features

### Authentication

- User Registration
- User Login
- JWT Authentication
- Password Hashing
- Protected Routes

### Products

- Get Products
- Product Details
- Best Sellers
- Featured Products
- New Arrivals
- Product Offers
- Categories
- Collections

### Shopping Cart

- Add to Cart
- Update Quantity
- Remove Item
- Checkout

### Orders

- Place Order
- Cancel Pending Order
- Order History
- Order Details
- Automatic Stock Management

### User

- Profile
- Address Management

### Admin

- Dashboard Statistics
- Product Management
- Category Management
- Collection Management
- User Management
- Order Management

### Contact

- Contact Form
- Newsletter Subscription
- Email Notifications

---

## Installation

```bash
git clone <repository>

cd project

npm install
```

---

## Environment Variables

Create a `.env` file.

```env
PORT=

MONGODB_URI=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

ADMIN_EMAIL=

CLIENT_URL=
```

---

## Run Development

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

## Production

```bash
npm start
```

---

## API Structure

```
/api/auth

/api/products

/api/categories

/api/collections

/api/cart

/api/orders

/api/user

/api/contact

/api/newsletter

/api/admin
```

---

## Deployment

Backend deployed on Render.

---

## Future Improvements

- Payment Gateway Integration
- Image Upload Service
- Product Reviews
- Wishlist
- Coupon System
- Swagger API Documentation

---

## Author

Developed by **Bashar Abokwaik**