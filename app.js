const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
});
const User = mongoose.model('User', UserSchema);

// Product Schema
const ProductSchema = new mongoose.Schema({
    image: String,
    name: String,
    category: String,
    price: Number,
    stock: Number,
    availableColors: [String]
});
const Product = mongoose.model('Product', ProductSchema);

// Sales Schema
const SalesSchema = new mongoose.Schema({
    
        month: String,
        totalUsers: Number,
        totalSales: Number,
        totalOrders: Number,
        totalPending: Number
});
const Sales = mongoose.model('Sales', SalesSchema);

// Authentication Middleware
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    console.log("token ", token)
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, "yashkumarprajapati");
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

// Register
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.send('User registered');
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(!user){
        return res.status(400).send('Invalid credentials');
    }
    let isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ _id: user._id, role: user.role }, "yashkumarprajapati");
    res.json({ token, user });
});

// Get Sales Data
app.post('/sales', async (req, res) => {
    const { month } = req.body;
    const salesData = await Sales.find({month});
    res.json(salesData);
});

app.get('/products', async (req, res) => {
    const products = await Product.find({});
    res.send(products);
});
// Product Management (Admin only)
app.post('/products', async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    const product = new Product(req.body);
    await product.save();
    res.send('Product added');
});

app.put('/products/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.send('Product updated');
});

app.delete('/products/:id', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).send('Access denied');
    await Product.findByIdAndDelete(req.params.id);
    res.send('Product deleted');
});

// Insert Sample Data
const insertSampleData = async () => {
    await User.deleteMany();
    await Product.deleteMany();
    await Sales.deleteMany();

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
    await User.create({ username: 'user', password: hashedPassword, role: 'user' });

    await Product.create([
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Samsung Watch', category: 'Electronics', price: 100, stock: 50, availableColors: ['Red', 'Blue'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Apple Watch', category: 'Electronics', price: 200, stock: 30, availableColors: ['Black', 'White'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Mi Watch', category: 'Electronics', price: 150, stock: 20, availableColors: ['Green', 'Yellow'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Women’s Dress', category: 'Fashion', price: 100, stock: 50, availableColors: ['Red', 'Blue'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Men’s Dress', category: 'Fashion', price: 200, stock: 30, availableColors: ['Black', 'White'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Kid’s Dress', category: 'Fashion', price: 150, stock: 20, availableColors: ['Green', 'Yellow'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Camera', category: 'Home', price: 100, stock: 50, availableColors: ['Red', 'Blue'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Camera', category: 'Home', price: 200, stock: 30, availableColors: ['Black', 'White'] },
        { image: 'https://e7.pngegg.com/pngimages/486/490/png-clipart-apple-watch-series-3-smartwatch-apple-watch-accessory-apple-watch.png', name: 'Camera', category: 'Home', price: 150, stock: 20, availableColors: ['Green', 'Yellow'] }
    ]);

    await Sales.create(
        
        
            { month: 'January', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
            { month: 'February', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
            { month: 'March', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
            { month: 'April', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
            { month: 'May', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
            { month: 'June', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
            { month: 'July', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
            { month: 'August', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
            { month: 'September', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
            { month: 'October', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
            { month: 'November', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
            { month: 'December', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
    
    );

    console.log('Sample data inserted');
};

// insertSampleData();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
