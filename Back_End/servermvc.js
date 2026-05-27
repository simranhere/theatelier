var express      = require("express");
var fileuploader = require("express-fileupload");
require("dotenv").config();
const cors = require("cors");

var tailorRouter   = require("./routers/TailorRouter");
var userRouter     = require("./routers/UserRouter");
var customerRouter = require("./routers/CustomerRouter");
var reviewRouter   = require("./routers/Reviewtailorrouter");

var { connectToMongoDB } = require("./config/dbconnect");

var app = express();

// ── Core Middleware ─────────────────────────────────────
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── File Upload Middleware ──────────────────────────────
app.use(
  fileuploader({
    useTempFiles: true,
    tempFileDir:  "/tmp/",
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    abortOnLimit: true,
  })
);

// ── Static Files ────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

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

// ── Export App For Vercel ──────────────────────────────
module.exports = app;