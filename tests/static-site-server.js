import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".xml": "application/xml; charset=utf-8"
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "site");

function safeFilePath(requestUrl) {
  let parsed;
  try {
    parsed = new URL(requestUrl, "http://127.0.0.1");
  } catch (error) {
    return null;
  }
  let decoded;
  try {
    decoded = decodeURIComponent(parsed.pathname);
  } catch (error) {
    return null;
  }
  const relativePath = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const resolved = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, resolved);
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) return null;
  return resolved;
}

async function resolveFile(requestUrl) {
  const resolved = safeFilePath(requestUrl);
  if (!resolved) return null;
  const info = await stat(resolved).catch(() => null);
  if (info?.isFile()) return resolved;
  if (info?.isDirectory()) {
    const indexFile = path.join(resolved, "index.html");
    const indexInfo = await stat(indexFile).catch(() => null);
    if (indexInfo?.isFile()) return indexFile;
  }
  return null;
}

export async function startStaticSiteServer(port = 0) {
  const server = createServer(async (request, response) => {
    const filePath = await resolveFile(request.url || "/");
    if (!filePath) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "content-type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  return {
    url: `http://127.0.0.1:${server.address().port}`,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  };
}
