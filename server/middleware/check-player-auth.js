const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.PLAYER_KEY);
        const playerId = decodedToken.playerId;
        if (req.params.playerId !== playerId) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
};