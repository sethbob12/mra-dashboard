// server.js
console.log("Starting local proxy server...");

const express = require("express");
const fetch = require("node-fetch").default;
const cors = require("cors");

const app = express();
app.use(cors()); // Allow all origins locally

const PORT = 5000;

app.get("/api/reviewer-stats", async (req, res) => {
  try {
    const { d1, d2 } = req.query;
    const targetUrl = `http://136.179.36.245:8001/api/reviewer-stats?d1=${d1}&d2=${d2}`;
    console.log("Proxying request to:", targetUrl);

    const response = await fetch(targetUrl, {
      headers: { "X-API-Key": "pxc-super-secret-key" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Upstream error:", response.status, text);
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local proxy server running on http://localhost:${PORT}`);
});
