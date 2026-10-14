const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// 1. Lấy danh sách đơn hàng (Yêu cầu 5)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.render('order', { orders });
    } catch (error) {
        res.status(500).send('Server Error: ' + error.message);
    }
};

// 2. Hiển thị form tạo đơn hàng
exports.renderCreateForm = (req, res) => {
    res.render('createOrder', { errorMessage: null });
};

// 3. Thêm mới đơn hàng (Yêu cầu 7, 8, 10)
exports.createOrder = async (req, res) => {
    try {
        const { customerName, productName, quantity, orderDate } = req.body;

        // Ràng buộc: Sản phẩm phải có trong hệ thống (Yêu cầu 8)
        const product = await Product.findOne({ productName: productName.trim() });
        if (!product) {
            return res.render('createOrder', { 
                errorMessage: 'Sản phẩm không tồn tại trong hệ thống!' 
            });
        }

        // Tự động tính totalPrice = quantity * unitPrice (Yêu cầu 10)
        const totalPrice = Number(quantity) * product.unitPrice;

        const newOrder = new Order({
            customerName,
            productName,
            quantity,
            orderDate: orderDate || Date.now(),
            totalPrice
        });

        await newOrder.save();
        res.redirect('/orders');
    } catch (error) {
        res.status(500).send('Error creating order: ' + error.message);
    }
};

// 4. Hiển thị form cập nhật đơn hàng
exports.renderUpdateForm = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).send('Order not found');
        res.render('updateOrder', { order, errorMessage: null });
    } catch (error) {
        res.status(500).send('Error loading order');
    }
};

// 5. Cập nhật thông tin đơn hàng theo orderId (Yêu cầu 9, 10)
exports.updateOrder = async (req, res) => {
    try {
        const { customerName, productName, quantity, orderDate } = req.body;

        const product = await Product.findOne({ productName: productName.trim() });
        if (!product) {
            const order = await Order.findById(req.params.id);
            return res.render('updateOrder', { 
                order, 
                errorMessage: 'Sản phẩm không tồn tại trong hệ thống!' 
            });
        }

        // Tự động tính lại totalPrice (Yêu cầu 10)
        const totalPrice = Number(quantity) * product.unitPrice;

        await Order.findByIdAndUpdate(req.params.id, {
            customerName,
            productName,
            quantity,
            orderDate,
            totalPrice
        });

        res.redirect('/orders');
    } catch (error) {
        res.status(500).send('Error updating order');
    }
};

// 6. Xóa đơn hàng theo orderId (Yêu cầu 6)
exports.deleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.redirect('/orders');
    } catch (error) {
        res.status(500).send('Error deleting order');
    }
};