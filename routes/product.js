const express = require('express')
const router = express.Router()
const {Product} = require('../schema/ecom');
const {verifyToken} = require('../middleware/common');

router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'seller') return res.status(401).json({ message: "Not authorized" });
    try {
      const product = await Product.create(req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});
  
router.get('/', verifyToken, async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
});
    
router.put('/:id', verifyToken, async (req, res) => {
    if (req.user.role !== 'seller') return res.status(401).json({ message: "Not authorized" });
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
router.delete('/:id', async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully', ...product._doc });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router
