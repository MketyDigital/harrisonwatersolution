import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL(`../${p}`, import.meta.url),'utf8');

test('public pages do not expose setup or administrator placeholder language',()=>{
  const text=[
    read('src/pages/contact.astro'),
    read('src/pages/projects.astro'),
    read('src/content/pages/contact.yml')
  ].join('\n').toLowerCase();

  for (const phrase of [
    'once configured',
    'being prepared',
    'added by the administrator',
    'configured by the administrator',
    'uploaded from the admin dashboard'
  ]) {
    assert.equal(text.includes(phrase),false,`found production placeholder: ${phrase}`);
  }
});

test('production defaults include the known contact email and verified Facebook URL',()=>{
  const site=read('src/content/settings/site.yml');
  assert.match(site,/email:\s*info@harrisonwatersolution\.com/);
  assert.match(site,/https:\/\/www\.facebook\.com\/61571525077104\//);
});

test('admin settings can edit social links without code changes',()=>{
  const admin=read('public/admin/app.js');
  assert.match(admin,/arrayEditor\('settings\.socials'/);
});

test('deployment documentation matches exact-email RLS authorization',()=>{
  const docs=read('docs/deployment.md');
  assert.doesNotMatch(docs,/harrison_site_admins/);
  assert.match(docs,/info@harrisonwatersolution\.com/);
});
