require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const deliveryController = require("./controllers/deliveryController");

const app = express();
const PORT = process.env.DELIVERY_PORT || 3005;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// 1. Swagger Configuration
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Delivery Service API",
    version: "1.0.0",
    description:
      "Microservice for handling e-commerce deliveries, backed by MongoDB",
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    "/deliveries": {
      get: {
        summary: "Returns all deliveries",
        responses: { 200: { description: "A list of deliveries" } },
      },
      post: {
        summary: "Add a new delivery",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderId: { type: "integer", example: 105 },
                  status: { type: "string", example: "Pending" },
                  driver: { type: "string", example: "Sunil" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Delivery created" } },
      },
    },
    "/deliveries/{id}": {
      get: {
        summary: "Get a delivery by ID",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ], // Changed to string for MongoDB ObjectId
        responses: {
          200: { description: "Delivery details" },
          404: { description: "Delivery not found" },
        },
      },
      put: {
        summary: "Update an existing delivery",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ], // Changed to string
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "Delivered" },
                  driver: { type: "string", example: "Kamal" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Delivery updated" },
          404: { description: "Delivery not found" },
        },
      },
      delete: {
        summary: "Remove a delivery",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ], // Changed to string
        responses: {
          200: { description: "Delivery deleted" },
          404: { description: "Delivery not found" },
        },
      },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 2. API Routes connected to Controller
app.get("/deliveries", deliveryController.getAllDeliveries);
app.get("/deliveries/:id", deliveryController.getDeliveryById);
app.post("/deliveries", deliveryController.createDelivery);
app.put("/deliveries/:id", deliveryController.updateDelivery);
app.delete("/deliveries/:id", deliveryController.deleteDelivery);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Delivery Service is running on http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
