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
        totalPending: Number,
        sales: [
            {
                name: String,
                sales: Number
            }
        ]
});
const Sales = mongoose.model('Sales', SalesSchema);

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
    const product = new Product(req.body);
    await product.save();
    res.send('Product added');
});

app.put('/products/:id', async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.send('Product updated');
});

app.delete('/products/:id', async (req, res) => {
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

    // await Sales.create(
        
        
    //         { month: 'January', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
    //         { month: 'February', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
    //         { month: 'March', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
    //         { month: 'April', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
    //         { month: 'May', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
    //         { month: 'June', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
    //         { month: 'July', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
    //         { month: 'August', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
    //         { month: 'September', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
    //         { month: 'October', totalUsers: 10, totalSales: 5000, totalOrders: 50, totalPending: 5 },
    //         { month: 'November', totalUsers: 15, totalSales: 7000, totalOrders: 65, totalPending: 8 },
    //         { month: 'December', totalUsers: 20, totalSales: 10000, totalOrders: 80, totalPending: 10 },
    
    // );

    await Sales.create([
        {
            month: "January",
            totalUsers: 100,
            totalSales: 50000,
            totalOrders: 250,
            totalPending: 10,
            sales: [
              { name: "5k", sales: 20 },
              { name: "10k", sales: 40 },
              { name: "15k", sales: 38 },
              { name: "20k", sales: 64 },
              { name: "25k", sales: 42 },
              { name: "30k", sales: 50 },
              { name: "35k", sales: 20 },
              { name: "40k", sales: 58 },
              { name: "45k", sales: 46 },
              { name: "50k", sales: 50 },
              { name: "55k", sales: 47 },
              { name: "60k", sales: 49 },
            ],
          },
          {
            month: "February",
            totalUsers: 110,
            totalSales: 52000,
            totalOrders: 270,
            totalPending: 12,
            sales: [
              { name: "5k", sales: 25 },
              { name: "10k", sales: 72 },
              { name: "15k", sales: 36 },
              { name: "20k", sales: 30 },
              { name: "25k", sales: 44 },
              { name: "30k", sales: 85 },
              { name: "35k", sales: 22 },
              { name: "40k", sales: 60 },
              { name: "45k", sales: 28 },
              { name: "50k", sales: 52 },
              { name: "55k", sales: 49 },
              { name: "60k", sales: 71 },
            ],
          },
          {
            month: "March",
            totalUsers: 120,
            totalSales: 55000,
            totalOrders: 300,
            totalPending: 15,
            sales: [
              { name: "5k", sales: 38 },
              { name: "10k", sales: 45 },
              { name: "15k", sales: 70 },
              { name: "20k", sales: 95 },
              { name: "25k", sales: 48 },
              { name: "30k", sales: 68 },
              { name: "35k", sales: 25 },
              { name: "40k", sales: 62 },
              { name: "45k", sales: 30 },
              { name: "50k", sales: 54 },
              { name: "55k", sales: 92 },
              { name: "60k", sales: 53 },
            ],
          },
          {
            month: "April",
            totalUsers: 130,
            totalSales: 58000,
            totalOrders: 320,
            totalPending: 18,
            sales: [
              { name: "5k", sales: 40 },
              { name: "10k", sales: 68 },
              { name: "15k", sales: 42 },
              { name: "20k", sales: 70 },
              { name: "25k", sales: 50 },
              { name: "30k", sales: 90 },
              { name: "35k", sales: 28 },
              { name: "40k", sales: 65 },
              { name: "45k", sales: 22 },
              { name: "50k", sales: 56 },
              { name: "55k", sales: 74 },
              { name: "60k", sales: 55 },
            ],
          },
          {
            month: "May",
            totalUsers: 140,
            totalSales: 60000,
            totalOrders: 340,
            totalPending: 20,
            sales: [
              { name: "5k", sales: 35 },
              { name: "10k", sales: 50 },
              { name: "15k", sales: 95 },
              { name: "20k", sales: 75 },
              { name: "25k", sales: 55 },
              { name: "30k", sales: 35 },
              { name: "35k", sales: 30 },
              { name: "40k", sales: 58 },
              { name: "45k", sales: 54 },
              { name: "50k", sales: 28 },
              { name: "55k", sales: 86 },
              { name: "60k", sales: 57 },
            ],
          },
          {
            month: "June",
            totalUsers: 150,
            totalSales: 62000,
            totalOrders: 360,
            totalPending: 22,
            sales: [
              { name: "5k", sales: 20 },
              { name: "10k", sales: 40 },
              { name: "15k", sales: 38 },
              { name: "20k", sales: 64 },
              { name: "25k", sales: 42 },
              { name: "30k", sales: 50 },
              { name: "35k", sales: 20 },
              { name: "40k", sales: 58 },
              { name: "45k", sales: 46 },
              { name: "50k", sales: 50 },
              { name: "55k", sales: 47 },
              { name: "60k", sales: 49 },
            ],
          },
          {
            month: "July",
            totalUsers: 160,
            totalSales: 64000,
            totalOrders: 380,
            totalPending: 25,
            sales: [
              { name: "5k", sales: 40 },
              { name: "10k", sales: 55 },
              { name: "15k", sales: 50 },
              { name: "20k", sales: 80 },
              { name: "25k", sales: 60 },
              { name: "30k", sales: 70 },
              { name: "35k", sales: 35 },
              { name: "40k", sales: 72 },
              { name: "45k", sales: 58 },
              { name: "50k", sales: 62 },
              { name: "55k", sales: 60 },
              { name: "60k", sales: 61 },
            ],
          },
          {
            month: "August",
            totalUsers: 100,
            totalSales: 50000,
            totalOrders: 250,
            totalPending: 10,
            sales: [
              { name: "5k", sales: 40 },
              { name: "10k", sales: 68 },
              { name: "15k", sales: 42 },
              { name: "20k", sales: 70 },
              { name: "25k", sales: 50 },
              { name: "30k", sales: 90 },
              { name: "35k", sales: 28 },
              { name: "40k", sales: 65 },
              { name: "45k", sales: 22 },
              { name: "50k", sales: 56 },
              { name: "55k", sales: 74 },
              { name: "60k", sales: 55 },
            ],
          },
          {
            month: "September",
            totalUsers: 110,
            totalSales: 52000,
            totalOrders: 270,
            totalPending: 12,
            sales: [
              { name: "5k", sales: 25 },
              { name: "10k", sales: 42 },
              { name: "15k", sales: 36 },
              { name: "20k", sales: 60 },
              { name: "25k", sales: 44 },
              { name: "30k", sales: 55 },
              { name: "35k", sales: 22 },
              { name: "40k", sales: 60 },
              { name: "45k", sales: 48 },
              { name: "50k", sales: 52 },
              { name: "55k", sales: 49 },
              { name: "60k", sales: 51 },
            ],
          },
          {
            month: "October",
            totalUsers: 120,
            totalSales: 55000,
            totalOrders: 300,
            totalPending: 15,
            sales: [
              { name: "5k", sales: 78 },
              { name: "10k", sales: 45 },
              { name: "15k", sales: 30 },
              { name: "20k", sales: 65 },
              { name: "25k", sales: 78 },
              { name: "30k", sales: 58 },
              { name: "35k", sales: 25 },
              { name: "40k", sales: 82 },
              { name: "45k", sales: 20 },
              { name: "50k", sales: 54 },
              { name: "55k", sales: 72 },
              { name: "60k", sales: 53 },
            ],
          },
          {
            month: "November",
            totalUsers: 130,
            totalSales: 58000,
            totalOrders: 320,
            totalPending: 18,
            sales: [
              { name: "5k", sales: 30 },
              { name: "10k", sales: 48 },
              { name: "15k", sales: 42 },
              { name: "20k", sales: 70 },
              { name: "25k", sales: 50 },
              { name: "30k", sales: 60 },
              { name: "35k", sales: 88 },
              { name: "40k", sales: 65 },
              { name: "45k", sales: 52 },
              { name: "50k", sales: 56 },
              { name: "55k", sales: 94 },
              { name: "60k", sales: 55 },
            ],
          },
          {
            month: "December",
            totalUsers: 140,
            totalSales: 60000,
            totalOrders: 340,
            totalPending: 20,
            sales: [
              { name: "5k", sales: 35 },
              { name: "10k", sales: 50 },
              { name: "15k", sales: 45 },
              { name: "20k", sales: 25 },
              { name: "25k", sales: 55 },
              { name: "30k", sales: 65 },
              { name: "35k", sales: 80 },
              { name: "40k", sales: 68 },
              { name: "45k", sales: 44 },
              { name: "50k", sales: 78 },
              { name: "55k", sales: 56 },
              { name: "60k", sales: 57 },
            ],
          }
    ]);

    console.log('Sample data inserted');
};

insertSampleData();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
