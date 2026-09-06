export function resolvePaymentUrl({ nigeriaUrl = '', internationalUrl = '', primaryUrl = '' }, market = 'default') {
  if (market === 'ng') return nigeriaUrl || primaryUrl || '';
  if (market === 'international') return internationalUrl || primaryUrl || '';
  return primaryUrl || '';
}
