(() => {
  const SUPABASE_URL = 'https://vdblajgxrfndjesoyayy.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_nATRaQcJJrIiVLm5dyKZOg_owt3cNMQ';
  const CACHE_KEY = 'hws_site_bundle_v2';
  const CACHE_TTL = 60 * 1000;

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
    return rows[0].data;
  }

  async function loadBundle() {
    const force = new URLSearchParams(location.search).get('fresh') === '1';
    const cached = readCache();
    if (!force && cached && Date.now() - cached.cachedAt < CACHE_TTL) return cached.data;
    try {
      // Shared, CDN-cacheable JSON snapshot: normal page visits do NOT call Supabase.
      const data = force ? await fetchBundle() : await fetch('/content/harrison-site-bundle.json').then(res => {
        if (!res.ok) throw new Error('Published content snapshot unavailable');
        return res.json();
      });
      try { localStorage.setItem(CACHE_KEY,JSON.stringify({data,cachedAt:Date.now()})); } catch {}
      return data;
    } catch(err) {
      console.warn('[HWS static content]',err);
      if (cached?.data) return cached.data;
      // Initial deployment safety net if the scheduled snapshot has not run yet.
      try { return await fetchBundle(); } catch(e) { console.warn('[HWS fallback]',e); return null; }
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

  function videoEmbed(v){
    try {
      const u=new URL(v.url), host=u.hostname.toLowerCase();
      let src='', poster='';
      if(host==='youtube.com'||host==='www.youtube.com'||host==='m.youtube.com'||host==='youtu.be'||host==='www.youtu.be'||host==='www.youtube-nocookie.com'){
        let id=u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop();
        if(!/^[a-zA-Z0-9_-]{11}$/.test(id||''))return '';
        src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&playsinline=1';
        poster='https://i.ytimg.com/vi/'+encodeURIComponent(id)+'/hqdefault.jpg';
      } else if(host==='vimeo.com'||host==='www.vimeo.com'||host==='player.vimeo.com'){
        const id=u.pathname.split('/').filter(Boolean).pop();
        if(!/^\\d+$/.test(id||''))return '';
        src='https://player.vimeo.com/video/'+id+'?autoplay=1';
      } else return '';
      return '<div class="video wt-click-video"><button type="button" class="wt-video-trigger" data-video-src="'+esc(src)+'" aria-label="Play '+esc(v.title||'video')+'">'+(poster?'<img src="'+esc(poster)+'" alt="" loading="lazy" decoding="async" width="480" height="360">':'<span class="wt-video-background"></span>')+'<span class="wt-play" aria-hidden="true">▶</span><span class="wt-video-label">Tap to play video</span></button></div>';
    }catch{return ''}
  }
  function resolvePay(e){return e.nigeriaPaymentUrl||e.internationalPaymentUrl||e.primaryPaymentUrl||'/contact/'}
  function renderEbook(root,b){const e=b.pages?.ebook||{}, pay=resolvePay(e), projects=[], images=(e.landingImages||[]).filter(x=>x.image), tests=(e.landingTestimonials||[]).filter(x=>x.quote), vids=(e.landingVideos||[]).filter(x=>x.url), faqs=sort(b.faqs).filter(x=>(x.category||'ebook')==='ebook');root.innerHTML=`<div style="background:#dff7fb;text-align:center;padding:.65rem 1rem;font-weight:800">${esc(e.announcement)}</div><section class="ebook-hero"><div class="container hero-grid"><div><div class="eyebrow">${esc(e.hero?.eyebrow)}</div><h1>${esc(e.hero?.heading)}</h1><p class="lead">${esc(e.hero?.text)}</p><div class="actions">${button(pay,e.buyButtonLabel||'Get Instant Access')}</div></div><div class="pricing"><div class="product-meta">Digital guide</div><div class="price">${esc(e.price)}</div><h2>Complete Pure Water Business Blueprint</h2><p>Factory planning, treatment, machinery, costing, operations and growth in one practical guide.</p>${button(pay,e.buyButtonLabel||'Get Instant Access')}</div></div></section><section class="section"><div class="container grid grid-2"><div><div class="eyebrow">The problem</div><h2>${esc(e.painHeading)}</h2></div><div>${(e.painPoints||[]).map(x=>`<div class="feature">✓ ${esc(x)}</div>`).join('')}</div></div></section><section class="section section-soft"><div class="container"><div class="eyebrow">Introducing the guide</div><h2>${esc(e.introHeading)}</h2><p class="lead">${esc(e.introText)}</p><div class="ebook-highlight"><strong>${esc(e.authorHeading)}</strong><p>${esc(e.authorText)}</p></div></div></section><section class="section"><div class="container"><div class="eyebrow">Inside the book</div><h2>${esc(e.benefitsHeading)}</h2><div class="grid grid-2">${(e.benefits||[]).map(x=>`<div class="card">✓ ${esc(x)}</div>`).join('')}</div><div class="actions">${button(pay,e.buyButtonLabel||'Get Instant Access')}</div></div></section><section class="section section-soft"><div class="container"><div class="eyebrow">See what you are getting</div><h2>Practical previews that help you plan before spending</h2><div class="grid grid-2">${(e.previews||[]).map((x,i)=>`<article class="card preview"><div class="number">0${i+1}</div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</div></div></section>${vids.length?`<section class="section"><div class="container"><div class="eyebrow">Video</div><h2>${esc(e.videosHeading)}</h2><div class="grid grid-2">${vids.map(v=>`<article>${videoEmbed(v)}${v.caption?`<p>${esc(v.caption)}</p>`:''}</article>`).join('')}</div></div></section>`:''}<section class="section"><div class="container grid grid-2"><div><div class="eyebrow">Who it is for</div><h2>${esc(e.whoHeading)}</h2></div><div>${(e.whoItems||[]).map(x=>`<div class="feature">✓ ${esc(x)}</div>`).join('')}</div></div></section>${images.length?`<section class="section section-soft"><div class="container"><div class="eyebrow">Work done</div><h2>${esc(e.workHeading)}</h2><div class="gallery">${images.map(x=>`<figure>${image(x.image,x.alt)}${x.caption?`<figcaption>${esc(x.caption)}</figcaption>`:''}</figure>`).join('')}</div></div></section>`:''}${tests.length?`<section class="section"><div class="container"><div class="eyebrow">Proof</div><h2>${esc(e.testimonialsHeading)}</h2><div class="grid grid-3">${tests.map(t=>`<blockquote class="card">${t.image?image(t.image,t.name):''}<p class="quote">“${esc(t.quote)}”</p><footer><strong>${esc(t.name)}</strong>${t.role?` · ${esc(t.role)}`:''}${t.location?` · ${esc(t.location)}`:''}</footer>${t.url?`<a href="${esc(safeUrl(t.url,''))}" rel="noopener noreferrer" target="_blank">View reference →</a>`:''}</blockquote>`).join('')}</div></div></section>`:''}<section class="section section-soft"><div class="container grid grid-2"><div><div class="eyebrow">Included</div><h2>${esc(e.bonusHeading)}</h2></div><div>${(e.bonuses||[]).map(x=>`<div class="feature">✓ ${esc(x)}</div>`).join('')}</div></div></section><section class="section"><div class="container"><div class="eyebrow">FAQ</div><h2>${esc(e.faqHeading)}</h2>${faqs.map(f=>`<details class="card" style="margin-bottom:.75rem"><summary><strong>${esc(f.question)}</strong></summary><p>${esc(f.answer)}</p></details>`).join('')}</div></section><section class="section section-soft"><div class="container grid grid-2"><div><h2>${esc(e.finalHeading)}</h2><p class="lead">${esc(e.finalText)}</p></div><div class="pricing"><div class="price">${esc(e.price)}</div><p>One practical guide. Read it on your phone or computer.</p>${button(pay,e.buyButtonLabel||'Get Instant Access')}</div></div></section><div class="sticky-buy">${button(pay,`${e.buyButtonLabel||'Get Instant Access'} — ${e.price||''}`)}</div>`}

  function renderTraining(root,b) {
    const t=b.pages?.training||{}, media=t.media||{}, contact=b.settings?.contact?.whatsapp||'/contact/';
    const cta=()=>button(t.ctaUrl||contact,t.ctaText||'Register for Training');
    const gallery=(media.images||[]).filter(x=>x.image).slice(0,8).map(x=>'<figure>'+image(x.image,x.alt||'Water production project')+(x.caption?'<figcaption>'+esc(x.caption)+'</figcaption>':'')+'</figure>').join('');
    const clips=(media.videos||[]).filter(x=>x.url).slice(0,6).map(x=>'<article>'+videoEmbed(x)+'<p>'+esc(x.caption||x.title||'')+'</p></article>').join('');
    const reviews=(media.testimonials||[]).filter(x=>x.image||(x.quote&&x.name)).slice(0,6).map(x=>'<blockquote class="card">'+(x.image?image(x.image,x.name||'Client feedback'):'')+(x.quote?'<p>“'+esc(x.quote)+'”</p>':'')+(x.name?'<footer>'+esc(x.name)+'</footer>':'')+'</blockquote>').join('');
    root.innerHTML='<section class="wt-hero"><div class="container wt-hero-grid"><div><div class="wt-kicker">'+esc(t.eyebrow||'Water Production Business Training')+'</div><h1>'+esc(t.heading||'Master the Water Production Business — Before You Invest Your Money!')+'</h1><p class="wt-lead">'+esc(t.subheading||'Learn what it takes to start, improve or build a career in the water industry.')+'</p><div class="wt-actions">'+cta()+'<a href="#proof" class="wt-link">See actual work ↓</a></div><p class="wt-small">'+esc(t.heroNote||'For future factory owners, existing producers and people starting without factory capital.')+'</p></div><div class="wt-visual">'+(media.images?.[0]?.image?image(media.images[0].image,media.images[0].alt||'Water production machinery'):'<div class="wt-visual-fallback"><span>WATER TREATMENT</span><strong>PLAN • SET UP • GROW</strong></div>')+'</div></div></section>'+
    '<section class="wt-section wt-benefits"><div class="container"><p class="wt-kicker">Training benefits</p><h2>'+esc(t.benefitsHeading||'TOP BENEFITS OF JOINING THIS TRAINING')+'</h2><p class="wt-lead">'+esc(t.benefitsIntro||'Whether you are planning to start a water production business or you already own a factory, this training will help you understand the practical steps, challenges, and opportunities involved in the industry.')+'</p><div class="wt-benefit-grid">'+(t.benefits||[]).map(x=>'<div class="wt-benefit"><span class="wt-tick">✓</span><span>'+esc(x)+'</span></div>').join('')+'</div></div></section>'+
    '<section id="proof" class="wt-section wt-proof"><div class="container"><p class="wt-kicker">See the work</p><h2>'+esc(t.proofHeading||'Real projects, real machinery, real experiences')+'</h2>'+(gallery?'<div class="wt-photo-grid">'+gallery+'</div>':'')+(clips?'<div class="wt-video-grid">'+clips+'</div>':'')+(reviews?'<div class="wt-review-grid">'+reviews+'</div>':'')+(!gallery&&!clips&&!reviews?'<p>Explore our completed projects and installation work. <a href="/projects/">View projects</a></p>':'')+'</div></section>'+
    '<section class="wt-section wt-paths"><div class="container"><p class="wt-kicker">Who is this for?</p><h2>Whatever your starting point, there is a path.</h2><div class="wt-path-grid">'+(t.audiences||[]).map(x=>'<article class="wt-path"><h3>'+esc(x.title)+'</h3><p>'+esc(x.text)+'</p></article>').join('')+'</div></div></section>'+
    '<section class="wt-section wt-curriculum"><div class="container"><p class="wt-kicker">Inside the training</p><h2>'+esc(t.modulesHeading||'What you will learn')+'</h2><div class="wt-module-grid">'+(t.modules||[]).map((x,i)=>'<details class="wt-module"><summary><span class="wt-num">'+String(i+1).padStart(2,'0')+'</span>'+esc(x.title)+'</summary><p>'+esc(x.text)+'</p></details>').join('')+'</div><div class="wt-center">'+cta()+'</div></div></section>'+
    '<section class="wt-section wt-about"><div class="container"><p class="wt-kicker">Weekly live support</p><h2>'+esc(t.liveHeading||'Live Q&A and consultation sessions every week')+'</h2><p>'+esc(t.liveText||'Bring your questions about water treatment, equipment, factory setup, registration planning and operations to our weekly live Q&A and consultation sessions.')+'</p><p class="wt-kicker">Learn from professionals</p><h2>'+esc(t.aboutHeading||'Guidance informed by real water-treatment and machinery work')+'</h2><p>'+esc(t.aboutText||'Learn practical planning, equipment and operational considerations from Harrison Water Solution and Machinery Services.')+'</p></div></section>'+
    '<section class="wt-section wt-faq"><div class="container"><h2>Frequently asked questions</h2>'+(t.faqs||[]).map(x=>'<details class="wt-module"><summary>'+esc(x.question)+'</summary><p>'+esc(x.answer)+'</p></details>').join('')+'</div></section>'+
    '<section class="wt-final"><div class="container"><h2>'+esc(t.finalHeading||'Your next step begins with the right knowledge.')+'</h2><p>'+esc(t.finalText||'Prepare to start, improve or explore opportunities in the water industry.')+'</p>'+cta()+'</div></section><div class="wt-sticky">'+cta()+'</div>';
  }


  document.addEventListener('click',e=>{
    const btn=e.target.closest('.wt-video-trigger');
    if(!btn)return;
    const src=btn.dataset.videoSrc;
    if(!src || !(src.startsWith('https://www.youtube-nocookie.com/embed/')||src.startsWith('https://player.vimeo.com/video/')))return;
    const holder=btn.closest('.wt-click-video');
    if(holder)holder.innerHTML='<iframe src="'+esc(src)+'" title="Video" loading="eager" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  });
  const renderers={home:renderHome,about:renderAbout,contact:renderContact,products:renderProducts,product:renderProduct,services:renderServices,service:renderService,projects:renderProjects,ebook:renderEbook,training:renderTraining};
  document.addEventListener('DOMContentLoaded', async () => {
    const root=document.querySelector('main[data-hws-page]');
    if(!root)return;
    const bundle=await loadBundle();
    if(!bundle)return;
    applyGlobal(bundle);
    document.dispatchEvent(new CustomEvent('hws:bundle-ready',{detail:bundle}));
    const fn=renderers[root.dataset.hwsPage];
    if(fn) fn(root,bundle);
  });
})();
