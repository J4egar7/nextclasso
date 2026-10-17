import { NextResponse } from "next/server";

// Content-Security-Policy for the whole site.
//
// Why this exists: without a CSP, a single XSS bug anywhere (a product
// field rendered unsafely, a compromised npm package, a malicious browser
// extension acting on the page) can run arbitrary JavaScript with no
// restriction, load a script from any origin, or exfiltrate data over any
// connection. This header tells the browser to refuse all of that by
// default and only allow an explicit list of sources.
//
// script-src: 'self' plus two fixed allowances.
//   - 'sha256-...' are the exact content hashes of the two static JSON-LD
//     <script> tags in app/layout.js (site/organisation structured data for
//     search engines). Their content never changes at runtime, so a hash is
//     safer than 'unsafe-inline': it allow-lists these two exact scripts and
//     nothing else, and it does not require per-request dynamic rendering.
//   - 'nonce-<random>' is a fresh, unguessable value generated on every
//     request, attached to the one JSON-LD script that genuinely does
//     change per request (the per-product structured data in
//     ProductDetailPage.js). It's threaded through as a prop from
//     app/product/[id]/page.js. No other inline script can use it, since it
//     changes every request.
// No other inline script is allowed. A bug that injects
// <script>...</script> anywhere else on the page will not execute.
const STATIC_SCRIPT_HASHES = [
  "'sha256-/avjt6Bg0f8s2q6K1xP7Thig1pmFzp7ulga65hPV30M='", // app/layout.js org schema
  "'sha256-GNG5zX7i3Pvk6XffkPVTL8gpbwJlBqC4sEy7PDbUfXg='", // app/layout.js site schema
];

function buildCsp(nonce) {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' ${STATIC_SCRIPT_HASHES.join(" ")}`,
    // Inline `style={{...}}` is used throughout the UI (accent colours,
    // computed layout). Disallowing it would require rewriting every
    // styled component to use nonced <style> blocks instead, so this is a
    // deliberate, standard trade-off: inline CSS can't execute JavaScript,
    // so it's a much lower-severity relaxation than 'unsafe-inline' would
    // be on script-src.
    `style-src 'self' 'unsafe-inline'`,
    // Product photos and the admin's shrunk-image previews come from the
    // Supabase storage bucket; blob:/data: cover the client-side image
    // compression preview in AdminPage.js before upload.
    `img-src 'self' blob: data: https://*.supabase.co`,
    `font-src 'self'`,
    // The Supabase client talks to your project over HTTPS (reads/writes)
    // and WSS (the realtime product subscription in StoreContext.js).
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    // Belt-and-suspenders with the X-Frame-Options header already set in
    // next.config.js: no one can iframe the store or the admin panel.
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export function middleware(request) {
  // Edge runtime has Web Crypto's randomUUID(); base64-encoding it gives a
  // CSP-safe nonce value.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-csp-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  return response;
}

// Runs for every page request (not for static assets), so the CSP header
// and nonce are always present. Middleware adding a response header does
// not force any route into dynamic rendering by itself — app/layout.js
// keeps its existing 60-second ISR; only app/product/[id]/page.js reads
// the nonce (see that file), which is the one route that already does a
// live per-request Supabase read for its metadata anyway.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
