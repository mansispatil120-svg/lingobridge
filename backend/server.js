const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "20kb" }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use("/api/", limiter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "success",
        message: "LingoBridge server is running!",
        translationEngine: "MyMemory"
    });
});

// Split text into smaller chunks
function splitIntoChunks(text, maxBytes = 450) {
    const chunks = [];
    let current = "";

    for (const word of text.split(/(\s+)/)) {
        if (
            Buffer.byteLength(current + word, "utf8") > maxBytes &&
            current.length > 0
        ) {
            chunks.push(current);
            current = word;
        } else {
            current += word;
        }
    }

    if (current) chunks.push(current);

    return chunks;
}

// Translation route
app.post("/api/translate", async (req, res) => {
    try {
        const { q, source, target } = req.body;

        if (
            typeof q !== "string" ||
            !q.trim() ||
            !source ||
            !target
        ) {
            return res.status(400).json({
                error: "Enter text and select both languages."
            });
        }

        if (q.length > 5000) {
            return res.status(400).json({
                error: "Maximum 5000 characters allowed."
            });
        }

        

        if (source !== "auto" && source === target) {
            return res.json({
                translatedText: q
            });
        }

        const chunks = splitIntoChunks(q);
        const results = [];
        let detectedLanguage = null;

        for (const chunk of chunks) {
            const params = new URLSearchParams({
                q: chunk,
                langpair: `${source === "auto" ? "autodetect" : source}|${target}`,
                mt: "1"
            });

            const response = await fetch(
                "https://api.mymemory.translated.net/get?" +
                params.toString()
            );

            if (!response.ok) {
                throw new Error("Translation service unavailable.");
            }

            const data = await response.json();

            if (data.quotaFinished) {
                throw new Error(
                    "Daily free translation limit reached."
                );
            }

            if (
                data.responseStatus !== 200 ||
                !data.responseData?.translatedText
            ) {
                throw new Error(
                    data.responseDetails || "Translation failed."
                );
            }

            results.push(data.responseData.translatedText);

            if (!detectedLanguage && data.responseData.detectedLanguage) {
                detectedLanguage = data.responseData.detectedLanguage;
           }
        }

        res.json({
            translatedText: results.join(""),
            detectedLanguage: detectedLanguage
                ? { language: detectedLanguage }
                : null
        });
    } catch (error) {
        console.error("Translation error:", error.message);

        res.status(502).json({
            error: error.message || "Translation failed."
        });
    }
});

// Serve your frontend
app.use(express.static(path.join(__dirname, "..")));

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`LingoBridge running on port ${PORT}`);
});
