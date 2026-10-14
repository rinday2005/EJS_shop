const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    totalPrice: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);