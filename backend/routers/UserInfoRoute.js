const express = require("express");
const { UserModel } = require("../models/UserModel");
const { UserAuthMiddleware } = require("../Middleware/UserAuthMiddleware");

const UserInfoRouter = express.Router();

async function UserInfoHandler(req, res) {
    try {
        const userId = req.userId;

        const user = await UserModel.findById(userId).select("name email");

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({
            name: user.name,
            email: user.email
        });

    } catch (e) {
        res.status(500).json({
            msg: "Error in UserInfoRouter",
            error: "Something went wrong"
        });
    }
}

UserInfoRouter.get("/", UserAuthMiddleware, UserInfoHandler);

module.exports = {
    UserInfoRouter
};
