// Express backend for Razorpay production integration
// npm install express razorpay body-parser cors crypto
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
    key_id: 'rzp_test_cEvJWOFsLexsYL', // <-- Replace with your live Razorpay key_id
    key_secret: 'JOGbSoe7jpTerje3JKJUvgIj' // <-- Replace with your live Razorpay key_secret
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
    const expectedSignature = crypto.createHmac('sha256', razorpay.key_secret)
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
