import express, { Request, Response } from "express";
import { uploadStringToS3 } from "../utils/s3Utils";
import { DefaultMarkdownModel } from "../models/DefaultMarkdownModel";

const CreateDefaultMarkdownRouter = express.Router();

CreateDefaultMarkdownRouter.post("/", async (req: Request, res: Response) => {
  const markdownContent = `# [Problem Title]

## Description
<!-- Write a clear and concise description of the problem. -->

## Input
<!-- Explain the input format line by line. Mention types, order, and special conditions. -->

## Output
<!-- Explain what the program should output and in what format. -->

## Examples

### Example 1  
Input  
<!-- Example input here -->  
4 5

Output  
<!-- Expected output here -->  
9

### Example 2  
Input  
<!-- Example input here -->  
-2 3

Output  
<!-- Expected output here -->  
1

## Constraints
<!-- Mention all constraints like ranges, lengths, and limits. For example:
1 <= N <= 10^5  
-10^9 <= A, B <= 10^9  
-->

## Solving Explanation

### For Example 1:
<!-- Step-by-step logic behind Example 1. What’s happening with the input? Why is the output 9? -->

### For Example 2:
<!-- Step-by-step logic behind Example 2. How does -2 + 3 = 1? -->
`;

  const s3Key = "default_markdown.md";

  try {
    // Upload markdown string to S3
    const s3Url = await uploadStringToS3(markdownContent, s3Key,"text/markdown");

    // Save the S3 URL to MongoDB
    const savedDoc = await DefaultMarkdownModel.create({ markdownS3Url: s3Url });

    return res.status(201).json({
      message: "Default markdown uploaded and saved successfully",
      markdownRecord: savedDoc
    });
  } catch (error) {
    console.error("Error uploading markdown or saving to DB:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default CreateDefaultMarkdownRouter;
