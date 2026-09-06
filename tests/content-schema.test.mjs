import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const required = [
  'src/content/settings/site.yml',
  'src/content/pages/home.yml',
  'src/content/pages/about.yml',
  'src/content/pages/contact.yml',
  'src/content/pages/ebook.yml',
  'src/content.config.ts'
];

test('editable singleton content files exist', () => {
  for (const file of required) assert.equal(existsSync(file), true, file);
});

test('ebook content exposes the core sales-page fields', () => {
  const text = readFileSync('src/content/pages/ebook.yml', 'utf8');
  for (const key of ['price:', 'primaryPaymentUrl:', 'hero:', 'painPoints:', 'benefits:', 'videosHeading:', 'testimonialsHeading:', 'faqHeading:']) {
    assert.equal(text.includes(key), true, key);
  }
});
