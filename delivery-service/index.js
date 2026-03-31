const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Mock Database for MVP
let deliveries = [
  { id: 1, orderId: 101, status: "Dispatched", driver: "Kamal" },
  { id: 2, orderId: 102, status: "In Transit", driver: "Nimal" },
];

// 1. Swagger Configuration (Pure JS Object)
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Delivery Service API",
    version: "1.0.0",
    description:
      "Microservice for handling e-commerce deliveries with full CRUD operations",
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Direct Microservice Port",
    },
  ],
  paths: {
    "/deliveries": {
      get: {
        summary: "Returns all deliveries (Read)",
        responses: {
          200: { description: "A list of deliveries" },
        },
      },
      post: {
        summary: "Add a new delivery (Create)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderId: { type: "integer", example: 103 },
                  status: { type: "string", example: "Pending" },
                  driver: { type: "string", example: "Sunil" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Delivery created successfully" },
        },
      },
    },
    "/deliveries/{id}": {
      get: {
        summary: "Get a delivery by ID (Read)",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Delivery details" },
          404: { description: "Delivery not found" },
        },
      },
      put: {
        summary: "Update an existing delivery (Update)",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
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
          200: { description: "Delivery updated successfully" },
          404: { description: "Delivery not found" },
        },
      },
      delete: {
        summary: "Remove a delivery (Delete)",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Delivery deleted successfully" },
          404: { description: "Delivery not found" },
        },
      },
    },
  },
};

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ==========================================
// 2. API Endpoints (The CRUD Operations)
// ==========================================

// READ: Get all deliveries
app.get("/deliveries", (req, res) => {
  res.status(200).json(deliveries);
});

// READ: Get a single delivery by ID
app.get("/deliveries/:id", (req, res) => {
  const delivery = deliveries.find((d) => d.id === parseInt(req.params.id));
  if (!delivery) return res.status(404).json({ message: "Delivery not found" });
  res.status(200).json(delivery);
});

// CREATE: Add a new delivery
app.post("/deliveries", (req, res) => {
  const newDelivery = {
    // Auto-generate a new ID based on the highest existing ID
    id:
      deliveries.length > 0 ? Math.max(...deliveries.map((d) => d.id)) + 1 : 1,
    orderId: req.body.orderId,
    status: req.body.status || "Pending",
    driver: req.body.driver || "Unassigned",
  };
  deliveries.push(newDelivery);
  res.status(201).json(newDelivery); // 201 means "Created"
});

// UPDATE: Modify an existing delivery
app.put("/deliveries/:id", (req, res) => {
  const deliveryId = parseInt(req.params.id);
  const index = deliveries.findIndex((d) => d.id === deliveryId);

  if (index === -1)
    return res.status(404).json({ message: "Delivery not found" });

  // Update the record, but make sure the ID doesn't change
  deliveries[index] = {
    ...deliveries[index],
    ...req.body,
    id: deliveryId,
  };

  res.status(200).json(deliveries[index]);
});

// DELETE: Remove a delivery
app.delete("/deliveries/:id", (req, res) => {
  const index = deliveries.findIndex((d) => d.id === parseInt(req.params.id));

  if (index === -1)
    return res.status(404).json({ message: "Delivery not found" });

  // Remove 1 item at the found index
  deliveries.splice(index, 1);
  res.status(200).json({
    message: `Delivery with ID ${req.params.id} deleted successfully`,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Delivery Service is running on http://localhost:${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
