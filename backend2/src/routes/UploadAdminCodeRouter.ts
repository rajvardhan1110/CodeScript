import express, { Request, Response } from "express";
import { AdminAuthMiddleware } from "../Middleware/AdminAuthMiddleware";
import { uploadStringToS3 } from "../utils/s3uploadAdminCode";
import { ProblemModel } from "../models/ProblemModel";

const UploadAdminCodeRouter = express.Router();

interface CustomRequest extends Request {
  examTakerId?: string;
}

export const UploadAdminCodeHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { code, language_id, testId, problemId } = req.body;
    const adminId = req.examTakerId;

    // Validate required fields
    if (!code || !language_id || !testId || !problemId || !adminId) {
      return res.status(400).json({ msg: "code, language_id, testId, problemId, and admin token are required" });
    }

    const s3Key = `${testId}/${problemId}/AdminCode`;
    let adminCodeUrl: string;

    // Step 1: Upload to S3
    try {
      adminCodeUrl = await uploadStringToS3(code, s3Key, "text/plain");
    } catch (uploadErr: any) {
      console.error("❌ S3 upload failed:", uploadErr.message || uploadErr);
      return res.status(500).json({ msg: "Failed to upload admin code to S3" });
    }

    // Step 2: Save URL in ProblemModel
    const updatedProblem = await ProblemModel.findByIdAndUpdate(
      problemId,
      { AdminCode: adminCodeUrl,
        language: language_id
      },
      { new: true }
    );

    console.log(updatedProblem);

    if (!updatedProblem) {
      return res.status(404).json({ msg: "Problem not found to update" });
    }

    return res.status(200).json({
      msg: "✅ Admin code uploaded and saved successfully",
      adminCodeUrl,
    });

  } catch (error: any) {
    console.error("❌ Error in UploadAdminCodeHandler:", error.message || error);
    return res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};


UploadAdminCodeRouter.post("/", AdminAuthMiddleware, UploadAdminCodeHandler);

export default UploadAdminCodeRouter;
