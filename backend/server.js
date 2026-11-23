
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const ROOT_DIR = path.join(__dirname, "..");

const LIBRETRANSLATE_URL = (
  process.env.LIBRETRANSLATE_URL || "https://libretranslate.com"
).replace(/\/+$/, "");

const LIBRETRANSLATE_API_KEY =
  process.env.LIBRETRANSLATE_API_KEY || "";

// Supported language codes used by the frontend.
const SUPPORTED_LANGUAGES = new Set([
  "en",
  "hi",
  "kn",
  "te",
  "ta",
  "ml",
  "mr",
  "bn",
  "gu",
  "pa",
  "ur",
  "or",
  "es",
  "fr",
  "de",
  "zh",
  "ja",
  "ko",
  "ar",
  "ru",
  "pt",
  "it"
]);

// Basic security headers.
app.use(helmet());

// Parse JSON requests.
app.use(express.json({ limit: "20kb" }));

// Limit translation requests to reduce abuse.
const translationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many translation requests. Please try again later."
  }
});

// Health-check endpoint.
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "LingoBridge backend is running.",
    environment: NODE_ENV
  });
});

// Translation endpoint.
app.post("/api/translate", translationLimiter, async (req, res) => {
  try {
    const { q, source, target, format = "text" } = req.body || {};

    // Validate text.
    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({
        error: "Please enter text to translate."
      });
    }

    if (q.length > 5000) {
      return res.status(400).json({
        error: "Text cannot exceed 5000 characters."
      });
    }

    // Validate language selections.
    if (
      typeof source !== "string" ||
      (source !== "auto" && !SUPPORTED_LANGUAGES.has(source))
    ) {
      return res.status(400).json({
        error: "Invalid source language."
      });
    }

    if (
      typeof target !== "string" ||
      !SUPPORTED_LANGUAGES.has(target)
    ) {
      return res.status(400).json({
        error: "Invalid target language."
      });
    }

    if (source !== "auto" && source === target) {
      return res.status(400).json({
        error: "Source and target languages must be different."
      });
    }

    if (format !== "text") {
      return res.status(400).json({
        error: "Unsupported translation format."
      });
    }

    // Build LibreTranslate request.
    const requestBody = {
      q: q.trim(),
      source,
      target,
      format: "text"
    };

    if (LIBRETRANSLATE_API_KEY) {
      requestBody.api_key = LIBRETRANSLATE_API_KEY;
    }

    const translateUrl = `${LIBRETRANSLATE_URL}/translate`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let apiResponse;

    try {
      apiResponse = await fetch(translateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const responseData = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      console.error(
        "LibreTranslate error:",
        apiResponse.status,
        responseData
      );

      return res.status(502).json({
        error:
          responseData.error ||
          "The translation service could not process your request. Check your API configuration and try again."
      });
    }

    if (
      !responseData ||
      typeof responseData.translatedText !== "string"
    ) {
      return res.status(502).json({
        error: "The translation service returned an invalid response."
      });
    }

    return res.json({
      success: true,
      translatedText: responseData.translatedText,
      detectedLanguage:
        responseData.detectedLanguage || null
    });

  } catch (error) {
    console.error("Translation request failed:", error);

    if (error.name === "AbortError") {
      return res.status(504).json({
        error: "Translation timed out. Please try again."
      });
    }

    return res.status(500).json({
      error: "Unable to connect to the translation service. Please try again later."
    });
  }
});

// Prevent access to backend files through the static file server.
app.use((req, res, next) => {
  if (
    req.path === "/backend" ||
    req.path.startsWith("/backend/")
  ) {
    return res.sendStatus(404);
  }

  next();
});

// Serve frontend files from the main project folder.
app.use(
  express.static(ROOT_DIR, {
    dotfiles: "deny",
    index: "index.html"
  })
);

// Handle unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found."
  });
});

// Start server.
app.listen(PORT, () => {
  console.log("--------------------------------------");
  console.log("       LingoBridge Server Started");
  console.log("--------------------------------------");
  console.log(`Website: http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log("--------------------------------------");
});


