# Inventory Management System - API Documentation

## 📋 Project Overview

The **Inventory Management System** is a comprehensive backend API designed for managing product inventory, sales, contracts, and user management across multiple branches. It enables managers to create and track products, cashiers to process sales with profit tracking, and administrators to oversee the entire system.

### Key Features:
- 🏪 **Multi-branch Support** - Manage inventory across different branch locations
- 👥 **Role-Based Access Control** - Admin, Manager, and Cashier roles with specific permissions
- 📦 **Product Management** - Create, update, and manage products with image uploads
- 💰 **Sales & Revenue Tracking** - Track sales receipts with automatic profit calculations
- 📑 **Contract Management** - Manage purchase contracts with inventory integration
- 📊 **Advanced Reporting** - Daily reports, top-selling products, sales summaries
- 🔄 **Inventory Management** - Real-time stock tracking with automatic deductions
- ♻️ **Refund Processing** - Full receipt refunds with inventory restoration

---

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **Security:** Helmet, XSS Protection, Rate Limiting
- **Password Hashing:** bcrypt
- **Email Service:** Nodemailer (configured)

---

## 🏗️ System Architecture

```
├── Models (Database Schemas)
│   ├── User (Admin, Manager, Cashier)
│   ├── Product (Base product catalog)
│   ├── InventoryProduct (Branch-specific stock)
│   ├── Category (Product categories)
│   ├── Branch (Store locations)
│   ├── Provider (Suppliers)
│   ├── Contract (Purchase orders)
│   └── Receipt (Sales transactions)
│
├── Controllers (Business Logic)
│   ├── AuthController (Authentication)
│   ├── UserController (User management)
│   ├── ProductController (Product CRUD)
│   ├── CategoryController (Category management)
│   ├── BranchController (Branch operations)
│   ├── ContractController (Purchase contracts)
│   └── SellController (Sales & receipts)
│
├── Routes (API Endpoints)
│   ├── authRoutes
│   ├── userRoutes
│   ├── productRoutes
│   ├── categoryRoutes
│   ├── branchRoutes
│   ├── contractRoutes
│   └── sellRoutes
│
└── Utilities
    ├── catchAsync (Error handling)
    ├── appError (Custom errors)
    └── mail (Email utilities)
```

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### User Roles:
- **Admin** - Full system access
- **Manager** - Can manage products, contracts, and branches
- **Cashier** - Can create sales and process refunds for their branch

---

## 📚 API Endpoints

### 1️⃣ AUTHENTICATION ENDPOINTS

#### **Sign Up**
```
POST /api/signup
```

**Request Body:**
```json
{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "password": "password123",
  "passwordConfirm": "password123",
  "role": "manager"
}
```

**Response (201):**
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "role": "manager",
      "createdAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

#### **Login**
```
POST /api/login
```

**Request Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "role": "manager",
      "branch": "branch_id"
    }
  }
}
```

---

#### **Get Current User**
```
GET /api/me
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "role": "manager",
      "branch": {
        "_id": "branch_id",
        "name": "Main Store",
        "location": "Downtown"
      }
    }
  }
}
```

---

#### **Refresh Token**
```
POST /api/refreshToken
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "data": {
    "user": { ... }
  }
}
```

---

#### **Update Password**
```
PATCH /api/updateMyPassword
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "newPasswordConfirm": "newPassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "data": {
    "user": { ... }
  }
}
```

---

### 2️⃣ PRODUCT ENDPOINTS

#### **Create Product** (Manager/Admin)
```
POST /api/products
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (form-data):**
- `name` (string) - Product name
- `description` (string) - Product description
- `price` (number) - Product price
- `category` (ObjectId) - Category ID
- `image` (file) - Product image

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "product_id",
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "category": "category_id",
      "manager": "manager_id",
      "image": "/images/product-1712328000000.jpg",
      "createdAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

#### **Get All Products** (Protected)
```
GET /api/products?page=1&limit=10&category=<id>&search=<term>
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "results": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": {
    "products": [
      {
        "_id": "product_id",
        "name": "Laptop",
        "description": "High-performance laptop",
        "price": 999.99,
        "category": {
          "_id": "category_id",
          "name": "Electronics"
        },
        "manager": {
          "_id": "manager_id",
          "name": "Ahmed",
          "email": "ahmed@example.com"
        },
        "image": "/images/product-1712328000000.jpg"
      }
    ]
  }
}
```

---

#### **Get Single Product**
```
GET /api/products/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "product_id",
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "category": {
        "_id": "category_id",
        "name": "Electronics"
      },
      "manager": {
        "_id": "manager_id",
        "name": "Ahmed"
      },
      "image": "/images/product-1712328000000.jpg"
    }
  }
}
```

---

#### **Update Product** (Manager/Admin)
```
PATCH /api/products/:id
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (optional fields):**
```json
{
  "name": "Gaming Laptop",
  "description": "Updated description",
  "price": 1199.99,
  "category": "category_id"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "product": { ... }
  }
}
```

---

#### **Delete Product** (Manager/Admin)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
```

**Response (204):** No content

---

#### **Get My Products**
```
GET /api/products/my-products?page=1&limit=10
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "results": 10,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": {
    "products": [ ... ]
  }
}
```

---

### 3️⃣ CATEGORY ENDPOINTS

#### **Create Category** (Admin)
```
POST /api/categories
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Electronics"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "category": {
      "_id": "category_id",
      "name": "Electronics",
      "createdAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

#### **Get All Categories**
```
GET /api/categories
```

**Response (200):**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "categories": [
      {
        "_id": "category_id",
        "name": "Electronics",
        "createdAt": "2026-04-05T10:00:00Z"
      }
    ]
  }
}
```

---

#### **Update Category**
```
PATCH /api/categories/:id
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Computer & Electronics"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "category": { ... }
  }
}
```

---

#### **Delete Category**
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>
```

**Response (204):** No content

---

### 4️⃣ BRANCH ENDPOINTS

#### **Create Branch** (Manager/Admin)
```
POST /api/branches
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Main Store",
  "location": "Downtown Cairo"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "branch": {
      "_id": "branch_id",
      "name": "Main Store",
      "location": "Downtown Cairo",
      "manager": "manager_id",
      "createdAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

#### **Get All Branches**
```
GET /api/branches
```

**Response (200):**
```json
{
  "status": "success",
  "results": 3,
  "data": {
    "branches": [
      {
        "_id": "branch_id",
        "name": "Main Store",
        "location": "Downtown Cairo",
        "manager": "manager_id"
      }
    ]
  }
}
```

---

#### **Get My Branches** (Manager)
```
GET /api/branches/my-branches
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "branches": [ ... ]
  }
}
```

---

#### **Update Branch** (Manager/Admin)
```
PATCH /api/branches/:id
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Main Store - Giza",
  "location": "Giza, Egypt"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "branch": { ... }
  }
}
```

---

#### **Delete Branch**
```
DELETE /api/branches/:id
Headers: Authorization: Bearer <token>
```

**Response (204):** No content

---

### 5️⃣ CONTRACT ENDPOINTS

#### **Create Contract** (Manager/Admin)
```
POST /api/contracts
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "branch": "branch_id",
  "products": [
    {
      "product": "product_id",
      "quantity": 10,
      "buyPrice": 500,
      "sellPrice": 800,
      "provider": "provider_id"
    },
    {
      "product": "product_id_2",
      "quantity": 5,
      "buyPrice": 300,
      "sellPrice": 500
    }
  ],
  "paymentMethod": "cash",
  "expectedDeliveryDate": "2026-04-15",
  "description": "Monthly purchase order"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "contract": {
      "_id": "contract_id",
      "branch": {
        "_id": "branch_id",
        "name": "Main Store",
        "location": "Downtown"
      },
      "manager": {
        "_id": "manager_id",
        "name": "Ahmed",
        "email": "ahmed@example.com"
      },
      "products": [
        {
          "product": {
            "_id": "product_id",
            "name": "Laptop"
          },
          "quantity": 10,
          "buyPrice": 500,
          "sellPrice": 800,
          "subtotal": 5000,
          "provider": "provider_id"
        }
      ],
      "status": "pending",
      "paymentStatus": "unpaid",
      "totalQuantity": 10,
      "totalAmount": 5000,
      "paymentMethod": "cash",
      "expectedDeliveryDate": "2026-04-15",
      "createdAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

#### **Get All Contracts**
```
GET /api/contracts?page=1&limit=10&status=pending&branch=<id>
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "pages": 3,
  "data": {
    "contracts": [ ... ]
  }
}
```

---

#### **Get Single Contract**
```
GET /api/contracts/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "contract": { ... }
  }
}
```

---

#### **Update Contract** (Pending only)
```
PATCH /api/contracts/:id
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentMethod": "bank_transfer",
  "expectedDeliveryDate": "2026-04-18",
  "description": "Updated delivery date"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "contract": { ... }
  }
}
```

---

#### **Approve Contract** (Creates Inventory)
```
PATCH /api/contracts/:id/approve
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "deliveryDate": "2026-04-15"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Contract approved and inventory items created",
  "data": {
    "contract": {
      "_id": "contract_id",
      "status": "completed",
      "deliveryDate": "2026-04-15",
      "approvedBy": "manager_id",
      "approvalDate": "2026-04-05T10:00:00Z",
      ...
    }
  }
}
```

---

#### **Cancel Contract**
```
PATCH /api/contracts/:id/cancel
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Supplier unable to deliver"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Contract cancelled successfully",
  "data": {
    "contract": {
      "status": "cancelled",
      ...
    }
  }
}
```

---

#### **Delete Contract** (Pending only)
```
DELETE /api/contracts/:id
Headers: Authorization: Bearer <token>
```

**Response (204):** No content

---

### 6️⃣ SALES ENDPOINTS

#### **Create Sale/Receipt** (Cashier)
```
POST /api/sales
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "inventoryProduct": "inventory_product_id",
      "quantity": 3
    },
    {
      "inventoryProduct": "inventory_product_id_2",
      "quantity": 2
    }
  ],
  "paymentMethod": "cash",
  "notes": "Customer discount applied"
}
```

**Response (201):**
```json
{
  "status": "success",
  "data": {
    "receipt": {
      "_id": "receipt_id",
      "receiptNumber": "R-1712328000000",
      "cashier": {
        "_id": "cashier_id",
        "name": "Fatima",
        "email": "fatima@shop.com",
        "role": "cashier"
      },
      "branch": {
        "_id": "branch_id",
        "name": "Main Store",
        "location": "Downtown"
      },
      "items": [
        {
          "inventoryProduct": "inv_prod_id",
          "quantity": 3,
          "buyPrice": 500,
          "sellPrice": 800,
          "subtotal": 2400,
          "profit": 900
        }
      ],
      "totalQuantitySold": 3,
      "totalAmount": 2400,
      "totalCost": 1500,
      "totalProfit": 900,
      "profitMargin": 37.5,
      "paymentMethod": "cash",
      "status": "completed",
      "createdAt": "2026-04-05T10:00:00Z"
    }
  }
}
```

---

#### **Get All Receipts**
```
GET /api/sales?page=1&limit=10&startDate=2026-04-01&endDate=2026-04-05&paymentMethod=cash&status=completed
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "results": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": {
    "receipts": [ ... ]
  }
}
```

---

#### **Get Single Receipt**
```
GET /api/sales/:id
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "receipt": { ... }
  }
}
```

---

#### **Get Branch Sales Summary**
```
GET /api/sales/summary?startDate=2026-04-01&endDate=2026-04-05
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalSales": 15000,
      "totalReceipts": 45,
      "totalProfit": 5000,
      "averageProfitMargin": 33.33,
      "totalItemsSold": 250,
      "totalCost": 10000
    },
    "dateRange": {
      "start": "2026-04-01",
      "end": "2026-04-05"
    }
  }
}
```

---

#### **Get Daily Sales Report**
```
GET /api/sales/daily-report?date=2026-04-05
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "report": {
      "date": "2026-04-05",
      "totalReceipts": 12,
      "totalSales": 3200,
      "totalProfit": 1000,
      "totalItemsSold": 45,
      "averageProfitMargin": 31.25,
      "salesByCashier": {
        "Fatima": {
          "receipts": 7,
          "sales": 1900,
          "profit": 600
        },
        "Ahmed": {
          "receipts": 5,
          "sales": 1300,
          "profit": 400
        }
      },
      "paymentMethodBreakdown": {
        "cash": {
          "count": 8,
          "amount": 2000
        },
        "card": {
          "count": 4,
          "amount": 1200
        }
      }
    }
  }
}
```

---

#### **Get Top Selling Products**
```
GET /api/sales/top-products?limit=10&startDate=2026-04-01&endDate=2026-04-05
Headers: Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "topProducts": [
      {
        "_id": "inventory_id",
        "totalQuantity": 85,
        "totalRevenue": 8500,
        "totalProfit": 2550,
        "salesCount": 34,
        "product": {
          "_id": "product_id",
          "name": "Laptop",
          "category": "Electronics"
        }
      }
    ]
  }
}
```

---

#### **Refund Receipt** (Full refund)
```
PATCH /api/sales/:id/refund
Headers: Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Customer returned items"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Receipt fully refunded and inventory restored",
  "data": {
    "receipt": {
      "_id": "receipt_id",
      "status": "refunded",
      "items": [],
      "totalAmount": 0,
      "totalProfit": 0,
      "totalQuantitySold": 0,
      "notes": "Refunded: Customer returned items",
      "updatedAt": "2026-04-05T11:00:00Z"
    }
  }
}
```

---

## 🚨 Error Handling

All errors follow a consistent format:

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "name": "ErrorType"
}
```

### Common Errors:

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## 📝 Key Business Rules

### **Product Management:**
- Only managers can create products (assigned to their catalog)
- Each manager's products are separate and private
- Admins can see all products

### **Inventory:**
- Inventory is branch-specific
- Multiple inventory instances of same product allowed (different providers/prices)
- Inventory quantities auto-deduct on sale

### **Sales:**
- Only cashiers can create sales/receipts
- Quantity must be available in branch inventory
- Profit calculated automatically
- Revenue = Sell Price - Buy Price

### **Contracts:**
- Managers create contracts for their products
- Approval creates new inventory items
- Refunded receipts excluded from reports

### **Reports:**
- Only count completed (non-refunded) receipts
- Profit margin = (Total Profit / Total Sales) × 100
- Daily reports breakdown by cashier and payment method

---

## 🔄 Workflow Example

```
1. Manager creates Products
   ↓
2. Manager creates Category & Associates Products
   ↓
3. Manager creates Contract with Products
   ↓
4. Manager Approves Contract
   ↓
5. Inventory Items Created in Branch
   ↓
6. Cashier Creates Sales from Inventory
   ↓
7. System auto-calculates Profit & Margin
   ↓
8. Manager views Reports & Analytics
```

---

## 🔐 Security Features

✅ JWT Authentication with refresh tokens  
✅ Password hashing with bcrypt  
✅ Role-based access control (RBAC)  
✅ Rate limiting on API endpoints  
✅ XSS protection with Helmet  
✅ Input validation and sanitization  
✅ Protected file uploads with type validation  
✅ Secure error messages (no sensitive data leakage)  

---

## 🚀 Getting Started

### **Installation:**
```bash
npm install
```

### **Environment Setup:**
Create `.env` file with:
```
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
PORT=8000
```

### **Start Server:**
```bash
npm start
```

Server runs on `http://localhost:8000`

---

## 📞 Support

For API issues or questions, check:
1. Request/Response format matches documentation
2. Authorization token is valid
3. User has required role permissions
4. Required fields are provided
5. IDs reference existing resources

---

**Last Updated:** April 5, 2026  
**API Version:** 1.0  
**Status:** ✅ Production Ready
