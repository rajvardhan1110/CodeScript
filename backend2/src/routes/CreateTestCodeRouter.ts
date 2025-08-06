import express, { Request, Response } from "express";
import { Types } from "mongoose";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { uploadStringToS3 } from "../utils/s3Utils";
import { ProblemModel } from "../models/ProblemModel";
import { TestCodeModel } from "../models/TestCodeModel";

const CreateTestCodeRouter = express.Router();

interface CustomRequest extends Request {
    examTakerId?: string;
}

export const CreateTestCodeHandler = async (req: CustomRequest, res: Response) => {
    try {
        const { testId, title, markdown } = req.body;
        const adminId = req.examTakerId;

        console.log(title);
        console.log(markdown);

        if (!testId || !title || !markdown || !adminId || !Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ msg: "Please, Fill All the Details" });
        }

        const testObjectId = new Types.ObjectId(testId);

        // Step 1: Upload markdown to S3
        const s3Key = `${testId}/${new Types.ObjectId().toString()}/md`;
        let markdownUrl: string;

        try {
            markdownUrl = await uploadStringToS3(markdown, s3Key, "text/markdown");
        } catch (uploadErr) {
            console.error("S3 upload failed:", uploadErr);
            return res.status(500).json({ msg: "Failed to upload markdown to S3" });
        }

        // Step 2: Create and save problem
        const newProblem = new ProblemModel({
            title,
            markdownUrl,
            testId: testObjectId,
            createdBy: adminId,
        });

        const problem = await newProblem.save();

        // Step 3: Add problem to TestCodeModel
        const existingTest = await TestCodeModel.findOne({ testId: testObjectId });

        if (existingTest) {
            existingTest.problems.push(problem._id as Types.ObjectId);
            await existingTest.save();
        } else {
            const newTest = new TestCodeModel({
                testId: testObjectId,
                problems: [problem._id as Types.ObjectId],
            });
            await newTest.save();
        }

        return res.status(201).json({
            msg: "Markdown uploaded and test problem entry created successfully",
            markdownUrl,
            problemId: problem._id,
        });

    } catch (error: any) {
        console.error("Error in createTestCodeHandler:", error);
        return res.status(500).json({ msg: "Internal Server Error", error: error.message });
    }
};

CreateTestCodeRouter.post("/", AdminAuthMiddleware, CreateTestCodeHandler);

export default CreateTestCodeRouter;
