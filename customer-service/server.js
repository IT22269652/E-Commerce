const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const customerController = require('./controllers/customerController');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

// const swaggerOptions = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Customer API',
//       version: '1.0.0',
//     },
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//         },
//       },
//       schemas: {
//         CustomerRequest: {
//           type: 'object',
//           properties: {
//             name: { type: 'string' },
//             email: { type: 'string' },
//             password: { type: 'string' },
//             phone: { type: 'string' }
//           }
//         }
//       }
//     },
//   },
//   apis: ['./controllers/customerController.js'], 
// };

// --- server.js ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer API',
      version: '1.0.0',
      description: 'Customer Management Microservice'
    },
    servers: [{ url: 'http://localhost:3002' }], 
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CustomerRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            phone: { type: 'string' }
          }
        }
      }
    },
    paths: {
      // ✅ ADDED /customer PREFIX TO ALL PATHS
      '/customer/register': {
        post: {
          summary: 'Register a new customer',
          tags: ['Auth'],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CustomerRequest' }
              }
            }
          },
          responses: { 201: { description: 'Created' } }
        }
      },
      '/customer/login': {
        post: {
          summary: 'User Login',
          tags: ['Auth'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'OK' } }
        }
      },
      '/customer/{id}': { // ✅ Matches app.get('/customer/:id')
        get: {
          summary: 'Get customer profile',
          tags: ['Profile'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Success' } }
        },
        put: {
          summary: 'Update customer profile',
          tags: ['Profile'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerRequest' } } }
          },
          responses: { 200: { description: 'Updated' } }
        },
        delete: {
          summary: 'Delete customer account',
          tags: ['Profile'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Deleted' } }
        }
      }
    }
  },
  apis: [], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Customer Database Connected Successfully"))
  .catch(err => console.error("❌ Database Connection Error:", err.message));


// PUBLIC ROUTES
app.post('/customer/register', customerController.register);
app.post('/customer/login', customerController.login);

// PROTECTED ROUTES
app.get('/customer/:id', auth, customerController.getProfile);
app.put('/customer/:id', auth, customerController.updateProfile);
app.delete('/customer/:id', auth, customerController.deleteCustomer);

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

const PORT = process.env.CUSTOMER_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Customer Service active on port ${PORT}`);
  console.log(`📑 Swagger Dashboard: http://localhost:${PORT}/api-docs`);
});