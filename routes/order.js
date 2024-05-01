const express = require('express')
const router = express.Router()
const {Product,
  User,
  Order} = require('../schema/ecom');
module.exports = router