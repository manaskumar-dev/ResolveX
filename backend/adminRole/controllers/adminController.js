const { hashPass } = require("../../userRole/controllers/authController");
const userAuth = require("../../userRole/models/userAuth");
const userComp = require("../../userRole/models/userComp");
const userData = require("../../userRole/models/userData");

exports.createAgent = async (req, res) => {
    try{
        const {name, email, password, category} = req.body;
        const role = "agent";
        const checkExisting = await userAuth.findOne({email});
        if(checkExisting){
            return res.status(400).json({message: "Email already created"});
        }
        const hashPassword = await hashPass(password);
        const agent = await userAuth.create({name, email, password: hashPassword, category, role});
        res.status(200).json({message: "Agent created successfully", data: agent});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getAllUsers = async(req, res) =>{
    try{
        const allUsers = await userData.find();
        if(allUsers.length === 0){
            return res.status(404).json({message: "No user exist"});
        }
        res.status(200).json({message: "Fetched all users", data: allUsers});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getAllAgents = async(req, res) =>{
    try{
        const allAgents = await userAuth.find({role:"agent"});
        if(allAgents.length === 0){
            return res.status(404).json({message: "No agent exist"});
        }
        res.status(200).json({message: "Fetched all agents", data: allAgents});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getAllComplaints = async(req, res) =>{
    try{
        const allComplaints = await userComp.find().populate("userId", "name email role").populate("assignedTo", "name email");
        if(allComplaints.length === 0){
            return res.status(404).json({message: "No complaint exist"});
        }
        res.status(200).json({message: "Fetched all complaint", data: allComplaints});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getUnassignedComplaints = async(req, res) =>{
    try{
        const unassignedComplaints = await userComp.find({assignedTo: null}).populate("userId", "name email role");
        if(unassignedComplaints.length === 0){
            return res.status(200).json({message: "No unassigned complaint exist", data: []});
        }
        res.status(200).json({message: "Fetched unassigned complaints", data: unassignedComplaints});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.getAgentByCategory = async (req, res) =>{
    try{
        const {ticketId} = req.params;
        const complaint = await userComp.findOne({ticketId});
        const complaintCategory = complaint.category;
        const agents = await userAuth.find({role:"agent", category: complaintCategory}).select("name email category");
        if(agents.length === 0){
            return res.status(404).json({message: `No agent exist for ${complaintCategory} category`});
        }
        res.status(200).json({message: "Agents fetched successfully", complaintCategory: complaintCategory, data: agents});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}

exports.assignComplaint = async (req, res) =>{
    try{
        const {ticketId} = req.params;
        const {agentId} = req.body;
        const complaint = await userComp.findOne({ticketId});
        if(!complaint){
            return res.status(404).json({ message: "Complaint not found" });
        }
        if (complaint.assignedTo) {
            if (complaint.assignedTo.toString() === agentId) {
                return res.status(400).json({ message: "Complaint already assigned to this agent" });
            }
            return res.status(400).json({ message: "Complaint already assigned to another agent" });
        }
        const agent = await userAuth.findById(agentId);
        if (!agent || agent.role !== "agent"){
            return res.status(400).json({ message: "Invalid agent ID" });
        }
        if (agent.category !== complaint.category){
            return res.status(400).json({ message: "Agent not in the same department" });
        }
        complaint.assignedTo = agentId;
        await complaint.save();
        res.status(200).json({message: "Complaint assigned successfully", data: complaint});
    }
    catch(e){
        res.status(500).json({message: "Internal server error"});
    }
}