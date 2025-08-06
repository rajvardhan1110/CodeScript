import express, { Request, Response } from "express";
import { getS3DataFromUrl } from "../utils/s3GetCode";

const GetBoilerplateCodeRouter = express.Router();

// Mapping of Judge0 language IDs to S3 keys
const boilerplateKeyMap: { [languageId: number]: string } = {
  50: "boilerplatecode/50",  // C
  54: "boilerplatecode/54",  // C++
  62: "boilerplatecode/62",  // Java
  63: "boilerplatecode/63",  // JavaScript
  74: "boilerplatecode/74",  // TypeScript
  60: "boilerplatecode/60",  // Go
  71: "boilerplatecode/71",  // Python
};

export const GetBoilerplateCodeHandler = async (req: Request, res: Response) => {
  try {
    const { languageId } = req.body;

    console.log("📥 Received request to fetch boilerplate code for languageId:", languageId);

    if (!languageId || typeof languageId !== "number") {
      console.warn("⚠️ Invalid or missing languageId in request body:", req.body);
      return res.status(400).json({ message: "Missing or invalid languageId" });
    }

    const key = boilerplateKeyMap[languageId];
    if (!key) {
      console.warn("⚠️ Unsupported languageId:", languageId);
      return res.status(400).json({ message: "Unsupported languageId" });
    }

    const bucketName = process.env.S3_BUCKET_NAME!;
    const region = process.env.AWS_REGION!;
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    console.log("🔗 Constructed S3 URL:", s3Url);

    const code = await getS3DataFromUrl(s3Url);

    console.log(`✅ Successfully fetched boilerplate code for languageId ${languageId}. Length: ${code.length} chars`);

    return res.status(200).json({
      languageId,
      boilerplateCode: code,
    });
  } catch (error: any) {
    console.error("❌ Error in GetBoilerplateCodeHandler:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

GetBoilerplateCodeRouter.post("/", GetBoilerplateCodeHandler);

export default GetBoilerplateCodeRouter;
