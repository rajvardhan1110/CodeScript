import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { UserModel } from "../models/UserModel";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not set in environment variables");
}

interface CustomRequest extends Request {
    userId?: string;
}

export const UserAuthMiddleware = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const token = req.headers.token as string;

    console.log("Checking token:", token);

    if (!token) {
        console.log("No token found in headers");
        res.status(401).json({ msg: "Token is required" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const exid = decoded.userId;

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
    } catch (e: any) {
        console.log("JWT or DB error:", e);
        res.status(401).json({ msg: "Invalid token", error: e.message });
    }
};
