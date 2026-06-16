# 🛒 ShopEz - MERN Stack E-Commerce Platform

ShopEz is a modern full-stack eCommerce application built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). It provides a complete online shopping experience with category-based product browsing, cart management, order placement, order tracking, and an admin dashboard for product management.

## ✨ Features

### Customer Features

* User Registration & Login
* Browse Products by Category (Men, Women, Kids)
* Product Details Page
* Add to Cart & Manage Cart
* Checkout & Order Placement
* Order Tracking & Order History
* Responsive Design

### Admin Features

* Admin Dashboard
* Add New Products
* View Products
* Delete Products
* Product Image Management
* Order Management

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* CSS3

### Backend

* Node.js
* Express.js

### Database

* MongoDB Community Server
* MongoDB Compass

## 📁 Project Structure

```bash
ShopEz/
├── client/      # Customer Frontend
├── server/      # Backend API
├── admin/       # Admin Dashboard
├── upload/      # Product Images
└── seed.js      # Database Seeder
```

## 🚀 Installation

### Clone Repository

```bash
git clone <repository-url>
cd ShopEz
```

### Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

#### Admin Panel

```bash
cd admin
npm install
```

## ⚙️ Environment Variables

Create a `.env` file inside the server directory:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ShopEz
JWT_SECRET=your_secret_key
```

## 🗄️ Database Setup

Start MongoDB Community Server and ensure MongoDB Compass is running.

Connection String:

```env
mongodb://localhost:27017/ShopEz
```

## ▶️ Run the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm start
```

### Start Admin Panel

```bash
cd admin
npm start
```

## 📦 Sample Data

The project includes sample products across:

* Men
* Women
* Kids

with images stored locally in the assets folder.

## 🔮 Future Enhancements

* Online Payment Gateway Integration
* Product Reviews & Ratings
* Wishlist Functionality
* Inventory Management
* Email Notifications

## 👨‍💻 Author

Developed as a MERN Stack E-Commerce Project using React, Node.js, Express, and MongoDB.
As a SmartBridge FullStack Mern project for Internship
