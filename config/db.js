const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Product = require('../models/productModel');

let isConnected = false;

const seedInitialData = async () => {
    try {
        // Tự động tạo tài khoản mặc định nếu chưa có
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const hashAdmin = await bcrypt.hash('admin123', 10);
            const hashUser = await bcrypt.hash('user123', 10);
            await User.create([
                { username: 'admin', password: hashAdmin, role: 'admin' },
                { username: 'user', password: hashUser, role: 'user' }
            ]);
            console.log('-> Tạo tài khoản mẫu thành công: admin / admin123 (Admin) và user / user123 (User)');
        }

        // Tự động tạo sản phẩm mẫu theo đúng đề thi nếu chưa có
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            await Product.create({
                productName: 'Wireless Mouse',
                category: 'Electronics',
                stockStatus: 'in_stock',
                unitPrice: 250000,
                tags: ['bestseller', 'wireless', 'accessory']
            });
            console.log('-> Tạo sản phẩm mẫu thành công: Wireless Mouse (250,000 VND)');
        }
    } catch (err) {
        console.error('Lỗi khởi tạo dữ liệu mẫu:', err.message);
    }
};

const connectDB = async () => {
    // Nếu đã kết nối rồi (đặc biệt khi chạy dạng Serverless trên Vercel) thì tái sử dụng kết nối
    if (isConnected || mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_shop');
        isConnected = true;
        console.log('MongoDB connected successfully!');
        await seedInitialData();
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
    }
};

module.exports = connectDB;