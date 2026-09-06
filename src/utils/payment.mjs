export function resolvePaymentUrl({ nigeriaUrl = '', internationalUrl = '', primaryUrl = '' }, market = 'default') {
  if (market === 'ng') return nigeriaUrl || primaryUrl || '/contact/';
  if (market === 'international') return internationalUrl || primaryUrl || '/contact/';
  return primaryUrl || '/contact/';
}
