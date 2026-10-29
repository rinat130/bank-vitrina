// Простой статический каталог: все предложения редактируются в data/offers.json через Pages CMS.
(() => {
  const categories = {debit:'Дебетовая карта', 'credit-card':'Кредитная карта', loan:'Кредит', deposit:'Вклад', business:'Для бизнеса'};
  const state = {category:'all', query:'', offers:[]};
  const grid = document.getElementById('offers-grid');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty-message');
  const loadError = document.getElementById('load-error');
  const normalize = value => String(value || '').toLocaleLowerCase('ru').trim();

  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = String(text);
    return el;
  }
  function linkUrl(value) {
    try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; }
    catch { return null; }
  }
  function drawCard(offer) {
    const card = element('article', 'offer-card');
    const head = element('div', 'offer-top');
    const logo = element('div', 'bank-logo');
    if (offer.logo && (String(offer.logo).startsWith('/media/') || String(offer.logo).startsWith('media/'))) {
      const img = document.createElement('img'); img.src = offer.logo; img.alt = `Логотип: ${offer.bank || 'Банк'}`; img.loading = 'lazy';
      img.onerror = () => { logo.replaceChildren(document.createTextNode((offer.bank || 'Б')[0].toLocaleUpperCase('ru'))); };
      logo.append(img);
    } else logo.textContent = (offer.bank || 'Б')[0].toLocaleUpperCase('ru');
    head.append(logo, element('span','offer-tag', offer.badge || categories[offer.category] || 'Продукт'));
    card.append(head, element('div','offer-bank',offer.bank || 'Банк'), element('h3','offer-title',offer.title || 'Банковский продукт'));
    card.append(element('div','offer-feature',offer.highlight || 'Узнайте условия'), element('p','offer-detail',offer.detail || 'Подробные условия — на сайте банка.'));
    const href = linkUrl(offer.url);
    const button = href ? document.createElement('a') : element('div','offer-link disabled');
    button.className = href ? 'offer-link' : 'offer-link disabled';
    button.textContent = href ? 'К предложению' : 'Ссылка не добавлена';
    const arrow = element('span','',href ? '↗' : '—'); arrow.setAttribute('aria-hidden','true'); button.append(arrow);
    if (href) { button.href = href; button.target = '_blank'; button.rel = 'sponsored noopener noreferrer'; }
    card.append(button);
    return card;
  }
  function render() {
    const matched = state.offers.filter(o => o.active !== false && (state.category === 'all' || o.category === state.category) &&
      normalize([o.bank,o.title,o.highlight,o.detail].join(' ')).includes(state.query));
    matched.sort((a,b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    grid.replaceChildren(...matched.map(drawCard));
    count.textContent = `Найдено предложений: ${matched.length}`;
    empty.hidden = matched.length !== 0;
  }
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
    state.category = tab.dataset.category;
    document.querySelectorAll('.tab').forEach(el => {
      const active = el === tab; el.classList.toggle('active',active); el.setAttribute('aria-pressed',String(active));
    });
    render();
  }));
  document.getElementById('search').addEventListener('input', e => { state.query = normalize(e.target.value); render(); });
  document.getElementById('year').textContent = String(new Date().getFullYear());
  fetch('./data/offers.json', {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => { if (!Array.isArray(data)) throw new Error('offers.json должен содержать массив'); state.offers = data; render(); })
    .catch(err => { console.error('Ошибка загрузки офферов:',err); count.textContent = ''; loadError.hidden = false; });
})();
