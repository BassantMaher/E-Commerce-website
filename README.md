# E-Commerce Backend

This is a fully functional backend for an e-commerce platform, built using **Node.js**, **Redis**, **Cloudinary**, **Stripe**, and **MongoDB Atlas**. It provides a robust API for user authentication, product management, order handling, and payment processing.

## Features

### 1. User Management
- User registration and login

### 2. Authentication
- Secure authentication using **refresh and access tokens**
- Role-based access control (users/admins)

### 3. Admin Dashboard
- Product management (CRUD operations)
- Order management
- Discount coupon management

### 4. Shopping Cart
- Add, update, and remove items
- Apply discount coupons

### 5. Orders
- Order placement and tracking
- Order status updates

### 6. Payment Integration
- Secure payment processing via **Stripe**
- Order confirmation upon successful payment

### 7. Discount Coupons
- Create and apply coupons
- Expiry and usage limits

## Tech Stack

- **Node.js** - Backend framework
- **Express.js** - Web framework for API handling
- **MongoDB Atlas** - Cloud database solution
- **Redis** - Caching and session management
- **Cloudinary** - Cloud storage for product images
- **Stripe** - Payment gateway

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BassantMaher/E-Commerce.git
   cd ecommerce-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (create a `.env` file):
   ```env
   PORT=
   MONGO_URI=
   REDIS_URL=
   ACCESS_TOKEN_SECRET=
   REFRESH_TOKEN_SECRET=
   NODE_ENV=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   STRIPE_SECRET_KEY=
   CLIENT_URL=
   ```

4. Run the application:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token

### User Profile
- `POST /api/auth/profile` - Get user profile

### Cart
- `POST /api/cart/` - Add item to cart
- `DELETE /api/cart/` - Remove all items from cart
- `PUT /api/cart/:id` - Update item quantity
- `GET /api/cart/` - Get cart products

### Coupons
- `GET /api/coupons/` - Get available coupons
- `POST /api/coupons/` - Validate coupon

### Payments
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/checkout-success` - Handle successful checkout

### Products
- `GET /api/products/` - Get all products (admin only)
- `GET /api/products/featured` - Get featured products
- `POST /api/products/` - Create a new product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)
- `GET /api/products/get_recommendations` - Get product recommendations
- `GET /api/products/category/:category` - Get products by category
- `PATCH /api/products/:id` - Update specific product fields

## Deployment

1. Set up cloud deployment service (e.g., **Heroku**, **AWS**, **Vercel**)
2. Add environment variables in the deployment settings
3. Deploy using:
   ```bash
   git push heroku main
   ```

## Contributions

Feel free to fork the repository and submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Contact

For any inquiries or support, reach out to:
- Email: bassanthafez12@gmail.com
- GitHub: [BassantMaher](https://github.com/BassantMaher)

