// Express backend for Razorpay production integration
// npm install express razorpay body-parser cors crypto dotenv
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const order = await razorpay.orders.create({
            amount,
            currency,
            payment_capture: 1
        });
        res.json({ order_id: order.id, amount: order.amount, currency: order.currency });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify payment endpoint
app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign)
        .digest('hex');
    if (expectedSignature === razorpay_signature) {
        // Mark order as paid in your DB here
        res.json({ status: 'success' });
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Backend running on port', PORT));
