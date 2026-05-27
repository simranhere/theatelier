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
    time:   new Date().toISOString(),
  });
});

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 2007;
app.listen(PORT, () => {
  console.log(` Server started on port: ${PORT}`);
});

// ── 404 Handler (Always Last) ──────────────────────────
app.use((req, res) => {
  console.log("404 ->", req.method, req.url);
  res.status(404).json({
    status: false,
    msg:    "Invalid URL",
  });
});
module.exports = app;