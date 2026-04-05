require('dotenv').config();
const express = require("express");
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');

// --- 1. MODELS ---
const User = require('./models/user'); 
const Product = require('./models/product'); 
const productRoutes = require('./routes/productRoutes');

const app = express();

// --- 2. EMAIL CONFIGURATION ---
// Replace with your real Gmail and 16-digit App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail
        pass: process.env.EMAIL_PASS  // Your 16-character App Password
    }
});

// Verify the connection
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Email System Error:", error);
    } else {
        console.log("📧 Email System Ready for UK TECHUB");
    }
});


// --- 3. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serving static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/image', express.static(path.join(__dirname, '../frontend/IMAGES')));

// --- 4. DATABASE CONNECTION ---
mongoose.connect('mongodb://localhost:27017/uk_techub_db')
    .then(() => console.log('✅ DATABASE CONNECTED SUCCESSFULLY'))
    .catch(err => console.error('❌ DATABASE CONNECTION ERROR:', err));

// --- 5. HTML ROUTES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/HTML/products.html'));
});

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/HTML/admin.html'));
});

// --- 6. EMAIL API ROUTE (THE FINAL BOSS) ---
app.post('/api/send-email', async (req, res) => {
    const { email, orderID, total } = req.body;

    const mailOptions = {
        from: '"UK TECHUB" <your-email@gmail.com>', // Match your auth user
        to: email,
        subject: `ORDER CONFIRMED: ${orderID}`,
        html: `
            <div style="font-family:sans-serif; border:1px solid #e5e5e5; padding:20px; border-radius:15px;">
                <h2 style="color:#0071e3;">THANKS FOR YOUR PURCHASE!</h2>
                <p>ORDER ID: <strong>${orderID}</strong></p>
                <p>TOTAL AMOUNT : <strong>$${total}</strong></p>
                <p>YOUR FLAGSHIP IS BEING PREPARED FOR YOUR SHIPMENT</p>
                <hr style="border:none; border-top:1px solid #eee;">
                <p style="font-size:10px; color:#888;">This is an automated receipt from UKTECHUB project.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to: ${email}`);
        res.status(200).json({ success: true, message: "Email Sent" });
    } catch (err) {
        console.error("❌ NODEMAILER ERROR:", err);
        res.status(500).json({ success: false, message: "Email Failed" });
    }
});

// --- 7. AUTHENTICATION API ---
app.post('/api/auth/check', async (req, res) => {
    const { email, password, isRegistering, name } = req.body;
    try {
        const user = await User.findOne({ email });
        if (isRegistering) {
            if (user) return res.status(400).json({ message: "USER ALREADY EXISTS" });
            const newUser = new User({ name, email, password });
            await newUser.save();
            return res.status(201).json({ message: "SUCCESSFULLY REGISTERED", user: newUser });
        } else {
            if (!user || user.password !== password) {
                return res.status(401).json({ message: "INVALID EMAIL OR PASSWORD" });
            }
            return res.json({ message: "LOGIN SUCCESSFUL", user });
        }
    } catch (err) {
        res.status(500).json({ message: "SERVER ERROR" });
    }
});

// --- 8. PRODUCT & ADMIN API ---
app.use("/api/product", productRoutes);

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password'); 
        res.json(users);
    } catch (err) { 
        res.status(500).json({ message: "Error fetching users" }); 
    }
});

// --- 9. SERVER START ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 UKTECHUB SERVER IS LIVE AT: http://localhost:${PORT}`);
});