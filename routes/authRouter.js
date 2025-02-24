const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const bcrypt = require("bcrypt");

const User = require("../schemas/UserSchema");

const authMiddleware = require("../middleware/authMiddleware");

require("dotenv").config();

//POST API - login the user
router.post("/login", async(req, res) => {
    try {
        const SECRET_KEY = process.env.SECRET_KEY;

        const { email, pwd } = req.body;

        const user = await User.findOne({ email });

        if(!user) {
            return res.status(404).json({error: "Email was not found"});
        }

        const isMatch = await bcrypt.compare(pwd, user.password);
        if(!isMatch) {
            return res.status(409).json({error: "Passwords are not matching"})
        }

        const token = jwt.sign({ id: user._id, status: user.status }, SECRET_KEY, { expiresIn: "1h" });


        res.cookie("authToken", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "Lax",
            path: "/",
            maxAge: 3600000,
        }); 
        //secure: true, sameSite: "Strict" - for production

        res.status(200).json({ message: "Login successful", status: user.status });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
})

//Check if the user is logged in:
router.get("/check-user", authMiddleware, (req, res) => {
    res.status(200).json({ isAuthenticated: true, user: req.user });
});

//POST API - Sign Up a new user to app
router.post("/users", async (req, res) => {
    try  {
        const data = {
            email: req.body.email,
            password: req.body.password,
            country: req.body.country,
        };
    
        const admins = ["arseniikyrychenko@gmail.com", "maxpavliy@gmail.com"];

        if(admins.includes(data.email)) {
            data.status = "admin";
        }

        if(await User.findOne({ email: data.email })) {
            res.status(409).json( {
                status: 409,
                message: "email is already in use",
            });
            return;
        }
    
        const saltRounds = 10;
        const hashPwd = await bcrypt.hash(data.password, saltRounds);
        
        data.password = hashPwd;

        await User.create(data);
    
        res.status(201).json({ status: 201, message: "Signed Up successfully!" })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//GET API - get all of the users
router.get("/users", async(req, res) => {
    try {
        const users = await User.find({});

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//POST API - logout the user:
router.post("/logout", async (req, res) => {
    res.clearCookie("authToken");
    res.status(200).json({ message: "Logged out successfully" });  
})

module.exports = router;