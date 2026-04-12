# OptiFactory ERP

OptiFactory ERP is a professional, localized factory management and inventory planning system. It is designed to streamline logistics, manage workforce access, and provide real-time stock synchronization across multiple branches.

---

## 🛠 Technologies

### Frontend
-   **Angular 17**: Modern standalone component architecture.
-   **Tailwind CSS**: Custom "ERP" design system for a premium UI.
-   **ngx-translate**: Full internationalization (i18n) engine.
-   **RxJS**: Reactive state management and stream handling.
-   **Angular Material**: Specialized UI components for snacks and overlays.

### Backend
-   **Node.js & Express**: High-performance RESTful API.
-   **MongoDB & Mongoose**: Flexible document-oriented data modeling.
-   **JWT**: Secure stateless authentication and session management.
-   **Bcrypt**: Industry-standard password hashing.
-   **Security**: Integrated `helmet`, `xss-clean`, and rate-limiting.

---

## 👥 Roles & Permissions

The system uses a strict hierarchical role-based access control (RBAC) model:

-   **Admin**:
    *   Full system control.
    *   Manage branches and global configuration.
    *   Create and manage Managers and Cashiers.
-   **Manager**:
    *   Oversee daily operations.
    *   Manage Suppliers and Inventory.
    *   Approve/Cancel Contracts and logistics deals.
    *   Create Cashier accounts for their specific branch.
    *   Manage products that belong to his branchs.
    *   Manage Branches that belong to him.
    
-   **Cashier**:
    *   Restricted to operational tasks.
    *   Create Sales transactions.
    *   View real-time stock availability.

---

## 🔄 Core Workflows

### 1. Stock & Inventory Flow
New products are registered by Managers -> Categorized for easy discovery -> Stock levels updated via Contracts or manual adjustment -> Sold via the Sales module.

### 2. Multi-Branch Logistics
Admins define branches -> Users are assigned to specific locations -> Inventory is tracked per-branch while maintaining a global overview for Admins.

### 3. Localized Experience
Users can toggle between English and Arabic at any time. The system automatically adjusts font families and flips the layout (RTL) to maintain a premium reading experience in both languages.

---

## 📦 Core Dependencies

### Server
- `mongoose`: Database modeling.
- `jsonwebtoken`: Security.
- `bcrypt`: Encryption.
- `express-rate-limit`: DDoS protection.

### Client
- `@ngx-translate/core`: Localization.
- `tailwindcss`: Styling.
- `rxjs`: Data streams.

---

## 🚀 How to Run

### 1. Prerequisites
-   Node.js (v18+)
-   MongoDB (Running locally or a cloud URI)

### 2. Environment Setup
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=90d
```

### 3. Installation & Execution

#### Start the Backend
```bash
cd server
npm install
npm start
```

#### Start the Frontend
```bash
cd Client
npm install
npm start
```

---

## 📁 Project Structure

-   `/Client`: Angular frontend application.
-   `/server`: Express.js backend API.
-   `/Client/src/assets/i18n`: Translation dictionaries (en.json, ar.json).
