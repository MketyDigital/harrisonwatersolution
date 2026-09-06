import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePaymentUrl } from '../src/utils/payment.mjs';

test('Nigeria payment URL overrides primary', () => {
  assert.equal(resolvePaymentUrl({ nigeriaUrl: 'ng', internationalUrl: 'intl', primaryUrl: 'main' }, 'ng'), 'ng');
});
test('international URL overrides primary', () => {
  assert.equal(resolvePaymentUrl({ nigeriaUrl: 'ng', internationalUrl: 'intl', primaryUrl: 'main' }, 'international'), 'intl');
});
test('missing market URL falls back to primary', () => {
  assert.equal(resolvePaymentUrl({ nigeriaUrl: '', internationalUrl: '', primaryUrl: 'main' }, 'ng'), 'main');
});
test('empty payment URLs fall back to the real contact page', () => {
  assert.equal(resolvePaymentUrl({ nigeriaUrl: '', internationalUrl: '', primaryUrl: '' }, 'default'), '/contact/');
});
