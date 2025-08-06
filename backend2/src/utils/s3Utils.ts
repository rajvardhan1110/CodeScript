import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3config/s3config";

export const uploadStringToS3 = async (
  content: string,
  key: string,
  contentType: string = "text/markdown"
): Promise<string> => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME!;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: content,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the S3 object URL
    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return url;
  } catch (error) {
    console.error("Error uploading string to S3:", error);
    throw new Error("S3 upload failed");
  }
};
