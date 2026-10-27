# Immediate Harrison public-content publication

Admin saves write the Supabase `harrison_site_content` bundle first, then invoke the
`harrison-publish-content` Supabase Edge Function with the signed-in user JWT.

The deployed Edge Function verifies the JWT against Supabase Auth and allows only
`info@harrisonwatersolution.com` (matching the table RLS policy). It uses
the **server-side only** environment variable `HARRISON_GITHUB_TOKEN` to
dispatch GitHub Actions workflow `publish-harrison-content.yml` on `main`.
The workflow reads the published Supabase bundle, commits a new public JSON
snapshot only when content differs, and causes the site to redeploy through
its existing hosting connection.

## One-time secret configuration (required)

1. Create a narrowly scoped GitHub fine-grained personal access token for
   `MketyDigital/harrisonwatersolution` with **Actions: write** repository permission.
   Do not expose this token in JavaScript or git.
2. Add it as the `HARRISON_GITHUB_TOKEN` Edge Functions secret for Supabase
   project `vdblajgxrfndjesoyayy`.
3. Save a harmless text change in the admin and verify the function responds with
   `queued:true`, the workflow runs, and the hosting provider deploys its commit.

Until configured, an admin save still succeeds but displays the publishing
configuration error. The six-hour scheduled workflow remains as a fallback.

The browser checks its public JSON cache at most 60 seconds after the previous
load, **not via Supabase**. Shared CDN caching and hosting deployment delays may
extend visibility; content is not synchronously invalidated on every device.
