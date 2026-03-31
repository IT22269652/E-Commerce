const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const productController = require('./controllers/productController');

const app = express();
app.use(express.json());

// ========== SERVE UPLOADED IMAGES ==========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== MULTER SETUP ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG and PNG allowed'), false);
};

const upload = multer({ storage, fileFilter });

// ========== SWAGGER SETUP ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Service API',
      version: '1.0.0',
      description: 'Product microservice with image upload for E-Commerce platform',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./controllers/productController.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Product Database Connected Successfully'))
  .catch(err => console.error('❌ Database Connection Error:', err.message));

// ========== ROUTES ==========
app.get('/products',        productController.getAllProducts);
app.get('/products/:id',    productController.getProduct);
app.post('/products',       upload.single('image'), productController.createProduct);
app.put('/products/:id',    upload.single('image'), productController.updateProduct);
app.delete('/products/:id', productController.deleteProduct);

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

// ========== START SERVER ==========
const PORT = process.env.PRODUCT_PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Product Service active on port ${PORT}`);
  console.log(`📑 Swagger Dashboard: http://localhost:${PORT}/api-docs`);
});