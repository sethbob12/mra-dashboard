// server.js
console.log("Starting proxy server...");

const express = require("express");
const fetch = require("node-fetch").default;  // Ensure you use .default for CommonJS
const cors = require("cors");                 // Import the CORS middleware

const app = express();
app.use(cors());  // Enable CORS for all routes

const PORT = 5000;

app.get("/api/reviewer-stats", async (req, res) => {
  try {
    const { d1, d2 } = req.query;
    const targetUrl = `http://136.179.36.245:8001/api/reviewer-stats?d1=${d1}&d2=${d2}`;
    console.log("Proxying request to:", targetUrl);

    const response = await fetch(targetUrl, {
      headers: { "X-API-Key": "pxc-super-secret-key" }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from live API:", response.status, errorText);
      return res.status(response.status).json({ error: "Error from live API", details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal server error in proxy", message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
