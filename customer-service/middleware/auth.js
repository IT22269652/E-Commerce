const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header (Format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Add the user ID to the request object
    next(); // Move to the next function (the controller)
  } catch (err) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};