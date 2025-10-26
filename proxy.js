import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing ?url=");
  }

  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");
    let body = await response.text();

    // If it’s HTML, rewrite relative asset paths
    if (contentType && contentType.includes("text/html")) {
      const base = new URL(targetUrl).origin + new URL(targetUrl).pathname.replace(/\/[^\/]*$/, "");
      const proxyBase = `${req.protocol}://${req.get("host")}/?url=${base}/`;

      // Rewrite src, href, and url() references
      body = body
        .replace(/(src|href)=["']([^"'#:]+)["']/g, (match, attr, path) => {
          if (path.startsWith("data:") || path.startsWith("http")) return match;
          return `${attr}="${proxyBase}${path}"`;
        })
        .replace(/url\(["']?([^"')#]+)["']?\)/g, (match, path) => {
          if (path.startsWith("data:") || path.startsWith("http")) return match;
          return `url(${proxyBase}${path})`;
        });
    }

    res.set("content-type", contentType || "text/plain");
    res.send(body);
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});

