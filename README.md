# 🛒 E-Commerce Microservices Platform

## 📌 Project Overview

This project implements a **Microservices Architecture** for an E-Commerce platform. Each microservice handles one business domain and runs independently on its own port. All services are accessible through a single **API Gateway** on port `3000`.

The system consists of:
- **4 Independent Microservices** — Product, Customer, Order, Payment
- **1 API Gateway** — Routes all traffic through a single port
- **Swagger UI** — Auto-generated API documentation for every service

---

## 🏗️ Architecture

```
                        ┌─────────────┐
                        │   CLIENT    │
                        └──────┬──────┘
                               │
                          Port 3000
                               │
                    ┌──────────▼──────────┐
                    │     API GATEWAY     │
                    │  (Port 3000)        │
                    └──┬──┬──┬──┬─────────┘
                       │  │  │  │
           ┌───────────┘  │  │  └───────────┐
           │         ┌────┘  └────┐          │
           ▼         ▼            ▼          ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Product  │ │ Customer │ │  Order   │ │ Payment  │
    │ Service  │ │ Service  │ │ Service  │ │ Service  │
    │ :3001    │ │ :3002    │ │ :3003    │ │ :3004    │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘

```

## ⚙️ Installation & Setup

### 1. Product Service
```bash
cd product-service
npm init -y
npm install express swagger-ui-express swagger-jsdoc multer
mkdir uploads
```

### 2. Customer Service
```bash
cd customer-service
npm init -y
npm install express swagger-ui-express swagger-jsdoc
```

### 3. Order Service
```bash
cd order-service
npm init -y
npm install express swagger-ui-express swagger-jsdoc
```

### 4. Payment Service
```bash
cd payment-service
npm init -y
npm install express swagger-ui-express swagger-jsdoc
```

### 5. API Gateway
```bash
cd api-gateway
npm init -y
npm install express http-proxy-middleware
```

---

## ▶️ Running the Services

### Terminal 1 — Product Service
```bash
cd product-service
node index.js
# ✅ Product Service running on http://localhost:3001
```

### Terminal 2 — Customer Service
```bash
cd customer-service
node index.js
# ✅ Customer Service running on http://localhost:3002
```

### Terminal 3 — Order Service
```bash
cd order-service
node index.js
# ✅ Order Service running on http://localhost:3003
```

### Terminal 4 — Payment Service
```bash
cd payment-service
node index.js
# ✅ Payment Service running on http://localhost:3004
```

### Terminal 5 — API Gateway (start this LAST)
```bash
cd api-gateway
node index.js
# ✅ API Gateway running on http://localhost:3000
```

---

## 🔀 API Gateway

| Gateway URL | Routes To | Service |
|------------|-----------|---------|
| `localhost:3000/products` | `localhost:3001` | Product Service |
| `localhost:3000/customers` | `localhost:3002` | Customer Service |
| `localhost:3000/orders` | `localhost:3003` | Order Service |
| `localhost:3000/payments` | `localhost:3004` | Payment Service |


## 📄 Swagger Documentation

| Service | Direct Swagger URL |
|---------|--------------------|
| Product Service | http://localhost:3001/api-docs |
| Customer Service | http://localhost:3002/api-docs |
| Order Service | http://localhost:3003/api-docs |
| Payment Service | http://localhost:3004/api-docs |

---

## 📌 Ports Summary

| Service | Port | Status |
|---------|------|--------|
| API Gateway | `3000` | Single entry point |
| Product Service | `3001` | Runs independently |
| Customer Service | `3002` | Runs independently |
| Order Service | `3003` | Runs independently |
| Payment Service | `3004` | Runs independently |

