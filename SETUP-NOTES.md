# What changed, and what you need to do

## 1. Admin login — was hardcoded, now real

**Before:** `AdminLoginPage.js` had `ADMIN_EMAIL` and `ADMIN_PASSWORD` written directly
in the JS, which meant anyone could read your admin password by opening the deployed
site's dev tools (View Source / Network tab / the JS bundle itself).

**Now:** Admin login uses real Firebase Authentication, and admin *status* is checked
against a Firestore collection (`admins/{uid}`) that only exists server-side — nothing
sensitive ships in the JS bundle anymore.

### One-time setup you need to do in the Firebase Console (project `classo-1`):

1. **Create your real admin account:**
   Authentication → Users → Add user. Use a real email you control and a strong password
   (not `claso0786@gmail.con` — that typo'd `.con` domain was in the old code too, worth
   fixing along the way).

2. **Mark that account as an admin in Firestore:**
   Firestore Database → create a collection called `admins`.
   Add a document whose **Document ID** is that user's UID (copy it from the Authentication
   user list) — the document's contents don't matter, its existence is the whole check.

3. **Publish the security rules** in this project:
   - Firestore Database → Rules → paste in `firestore.rules` (included here) → Publish.
   - Storage → Rules → paste in `storage.rules` (included here) → Publish.
     (Storage will prompt you once to allow it to read Firestore for this rule — accept it.)

That's it — log in at `/admin` with the real email/password you created in step 1.

## 2. Admin product changes now actually save

**Before:** "Add/Edit/Delete Product" in the admin panel only changed a `useState` array
in memory. It never touched the live catalog customers see, and vanished on refresh.

**Now:** Products are read from and written to a Firestore `products` collection.
- Images are uploaded to Firebase Storage (not stuffed into the database as base64 text).
- `HomePage`/`SkincarePage`/`MakeupPage` now merge Firestore products in alongside the
  existing static catalog (`src/data/products.js`), live, via `onSnapshot` — so anything
  an admin adds shows up on the storefront immediately, without a redeploy.
- The original static products are untouched and still show — Firestore products are
  additive, not a replacement.

No action needed here beyond the rules setup above; it works once those are published.

## 3. Two more things noticed, not yet fixed (flagging for you to decide)

- **`AuthPage.js` (customer login/signup) is fully built but not wired into `App.js`** —
  there's no `page === "auth"` case, so customers currently can't sign up or log in at all;
  checkout works as guest-only. Want me to wire it in (add a nav/account entry that routes
  to it), or is guest-only checkout intentional for now?
- `AuthPage.js` also has its own hardcoded `ADMIN_EMAIL` (a different one from the old
  `AdminLoginPage`), left over from before. Since it's unreachable right now it's not a live
  risk, but worth cleaning up if you wire the page in.

## 4. Migrated from Create React App to Next.js

The site is no longer a Create React App single-page app — it's now a real
Next.js site with proper routes. This fixes everything from the earlier
conversation:

- **Every page has a real URL now**: `/`, `/skincare`, `/makeup`, `/about`,
  `/brands`, `/checkout`, `/product/[id]`, `/admin`, `/admin/login`. You can
  bookmark or share a link to any of them directly.
- **Refreshing any page keeps you on that page** — it's a real server route,
  not a JS-only state variable.
- **Back/forward buttons work properly**, and links open in new tabs correctly.
- **Cart and favourites now persist** across refreshes too (saved to
  `localStorage`), so refreshing mid-checkout no longer empties your cart.
- **Better for Google**: pages are pre-rendered as real HTML at build time
  (you can see this in the build output — `○ (Static)` next to most routes),
  rather than shipped as one empty shell that needs JS to fill in.
- **`/product/[id]` is a real dynamic route** — anyone can open a direct link
  to a specific product, and it looks the product up by ID from your catalog
  (static + Firestore-published) instead of needing to click through from a
  listing page first.
- **`/brands` is now reachable too** — it existed in your code before but was
  never wired into any navigation; it's now a real page (not yet linked from
  the nav menu — let me know if you want it added there).

### What changed structurally, if you're curious
- `src/pages/*.js` was renamed to `src/screens/*.js` — Next.js treats a real
  `pages/` folder as its own special routing system, so keeping that name
  would have caused conflicts with the new `app/` routing folder.
- All your shared state (cart, favourites, admin login, live product sync)
  moved from `App.js` into `src/lib/StoreContext.js`, a React Context that
  wraps the whole site from `app/layout.js`.
- Each route under `app/` is a small wrapper file that renders your existing
  screen component with the right props — your actual page components
  (`HomePage.js`, `CheckoutPage.js`, etc.) are almost entirely unchanged.
- Deploying to Vercel needs **zero config** for this — Vercel auto-detects
  Next.js and handles routing/rendering natively (no `vercel.json` needed,
  unlike the old CRA setup).

### Before you push this live
Update the placeholder domain in `app/layout.js` (`metadataBase`) once you've
moved to your `.pk` domain — currently set to `classo-topaz.vercel.app`.

## 5. Moving off classo-topaz.vercel.app to a .pk domain

Buying `classo.com.pk` or `classo.pk` and pointing it at your existing Vercel deployment
doesn't require touching any code — it's entirely DNS + Vercel config:

1. **Register the domain.** `.pk` domains (including `.com.pk`) are issued by **PKNIC**
   (pknic.net.pk), Pakistan's registry, or through PKNIC-accredited resellers. You'll need
   Pakistani ID/NTN details depending on the domain class — check PKNIC's current
   requirements when you register, since these can change.

2. **Add the domain in Vercel:** Project → Settings → Domains → enter `classo.com.pk`
   (and optionally `www.classo.com.pk`) → Add.

3. **Point DNS at Vercel** — Vercel will show you exactly which records to add once you
   type the domain in. Do this at your registrar/DNS provider:
   - Apex domain (`classo.com.pk`): an **A record** to Vercel's IP (currently `76.76.21.21`,
     but always use the value Vercel's dashboard shows you, since it can change).
   - `www.classo.com.pk`: a **CNAME** to `cname.vercel-dns.com`.

4. **Wait for DNS propagation** (usually minutes, sometimes up to 24–48h) — Vercel's
   dashboard will show the domain going from "Invalid Configuration" to "Valid" and issue
   an SSL certificate automatically.

5. Optional: set `classo.com.pk` as your **Primary domain** in Vercel so
   `classo-topaz.vercel.app` redirects to it, keeping one canonical URL for SEO.

I can't register the domain or touch your DNS/Vercel dashboard for you (those need your
login), but happy to double check your DNS records once you've added them, or troubleshoot
if Vercel shows an error.

## 6. Migrated from Firebase to Supabase

Products, admin login, and orders now all run on Supabase instead of Firebase.
Firebase has been fully removed from the project (the `firebase` package is
gone from `package.json` — this also cut the install from 107+ packages down
to 34, which should help page load speed).

### What changed
- **Products**: same live-sync behaviour as before (add/edit/delete in the
  admin panel shows up on the storefront instantly), now backed by a
  Postgres `products` table instead of a Firestore collection.
- **Admin login**: now uses Supabase Auth instead of Firebase Auth. Same
  security model as before — a user is only treated as an admin if a row
  exists for them in the `admins` table (checked server-side via Row Level
  Security, not just in the app's JavaScript).
- **Product images**: now upload to Supabase Storage instead of Firebase
  Storage.
- **Orders are now real** — previously "placing an order" only saved to the
  customer's own browser (localStorage), which meant you had no way to see
  anyone's orders but your own. Every order now writes to a shared `orders`
  table in Supabase, which the admin dashboard will read from once we build
  it out. (The customer's device also still keeps a local copy for their
  own "My Orders" page — that part didn't change.)
- The schema already includes a `manufacturing_cost` column on products,
  ready for the profit/revenue dashboard — that UI itself isn't built yet,
  this phase was just the data foundation.

### One-time setup you need to do

1. **Create a Supabase project** at [supabase.com](https://supabase.com) if
   you haven't already (free tier is plenty to start).

2. **Run the schema**: Supabase Dashboard → SQL Editor → New Query → paste
   in the entire contents of `supabase-schema.sql` (included in this
   project) → Run. This creates the `products`, `admins`, and `orders`
   tables, sets up Row Level Security so the right people can read/write
   the right things, and creates a public storage bucket for product images.

3. **Create your admin account**: Supabase Dashboard → Authentication →
   Users → Add User. Use a real email and a strong password.

4. **Mark that account as an admin**: Supabase Dashboard → Table Editor →
   `admins` table → Insert Row. Set `id` to that user's UID (copy it from
   the Authentication → Users list) and `email` to their email.

5. **Get your API keys**: Supabase Dashboard → Project Settings → API.
   You need the **Project URL** and the **anon public** key (not the
   `service_role` key — that one should never be used in frontend code).

6. **Set environment variables**:
   - Locally: copy `.env.local.example` to `.env.local` and fill in the
     two values from step 5.
   - On Vercel: Project → Settings → Environment Variables → add
     `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with
     the same values, then redeploy.

That's it — login at `/admin` with the account from step 3, and adding a
product should show up on the storefront within a second or two.
