const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Hiển thị trang đăng nhập
exports.renderLogin = (req, res) => {
    // Nếu đã đăng nhập rồi thì chuyển hướng thẳng vào /orders
    if (req.cookies && req.cookies.token) {
        return res.redirect('/orders');
    }
    res.render('login', { errorMessage: null });
};

// 2. Xử lý đăng nhập
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm người dùng trong DB
        const user = await User.findOne({ username: username.trim() });
        if (!user) {
            return res.render('login', { errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        // So khớp mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { errorMessage: 'Tài khoản hoặc mật khẩu không chính xác!' });
        }

        // Tạo JWT Token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret_key_sdn302',
            { expiresIn: '1d' }
        );

        // Lưu token vào HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 ngày
        });

        res.redirect('/orders');
    } catch (error) {
        res.render('login', { errorMessage: 'Đã có lỗi xảy ra: ' + error.message });
    }
};

// 3. Xử lý đăng xuất
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};
