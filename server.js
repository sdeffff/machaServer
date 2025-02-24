const mongoose = require("mongoose");
const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const shopRouter = require("./routes/shopRouter");
const authRouter = require("./routes/authRouter");

require("dotenv").config();

const uri = process.env.DB_ENV;

const app = express(); 

app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true })) 
app.use(cookieParser());

const allowedOrigins = ["http://localhost:4200", "https://macha-project.vercel.app"];

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

// Connect to MongoDB
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }
    
    try {
        const client = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        
        cachedDb = client;
        console.log('Connected to MongoDB Atlas');
        return cachedDb;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// For local
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    connectToDatabase()
        .then(() => {
            app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        })
        .catch(err => {
            console.error('Failed to connect to database:', err);
        });
}

const handler = async (req, res) => {
    try {
        await connectToDatabase();
        return app(req, res);
    } catch (error) {
        return res.status(500).json({ error: 'Database connection failed' });
    }
};

// Export for Vercel
module.exports = handler;