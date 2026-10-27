# Harrison content publication

A successful admin save immediately updates the authorized Supabase
`harrison_site_content` record. Public pages normally read the static JSON
file `/content/harrison-site-bundle.json`, **not Supabase directly**.

## Publish changes on demand with one click (no new token)

1. Save the page in Harrison's admin editor.
2. Click the **Open one-click Publish workflow** link shown after saving,
   or visit https://github.com/MketyDigital/harrisonwatersolution/actions/workflows/publish-harrison-content.yml
3. Choose **Run workflow** on the **main** branch.
4. GitHub Actions fetches the latest published content, commits the snapshot
   only if it changed, and the hosting provider can deploy that commit.

This manual workflow uses the repository's native GitHub Actions token
(`GITHUB_TOKEN`) with scoped `contents:write` permission. There is no
separate GitHub token to put in Supabase.

The existing scheduled refresh remains a fallback. A browser's cached
copy is checked again after up to 60 seconds; hosting deployment and CDN
caches may cause further delay. The website cannot forcibly clear every
visitor's browser cache at the precise instant of an admin save.

The older `harrison-publish-content` Supabase Edge Function is not used by
the admin workflow; it may be disabled separately if desired.
