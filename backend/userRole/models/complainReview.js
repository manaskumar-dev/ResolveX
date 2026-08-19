const {model, Schema} = require("mongoose");

const reviewSchema = new Schema(
    {
        ticketId:{
            type: String,
            required: true,      
        },
        userId:{
            type: Schema.Types.ObjectId,
            required: true,
        },
        rating:{
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment:{
            type: String
        },
        result:{
            type: String,
            enum: ["Satisfied", "Not Satisfied"],
            default: "Satisfied"
        }
    },{timestamps:true}
)

const complainReview = model("complainReview", reviewSchema);
module.exports = complainReview;