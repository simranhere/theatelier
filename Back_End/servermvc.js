var express      = require("express");
var fileuploader = require("express-fileupload");
const cors = require("cors");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
var tailorRouter   = require("./routers/TailorRouter");
var userRouter     = require("./routers/UserRouter");
var customerRouter = require("./routers/CustomerRouter");
var reviewRouter   = require("./routers/Reviewtailorrouter");

var { connectToMongoDB } = require("./config/dbconnect");

var app = express();

// ── Core Middleware ─────────────────────────────────────
app.use(
  cors({
    origin: [
      "https://theatelier-56tl.vercel.app",
      "http://localhost:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── File Upload Middleware ──────────────────────────────
app.use(
  fileuploader({
    useTempFiles: true,
    tempFileDir:  "/tmp/",
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
    abortOnLimit: true,
  })
);

// ── Cloudinary Upload Route ─────────────────────────────
// Use this endpoint from frontend to upload any image or PDF
// POST /uploads  →  returns { status: true, url: "https://cloudinary..." }
app.post("/uploads", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ status: false, msg: "No file provided" });
    }

    const file = req.files.file;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",   // handles images + PDFs automatically
      folder: "uploads",       // organizes under 'uploads' folder in Cloudinary
    });

    res.json({
      status: true,
      url:    result.secure_url,
      public_id: result.public_id, // useful if you ever want to delete files
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ status: false, msg: err.message });
  }
});

// ── Database Connection ─────────────────────────────────
connectToMongoDB();

// ── Routes ─────────────────────────────────────────────
app.use("/user",     userRouter);
app.use("/customer", customerRouter);
app.use("/tailor",   tailorRouter);
app.use("/review",   reviewRouter);

// ── Health Check ───────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString(),
  });
});

// ── Root Route ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend running successfully");
});

// ── 404 Handler (Always Last) ──────────────────────────
app.use((req, res) => {
  console.log("404 ->", req.method, req.url);
  res.status(404).json({
    status: false,
    msg: "Invalid URL",
  });
});

// ── Export App For Vercel (DO NOT call app.listen here) ─
module.exports = app;