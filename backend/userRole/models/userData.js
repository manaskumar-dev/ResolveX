const {model, Schema} = require("mongoose");
const mongoose = require("mongoose");

const userDataSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },{timestamps: true}
);

const userData = model("userData", userDataSchema);
module.exports = userData;