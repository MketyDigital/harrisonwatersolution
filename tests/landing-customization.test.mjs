import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=f=>readFileSync(f,'utf8');
test('ebook layout omits regular navigation and footer',()=>{
  assert.match(read('src/pages/water-business-blueprint.astro'),/<BaseLayout landing title=/);
  assert.match(read('src/layouts/BaseLayout.astro'),/!landing && <SiteFooter/);
  assert.match(read('src/components/SiteHeader.astro'),/!landing &&/);
});
test('logo has visible fallback and is editable from settings',()=>{
  assert.match(read('public/admin/app.js'),/settings\.logo/);
  assert.match(read('public/js/site-content.js'),/img.onerror=fallback/);
  assert.match(read('src/components/SiteHeader.astro'),/brand-logo/);
});
test('pixel loader is isolated to ebook and never asserts a purchase',()=>{
  const a=read('public/admin/app.js');
  for(const id of ['meta','tiktok','google'])assert.ok(a.includes('pages.ebook.pixels.'+id));
  const s=read('public/js/landing-pixels.js');
  assert.match(s,/main\[data-hws-page="ebook"\]/);
  assert.match(s,/PageView/);
  assert.doesNotMatch(s,/CompletePayment|Purchase/);
});