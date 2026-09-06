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
The admin is a static page at `/admin/`. It signs into Supabase Auth with a dedicated Harrison administrator account. RLS restricts writes to user IDs listed in `public.harrison_site_admins`.

The admin stores only text, URLs, numbers, booleans and small JSON. Images, videos, ebook files and other media are external URLs and are never uploaded to Supabase.

To add an administrator:
1. Create the user in Supabase Authentication.
2. Copy the user's UUID.
3. Insert that UUID into `public.harrison_site_admins(user_id)`.

## Public-content caching
The public runtime requests only the published `settings/site-bundle` row. It caches the returned JSON in the visitor's browser for 24 hours. Static fallback content remains in the generated HTML if Supabase is unavailable. Add `?fresh=1` to a URL to bypass the local cache when checking a newly published edit.

This architecture avoids a Cloudflare rebuild for content changes. A first-time visitor still makes one small Supabase request because a fully static site cannot share a mutable cache across unrelated browsers without a CDN/Worker or another shared cache service.
