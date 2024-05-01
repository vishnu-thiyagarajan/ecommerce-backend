const {Schema, model} = require('mongoose');

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  imageUrl: { type: String }
});

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true},
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer'},
  cart: [{product: { type: Schema.Types.ObjectId, ref: 'products', required: true }, 
          quantity: { type: Number, default: 1, required: true}}],
});

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  items: [{product: { type: Schema.Types.ObjectId, ref: 'products', required: true }, 
           quantity: { type: Number, required: true}}],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  paymentStatus: { type: String, enum: ['success', 'failure', 'pending'], default: 'pending'}
});

const Product = model('products', productSchema);
const User = model('users', userSchema);
const Order = model('orders', orderSchema);

module.exports = {
  Product,
  User,
  Order
};
