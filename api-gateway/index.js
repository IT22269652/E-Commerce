const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// ── Swagger docs (keep `/api-docs` at service root)
app.use(
  '/products/api-docs',
  createProxyMiddleware({ target: 'http://localhost:3001/api-docs', changeOrigin: true }),
);
app.use(
  '/customers/api-docs',
  createProxyMiddleware({ target: 'http://localhost:3002/api-docs', changeOrigin: true }),
);
app.use(
  '/orders/api-docs',
  createProxyMiddleware({ target: 'http://localhost:3003/api-docs', changeOrigin: true }),
);
app.use(
  '/payments/api-docs',
  createProxyMiddleware({ target: 'http://localhost:3004/api-docs', changeOrigin: true }),
);
app.use(
  '/deliveries/api-docs',
  createProxyMiddleware({ target: 'http://localhost:3005/api-docs', changeOrigin: true }),
);

// ── CRUD endpoints
app.use('/products', createProxyMiddleware({
  target: 'http://localhost:3001/products',
  changeOrigin: true,
}));

app.use('/customers', createProxyMiddleware({
  target: 'http://localhost:3002/customers',
  changeOrigin: true,
}));

app.use('/orders', createProxyMiddleware({
  target: 'http://localhost:3003/orders',
  changeOrigin: true,
}));

app.use('/payments', createProxyMiddleware({
  target: 'http://localhost:3004/payments',
  changeOrigin: true,
}));

app.use('/deliveries', createProxyMiddleware({
  target: 'http://localhost:3005/deliveries',
  changeOrigin: true,
}));

// ── Root health check
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway is running!',
    routes: {
      products: 'http://localhost:3000/products',
      customers: 'http://localhost:3000/customers',
      orders: 'http://localhost:3000/orders',
      payments: 'http://localhost:3000/payments',
      deliveries: 'http://localhost:3000/deliveries',
    }
  });
});

// ── Start server
app.listen(3000, () => {
  console.log('✅ API Gateway running on http://localhost:3000');
  console.log('   /products   → Port 3001');
  console.log('   /customers  → Port 3002');
  console.log('   /orders     → Port 3003');
  console.log('   /payments   → Port 3004');
  console.log('   /deliveries → Port 3005');
});