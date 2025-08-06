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

export const getS3DataFromUrl = async (s3Url: string): Promise<string> => {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const region = process.env.AWS_REGION!;

  // Extract S3 key from full URL
  const prefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  const key = s3Url.replace(prefix, "");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await s3Client.send(command);
  const body = response.Body as Readable;

  return await streamToString(body); 
};
