import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";

const app = express();
const PORT = 3000;

const VIDEOS_DIR = path.resolve(__dirname, "../videos");
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".mov"]);

// Ensure videos directory exists
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}

// Sanitize filename: strip path components, replace unsafe chars
function sanitizeFilename(original: string): string {
  return path.basename(original).replace(/[^a-zA-Z0-9._-]/g, "_");
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, VIDEOS_DIR),
  filename: (_req, file, cb) => cb(null, sanitizeFilename(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (VIDEO_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${ext}`));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5 GB
});

app.get("/api/videos", (_req, res) => {
  try {
    const files = fs
      .readdirSync(VIDEOS_DIR)
      .filter((f) => VIDEO_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
    res.json(files);
  } catch {
    res.json([]);
  }
});

app.post("/api/upload", (req, res) => {
  upload.single("video")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    res.json({ filename: req.file.filename });
  });
});

app.delete("/api/videos/:filename", (req, res) => {
  const filename = sanitizeFilename(req.params.filename);
  const filePath = path.join(VIDEOS_DIR, filename);

  // Verify the resolved path is still inside VIDEOS_DIR
  if (!path.resolve(filePath).startsWith(VIDEOS_DIR)) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  fs.unlinkSync(filePath);
  res.json({ deleted: filename });
});

app.use("/videos", express.static(VIDEOS_DIR));

// Serve built frontend in production
const webDist = path.resolve(__dirname, "../web/dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
