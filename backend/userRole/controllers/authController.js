const bcrypt = require("bcrypt");
const userAuth = require("../models/userAuth");
const userData = require("../models/userData");
const userComp = require("../models/userComp");
const complainReview = require("../models/complainReview");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const saltRounds = 10;
const jwt_secret = process.env.JWT_SECRET || "default_secret_change_this_in_production";

async function hashPass(password){
    try{
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }
    catch(e){
        console.error("error hashing password", e);
    }
}

async function verifyPass(plainPass, hashedPassword){
    try{
        const match = await bcrypt.compare(plainPass, hashedPassword);
        return match;
    }
    catch(e){
        console.error("error comparing password", e);
    }
}

exports.createUser =  async(req, res) => {
    try{
        const {name, email, password} = req.body;
        const role = "user";
        const existingUser = await userAuth.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exist"});
        }
        const hashedPassword = await hashPass(password);
        const user = await userAuth.create({name, email, password: hashedPassword, role});
        await userData.create({
            name: user.name,
            email: user.email,
            userId: user._id,
        });
        res.status(201).json({message: "User created successfully"});
    }
    catch(e){
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.deleteUser = async(req, res) =>{
    try{
        const id = req.user.id;
        await userAuth.findByIdAndDelete(id);
        await userData.findOneAndDelete({userId:id});
        await userComp.deleteMany({userId:id});
        await complainReview.deleteMany({ userId: id });
        res.status(200).json({message: "User deleted successfully"});
    }
    catch(e){
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
}

exports.loginUser = async(req, res) =>{
    try{
        const {email, password} = req.body;
        const findUser = await userAuth.findOne({email});
        if(!findUser){
            return res.status(404).json({message: "User not found"});
        }
        const match = await verifyPass(password, findUser.password);
        if(match){
            const payLoad = {
                id:findUser._id,
                role:findUser.role,
            }
            const token = jwt.sign(
                payLoad,
                jwt_secret,
                {expiresIn: "1h"}
            );

            res.status(200).json(
                {
                    message : "Login Successful", 
                    token, 
                    role: findUser.role, 
                    name: findUser.name,
                    email: findUser.email,
                    id: findUser._id,
                    createdAt: findUser.createdAt
                }
            );
        }
        else{
            res.status(401).json({message: "Invalid credentials"});
        }
    }
    catch(e){
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
}

module.exports = {
    hashPass,
    verifyPass,
    createUser: exports.createUser,
    deleteUser: exports.deleteUser,
    loginUser: exports.loginUser
};