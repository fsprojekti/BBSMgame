const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        req.adminData = jwt.verify(token, process.env.ADMIN_KEY);
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
};