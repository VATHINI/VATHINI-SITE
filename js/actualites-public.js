/* VATHINI — Actualités PROD, source unique : VATHINI Studio. */
(() => {
  'use strict';
  const API_BASE = 'https://vathini-news-public.vathini-cor.workers.dev';
  const grid = document.querySelector('.news-grid');
  const status = document.getElementById('news-status');
  if (!grid || !status) return;

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
  let activeOverlay = null;
  let opener = null;
  const close = () => {
    if (!activeOverlay) return;
    activeOverlay.classList.remove('active');
    activeOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('vathini-news-open');
    activeOverlay = null;
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  };
  const open = (overlay, card) => {
    if (activeOverlay) close();
    opener = card;
    activeOverlay = overlay;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.scrollTop = 0;
    document.body.classList.add('vathini-news-open');
    overlay.querySelector('.article-close')?.focus({ preventScroll: true });
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeOverlay) close();
  });

  async function load() {
    try {
      const response = await fetch(`${API_BASE}/api/news`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (payload.environment !== 'PROD' || !Array.isArray(payload.news)) {
        throw new Error('Réponse API inattendue');
      }
      const articles = payload.news.filter(article =>
        article.status === 'published' &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '') &&
        /^\d{4}-\d{2}-\d{2}$/.test(article.publication_date || '')
      ).sort((a, b) => b.publication_date.localeCompare(a.publication_date) || a.slug.localeCompare(b.slug));

      grid.replaceChildren();
      document.querySelectorAll('body > .article-overlay[data-cms-news]').forEach(node => node.remove());
      for (const article of articles) {
        const filename = typeof article.image_key === 'string' ? article.image_key.split('/').pop() : '';
        const imageURL = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/.test(filename)
          ? `${API_BASE}/api/news-image/${filename}` : '';
        const author = `Rédigé et publié par ${article.author || 'VATHINI'}`;
        const card = el('article', 'news-card');
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Lire : ${article.title || 'Actualité'}`);
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
        overlay.dataset.cmsNews = article.slug;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', article.title || 'Actualité');
        overlay.setAttribute('aria-hidden', 'true');
        const opened = el('article', 'article-open');
        const back = el('button', 'article-close', 'RETOUR');
        back.type = 'button';
        opened.append(back, el('span', 'article-tape article-tape-left'),
          el('span', 'article-tape article-tape-right'),
          el('h2', '', article.title || ''),
          el('div', 'article-date', dateFR(article.publication_date)));
        const body = el('div', 'article-body');
        const txt = el('div', 'article-text');
        paragraphs(txt, article.body);
        body.append(txt);
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
        card.addEventListener('click', () => open(overlay, card));
        card.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open(overlay, card);
          }
        });
        back.addEventListener('click', close);
        overlay.addEventListener('click', event => {
          if (event.target === overlay) close();
        });
        grid.append(card);
        document.body.append(overlay);
      }
      status.textContent = articles.length ? '' : 'De nouvelles actualités seront disponibles prochainement !';
      status.hidden = articles.length > 0;
    } catch (error) {
      console.error('VATHINI : chargement des actualités PROD impossible.', error);
      status.textContent = 'Les actualités sont momentanément indisponibles.';
      status.hidden = false;
    }
  }
  load();
})();
