const userComp = require("../models/userComp");
const userData = require("../models/userData");
const {v4} = require("uuid");

exports.viewProfile = async(req, res) =>{
    try{
        const id = req.user.id;
        const user = await userData.findOne({ userId: id });
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "Profile fetched successfully", data: user});
    }
    catch(e){
        return res.status(500).json({message: "Internal server error"});
    }
}

exports.updateProfile = async(req, res) =>{
    try{
        const id = req.user.id;
        const {name} = req.body;
        const user = await userData.findOne({userId: id});
        const updateUser = await userData.findOneAndUpdate({userId: id}, {name}, {new:true});
        res.status(200).json({message: "Profile updated successfully", data: updateUser});
    }
    catch(e){
        return res.status(500).json({message: "Internal server error"});
    }
}

exports.createComplaint = async(req, res) =>{
    try{
        const {category, desc, img} = req.body;
        const userId = req.user.id;
        const ticketId = v4();
        const newComplain = await userComp.create({category, desc, img, userId, ticketId});
        res.status(200).json({message:"Complaint registered successfully", data:newComplain});
    }
    catch(e){
        return res.status(500).json({message: "Internal server error"});
    }
}

exports.allComplaints = async(req, res) =>{
    try{
        const id = req.user.id;
        const complaints = await userComp.find({userId: id});
        if(complaints.length === 0){
            return res.status(200).json({message: "No complain"});
        }
        res.status(200).json({message: "Fetched all complaints", data: complaints});
    }
    catch(e){
        return res.status(500).json({message: "Internal server error"});
    }
}

exports.singleComplain = async(req, res) =>{
    try{
        const {ticketId} = req.params;
        const foundComplain = await userComp.findOne({ticketId}).populate("userId", "name email").populate("assignedTo", "name email");
        if(!foundComplain){
            return res.status(404).json({message: "Complaint not found"});
        }
        res.status(200).json({message: "fetched complain", data: foundComplain});
    }
    catch(e){
        console.error("singleComplain error:", e && e.message ? e.message : e);
        return res.status(500).json({message: "Internal server error"});
    }
}

exports.completedComplaints = async(req, res) =>{
    try{
        const id = req.user.id;
        const complaints = await userComp.find({userId: id, status: "Completed"});
        if(!complaints || complaints.length === 0){
            return res.status(200).json({message: "No completed complain"});
        }
        res.status(200).json({message: "Fetched completed complaints", data: complaints});
    }
    catch(e){
        return res.status(500).json({message: "Internal server error"});
    }
}