// Worker for the uci.kazuha.me `cloudflare` target. Static assets are served first;
// this only runs for requests that match no asset. It stands in for the speedtest's
// test files: `downloading` is 30 MiB, over the 25 MiB per-asset limit, and a static
// host can't accept the upload POSTs. `wrap` in scripts/build-targets.sh removes both
// from the build, so requests for them reach this Worker.
const DOWNLOAD_BYTES = 30 * 1024 * 1024;
const CHUNK_BYTES = 64 * 1024;

const NO_STORE = { "Cache-Control": "no-store, no-cache" };

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/tools/speedtest/downloading") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
      }
      const headers = {
        ...NO_STORE,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(DOWNLOAD_BYTES),
      };
      if (request.method === "HEAD") return new Response(null, { headers });
      // Random bytes, so nothing on the way can compress them (like the original file).
      // Generated per request: Workers can't create random values at global scope.
      const chunk = crypto.getRandomValues(new Uint8Array(CHUNK_BYTES));
      let sent = 0;
      const source = new ReadableStream({
        pull(controller) {
          const n = Math.min(chunk.length, DOWNLOAD_BYTES - sent);
          controller.enqueue(n === chunk.length ? chunk : chunk.subarray(0, n));
          sent += n;
          if (sent >= DOWNLOAD_BYTES) controller.close();
        },
      });
      // FixedLengthStream keeps Content-Length (a plain stream is sent chunked).
      const { readable, writable } = new FixedLengthStream(DOWNLOAD_BYTES);
      source.pipeTo(writable);
      return new Response(readable, { headers });
    }

    if (pathname === "/tools/speedtest/upload") {
      // Read and drop the body so the client's upload actually completes.
      if (request.body) await request.body.pipeTo(new WritableStream());
      return new Response(null, { status: 200, headers: NO_STORE });
    }

    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  },
};
