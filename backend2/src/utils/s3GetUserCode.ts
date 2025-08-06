import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3config/s3config";
import { Readable } from "stream";

const streamToString = async (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

export const getUserCodeFromS3 = async (
  s3Key: string
): Promise<{ code: string; language_id: number }> => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME not configured in environment");
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  try {
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("No content found in S3 object");
    }

    const bodyString = await streamToString(response.Body as Readable);
    const data = JSON.parse(bodyString);

    if (!data.code || typeof data.language_id !== "number") {
      throw new Error("Invalid format in S3 object");
    }

    return data;
  } catch (err: any) {
    console.error("❌ Failed to fetch user code from S3:", err.message || err);
    throw err;
  }
};
