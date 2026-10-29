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
// script-src: 'self' (no script can ever load from a third-party domain,
// which is the actual threat a compromised dependency or an injected
// <script src=...> depends on) plus 'unsafe-inline'.
//
// An earlier version tried to lock inline scripts down further with a
// per-request nonce, but Next.js only attaches that nonce to its own
// framework scripts on routes that call headers() during render, which
// was only app/product/[id]/page.js. Every other page's CSP still
// demanded a nonce Next's own scripts never carried there, so the
// browser silently refused to run them: no hydration, no onClick
// handlers, anywhere but that one page. 'unsafe-inline' trades away
// strict inline-script allow-listing for actually working correctly
// everywhere; this app never renders raw user input as HTML (reviews
// are plain React text, not dangerouslySetInnerHTML with user
// content), so that trade is a reasonable one here.
function buildCsp() {
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'`,
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
  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", buildCsp());
  return response;
}

// Runs for every page request (not for static assets). No dynamic APIs
// are used here, so this doesn't force any route into dynamic
// rendering — every page keeps whatever static/ISR behaviour it had.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
