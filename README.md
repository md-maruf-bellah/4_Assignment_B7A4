# RentNest Backend API

## Project Overview

RentNest Backend API is a production-ready RESTful backend application for a rental property marketplace. The system allows users to register as **Tenant**, **Landlord**, or **Admin**, with each role having different permissions and responsibilities.

The backend is built using **Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, JWT Authentication, Zod Validation, and Stripe Payment Integration**. The project follows a clean and scalable architecture by separating Controllers, Services, Routes, Middleware, Validators, and Utilities.

---



## Features



### Authentication & Authorization

* User registration with Tenant, Landlord, or Admin roles
* Secure login using JWT Authentication
* Password hashing with bcryptjs
* Protected routes
* Role-Based Access Control (RBAC)
* Get logged-in user profile

### Property Management

Landlords can:

* Create new properties
* Update property information
* Delete their own properties
* View all their listed properties

Public users can:

* Browse all available properties
* Search properties
* Filter properties by:

  * Location
  * City
  * Property Type
  * Price Range
  * Amenities

### Rental Request System



Tenants can:

* Submit rental requests
* View their rental requests
* Track rental request status

Landlords can:

* View incoming rental requests
* Approve rental requests
* Reject rental requests with a reason

### Payment Integration

The project uses Stripe Checkout for secure online payments.

Payment flow:

1. Tenant submits a rental request.
2. Landlord approves the request.
3. Tenant creates a Stripe Checkout session.
4. Payment is completed through Stripe.
5. Stripe webhook verifies the payment.
6. Payment status becomes **COMPLETED**.
7. Rental request status changes to **ACTIVE**.

### Review System

After a successful payment, tenants can:

* Submit one review for a completed rental
* Give a rating from 1 to 5
* Write a comment

### Admin Panel

Admin can:

* View all users
* Ban or activate users
* View all properties
* View all rental requests
* Create property categories

### Validation



Every request is validated using Zod before reaching the controller.

Validation includes:

* Required fields
* Email validation
* Password validation
* Rating validation
* Price validation
* Request body validation

### Error Handling

A centralized global error handler is implemented.

All errors return a consistent response format.

```json
{
  "success": false,
  "message": "Something went wrong",
  "errorDetails": {}
}
```

Handled errors include:

* Validation errors
* JWT authentication errors
* Prisma errors
* Unauthorized access
* Forbidden access
* Resource not found
* Internal server errors

### Database

The application uses PostgreSQL with Prisma ORM.

Main database models:

* Users
* Categories
* Properties
* Rental Requests
* Payments
* Reviews

Migration and seed scripts are included for database setup.

### API Documentation

A complete Postman Collection is included.

It covers:

* Authentication APIs
* Property APIs
* Rental APIs
* Payment APIs
* Review APIs
* Admin APIs

Collection variables automatically store JWT tokens and resource IDs for easier testing.

### Deployment

The backend can be deployed on:

* Render
* Railway
* Vercel (using a serverless adapter)
* Any Node.js hosting platform

Required environment variables include:

* DATABASE_URL
* JWT_SECRET
* STRIPE_SECRET_KEY
* STRIPE_WEBHOOK_SECRET
* ADMIN_EMAIL
* ADMIN_PASSWORD

---

## Project Architecture

```
Client
   │
Routes
   │
Middleware
   │
Controllers
   │
Services
   │
Prisma ORM
   │
PostgreSQL
```

Each layer has a single responsibility, making the project easy to maintain, test, and scale.

---

## Security

* JWT Authentication
* Password Hashing
* Protected Routes
* Role-Based Authorization
* Request Validation
* Stripe Webhook Signature Verification
* Environment Variables
* Global Error Handling

---

## Future Improvements

* Email Verification
* Forgot Password
* Refresh Token Authentication
* Property Wishlist
* Image Upload
* Real-time Notifications
* Chat between Tenant and Landlord
* Dashboard Analytics
* Property Availability Calendar
* Advanced Search and Sorting

---

## Conclusion

RentNest Backend API is a scalable and production-ready backend application that demonstrates modern backend development practices. It includes secure authentication, role-based authorization, property management, rental workflows, Stripe payment integration, review management, input validation, centralized error handling, and a clean architecture suitable for real-world applications.
