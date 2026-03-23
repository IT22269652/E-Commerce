const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());

// ========== SERVE UPLOADED IMAGES ==========
// This lets you view images via browser URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== MULTER SETUP (Image Upload Config) ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save images to uploads folder
  },
  filename: function (req, file, cb) {
    // filename = timestamp + original name (avoids duplicate names)
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG and PNG images are allowed'), false);
  }
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
  apis: ['./index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

let products = [];

// ========== ROUTES ==========

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of all products
 */
app.get('/products', (req, res) => {
  res.json(products);
});

// -----------------------------------------

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// -----------------------------------------

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product with optional image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 */
app.post('/products', upload.single('image'), (req, res) => {
  const { name, price, category, stock } = req.body;

  // If image was uploaded, build the URL. If not, set null
  const imageUrl = req.file
    ? `http://localhost:3001/uploads/${req.file.filename}`
    : null;

  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    category,
    stock: parseInt(stock),
    imageUrl,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// -----------------------------------------

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product with optional new image
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
app.put('/products/:id', upload.single('image'), (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, price, category, stock } = req.body;

  // Keep old image if no new image uploaded
  const imageUrl = req.file
    ? `http://localhost:3001/uploads/${req.file.filename}`
    : products[index].imageUrl;

  products[index] = {
    id: parseInt(req.params.id),
    name,
    price: parseFloat(price),
    category,
    stock: parseInt(stock),
    imageUrl,
  };

  res.json(products[index]);
});

// -----------------------------------------


/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

// ========== START SERVER ==========
app.listen(3001, () => {
  console.log('✅ Product Service running on http://localhost:3001');
  console.log('📄 Swagger Docs at   http://localhost:3001/api-docs');
});