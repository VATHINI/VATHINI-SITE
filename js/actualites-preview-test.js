
/* Prévisualisation locale uniquement — aucun effet sur actualites.html */
(() => {
  // Adresse du Worker de lecture TEST, sans slash final.
  const API_BASE = 'https://vathini-news-preview-test.vathini-cor.workers.dev';

  const grid = document.querySelector('.news-grid');
  const content = document.querySelector('.actualites-content');

  if (!grid || !content) return;

  const info = document.createElement('p');
  info.className = 'preview-news-status';
  info.style.cssText =
    'text-align:center;color:#12120F;padding:15px;font:14px Montserrat,sans-serif';

  grid.before(info);

  const dateFR = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
  };

  const el = (tag, cls, value) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  };

  const addText = (target, text) => {
    for (const paragraph of String(text || '')
      .split(/\n\s*\n/)
      .filter(Boolean)) {
      target.append(el('p', '', paragraph.trim()));
    }
  };

  async function load() {
    info.textContent = 'Chargement des Actualités D1 TEST…';

    try {
      const response = await fetch(`${API_BASE}/api/news`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const articles = Array.isArray(data.news) ? data.news : [];

      for (const a of articles) {
        if (
          a.status !== 'published' ||
          !/^[a-z0-9-]{1,100}$/.test(a.slug)
        ) {
          continue;
        }

        const id = `article-test-${a.slug}`;

        const img = a.image_key
          ? `${API_BASE}/api/news-image/${encodeURIComponent(
              a.image_key.split('/').pop()
            )}`
          : '';

        const author =
          `Rédigé et publié par ${a.author || 'VATHINI'}`;

        // Carte de présentation
        const card = el('article', 'news-card');
        card.dataset.article = id;
        card.dataset.publicationDate = a.publication_date;

        card.append(
          el('span', 'tape tape-top'),
          el('h2', '', a.title),
          el('div', 'news-date', dateFR(a.publication_date))
        );

        if (img) {
          const pic = el('img');
          pic.src = img;
          pic.alt = a.image_alt || '';
          pic.loading = 'lazy';
          card.append(pic);
        }

        card.append(el('p', 'news-author', author));

        // Contenu complet de l'article
        const overlay = el('div', 'article-overlay');
        overlay.id = id;

        const opened = el('article', 'article-open');
        const close = el('button', 'article-close', 'RETOUR');
        close.type = 'button';

        opened.append(
          close,
          el('span', 'article-tape article-tape-left'),
          el('span', 'article-tape article-tape-right'),
          el('h2', '', a.title),
          el('div', 'article-date', dateFR(a.publication_date))
        );

        const body = el('div', 'article-body');
        const txt = el('div', 'article-text');

        addText(txt, a.body);
        body.append(txt);

        if (img) {
          const picture = el('img', 'article-image');
          picture.src = img;
          picture.alt = a.image_alt || '';
          body.append(picture);
        }

        opened.append(body);

        if (a.conclusion) {
          const footer = el('div', 'article-footer-text');
          addText(footer, a.conclusion);
          opened.append(footer);
        }

        opened.append(el('p', 'article-author', author));
        overlay.append(opened);

        // Ouverture et fermeture
        card.addEventListener('click', () => {
          window.vathiniOpenNewsArticle(overlay);
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.vathiniOpenNewsArticle(overlay);
          }
        });

        card.tabIndex = 0;
        card.setAttribute('role', 'button');

        close.addEventListener('click', () => {
          window.vathiniCloseNewsArticle(overlay);
        });

        grid.append(card);
        content.append(overlay);
      }

      // Dates des deux articles historiques
      const legacyDates = {
        'article-naissance': '2026-08-03',
        'article-site': '2026-09-01'
      };

      for (const card of grid.querySelectorAll('.news-card')) {
        if (!card.dataset.publicationDate) {
          card.dataset.publicationDate =
            legacyDates[card.dataset.article] || '0000-00-00';
        }
      }

      // Tri du plus récent au plus ancien
      const sorted = [...grid.querySelectorAll('.news-card')]
        .sort((a, b) =>
          (b.dataset.publicationDate || '')
            .localeCompare(a.dataset.publicationDate || '') ||
          (a.dataset.article || '')
            .localeCompare(b.dataset.article || '')
        );

      grid.replaceChildren(...sorted);

      const n = articles.filter(
        (a) => a.status === 'published'
      ).length;

      info.textContent =
        `Prévisualisation D1 TEST : ${n} article${n > 1 ? 's' : ''} ` +
        `chargé${n > 1 ? 's' : ''} · Aucun changement sur vathini.fr`;

      if (n) {
        const coming = document.querySelector('.news-coming');
        if (coming) coming.style.display = 'none';
      }

    } catch (e) {
      info.textContent =
        `Impossible de charger les Actualités TEST (${e.message}). ` +
        `Vérifier l’URL du Worker et ses liaisons D1/R2.`;
    }
  }

  load();
})();
