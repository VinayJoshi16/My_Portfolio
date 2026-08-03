import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import status from "http-status";
import mongoose from "mongoose";
import { z } from "zod";

import { projectSchema } from "@/src/definitions/projects-validations";
import { uploadToCloudinary } from "@/src/lib/cloudinary";
import dbConnect from "@/src/lib/db";
import { authMiddleware, withHiddenAuth } from "@/src/lib/jwt";
import { Project, projectType } from "@/src/models/project-model";
import { FALLBACK_PROJECTS } from "@/src/lib/fallback-data";

const app = new Hono()
  .get("/", withHiddenAuth, async (c) => {
    let data;
    try {
      await dbConnect();
      const withHidden = c.req.query("withHidden") === "true";
      const query = withHidden ? {} : { hide: { $ne: true } };
      data = await Project.find(query).sort({ sortIndex: 1 });
    } catch (err) {
      console.warn("Database connection failed, using fallback projects:", err);
    }

    if (!data || data.length === 0) {
      data = FALLBACK_PROJECTS.filter((p) => c.req.query("withHidden") === "true" || !p.hide);
    }

    return c.json({
      data,
    });
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "query",
      z.object({
        withHidden: z.string().optional(),
      })
    ),
    withHiddenAuth,
    async (c) => {
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing project id" }, status.BAD_REQUEST);
      }
      let data;
      try {
        await dbConnect();
        const withHidden = c.req.query("withHidden") === "true";
        if (mongoose.Types.ObjectId.isValid(id)) {
          data = await Project.findById(id);
        } else {
          data = await Project.findOne({ slug: id });
        }
        if (data && !withHidden && data.hide) {
          data = null;
        }
      } catch (err) {
        console.warn("Database connection failed, using fallback project detail:", err);
      }

      if (!data) {
        const withHidden = c.req.query("withHidden") === "true";
        data = FALLBACK_PROJECTS.find(
          (p) => (p.slug === id || p._id === id) && (withHidden || !p.hide)
        );
      }

      if (!data) {
        return c.json({ error: "Project Not Found", id }, status.NOT_FOUND);
      }
      return c.json({ data });
    }
  )
  .post("/", authMiddleware, async (c) => {
    await dbConnect();
    const body = await c.req.formData();
    const name = body.get("name");
    const year = body.get("year");
    const liveUrl = body.get("liveUrl");
    const sourceCode = body.get("sourceCode");
    const description = body.get("description");
    const thumbnail = body.get("thumbnail");
    const sortIndex = body.get("sortIndex");
    const hideRaw = body.get("hide");
    const hide = hideRaw === "true";
    const features = body.getAll("features");
    const techStack = body.getAll("techStack");
    const parsedData = {
      name,
      year,
      liveUrl,
      sourceCode,
      description,
      features: features.map((f) => ({ item: f as string })),
      techStack: techStack.map((t) => ({ item: t as string })),
      thumbnail,
      sortIndex: Number(sortIndex),
      hide,
    };
    const result = projectSchema.safeParse(parsedData);
    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return c.json({ success: false, message: "Validation failed", errors }, status.BAD_REQUEST);
    }
    const { data } = result;
    let thumbnailUrl = data.thumbnail;
    if (data.thumbnail instanceof File) {
      thumbnailUrl = await uploadToCloudinary(data.thumbnail, "projects/thumbnails");
    }
    const newProject = {
      name: data.name,
      year: Number(data.year),
      liveUrl: data.liveUrl,
      sourceCode: data.sourceCode,
      description: data.description,
      features: data.features.map((f) => f.item),
      techStack: data.techStack.map((t) => t.item),
      thumbnail: thumbnailUrl,
      sortIndex: data.sortIndex,
      hide: data.hide,
    };
    const project = await Project.create(newProject);
    if (!project) {
      return c.json({ message: "Error creating project!, Try again later" }, status.BAD_REQUEST);
    }
    return c.json({
      success: true,
      project,
    });
  })
  .patch(
    "/:id",
    authMiddleware,
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, status.BAD_REQUEST);
      }
      await dbConnect();
      const body = await c.req.formData();
      const name = body.get("name");
      const year = body.get("year");
      const liveUrl = body.get("liveUrl");
      const sourceCode = body.get("sourceCode");
      const description = body.get("description");
      const thumbnail = body.get("thumbnail");
      const sortIndex = body.get("sortIndex");
      const hideRaw = body.get("hide");
      const hide = hideRaw === "true";
      const features = body.getAll("features");
      const techStack = body.getAll("techStack");
      const parsedData = {
        name,
        year,
        liveUrl,
        sourceCode,
        description,
        features: features.map((f) => ({ item: f as string })),
        techStack: techStack.map((t) => ({ item: t as string })),
        thumbnail,
        sortIndex: Number(sortIndex),
        hide,
      };
      const result = projectSchema.safeParse(parsedData);
      if (!result.success) {
        const errors = result.error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));
        return c.json({ success: false, message: "Validation failed", errors }, status.BAD_REQUEST);
      }
      const { data } = result;
      let thumbnailUrl = data.thumbnail;
      if (data.thumbnail instanceof File) {
        thumbnailUrl = await uploadToCloudinary(data.thumbnail, "projects/thumbnails");
      }
      const newProject = {
        name: data.name,
        year: Number(data.year),
        liveUrl: data.liveUrl,
        sourceCode: data.sourceCode,
        description: data.description,
        features: data.features.map((f) => f.item),
        techStack: data.techStack.map((t) => t.item),
        thumbnail: thumbnailUrl,
        sortIndex: data.sortIndex,
        hide: data.hide,
      };
      let project = await Project.findById(id);
      if (!project) {
        return c.json({ message: "Project not found" }, status.BAD_REQUEST);
      }
      Object.assign(project, newProject);
      project = await project.save();
      return c.json<{ success: true; project: projectType }>({
        success: true,
        project,
      });
    }
  )
  .delete(
    "/:id",
    authMiddleware,
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, status.BAD_REQUEST);
      }
      await dbConnect();
      const project = await Project.findByIdAndDelete(id);
      if (!project) {
        return c.json({ message: "Error deleting project!, Try again later" }, status.NOT_FOUND);
      }
      return c.status(status.NO_CONTENT);
    }
  );

export default app;
