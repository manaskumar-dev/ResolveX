const userComp = require("../userRole/models/userComp");

exports.sendMessage = async (req, res) =>{
    try{
        const {ticketId} = req.params;
        const {message} = req.body;
        if(!message || message.trim() === ""){
            return res.status(400).json({ message: "Message cannot be empty" });
        }
        const complaint = await userComp.findOne({ticketId});
        const sender = req.user.role === "agent" ? "agent" : "user";

        complaint.messages.push({
            sender, message, timestamp: new Date()
        })
        await complaint.save();
        return res.status(200).json({ message: "Message sent", data: complaint.messages });
    }
    catch(e){
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getMessages = async(req, res) =>{
    try{
        const {ticketId} = req.params;
        const complaint = await userComp.findOne({ticketId});
        return res.status(200).json({message: "Chat fetched successfully", data: complaint.messages});
    }
    catch(e){
        res.status(500).json({ message: "Internal server error" });
    }
}