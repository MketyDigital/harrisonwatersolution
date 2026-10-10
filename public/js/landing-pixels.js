/* eBook-only advertising pixels; no purchase conversion is inferred from a page view. */
(() => {
  if (!document.querySelector('main[data-hws-page="ebook"]')) return;
  const endpoint='https://vdblajgxrfndjesoyayy.supabase.co/rest/v1/harrison_site_content?select=data&content_type=eq.settings&slug=eq.site-bundle&published=eq.true&limit=1';
  const key='sb_publishable_nATRaQcJJrIiVLm5dyKZOg_owt3cNMQ';
  const loaded=new Set();
  const add=(url,id)=>{if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.async=true;s.src=url;document.head.appendChild(s)};
  function start(p={}) {
    const meta=String(p.meta||'').trim();
    if(/^\d{5,25}$/.test(meta)&&!loaded.has('meta')) {
      loaded.add('meta');
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init',meta);window.fbq('track','PageView');
    }
    const tt=String(p.tiktok||'').trim();
    if(/^[a-z0-9]{10,40}$/i.test(tt)&&!loaded.has('tiktok')) {
      loaded.add('tiktok');
      !function(w,d,t){w.TiktokAnalyticsObject=t;var q=w[t]=w[t]||[];q.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];q.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<q.methods.length;i++)q.setAndDefer(q,q.methods[i]);q.load=function(e){add('https://analytics.tiktok.com/i18n/pixel/events.js?sdkid='+encodeURIComponent(e)+'&lib='+t,'hws-tiktok-pixel')};q.load(tt);q.page()}(window,document,'ttq');
    }
    const google=String(p.google||'').trim().toUpperCase();
    if(/^(AW-\d{6,15}|G-[A-Z0-9]{6,20})$/.test(google)&&!loaded.has('google')) {
      loaded.add('google');
      window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
      window.gtag('js',new Date());window.gtag('config',google);
      add('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(google),'hws-google-tag');
    }
  }
  fetch(endpoint,{headers:{apikey:key,Authorization:'Bearer '+key},cache:'no-store'}).then(r=>r.ok?r.json():[]).then(rows=>start(rows?.[0]?.data?.pages?.ebook?.pixels)).catch(err=>console.warn('[HWS pixels]',err));
})();