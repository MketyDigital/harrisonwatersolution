# Deployment

## Architecture
The public site is a static Astro build on Cloudflare Pages. Editable content is stored as one small JSON bundle in Supabase Postgres. The browser fetches that bundle only when its 24-hour local cache is missing or expired. No Supabase Storage, Realtime, Edge Functions, file uploads, or server-side rendering are used.

## GitHub
Repository: `MketyDigital/harrisonwatersolution`
Production branch: `main`

## Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Node: `22.12.0` or newer
- Custom domain: `harrisonwatersolution.com`

## Admin
The admin is a static page at `/admin/`. It signs into Supabase Auth with a dedicated Harrison administrator account using email and password.

Write access is enforced by Postgres Row Level Security, not by the admin page UI. INSERT, UPDATE and DELETE operations require the signed-in Supabase JWT email to equal `info@harrisonwatersolution.com`. Other authenticated Supabase users cannot modify Harrison content.

The admin stores only text, URLs, numbers, booleans and small JSON. Images, videos, ebook files and other media are external URLs and are never uploaded to Supabase.

To provision the Harrison administrator, create the Supabase Auth user with the exact email `info@harrisonwatersolution.com`, assign a strong permanent password, and confirm the email. No separate Harrison admin-membership table is used.

## Production defaults
Static Astro content provides a production-ready fallback if Supabase is unavailable. Known real defaults such as the official email and verified social links are included in both the static content and the Supabase site bundle. Optional unverified fields such as phone, WhatsApp, address, Instagram, media and payment URLs stay hidden or use a safe customer-facing fallback until a real value is added through `/admin/`.

## Public-content caching
The public runtime requests only the published `settings/site-bundle` row. It caches the returned JSON in the visitor's browser for 24 hours. Static fallback content remains in the generated HTML if Supabase is unavailable. Add `?fresh=1` to a URL to bypass the local cache when checking a newly published edit.

This architecture avoids a Cloudflare rebuild for content changes. A first-time visitor still makes one small Supabase request because a fully static site cannot share a mutable cache across unrelated browsers without a CDN/Worker or another shared cache service.
