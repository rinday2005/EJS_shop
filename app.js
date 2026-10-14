const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Controllers & Middlewares
const orderController = require('./controllers/orderController');
const authController = require('./controllers/authController');
const { isAuthenticated, authorizeRoles } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();

// Kết nối database
connectDB();

// Cấu hình View Engine và Views Directory (Đặc biệt quan trọng khi chạy trên Vercel)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ================= ROUTING ================= //

// Auth Routes (Đăng nhập, Đăng xuất)
app.get('/login', authController.renderLogin);
app.post('/login', authController.login);
app.get('/logout', authController.logout);

// Trang chủ chuyển hướng đến /orders
app.get('/', (req, res) => res.redirect('/orders'));

// Order Routes:
// 1. Xem và Tạo mới: Yêu cầu đăng nhập (Authenticated: admin hoặc user đều được)
app.get('/orders', isAuthenticated, orderController.getAllOrders);
app.get('/orders/create', isAuthenticated, orderController.renderCreateForm);
app.post('/orders/create', isAuthenticated, orderController.createOrder);

// 2. Sửa và Xóa: Yêu cầu quyền ADMIN (Authorization)
app.get('/orders/update/:id', isAuthenticated, authorizeRoles('admin'), orderController.renderUpdateForm);
app.post('/orders/update/:id', isAuthenticated, authorizeRoles('admin'), orderController.updateOrder);
app.post('/orders/delete/:id', isAuthenticated, authorizeRoles('admin'), orderController.deleteOrder);

// Chạy Server: Nếu chạy ở Local hoặc Render thì listen bình thường,
// còn trên Vercel Serverless thì Vercel sẽ tự điều phối qua module.exports
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;