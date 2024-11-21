const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 5000;
// Middleware
app.use(cors());
app.use(express.json());
// Multer configuration for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, "uploads");
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);
            }
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        // Allow only PDF files
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed."));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB file size limit
    },
});
// File upload route
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        const filePath = path.join(__dirname, "uploads", req.file.filename);
        // Parse the PDF file
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        // Extracted text from PDF
        const extractedText = pdfData.text;
        // Cleanup: Delete the uploaded file after processing
        fs.unlinkSync(filePath);
        res.json({ text: extractedText });
    } catch (error) {
        console.error("Error processing file:", error.message);
        res.status(500).json({
            message: "Failed to process the file. Please try again.",
            error: error.message,
        });
    }
});
// Global error handler for Multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        return res.status(400).json({ message: err.message });
    } else if (err) {
        // General errors
        return res.status(400).json({ message: err.message });
    }
    next();
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});