const {model, Schema} = require("mongoose");

const userCompSchema = new Schema(
    {
        category: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
            maxLength: 500,
        },
        img: {
            type: String,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "userAuth",
            required: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: "userAuth",
            default: null
        },
        ticketId: {
            type: String,
            required: true,
            unique: true
        },
        status:{
            type: String,
            enum: ["Open", "In Progress", "Resolved", "Completed", "Re-opened"],
            default: "Open",
        },
        resolutionMessage: {
            type: String,
            default: ""
        },
        resolvedAt: {
            type: Date,
            default: null
        },
        reopenedAt: {
            type: Date,
            default: null
        },
        messages:[
            {
                sender:{
                    type: String,
                    enum: ["user", "agent"],
                    required: true,
                },
                message:{
                    type: String,
                    required: true,
                },
                timestamp:{
                    type: Date,
                    default: Date.now,
                }
            }
        ]
    },{timestamps: true}
);

// Add indexes for performance
// `ticketId` already has `unique: true` in the schema which creates an index.
// Avoid creating a duplicate index here to silence mongoose warnings.
// userCompSchema.index({ticketId: 1});
userCompSchema.index({userId: 1});
userCompSchema.index({assignedTo: 1});
userCompSchema.index({status: 1});
userCompSchema.index({createdAt: -1});

const userComp = model("userComp", userCompSchema);
module.exports = userComp;