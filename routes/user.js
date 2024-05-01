const express = require('express')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router()
const {User, Product} = require('../schema/ecom');
const {verifyToken} = require('../middleware/common');

router.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userObj = {
      username: req.body.username,
      address: req.body.address,
      password: hashedPassword,
      role: 'buyer'
    }
    const user = await User.create(userObj);
    const token = jwt.sign({...userObj, _id: user._doc._id}, process.env.JWT_SECRET);
    res.json({...user._doc, token});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const {username : user_name, password: pass_word, role} = user;
    const jwtPayload = {username: user_name, password: pass_word, role, _id: user._doc._id};
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    res.json({ ...user._doc, token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.patch('/change-password', verifyToken, async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


router.patch('/cart/add', verifyToken, async (req, res) => {
  try {
    const obj = { product: req.body.id , quantity: req.body.quantity}
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { $push: { cart: obj } },
      { new: true });
    res.json(user);    
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.patch('/cart/remove', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { cart: {_id: req.body._id} } },
      { new: true });
    res.json(user);  
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.patch('/cart/quantity', verifyToken, async (req, res) => {
  try {
    User.findById({_id: req.user._id}).then((doc)=>{
      doc.cart.forEach(item => {
        if (item.product.equals(req.body.id)) item.quantity = req.body.quantity;
      });
      return doc.save();
    }).then(updatedDoc => res.json(updatedDoc));
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});
module.exports = router