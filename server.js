const mongoose = require("mongoose");

const express = require('express');
const cors = require("cors");

const cookieParser = require("cookie-parser");

//Routers:
const shopRouter = require("./routes/shopRouter");
const authRouter = require("./routes/authRouter");

require("dotenv").config();

const uri = process.env.DB_ENV;

const app = express(); 

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true })) 
app.use(cookieParser());

const allowedOrigins = ["http://localhost:4200", "https://macha-project.vercel.app/"];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
    }, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
}));

//APIs for products pages
app.use("/products/", shopRouter);
app.use("/auth/", authRouter);

const PORT = 3000;

//Connecting to database using mongoose
mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => console.log(`it's okay ${PORT}`));
    })
    .catch((err) => {
        console.log(err);
    })