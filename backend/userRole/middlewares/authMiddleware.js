const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwt_secret = process.env.JWT_SECRET || "default_secret_change_this_in_production";

async function authMiddleware(req, res, next){
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message: "No token provided, unauthorized"});
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, jwt_secret);
        req.user = decoded;
        next();
    }
    catch(e){
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}

module.exports = authMiddleware;