import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3config/s3config";


export const uploadStringToS3 = async (
  content: string,
  key: string,
  contentType: string = "text/plain"
): Promise<string> => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME!;
    const region = process.env.AWS_REGION!;

    if (!bucketName || !region) {
      throw new Error("S3_BUCKET_NAME or AWS_REGION is missing in environment");
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: content,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    return url;
  } catch (error: any) {
    console.error("❌ Error uploading to S3 AdminCode / upload input and output:", error?.message || error);
    throw new Error("Failed to upload to S3 AdminCode / upload input and output");
  }
};
