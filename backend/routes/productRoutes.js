const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// 1. GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. CATEGORY FILTERS (FIXED VARIABLES)
// Helper function to handle category fetching to avoid repeating code
const getCategory = async (req, res, categoryName) => {
    try {
        const items = await Product.find({ 
            category: { $regex: new RegExp(`^${categoryName}$`, 'i') } 
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: `Error fetching ${categoryName}` });
    }
};

router.get('/category/laptops', (req, res) => getCategory(req, res, 'laptops'));
router.get('/category/smartphones', (req, res) => getCategory(req, res, 'smartphones'));
router.get('/category/gaming', (req, res) => getCategory(req, res, 'gaming'));
router.get('/category/airpods', (req, res) => getCategory(req, res, 'airpods'));
router.get('/category/watches', (req, res) => getCategory(req, res, 'watches'));

// 3. ADD NEW PRODUCT
router.post('/add', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        image: req.body.image,
        category: req.body.category,
        description: req.body.description || "Premium Tech Arrival",
        createdAt: req.body.createdAt || Date.now()
    });

    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE PRODUCT
router.delete('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product" });
    }
});

// 5. EMAIL ROUTE (IF KEPT IN ROUTES)
// Note: This requires 'transporter' to be passed or imported here.
// It is usually better to keep this in server.js as we did in the last step!
router.post('/send-email', async (req, res) => {
    const { email, orderID, total } = req.body;
    
    // We use global.transporter if defined in server.js
    if (!global.transporter) {
        return res.status(500).json({ message: "Email system not configured" });
    }

    const mailOptions = {
        from: '"UK TECHUB" <your-email@gmail.com>',
        to: email,
        subject: `ORDER CONFIRMED: ${orderID}`,
        html: `<h3>Success!</h3><p>Your order ${orderID} for $${total} is being processed.</p>`
    };

    try {
        await global.transporter.sendMail(mailOptions);
        res.status(200).send("Email Sent");
    } catch (err) {
        console.error(err);
        res.status(500).send("Email Failed");
    }
});

module.exports = router;