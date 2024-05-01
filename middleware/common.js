const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    const token = req?.headers?.authorization?.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET,(err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = decoded;
        next();
      })
}

module.exports = {verifyToken};