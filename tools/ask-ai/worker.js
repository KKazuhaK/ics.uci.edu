// Cloudflare Worker: Mistral API Proxy + Entra ID OAuth
// Deploy this to Cloudflare Workers, NOT to your website.
// This file is kept here for reference only.
//
// Environment Variables (set in Cloudflare Dashboard → Worker → Settings → Variables):
//   MISTRAL_API_KEY    - your Mistral API key (encrypt it)
//   CHAT_PASSWORD      - comma-separated passwords for legacy login
//   AZURE_CLIENT_ID    - Entra ID app registration client ID
//   AZURE_CLIENT_SECRET- Entra ID app registration client secret (encrypt it)
//   AZURE_TENANT_ID    - Entra ID tenant ID
//   JWT_SECRET         - random string for signing JWTs (encrypt it)
//
// Entra ID App Registration setup:
//   1. Go to Azure Portal → Entra ID → App registrations → New registration
//   2. Redirect URI: https://<your-worker>.workers.dev/auth/callback (Web)
//   3. API permissions: openid, profile, email (Microsoft Graph)
//   4. Certificates & secrets: create a client secret
//   5. Set environment variables above with the values

const MISTRAL_API = "https://api.mistral.ai/v1/chat/completions";
const SITEMAP_URL = "https://ics.uci.edu/~kazuhak/sitemap.json";
const CHAT_PAGE   = "https://ics.uci.edu/~kazuhak/tools/ask-ai/";
const ALLOWED_ORIGINS = [
  "https://ics.uci.edu",
  "http://localhost",
];

// --- Access-code rate limiting ---
// After RL_MAX failed attempts within RL_WINDOW seconds, lock the IP for RL_LOCKOUT seconds.
// Storage uses the Workers Cache API (per-data-center; good enough for personal-site abuse deterrence).
const RL_MAX     = 5;
const RL_WINDOW  = 15 * 60;   // failure counter expires after this many seconds of no attempts
const RL_LOCKOUT = 15 * 60;   // length of the lockout once tripped

// --- Sitemap cache ---
let sitemapCache = null;
let sitemapFetchedAt = 0;
const SITEMAP_TTL = 3600_000;

async function getSitemap() {
  const now = Date.now();
  if (sitemapCache && (now - sitemapFetchedAt) < SITEMAP_TTL) return sitemapCache;
  try {
    const res = await fetch(SITEMAP_URL);
    if (res.ok) { sitemapCache = await res.text(); sitemapFetchedAt = now; }
  } catch {}
  return sitemapCache || "";
}

// --- CORS ---
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.find(o => origin?.startsWith(o));
  return {
    "Access-Control-Allow-Origin": allowed || ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function errorResponse(message, status, origin) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// --- JWT helpers (HMAC-SHA256 via Web Crypto) ---
function base64url(buf) {
  const bytes = buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf;
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const binary = atob(s + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getSigningKey(secret) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();
  const headerB64 = base64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64url(enc.encode(JSON.stringify(payload)));
  const data = enc.encode(headerB64 + "." + payloadB64);
  const key = await getSigningKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return headerB64 + "." + payloadB64 + "." + base64url(sig);
}

async function verifyJWT(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const enc = new TextEncoder();
  const data = enc.encode(parts[0] + "." + parts[1]);
  const sig = base64urlDecode(parts[2]);
  const key = await getSigningKey(secret);
  const valid = await crypto.subtle.verify("HMAC", key, sig, data);
  if (!valid) return null;
  const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// --- Entra ID OAuth helpers ---
function getEntraAuthURL(env, workerURL) {
  const params = new URLSearchParams({
    client_id: env.AZURE_CLIENT_ID,
    response_type: "code",
    redirect_uri: workerURL + "/auth/callback",
    scope: "openid profile email",
    response_mode: "query",
    prompt: "select_account",
  });
  return `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?${params}`;
}

async function exchangeCode(code, env, workerURL) {
  const res = await fetch(`https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.AZURE_CLIENT_ID,
      client_secret: env.AZURE_CLIENT_SECRET,
      code,
      redirect_uri: workerURL + "/auth/callback",
      grant_type: "authorization_code",
      scope: "openid profile email",
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

// --- Rate-limit helpers (Cache API per-IP) ---
function rlKey(ip) {
  return new Request(`https://r-l.invalid/login-fail/${encodeURIComponent(ip)}`);
}

async function rlGet(ip) {
  const c = await caches.default.match(rlKey(ip));
  if (!c) return null;
  try { return await c.json(); } catch { return null; }
}

async function rlSet(ip, data, ttl) {
  const res = new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `max-age=${ttl}`,
    },
  });
  await caches.default.put(rlKey(ip), res);
}

async function rlClear(ip) {
  await caches.default.delete(rlKey(ip));
}

// Inspect rate-limit state without modifying it.
// Returns { blocked, retryAfter } if locked, otherwise { blocked:false, count }.
async function rlCheck(ip) {
  const r = await rlGet(ip);
  if (!r) return { blocked: false, count: 0 };
  const now = Math.floor(Date.now() / 1000);
  if (r.lockedUntil && r.lockedUntil > now) {
    return { blocked: true, retryAfter: r.lockedUntil - now };
  }
  return { blocked: false, count: r.count || 0 };
}

// Record a failed attempt. Trips a lockout once count >= RL_MAX.
async function rlFail(ip) {
  const r = (await rlGet(ip)) || { count: 0 };
  const now = Math.floor(Date.now() / 1000);
  r.count = (r.count || 0) + 1;
  let ttl = RL_WINDOW;
  if (r.count >= RL_MAX) {
    r.lockedUntil = now + RL_LOCKOUT;
    ttl = RL_LOCKOUT;
  }
  await rlSet(ip, r, ttl);
  return r;
}

function rateLimitedResponse(retryAfter, origin) {
  return new Response(JSON.stringify({
    error: "Too many failed attempts. Try again later.",
    retryAfter,
  }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
      ...corsHeaders(origin),
    },
  });
}

function passwordIsValid(env, password) {
  const list = (env.CHAT_PASSWORD || "").split(",").map(p => p.trim()).filter(Boolean);
  return password && list.includes(password);
}

// Verify a password while honoring the per-IP rate limit. Returns { ok, response }.
// - { ok: true } means the password matched and the failure counter has been cleared.
// - { ok: false, response } means caller should return that response (401 or 429).
async function authenticatePassword(env, password, ip, origin) {
  const lim = await rlCheck(ip);
  if (lim.blocked) return { ok: false, response: rateLimitedResponse(lim.retryAfter, origin) };

  if (passwordIsValid(env, password)) {
    await rlClear(ip);
    return { ok: true };
  }

  const fail = await rlFail(ip);
  if (fail.lockedUntil) {
    const retryAfter = fail.lockedUntil - Math.floor(Date.now() / 1000);
    return { ok: false, response: rateLimitedResponse(retryAfter, origin) };
  }
  const attemptsLeft = Math.max(0, RL_MAX - fail.count);
  const response = new Response(JSON.stringify({
    error: "Invalid access code",
    attemptsLeft,
  }), {
    status: 401,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
  return { ok: false, response };
}

function parseIdToken(idToken) {
  // Decode the payload (middle part) of the ID token — we trust it because it came directly from Entra
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(idToken.split(".")[1])));
    return { name: payload.name || "", email: payload.preferred_username || payload.email || "", sub: payload.sub };
  } catch { return null; }
}

// --- Main handler ---
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const workerURL = url.origin;

    // --- OAuth routes (GET) ---

    // GET /auth/login → redirect to Entra ID
    if (url.pathname === "/auth/login" && request.method === "GET") {
      return Response.redirect(getEntraAuthURL(env, workerURL), 302);
    }

    // GET /auth/callback → exchange code, issue JWT, redirect to chat page
    if (url.pathname === "/auth/callback" && request.method === "GET") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error_description") || url.searchParams.get("error");
      if (error || !code) {
        return new Response(`Login failed: ${error || "no code"}`, { status: 400, headers: { "Content-Type": "text/plain" } });
      }

      const tokenData = await exchangeCode(code, env, workerURL);
      if (!tokenData || !tokenData.id_token) {
        return new Response("Failed to exchange authorization code", { status: 500, headers: { "Content-Type": "text/plain" } });
      }

      const user = parseIdToken(tokenData.id_token);
      if (!user) {
        return new Response("Failed to parse identity", { status: 500, headers: { "Content-Type": "text/plain" } });
      }

      // Issue our own JWT (valid 7 days)
      const jwt = await signJWT({
        sub: user.sub,
        name: user.name,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
      }, env.JWT_SECRET);

      // Redirect to chat page with token
      return Response.redirect(CHAT_PAGE + "?token=" + encodeURIComponent(jwt), 302);
    }

    // --- CORS preflight ---
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // POST /auth/verify → cheap password-only check (avoids burning Mistral quota on each attempt)
    if (url.pathname === "/auth/verify" && request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      let body;
      try { body = await request.json(); } catch { return errorResponse("Invalid JSON", 400, origin); }
      const password = body && body.password;
      if (!password) return errorResponse("Password required", 400, origin);
      const auth = await authenticatePassword(env, password, ip, origin);
      if (!auth.ok) return auth.response;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // --- Chat API (POST) ---
    if (request.method !== "POST") {
      return errorResponse("Method not allowed", 405, origin);
    }

    let body;
    try { body = await request.json(); } catch { return errorResponse("Invalid JSON", 400, origin); }

    const { messages, context, password, token, mode } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse("Messages required", 400, origin);
    }

    // --- Fetch sitemap ---
    const sitemap = await getSitemap();

    // --- Authentication & mode logic ---
    let systemPrompt;
    let userName = null;

    if (mode === "chat") {
      // Authenticate via JWT (Entra ID) or password
      let authenticated = false;
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";

      if (token) {
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (payload) { authenticated = true; userName = payload.name || payload.email; }
      }

      // Password path goes through the same rate limiter as /auth/verify
      // so brute-force against the chat endpoint is throttled too.
      if (!authenticated && password) {
        const auth = await authenticatePassword(env, password, ip, origin);
        if (!auth.ok) return auth.response;
        authenticated = true;
      } else if (!authenticated && !token) {
        // No credentials supplied at all — still consult the rate limiter so a
        // locked-out IP can't probe whether the endpoint is alive.
        const lim = await rlCheck(ip);
        if (lim.blocked) return rateLimitedResponse(lim.retryAfter, origin);
      }

      if (!authenticated) {
        return errorResponse("Invalid credentials", 401, origin);
      }

      const userContext = userName ? ` The current user is ${userName}.` : "";
      systemPrompt = `You are a helpful assistant on Kazuha's personal website at UCI (https://ics.uci.edu/~kazuhak).${userContext} Respond in the same language the user writes in. Be concise and helpful. When writing math formulas, always use LaTeX notation with $ delimiters (e.g. $E = mc^2$ for inline, $$F = ma$$ for display).

--- SITE KNOWLEDGE ---
${sitemap}
--- END SITE KNOWLEDGE ---`;
    } else {
      // Page widget mode
      const pageContext = (context || "").trim();
      const isTruncated = pageContext.length > 32000;
      const truncatedContext = pageContext.slice(0, 32000);
      systemPrompt = `You are a friendly assistant embedded on a webpage. You can see the current page content and site map below.

Rules:
- For greetings or casual chat, respond naturally and briefly. Do NOT immediately describe the page content unless asked.
- When the user asks a question, answer based on the page content if relevant. Use the site map to help navigate the user to other pages when appropriate.
- If the user asks something completely unrelated to the page, you can try to help briefly, or suggest the full chat at /tools/ask-ai/ for deeper conversations.
- Respond in the same language the user writes in. Be concise.
- When writing math formulas, always use LaTeX notation with $ delimiters (e.g. $E = mc^2$ for inline, $$F = ma$$ for display). Never write plain text formulas.

--- SITE KNOWLEDGE ---
${sitemap}
--- END SITE KNOWLEDGE ---

--- PAGE CONTENT ---
${truncatedContext}
--- END PAGE CONTENT ---${isTruncated ? "\n\nNote: The page content was too long and has been truncated. If the user asks about content you cannot see, let them know that the article may be too long for you to read in full." : ""}`;
    }

    // --- Build Mistral request ---
    const recentMessages = messages.slice(-20);

    const cleaned = recentMessages.map((msg, idx) => {
      if (!Array.isArray(msg.content)) return msg;
      if (idx >= recentMessages.length - 4) return msg;
      const textParts = msg.content.filter(p => p.type === "text");
      const hadImage = msg.content.some(p => p.type === "image_url");
      const hadDoc = msg.content.some(p => p.type === "document_url");
      const label = hadImage ? "(image was sent)" : hadDoc ? "(document was sent)" : "";
      const text = textParts.map(p => p.text).join("\n");
      return { role: msg.role, content: (text ? text + "\n" : "") + label || label };
    });

    const mistralMessages = [
      { role: "system", content: systemPrompt },
      ...cleaned,
    ];

    const mistralBody = {
      model: "mistral-large-latest",
      messages: mistralMessages,
      stream: true,
      max_tokens: 2048,
    };

    const mistralResponse = await fetch(MISTRAL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify(mistralBody),
    });

    if (!mistralResponse.ok) {
      await mistralResponse.text();
      const status = mistralResponse.status;
      const userMsg = status === 429 ? "Too many requests. Please wait a moment and try again."
        : status === 422 ? "The file or message format is not supported."
        : status === 401 ? "API authentication failed. Please contact the site owner."
        : `Something went wrong (${status}). Please try again later.`;
      return errorResponse(userMsg, 502, origin);
    }

    return new Response(mistralResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        ...corsHeaders(origin),
      },
    });
  },
};
