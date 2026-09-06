export function normalizeVideoUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? { provider: 'youtube', id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (url.hostname === 'youtu.be') {
      const id = url.pathname.replace(/^\//, '').split('/')[0];
      return id ? { provider: 'youtube', id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? { provider: 'vimeo', id, embedUrl: `https://player.vimeo.com/video/${id}` } : null;
    }
  } catch {}
  return null;
}
