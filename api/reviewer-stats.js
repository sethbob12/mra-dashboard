// api/reviewer-stats.js
const Cors = require('cors');
const cors = Cors({ origin: '*' });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)));
  });
}

module.exports = async (req, res) => {
  console.log("Invoked with query:", req.query);
  await runMiddleware(req, res, cors);
  res.status(200).json({ query: req.query });
};
