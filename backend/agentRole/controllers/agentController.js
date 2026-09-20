const userComp = require("../../userRole/models/userComp");
const complainReview = require("../../userRole/models/complainReview");
const sendEmail = require("../../utils/sendEmail");


exports.viewComplainByCategory = async (req, res) =>{
    try{
        const complaints = await userComp.find({assignedTo: req.user.id}).populate("userId", "name email");
        const complaintsWithReviews = await Promise.all(
            complaints.map(async (complaint) => {
                const review = await complainReview.findOne({ticketId: complaint.ticketId});
                return {
                    ...complaint.toObject(),
                    review: review || null
                };
            })
        );
        
        if (complaintsWithReviews.length === 0) {
            return res.status(200).json({ message: "No complaints for your department", data: [] });
        }
        res.status(200).json({message: "Fetched all complaints of particular department", data: complaintsWithReviews});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.updateStatusInProgress = async (req, res) =>{
    try{
        const {ticketId} =req.params;
        const complaint = await userComp.findOne({ticketId}).populate("userId", "name email");
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        if (!complaint.assignedTo) {
            return res.status(403).json({ message: "Complaint is not assigned to any agent" });
        }
        if (complaint.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: "This complaint is not assigned to you" });
        }
        if(!(complaint.status === "Open" || complaint.status === "Re-opened")){
            return res.status(400).json({message: "Only open or reopened complaints can be set to in-progress"});
        }
        complaint.status = "In Progress";
        await complaint.save();
        try {
            await sendEmail(complaint.userId.name, complaint.userId.email, ticketId, "is now In Progress.");
        } catch (e) {
            console.error('Email send failed (in-progress):', e && e.message ? e.message : e);
        }
        res.status(200).json({message: "Complaint status changed to in-progress", data: complaint});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.updateStatusResolved = async (req, res) =>{
    try{
        const {ticketId} = req.params;
        const {resolutionMsg} = req.body;
        const complaint = await userComp.findOne({ticketId}).populate("userId", "name email");
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        if (!complaint.assignedTo) {
            return res.status(403).json({ message: "Complaint is not assigned to any agent" });
        }
        if (complaint.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ message: "This complaint is not assigned to you" });
        }
        if(complaint.status !== "In Progress"){
            return res.status(400).json({message: "Only in-progress complaints can be set to Resolved"});
        }
        if (!resolutionMsg || resolutionMsg.trim() === "") {
            return res.status(400).json({ message: "Resolution message is required" });
        }
        complaint.status = "Resolved";
        complaint.resolutionMessage = resolutionMsg;
        complaint.resolvedAt = new Date();
        await complaint.save();
        try {
            await sendEmail(complaint.userId.name, complaint.userId.email, ticketId, "has been resolved.");
        } catch (e) {
            console.error('Email send failed (resolved):', e && e.message ? e.message : e);
        }
        res.status(200).json({message: "Complaint status changed to Resolved", data: complaint});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}