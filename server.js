const express = require("express");
const cors = require("cors");

const app = express();

// Middleware for CORS
app.use(cors({
    origin: "*",  // You can restrict this to your frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Basic route to check server status (optional)
app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
});

// Export the Express app for Vercel serverless handling
module.exports = (req, res) => {
    app(req, res);
};
