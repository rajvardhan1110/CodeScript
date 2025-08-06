import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../s3config/s3config";

export const deleteFromS3Url = async (s3Url: string): Promise<void> => {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const region = process.env.AWS_REGION!;

  const prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  const key = s3Url.replace(prefix, "");

  if (!key || key === s3Url) {
    throw new Error("Invalid S3 URL or key not extracted");
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
};
