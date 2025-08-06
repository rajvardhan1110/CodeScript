import express, { Request, Response } from "express";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { DefaultMarkdownModel } from "../models/DefaultMarkdownModel";
import { getS3DataFromUrl } from "../utils/s3GetCode";

const GetDefaultMarkdownRouter = express.Router();

interface CustomRequest extends Request {
    examTakerId?: string;
}

export const GetDefaultMarkdownHandler = async (req: CustomRequest, res: Response) => {
    try {
        // Step 1: Find the most recent markdown entry
        const latestMarkdown = await DefaultMarkdownModel.findOne().sort({ createdAt: -1 });

        if (!latestMarkdown) {
            return res.status(404).json({ msg: "No markdown found in the database." });
        }

        // Step 2: Extract S3 URL and fetch content
        const s3Url = latestMarkdown.markdownS3Url;
        const markdownContent = await getS3DataFromUrl(s3Url);

        

        // Step 3: Send markdown content
        return res.status(200).json({
            msg: "Fetched latest markdown successfully",
            content: markdownContent,
            s3Url
        });

    } catch (error: any) {
        console.error("Error in getDefaultMarkdownHandler:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
};

GetDefaultMarkdownRouter.get("/", AdminAuthMiddleware, GetDefaultMarkdownHandler);

export default GetDefaultMarkdownRouter;
