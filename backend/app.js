const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./userRole/routes/authRoute");
const userRouter = require("./userRole/routes/userRoute");
const reviewRouter = require("./userRole/routes/reviewRoute");
const messageRouter = require("./utils/messageRoute");
const agentRouter = require("./agentRole/routes/agentRoute");
const adminRouter = require("./adminRole/routes/adminRoute");

const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri)
.then(()=>{
    console.log("Database connected successfully");
})
.catch((e)=>{
    console.error("Database connection error:", e.message);
    process.exit(1);
});

app.use(express.json());

const corsOptions = {
    origin: [
        'https://resolve-x-blush.vercel.app',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/review", reviewRouter);
app.use("/message", messageRouter);
app.use("/agent", agentRouter);
app.use("/admin", adminRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});