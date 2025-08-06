import express, { Request, Response } from "express";
import { uploadStringToS3 } from "../utils/s3uploadAdminCode"; // adjust the path if needed

const UploadBoilerplatesRouter = express.Router();

const boilerplates: { [languageId: number]: string } = {
  50: "#include <stdio.h>\n\nint main() {\n    // your code goes here\n    return 0;\n}",
  54: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}",
  62: "public class Main {\n    public static void main(String[] args) {\n        // your code goes here\n    }\n}",
  63: "// your code goes here",
  74: "const main = (): void => {\n    // your code goes here\n};\n\nmain();",
  60: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // your code goes here\n}",
  71: "# your code goes here"
};

UploadBoilerplatesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const results: { languageId: number; url: string }[] = [];

    for (const [languageId, code] of Object.entries(boilerplates)) {
      const key = `boilerplatecode/${languageId}`;
      const url = await uploadStringToS3(code, key);
      results.push({ languageId: parseInt(languageId), url });
    }

    return res.status(200).json({
      message: "Boilerplates uploaded successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error uploading boilerplates:", error);
    return res.status(500).json({ message: "Failed to upload boilerplates" });
  }
});

export default UploadBoilerplatesRouter;
