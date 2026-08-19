const {model, Schema} = require("mongoose");

const userAuthSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        role:{
            type: String,
            enum: ["user", "agent", "admin"],
            default: "user",
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["Electricity", "Water", "Gas", "Road", "Sewer", null],
            default: null
        },
    },{timestamps: true}
);

// Add indexes for performance
// `email` already has `unique: true` in the schema which creates an index.
// Avoid creating a duplicate index here to silence mongoose warnings.
// userAuthSchema.index({email: 1});
userAuthSchema.index({role: 1});
userAuthSchema.index({category: 1});

const userAuth = model("userAuth", userAuthSchema);
module.exports = userAuth;