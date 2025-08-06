const { AdminModel } = require("../models/AdminModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

async function AdminAuthMiddleware(req, res, next) {
    const token = req.headers.token;

    console.log("Checking token:", token);

    if (!token) {
        console.log("No token found in headers");
        return res.status(401).json({ msg: "Token is required" });
    }

    try {
        const examTakerData = jwt.verify(token, JWT_SECRET);
        const exid = examTakerData.userId;

        console.log("Decoded userId:", exid);

        const existingAdmin = await AdminModel.findById(exid);

        if (existingAdmin) {
            console.log("Admin verified");
            req.examTakerId = exid;
            next();
        } else {
            console.log("Admin not found");
            res.status(403).json({ msg: "You are not an exam taker" });
        }
    } catch (e) {
        console.log("JWT or DB error:", e);
        res.status(401).json({ msg: "Invalid token", error: e.message });
    }
}

module.exports = {
    AdminAuthMiddleware,
};
