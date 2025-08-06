import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { AdminModel } from "../models/AdminModel";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not set in environment variables");
}

interface CustomRequest extends Request {
    examTakerId?: string;
}

export const AdminAuthMiddleware = async (
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

        const existingAdmin = await AdminModel.findById(exid);

        if (existingAdmin) {
            console.log("Admin verified");
            req.examTakerId = exid;
            next();
        } else {
            console.log("Admin not found");
            res.status(403).json({ msg: "You are not an exam taker" });
        }
    } catch (e: any) {
        console.log("JWT or DB error:", e);
        res.status(401).json({ msg: "Invalid token", error: e.message });
    }
};
