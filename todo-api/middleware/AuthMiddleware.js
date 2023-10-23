const jwt = require('jsonwebtoken');

const isAuth = (req, res, next)=>{
    try {
        
        const token = req.headers['todo-app'];

        const isVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if(!isVerified){
            return res.status(401).send({
                status: 401,
                message: "User not Authorized! Please login.",
                data: err
            })
        }

        next();

    } catch (err) {
        res.status(401).send({
            status: 401,
            message: "User not authorized! Please login.",
            data: err
        })
    }
}

module.exports = { isAuth }