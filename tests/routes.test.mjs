import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

test('production build creates homepage', () => {
  assert.equal(existsSync('dist/index.html'), true);
});
