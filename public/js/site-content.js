(() => {
  const SUPABASE_URL = 'https://vdblajgxrfndjesoyayy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_nATRaQcJJrIiVLm5dyKZOg_owt3cNMQ';
  const CACHE_KEY = 'hws_site_bundle_v1';
  const CACHE_TTL = 24 * 60 * 60 * 1000;

  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const safeUrl = (value = '', fallback = '#') => {
    try {
      const u = new URL(value, location.origin);
      if (['http:','https:','mailto:','tel:'].includes(u.protocol)) return u.href;
    } catch {}
    return fallback;
  };
  const sort = xs => [...(xs || [])].sort((a,b)=>(a.sort_order ?? a.order ?? 100)-(b.sort_order ?? b.order ?? 100));
  const button = (href, label, secondary=false) => `<a class="button${secondary?' secondary':''}" href="${esc(safeUrl(href))}">${esc(label)}</a>`;
  const image = (src, alt='') => src ? `<img src="${esc(safeUrl(src,''))}" alt="${esc(alt)}" loading="lazy" decoding="async">` : '';
  const productCard = p => `<article class="card product-card">${image(p.heroImage,p.name)}<div class="product-meta">${esc(p.category||'Equipment')}</div><h3>${esc(p.name)}</h3><p>${esc(p.summary||'')}</p><a href="/products/view/?slug=${encodeURIComponent(p.slug)}">View details →</a></article>`;
  const serviceCard = s => `<article class="card"><h3>${esc(s.name)}</h3><p>${esc(s.summary||'')}</p><a href="/services/view/?slug=${encodeURIComponent(s.slug)}">View service →</a></article>`;

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!cached || !cached.data) return null;
      return cached;
    } catch { return null; }
  }

  async function fetchBundle() {
    const url = `${SUPABASE_URL}/rest/v1/harrison_site_content?select=data,updated_at&content_type=eq.settings&slug=eq.site-bundle&published=eq.true&limit=1`;
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY }, cache: 'no-store' });
    if (!res.ok) throw new Error(`Content request failed: ${res.status}`);
    const rows = await res.json();
    if (!rows[0]?.data) throw new Error('Site bundle is not published');
    const cached = { data: rows[0].data, updatedAt: rows[0].updated_at, cachedAt: Date.now() };
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cached)); } catch {}
    return cached;
  }

  async function loadBundle() {
    const force = new URLSearchParams(location.search).get('fresh') === '1';
    const cached = readCache();
    if (!force && cached && Date.now() - cached.cachedAt < CACHE_TTL) return cached.data;
    try { return (await fetchBundle()).data; }
    catch (err) {
      console.warn('[HWS content]', err);
      return cached?.data || null;
    }
  }

  function applyGlobal(bundle) {
    const site = bundle.settings || {};
    document.querySelectorAll('[data-hws-company]:not([data-hws-brand])').forEach(el => el.textContent = site.companyName || el.textContent);
    document.querySelectorAll('[data-hws-brand]').forEach(el => {
      const name=site.companyName||el.dataset.hwsCompany||'Harrison Water Solution';
      const img=el.querySelector('.brand-logo'), text=el.querySelector('.brand-text');
      if(!img||!text)return;
      const raw=String(site.logo||'').trim();let url='';
      try { const resolved=new URL(raw,location.origin);if(raw&&['http:','https:'].includes(resolved.protocol))url=resolved.href; } catch {}
      const fallback=()=>{img.hidden=true;img.removeAttribute('src');text.hidden=false;text.textContent=name};
      img.onerror=fallback;img.onload=()=>{img.hidden=false;text.hidden=true};img.alt=name;
      if(url){text.hidden=true;img.hidden=false;if(img.src!==url)img.src=url;else if(img.complete&&img.naturalWidth===0)fallback()}else fallback();
    });
    const desc = document.querySelector('[data-hws-footer-description]');
    if (desc && site.seo?.description) desc.textContent = site.seo.description;
    const contact = document.querySelector('[data-hws-footer-contact]');
    if (contact) {
      const c = site.contact || {};
      const socials = site.socials || [];
      contact.innerHTML = [
        c.phone && `<li><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></li>`,
        c.email && `<li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`,
        c.whatsapp && `<li><a href="${esc(safeUrl(c.whatsapp))}">WhatsApp</a></li>`,
        c.address && `<li>${esc(c.address)}</li>`,
        ...socials.filter(s=>s?.url).map(s=>`<li><a href="${esc(safeUrl(s.url,''))}" target="_blank" rel="noopener noreferrer">${esc(s.name||'Social')}</a></li>`)
      ].filter(Boolean).join('');
    }
    if (site.brand) {
      document.body.style.setProperty('--brand-primary', (!site.brand.primary || site.brand.primary.toLowerCase()==='#087a96' ? '#002BD8' : site.brand.primary));
      document.body.style.setProperty('--brand-secondary', (!site.brand.secondary || site.brand.secondary.toLowerCase()==='#123b4a' ? '#00249B' : site.brand.secondary));
      document.body.style.setProperty('--brand-accent', (!site.brand.accent || site.brand.accent.toLowerCase()==='#0ca6c9' ? '#00C8F8' : site.brand.accent));
    }
  }

  function renderHome(root, b) {
    const h=b.pages?.home||{}, site=b.settings||{};
    const products=sort(b.products).filter(x=>x.featured).slice(0,3);
    const services=sort(b.services).filter(x=>x.featured).slice(0,3);
    root.innerHTML = `<section class="hero"><div class="container hero-grid"><div><div class="eyebrow">${esc(h.hero?.eyebrow)}</div><h1>${esc(h.hero?.heading)}</h1><p class="lead">${esc(h.hero?.text)}</p><div class="actions">${button(site.contact?.whatsapp||'/contact/',h.hero?.primaryCta||'Request a Quote')}${button('/products/',h.hero?.secondaryCta||'View Products',true)}</div></div><div class="hero-panel"><div><div class="eyebrow">Harrison Water Solution</div><h2>Plan the system, machinery and production flow together.</h2><p>Explore verified services, machinery and completed work.</p></div></div></div></section>
    <section class="section"><div class="container"><div class="eyebrow">Services</div><h2>${esc(h.servicesHeading)}</h2><div class="grid grid-3">${services.map(serviceCard).join('')}</div></div></section>
    <section class="section section-soft"><div class="container"><div class="eyebrow">Products</div><h2>${esc(h.productsHeading)}</h2><div class="grid grid-3">${products.map(productCard).join('')}</div></div></section>
    <section class="section"><div class="container grid grid-2"><div><div class="eyebrow">Why Harrison</div><h2>${esc(h.whyHeading)}</h2></div><div class="feature-list">${(h.whyItems||[]).map(x=>`<div class="feature"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div></div></section>
    <section class="section section-soft"><div class="container"><div class="eyebrow">Process</div><h2>${esc(h.processHeading)}</h2><div class="grid grid-3">${(h.process||[]).map((x,i)=>`<div class="card"><div class="number">0${i+1}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div></div></section>
    <section class="section"><div class="container"><h2>${esc(h.ctaHeading)}</h2><p class="lead">${esc(h.ctaText)}</p><div class="actions">${button(site.contact?.whatsapp||'/contact/','Request a Quote')}</div></div></section>`;
  }

  function renderAbout(root,b){const a=b.pages?.about||{};root.innerHTML=`<section class="hero"><div class="container"><div class="eyebrow">About</div><h1>${esc(a.heading)}</h1><p class="lead">${esc(a.intro)}</p></div></section><section class="section"><div class="container grid grid-2"><div><h2>Practical, project-focused support</h2><p>${esc(a.body)}</p></div><div class="card"><h3>Areas of expertise</h3><ul>${(a.expertise||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></section>`}
  function renderContact(root,b){const p=b.pages?.contact||{}, s=b.settings||{}, c=s.contact||{}, socials=s.socials||[];root.innerHTML=`<section class="hero"><div class="container"><div class="eyebrow">Contact</div><h1>${esc(p.heading)}</h1><p class="lead">${esc(p.text)}</p><div class="actions">${c.whatsapp?button(c.whatsapp,'WhatsApp Us'):''}${c.phone?button(`tel:${c.phone}`,'Call Us',true):''}</div></div></section><section class="section"><div class="container grid grid-2"><div class="card"><h3>Project details to send</h3><ul><li>Your location</li><li>Sachet, bottled water or other application</li><li>Expected production capacity</li><li>New factory, upgrade or repair</li><li>Equipment already available, if any</li></ul></div><div class="card"><h3>Contact details</h3>${c.email?`<p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>`:''}${c.address?`<p>${esc(c.address)}</p>`:''}${c.openingHours?`<p>${esc(c.openingHours)}</p>`:''}${socials.filter(x=>x?.url).map(x=>`<p><a href="${esc(safeUrl(x.url,''))}" target="_blank" rel="noopener noreferrer">${esc(x.name||'Social')}</a></p>`).join('')}</div></div></section>`}
  function renderProducts(root,b){const items=sort(b.products);root.innerHTML=`<section class="hero"><div class="container"><div class="eyebrow">Products & Machinery</div><h1>Water-production equipment for complete factory workflows</h1><p class="lead">Browse equipment categories and request a project-specific recommendation and quotation.</p></div></section><section class="section"><div class="container grid grid-3">${items.map(productCard).join('')}</div></section>`}
  function renderProduct(root,b){const slug=new URLSearchParams(location.search).get('slug')||root.dataset.slug;const p=(b.products||[]).find(x=>x.slug===slug);if(!p)return;root.innerHTML=`<section class="hero"><div class="container grid grid-2"><div><div class="eyebrow">${esc(p.category||'Equipment')}</div><h1>${esc(p.name)}</h1><p class="lead">${esc(p.summary||'')}</p></div><div>${image(p.heroImage,p.name)}</div></div></section><section class="section"><div class="container grid grid-2"><div><h2>Overview</h2><p>${esc(p.description||'')}</p><h3>Applications</h3><ul>${(p.applications||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="card"><h3>Specifications</h3>${(p.specifications||[]).map(x=>`<p><strong>${esc(x.label)}:</strong> ${esc(x.value)}</p>`).join('')}<p><strong>Price:</strong> ${esc(p.price||'Request a quote')}</p></div></div></section>`}
  function renderServices(root,b){const items=sort(b.services);root.innerHTML=`<section class="hero"><div class="container"><div class="eyebrow">Services</div><h1>From treatment planning to factory setup support</h1><p class="lead">Practical support for new factories, upgrades and operating systems.</p></div></section><section class="section"><div class="container grid grid-3">${items.map(serviceCard).join('')}</div></section>`}
  function renderService(root,b){const slug=new URLSearchParams(location.search).get('slug')||root.dataset.slug;const s=(b.services||[]).find(x=>x.slug===slug);if(!s)return;root.innerHTML=`<section class="hero"><div class="container"><div class="eyebrow">Service</div><h1>${esc(s.name)}</h1><p class="lead">${esc(s.summary||'')}</p></div></section><section class="section"><div class="container grid grid-2"><div><h2>What this service covers</h2><p>${esc(s.description||'')}</p><h3>Deliverables</h3><ul>${(s.deliverables||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="card"><h3>Ideal for</h3><ul>${(s.idealFor||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></div></section>`}
  function renderProjects(root,b){const items=sort(b.projects).filter(x=>x.featured!==false);root.innerHTML=`<section class="hero"><div class="container"><div class="eyebrow">Projects</div><h1>Completed work, installations and factory support</h1><p class="lead">Water-treatment systems, production machinery and factory-support work tailored to each site's capacity and production requirements.</p></div></section><section class="section"><div class="container">${items.length?`<div class="grid grid-3">${items.map(x=>`<article class="card">${image(x.heroImage,x.title)}<h3>${esc(x.title)}</h3><p>${esc(x.summary||'')}</p>${x.location?`<small>${esc(x.location)}</small>`:''}</article>`).join('')}</div>`:'<div class="card"><h3>Water treatment and factory project support</h3><p>Harrison Water Solution supports water-treatment installations, production machinery, factory planning, upgrades and related technical work. Contact us with your location, capacity and project requirements for a tailored recommendation.</p></div>'}</div></section>`}

  function videoEmbed(v){try{const u=new URL(v.url);let src='';if(u.hostname.includes('youtu')){let id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop();src=`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;}else if(u.hostname.includes('vimeo')){const id=u.pathname.split('/').filter(Boolean).pop();src=`https://player.vimeo.com/video/${encodeURIComponent(id)}`;}return src?`<div class="video"><iframe src="${src}" title="${esc(v.title||'Video')}" loading="lazy" allowfullscreen></iframe></div>`:'';}catch{return ''}}
  function resolvePay(e){return e.nigeriaPaymentUrl||e.internationalPaymentUrl||e.primaryPaymentUrl||'/contact/'}
  // Keep the Astro-rendered training page intact. Supabase only enhances its proof gallery.
  // Never revert the new training offer to the legacy ebook markup.
  function renderEbook(root, bundle) {
    const e=bundle.pages?.ebook||{};
    const section=root.querySelector('#real-work .container');
    if(!section)return;
    const images=(e.landingImages||[]).filter(x=>x?.image && /^https?:\/\//i.test(x.image));
    const videos=(e.landingVideos||[]).filter(x=>x?.url);
    const testimonials=(e.landingTestimonials||[]).filter(x=>x?.quote && x?.name);
    if(!images.length&&!videos.length&&!testimonials.length)return;
    section.querySelector('.training-media-note')?.remove();
    const oldGallery=section.querySelector('.training-gallery');
    if(images.length){
      const html='<div class="training-gallery">'+images.slice(0,8).map(x=>'<figure>'+image(x.image,x.alt||'Harrison project photograph')+(x.caption?'<figcaption>'+esc(x.caption)+'</figcaption>':'')+'</figure>').join('')+'</div>';
      if(oldGallery)oldGallery.outerHTML=html;else section.insertAdjacentHTML('beforeend',html);
    }
    const oldVideos=section.querySelector('.training-videos');
    if(videos.length){
      const html='<div class="training-videos">'+videos.slice(0,4).map(x=>'<div>'+videoEmbed(x)+(x.caption?'<p>'+esc(x.caption)+'</p>':'')+'</div>').join('')+'</div>';
      if(oldVideos)oldVideos.outerHTML=html;else section.insertAdjacentHTML('beforeend',html);
    }
    const oldQuotes=section.querySelector('.training-testimonials');
    if(testimonials.length){
      const html='<div class="training-testimonials">'+testimonials.slice(0,6).map(x=>'<blockquote class="card">'+(x.image?image(x.image,x.name):'')+'<p>“'+esc(x.quote)+'”</p><footer><strong>'+esc(x.name)+'</strong> '+esc(x.role||x.location||'')+'</footer></blockquote>').join('')+'</div>';
      if(oldQuotes)oldQuotes.outerHTML=html;else section.insertAdjacentHTML('beforeend',html);
    }
  }

  const renderers={home:renderHome,about:renderAbout,contact:renderContact,products:renderProducts,product:renderProduct,services:renderServices,service:renderService,projects:renderProjects,ebook:renderEbook};
  document.addEventListener('DOMContentLoaded', async () => {
    const root=document.querySelector('main[data-hws-page]');
    if(!root)return;
    const bundle=await loadBundle();
    if(!bundle)return;
    applyGlobal(bundle);
    const fn=renderers[root.dataset.hwsPage];
    if(fn) fn(root,bundle);
  });
})();
