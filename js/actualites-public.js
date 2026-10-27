/* VATHINI — actualités publiques PROD. Lecture seule. */
(() => {
  'use strict';
  const API_BASE = 'https://vathini-news-public.vathini-cor.workers.dev';
  const grid = document.querySelector('.news-grid');
  const content = document.querySelector('.actualites-content');
  if (!grid || !content) return;

  const el = (tag, className = '', value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };
  const dateFR = value => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
  };
  const paragraphs = (target, value) => {
    String(value || '').split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
      .forEach(p => target.append(el('p', '', p)));
  };
  const open = overlay => overlay.classList.add('active');
  const close = overlay => overlay.classList.remove('active');
  const historicalDates = {
    'article-naissance': '2026-08-03',
    'article-site': '2026-09-01'
  };

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/news`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.environment !== 'PROD' || !Array.isArray(payload.news)) {
        throw new Error('Réponse API inattendue');
      }
      let count = 0;
      for (const article of payload.news) {
        if (article.status !== 'published' ||
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '') ||
            !/^\d{4}-\d{2}-\d{2}$/.test(article.publication_date || '')) continue;
        const id = `article-cms-${article.slug}`;
        if (document.getElementById(id)) continue;
        const filename = typeof article.image_key === 'string' ? article.image_key.split('/').pop() : '';
        const imageURL = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/.test(filename)
          ? `${API_BASE}/api/news-image/${filename}` : '';
        const author = `Rédigé et publié par ${article.author || 'VATHINI'}`;
        const card = el('article', 'news-card');
        card.dataset.article = id;
        card.dataset.publicationDate = article.publication_date;
        card.append(el('span', 'tape tape-top'), el('h2', '', article.title || ''),
          el('div', 'news-date', dateFR(article.publication_date)));
        if (imageURL) {
          const img = el('img');
          img.src = imageURL;
          img.alt = article.image_alt || '';
          img.loading = 'lazy';
          card.append(img);
        }
        card.append(el('p', 'news-author', author));

        const overlay = el('div', 'article-overlay');
        overlay.id = id;
        const opened = el('article', 'article-open');
        const back = el('button', 'article-close', 'RETOUR');
        back.type = 'button';
        opened.append(back, el('span', 'article-tape article-tape-left'),
          el('span', 'article-tape article-tape-right'),
          el('h2', '', article.title || ''),
          el('div', 'article-date', dateFR(article.publication_date)));
        const body = el('div', 'article-body');
        const text = el('div', 'article-text');
        paragraphs(text, article.body);
        body.append(text);
        if (imageURL) {
          const img = el('img', 'article-image');
          img.src = imageURL;
          img.alt = article.image_alt || '';
          body.append(img);
        }
        opened.append(body);
        if (article.conclusion) {
          const footer = el('div', 'article-footer-text');
          paragraphs(footer, article.conclusion);
          opened.append(footer);
        }
        opened.append(el('p', 'article-author', author));
        overlay.append(opened);
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.addEventListener('click', () => open(overlay));
        card.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open(overlay);
          }
        });
        back.addEventListener('click', () => close(overlay));
        grid.append(card);
        content.append(overlay);
        count++;
      }
      grid.querySelectorAll('.news-card').forEach(card => {
        if (!card.dataset.publicationDate) {
          card.dataset.publicationDate = historicalDates[card.dataset.article] || '0000-00-00';
        }
      });
      const cards = [...grid.querySelectorAll('.news-card')];
      cards.sort((a, b) => (b.dataset.publicationDate || '').localeCompare(a.dataset.publicationDate || ''));
      grid.replaceChildren(...cards);
      if (count > 0) {
        const coming = document.querySelector('.news-coming');
        if (coming) coming.style.display = 'none';
      }
    } catch (error) {
      console.error('VATHINI : chargement des actualités PROD impossible.', error);
      // Les articles historiques restent visibles si l'API est indisponible.
    }
  }
  load();
})();
