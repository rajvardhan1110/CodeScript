const { UserModel } = require("../models/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

async function UserAuthMiddleware(req, res, next) {
    const token = req.headers.token;

    console.log("Checking token:", token);

    if (!token) {
        console.log("No token found in headers");
        return res.status(401).json({ msg: "Token is required" });
    }

    try {
        const UserData = jwt.verify(token, JWT_SECRET);
        const exid = UserData.userId;

        console.log("Decoded userId:", exid);

        const existingUser = await UserModel.findById(exid);

        if (existingUser) {
            console.log("User verified");
            req.userId = exid;
            next();
        } else {
            console.log("User not found");
            res.status(403).json({ msg: "You are not a user" });
        }
    } catch (e) {
        console.log("JWT or DB error:", e);
        res.status(401).json({ msg: "Invalid token", error: e.message });
    }
}

module.exports = {
    UserAuthMiddleware,
};
