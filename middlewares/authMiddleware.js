const jwt = require('jsonwebtoken');

// 1. Authentication: Kiểm tra xem người dùng đã đăng nhập chưa
exports.isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_sdn302');
        req.user = decoded;
        res.locals.user = decoded; // Giúp các file .ejs truy cập được `user` mà không cần truyền thủ công
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

// 2. Authorization: Kiểm tra quyền hạn theo vai trò (Roles)
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).send('Forbidden: Bạn không có quyền (cần quyền Admin) để thực hiện thao tác này!');
        }
        next();
    };
};
