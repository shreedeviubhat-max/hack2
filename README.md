# 🏪 Kirana Smart Khaata

> A modern, lightning-fast digital ledger, customer credit tracker (*Udhaar Khata*), and supplier bookkeeper tailored for Indian Kirana & retail grocery stores.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js_5-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Key Features

- **🔐 Shopkeeper Authentication**: Secure phone-number-based registration and login with bcrypt password hashing (10 rounds) and 7-day signed JWT tokens.
- **📒 Customer Udhaar (Borrower) Khaata**:
  - Add borrowers with mobile number, address, and initial credit balance.
  - Record payments when customers return money (*"Money Returned"*).
  - Add new credit entries when customers take groceries on loan.
  - Complete chronologically sorted transaction history with notes and timestamps.
- **🚚 Supplier / Distributor Ledger**:
  - Manage wholesale distributors, invoice numbers, bill amounts, and dates.
  - Record payments made to suppliers and track outstanding dues.
- **📊 Real-Time Financial Dashboard**:
  - Instant calculation of Total Receivables (*Money customers owe you*) vs. Total Payables (*Money you owe suppliers*).
  - Net business health summary and metric cards.
- **📥 Data Export**: Export financial records and statements to CSV / Excel for bookkeeping.
- **🧾 OCR Ready**: Client-side document and receipt scanning via Tesseract.js.
- **🎨 Sleek Dark-Mode UI**: Built with Tailwind CSS v4, custom theme tokens (`#09090b` background, `#facc15` gold accents), and Lucide React icons.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (`react` 19.2.8, `react-dom` 19.2.8)
- **Bundler & Build Tool**: Vite 8 (`vite` 8.2.2)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` 4.3.3)
- **Routing**: React Router v7 (`react-router-dom` 7.18.3)
- **Icons**: Lucide React (`lucide-react` 1.39.0)
- **OCR Engine**: Tesseract.js (`tesseract.js` 7.0.0)

### Backend
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express.js 5 (`express` 5.2.1)
- **Database**: MongoDB Atlas with Mongoose ODM (`mongoose` 9.9.4)
- **Authentication**: JWT (`jsonwebtoken` 9.0.3) + Bcrypt (`bcrypt` 6.0.0)
- **CORS Handling**: `cors` 2.8.6 (configured for cross-origin Vercel requests)
- **Environment Management**: `dotenv` 17.4.2

---

## 📂 Project Structure

```text
├── backend/
│   ├── middleware/
│   │   └── auth.js             # JWT Bearer token authentication middleware
│   ├── models/
│   │   ├── User.js             # Shop owner account schema
│   │   ├── Borrower.js         # Customer credit & payment transaction schema
│   │   └── Supplier.js         # Vendor invoices & payment records schema
│   ├── routes/
│   │   ├── auth.js             # /api/auth (register, login)
│   │   ├── borrowers.js        # /api/borrowers (CRUD, payments, credits)
│   │   └── suppliers.js        # /api/suppliers (invoices, payments)
│   ├── .env.example            # Environment variables template
│   ├── db.js                   # Mongoose connection with DNS fallback
│   ├── package.json            # Backend scripts and dependencies
│   └── server.js               # Express application entry point
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images and visual branding
│   │   ├── config/
│   │   │   └── api.js          # Centralized API base URL helper
│   │   ├── pages/
│   │   │   ├── Welcome.jsx     # Landing page
│   │   │   ├── Auth.jsx        # Login & Registration modal/view
│   │   │   └── Dashboard.jsx   # Main Khaata & Supplier management dashboard
│   │   ├── App.jsx             # React Router and Auth Context provider
│   │   ├── index.css           # Tailwind v4 theme definitions
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Frontend environment variable template
│   ├── package.json            # Frontend dependencies & Vite scripts
│   ├── vercel.json             # Single Page Application (SPA) rewrite rules
│   └── vite.config.js          # Vite React & Tailwind plugin configuration
├── .gitignore
├── .vercelignore               # Prevents backend from deploying to Vercel
├── package.json                # Monorepo root scripts
└── vercel.json                 # Vercel deployment & build configuration
```

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [MongoDB Atlas](https://cloud.mongodb.com/) cluster URI

### 1. Clone the Repository
```bash
git clone https://github.com/shreedeviubhat-max/hack2.git
cd hack2
```

### 2. Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kirana_khaata?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
```
Start the backend server:
```bash
npm start
```
*The server will run on `http://localhost:5000`.*

### 3. Configure Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Vite will start the client on `http://localhost:5173`. In development, Vite's proxy automatically routes `/api` requests to `http://localhost:5000`.*

---

## 🚀 Production Deployment Guide

This project is optimized for decoupled cloud hosting: **Backend on Render** and **Frontend on Vercel**.

### Step 1: Deploy Backend on Render

1. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
2. Connect this GitHub repository.
3. Configure the settings:
   - **Name**: `kirana-smart-khaata-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
4. Add the following **Environment Variables** in the Render dashboard:
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_SECRET`: `your_jwt_secret_key`
   - `NODE_ENV`: `production`
5. **MongoDB Atlas Network Access**:
   - In MongoDB Atlas, go to **Network Access** -> **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render's dynamic IP addresses can connect.
6. Click **Create Web Service**. Once deployed, copy your Render URL (e.g. `https://kirana-smart-khaata-api.onrender.com`).

---

### Step 2: Deploy Frontend on Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import the GitHub repository.
3. In **Project Settings**:
   - **Root Directory**: Click *Edit* and select `frontend` *(or leave as `./`)*.
   - **Framework Preset**: `Vite` *(auto-detected)*.
   - **Build and Output Settings**: Leave all toggles **OFF** *(Vercel runs `npm run build` and outputs to `dist` automatically)*.
4. In **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render live URL (e.g., `https://kirana-smart-khaata-api.onrender.com` without trailing slash).
5. Click **Deploy**. Your app is now live!

> [!NOTE]
> **Render Free Tier Notice**: Render Web Services spin down into sleep mode after 15 minutes of inactivity. The very first request after waking up may take 30–50 seconds; subsequent requests are fast.

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new shopkeeper | ❌ |
| `POST` | `/api/auth/login` | Login via mobile number and password | ❌ |

### Borrowers / Customer Udhaar (`/api/borrowers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/borrowers` | Get all borrowers for the logged-in shop | ✅ |
| `POST` | `/api/borrowers` | Add a new borrower with initial balance | ✅ |
| `POST` | `/api/borrowers/:id/payment` | Record money returned by borrower | ✅ |
| `POST` | `/api/borrowers/:id/credit` | Record new credit / items taken on loan | ✅ |

### Suppliers / Invoices (`/api/suppliers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/suppliers` | Get all suppliers and invoices for shop | ✅ |
| `POST` | `/api/suppliers` | Add a new supplier with initial invoice | ✅ |
| `POST` | `/api/suppliers/:id/invoices`| Add a new invoice / purchase bill | ✅ |
| `POST` | `/api/suppliers/:id/payment` | Record payment made to supplier | ✅ |

---

## 📄 License
This project is open-source and available under the [ISC License](LICENSE).