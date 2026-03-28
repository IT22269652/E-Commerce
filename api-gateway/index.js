const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// ── Route /products → Product Service (Port 3001)
app.use('/products', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
}));

app.use('/orders', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
}));

// ── Root health check
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway is running!',
    routes: {
      products:  'http://localhost:3000/products',
      orders: 'http://localhost:3000/orders',
    }
  });
});


app.listen(3000, () => {
  console.log('✅ API Gateway running on http://localhost:3000');
  console.log('   /products  → Port 3001');
  console.log('   /orders    → Port 3003');
});