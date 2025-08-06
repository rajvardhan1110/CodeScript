import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3config/s3config"; // Make sure this is correctly configured

export const uploadUserCodeToS3 = async (
  code: string,
  language_id: number,
  s3Key: string
): Promise<string> => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME not configured in environment");
  }

  const jsonData = JSON.stringify({ code, language_id });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
    Body: jsonData,
    ContentType: "application/json",
  });

  await s3Client.send(command);

  return `https://${bucketName}.s3.amazonaws.com/${s3Key}`;
};
