# Deployment

## GitHub
Create `MketyDigital/harrison-water-solution` with `main` as the production branch, then push this project.

## Sveltia CMS OAuth
The admin is at `/admin/` and uses the GitHub backend. Deploy the Sveltia CMS Authenticator on Cloudflare Workers and bind it to `cms-auth.harrisonwatersolution.com`. Create a GitHub OAuth App whose callback URL matches the authenticator documentation. Store the GitHub OAuth client secret only as a Cloudflare Worker secret; never commit it.

## Cloudflare Pages
Connect the GitHub repository to Cloudflare Pages.

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Custom domain: `harrisonwatersolution.com`

## Before launch
Use `/admin/` to add the verified company phone, WhatsApp, email, address, logo, favicon, brand colours, social links, real project photos, genuine testimonials, confirmed products/services and live payment URLs. Do not publish invented company facts.
