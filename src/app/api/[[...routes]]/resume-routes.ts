import { Hono } from "hono";
import status from "http-status";
import fs from "fs";
import path from "path";

import { uploadPdfToCloudinary } from "@/src/lib/cloudinary";
import dbConnect from "@/src/lib/db";
import { authMiddleware } from "@/src/lib/jwt";
import { Resume } from "@/src/models/resume-model";

const app = new Hono()
  .get("/", async (c) => {
    const asInfo = c.req.query("info") === "true";
    let resumeUrl = "";
    let updatedAt = null;
    let pdfBuffer: Buffer | null = null;

    try {
      await dbConnect();
      const resume = await Resume.findOne();
      if (resume) {
        resumeUrl = resume.url;
        updatedAt = resume.updatedAt;

        if (!asInfo) {
          const pdfResponse = await fetch(resume.url);
          if (pdfResponse.ok) {
            pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
          }
        }
      }
    } catch (err) {
      console.warn("Database connection or resume fetch failed, using local PDF file:", err);
    }

    if (asInfo) {
      return c.json({
        url: resumeUrl || "/resume.pdf",
        updatedAt: updatedAt || new Date(),
      });
    }

    if (!pdfBuffer) {
      const filePath = path.join(process.cwd(), "public", "resume.pdf");
      if (fs.existsSync(filePath)) {
        pdfBuffer = fs.readFileSync(filePath);
      }
    }

    if (!pdfBuffer) {
      return c.json({ message: "No resume PDF file found" }, status.NOT_FOUND);
    }

    return c.newResponse(new Uint8Array(pdfBuffer), 200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="vinay_joshi_full_stack_developer.pdf"',
    });
  })
  .post("/", authMiddleware, async (c) => {
    await dbConnect();
    const body = await c.req.formData();
    const file = body.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ message: "No PDF file provided" }, status.BAD_REQUEST);
    }

    if (file.type !== "application/pdf") {
      return c.json({ message: "Only PDF files are allowed" }, status.BAD_REQUEST);
    }

    const url = await uploadPdfToCloudinary(file, "resume");

    const resume = await Resume.findOneAndUpdate({}, { url }, { upsert: true, new: true });

    return c.json({ success: true, url: resume.url, updatedAt: resume.updatedAt });
  });

export default app;
