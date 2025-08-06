// utils/uploadSubmissionToS3.ts
import { s3Client } from "../s3config/s3config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export const uploadSubmissionToS3 = async (
  userId: string,
  testId: string,
  problemId: string,
  code: string,
  result: any
): Promise<string> => {
  const key = `submissions/${userId}/${testId}/${problemId}/${uuidv4()}.json`;

  const bucketName = process.env.S3_BUCKET_NAME!;
  const region = process.env.AWS_REGION!;

  const content = JSON.stringify({
    userId,
    testId,
    problemId,
    code,
    result,
    timestamp: new Date().toISOString(),
  });

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: content,
    ContentType: "application/json",
  });

  await s3Client.send(command);
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};
