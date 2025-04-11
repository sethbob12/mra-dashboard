// api/reviewer-stats.js
const fetch = require('node-fetch').default;
const Cors = require('cors');
const cors = Cors({ origin: '*' });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });
}

module.exports = async (req, res) => {
  try {
    await runMiddleware(req, res, cors);
    const { d1, d2 } = req.query;
    if (!d1 || !d2) {
      return res.status(400).json({ error: 'Missing d1 or d2' });
    }

    const targetUrl = `http://136.179.36.245:8001/api/reviewer-stats?d1=${d1}&d2=${d2}`;
    console.log("Proxying to:", targetUrl);

    const upstream = await fetch(targetUrl, {
      headers: { 'X-API-Key': 'pxc-super-secret-key' },
    });
    const text = await upstream.text();
    console.log("Upstream status:", upstream.status);

    if (!upstream.ok) {
      console.error("Upstream error body:", text);
      return res.status(upstream.status).send(text);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", e);
      return res.status(502).send('Bad gateway: invalid JSON');
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Function error:", err);
    return res.status(500).json({ error: err.message });
  }
};
