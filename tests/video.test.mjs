import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeVideoUrl } from '../src/utils/video.mjs';

test('normalizes YouTube watch URL', () => {
  assert.deepEqual(normalizeVideoUrl('https://www.youtube.com/watch?v=abc123'), { provider: 'youtube', id: 'abc123', embedUrl: 'https://www.youtube-nocookie.com/embed/abc123' });
});
test('normalizes youtu.be URL', () => {
  assert.equal(normalizeVideoUrl('https://youtu.be/xyz789')?.id, 'xyz789');
});
test('normalizes Vimeo URL', () => {
  assert.deepEqual(normalizeVideoUrl('https://vimeo.com/123456'), { provider: 'vimeo', id: '123456', embedUrl: 'https://player.vimeo.com/video/123456' });
});
test('rejects unsupported URL', () => {
  assert.equal(normalizeVideoUrl('https://example.com/video'), null);
});
