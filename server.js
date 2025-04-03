const express = require('express'); const mongoose = require('mongoose'); const jwt = require('jsonwebtoken'); const bcrypt = require('bcryptjs'); const cors = require('cors'); require('dotenv').config();

const app = express(); app.use(express.json()); app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }) .then(() => console.log('MongoDB Connected')) .catch(err => console.error(err));

const userSchema = new mongoose.Schema({ name: String, email: String, password: String }); const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({ name: String, price: Number, description: String, stock: Number }); const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({ userId: String, products: [{ productId: String, quantity: Number }], total: Number, status: { type: String, default: 'Pending' } }); const Order = mongoose.model('Order', orderSchema);

app.post('/api/auth/register', async (req, res) => { const { name, email, password } = req.body; const hashedPassword = await bcrypt.hash(password, 10); const user = new User({ name, email, password: hashedPassword }); await user.save(); res.json({ message: 'User registered' }); });

app.post('/api/auth/login', async (req, res) => { const { email, password } = req.body; const user = await User.findOne({ email }); if (!user || !(await bcrypt.compare(password, user.password))) { return res.status(400).json({ message: 'Invalid credentials' }); } const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET); res.json({ token }); });

app.get('/api/products', async (req, res) => { const products = await Product.find(); res.json(products); });

app.post('/api/products', async (req, res) => { const product = new Product(req.body); await product.save(); res.json({ message: 'Product added' }); });

app.post('/api/orders', async (req, res) => { const order = new Order(req.body); await order.save(); res.json({ message: 'Order placed' }); });

app.listen(5000, () => console.log('Server running on port 5000'));

