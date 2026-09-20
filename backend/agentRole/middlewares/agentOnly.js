module.exports = function(req, res, next){
    if (req.user.role !== "agent"){
        return res.status(403).json({ message: "Access denied. Agents only." });
    }
    next();
}