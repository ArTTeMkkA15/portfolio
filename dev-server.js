// Local development server: serves the static site and the /api/chat function,
// the same way Vercel does in production. Run with `npm run dev`.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;

try {
  process.loadEnvFile(path.join(root, ".env"));
} catch {
  // No .env file: the chat runs in demo mode.
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

async function handleApi(req, res, name) {
  const file = path.join(root, "api", `${name}.js`);
  if (!fs.existsSync(file)) return notFound(res);
  const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`);
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    req.body = raw ? JSON.parse(raw) : {};
  } catch {
    req.body = {};
  }
  return mod.default(req, res);
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    const api = pathname.match(/^\/api\/([\w-]+)\/?$/);
    if (api) return await handleApi(req, res, api[1]);

    let file = path.normalize(path.join(root, pathname));
    if (!file.startsWith(root)) return notFound(res);

    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(308, { Location: pathname + "/" + url.search });
        return res.end();
      }
      file = path.join(file, "index.html");
    }
    if (!fs.existsSync(file)) return notFound(res);

    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server error");
  }
});

server.listen(port, () => {
  console.log(`Portfolio running at http://localhost:${port}`);
});
