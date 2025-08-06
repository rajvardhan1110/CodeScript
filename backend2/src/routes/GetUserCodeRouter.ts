import express, { Request, Response } from "express";
import { UserAuthMiddleware } from "../Middleware/UserAuthMiddleware";
import { getUserCodeFromS3 } from "../utils/s3GetUserCode";

const GetUserCodeRouter = express.Router();

interface CustomRequest extends Request {
  userId?: string;
}

export const GetUserCodeHandler = async (req: CustomRequest, res: Response) => {
  try {
    const { testId, problemId } = req.body;
    const userId = req.userId;

    if (!testId || !problemId || !userId) {
      return res.status(400).json({ msg: "testId, problemId, and token are required" });
    }

    const s3Key = `${testId}/${problemId}/${userId}`;

    try {
      const { code, language_id } = await getUserCodeFromS3(s3Key);

      return res.status(200).json({
        msg: "✅ Code fetched successfully",
        code,
        language_id,
      });

    } catch (err: any) {
      // If object not found, fallback
      if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
        return res.status(200).json({
          msg: "Code not found",
          code: "",
          language_id: 54,
        });
      }

      // Other errors
      console.error("❌ Unexpected error:", err.message || err);
      return res.status(500).json({ msg: "Internal Server Error" });
    }

  } catch (err: any) {
    console.error("❌ Handler crashed:", err.message || err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

GetUserCodeRouter.post("/", UserAuthMiddleware, GetUserCodeHandler);

export default GetUserCodeRouter;
