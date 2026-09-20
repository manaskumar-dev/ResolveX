const complainReview = require("../models/complainReview");
const userComp = require("../models/userComp");

exports.addReview = async(req, res) => {
    try{
        const {rating, comment, result} = req.body;
        const {ticketId} = req.params;
        const userId = req.user.id;
        const newReview = await complainReview.create({ticketId, userId, rating, comment, result});
        const findComp = await userComp.findOne({ticketId});
        if(!findComp){
            return res.status(404).json({message: "Complaint not found"});
        }
        if(result === "Satisfied"){
            findComp.status = "Completed";
        }
        else if(result === "Not Satisfied"){
            findComp.status = "Re-opened";
            findComp.reopenedAt = new Date();
        }
        await findComp.save();
        res.status(200).json({message: "Review added successfully", data: newReview});
    }
    catch(e){
        console.error("addReview error:", e && e.message ? e.message : e);
        return res.status(500).json({message: "Internal server error"});
    }
}