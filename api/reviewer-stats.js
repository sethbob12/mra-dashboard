// api/reviewer-stats.js
import fetch from "node-fetch";
import Cors from "cors";

// Initialize the cors middleware
const cors = Cors({
  origin: ["http://localhost:3000", "https://mra-dashboard.vercel.app"],
  methods: ["GET", "POST", "OPTIONS"],
});

// Helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  const { d1, d2 } = req.query;
  const targetUrl = `http://136.179.36.245:8001/api/reviewer-stats?d1=${d1}&d2=${d2}`;
  console.log("Proxying request to:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: { "X-API-Key": "pxc-super-secret-key" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from live API:", response.status, errorText);
      res.status(response.status).json({ error: "Error from live API", details: errorText });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal server error in proxy", message: error.message });
  }
}
