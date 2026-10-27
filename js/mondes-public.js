/* VATHINI — Mondes publiés uniquement. Aucune donnée commerciale. */
(() => {
  'use strict';
  const root = document.getElementById('vathini-worlds');
  if (!root) return;
  const API = 'https://vathini-news-public.vathini-cor.workers.dev';
  const make = (tag, className, content) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (content != null) el.textContent = content;
    return el;
  };
  function card(world) {
    // Ne pas inventer de page de Monde : seule la page VATHINI existe en production.
    const isVathini = world.slug === 'monde-vathini' || world.slug === 'vathini';
    const el = make('a', 'univers-card');
    el.href = isVathini ? 'monde-vathini.html' : 'monde.html?monde=' + encodeURIComponent(world.slug);
    const content = make('div', 'univers-content');
    content.append(make('h2', '', world.name), make('p', '', world.description || 'Découvrez cet univers VATHINI.'));
    const visual = make('div', 'univers-visual univers-vathini');
    if (world.image_url) {
      const img = make('img');
      img.src = new URL(world.image_url, API).href;
      img.alt = world.name;
      img.loading = 'lazy';
      visual.append(img);
    }
    el.append(content, visual);
    return el;
  }
  (async () => {
    try {
      const res = await fetch(API + '/api/worlds', {credentials:'omit',cache:'no-store'});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.environment !== 'PROD' || !Array.isArray(data.worlds)) throw new Error('Réponse invalide');
      root.replaceChildren(...data.worlds.map(card));
      if (!data.worlds.length) root.append(make('p','', 'Aucun Monde publié pour le moment.'));
    } catch (error) {
      console.error('Mondes VATHINI indisponibles', error);
      root.replaceChildren(make('p', '', 'Les Mondes sont momentanément indisponibles.'));
    }
  })();
})();
