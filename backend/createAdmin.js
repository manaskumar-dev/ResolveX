const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const userAuth = require("./userRole/models/userAuth");
require("dotenv").config();

const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri).then(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("admin123", salt);
    
    await userAuth.create({
        name: "Admin",
        email: "admin@test.com",
        password: hash,
        role: "admin"
    });
    console.log("Admin created!");
    process.exit(0);
});