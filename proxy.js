const express = require('express');
const request = require('request');
const app = express();

// Disable cache
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Main proxy endpoint
app.get('/', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url=');
  }

  // Add headers to make it look like a normal browser
  request({
    url: targetUrl,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  })
    .on('error', (err) => res.status(500).send(err.message))
    .pipe(res);
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ Proxy running at http://localhost:${PORT}`);
});
