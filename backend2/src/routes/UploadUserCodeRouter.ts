import express, { Request, Response } from "express";
import { uploadStringToS3 } from "../utils/s3uploadAdminCode";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";

const UploadUserCodeRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

export const UploadUserCodeHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { code, testId, problemId, language_id } = req.body;
    const userId = req.userId;

    console.log("📝 Incoming request to upload user code");
    console.log("Request Body:", { code, testId, problemId, language_id });
    console.log("User ID from token:", userId);

    if (!code || !testId || !problemId || !language_id || !userId) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({
        msg: "code, testId, problemId, language_id, and user token are required"
      });
    }

    const s3Key = `${testId}/${problemId}/${userId}`;
    const fileContent = JSON.stringify({ code, language_id });

    console.log("📦 Preparing to upload to S3 with key:", s3Key);

    let userCodeUrl: string;

    try {
      userCodeUrl = await uploadStringToS3(fileContent, s3Key, "application/json");
      console.log("✅ Successfully uploaded user code to S3:", userCodeUrl);
    } catch (err: any) {
      console.error("❌ S3 upload failed:", err.message || err);
      return res.status(500).json({ msg: "Failed to upload user code to S3" });
    }

    return res.status(200).json({
      msg: "✅ User code and language_id uploaded successfully",
      userCodeUrl,
    });

  } catch (error: any) {
    console.error("❌ Error in UploadUserCodeHandler:", error.message || error);
    return res.status(500).json({ msg: "Internal Server Error", error: error.message });
  }
};

UploadUserCodeRouter.post("/", UserAuthMiddleware, UploadUserCodeHandler);

export default UploadUserCodeRouter;
