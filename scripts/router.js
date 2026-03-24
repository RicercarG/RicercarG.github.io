// SPA router — intercepts internal page navigation so the navbar stays persistent
(function () {
  const PAGE_NAMES = {
    'index.html': 'Home',
    'about.html': 'About',
    'projects.html': 'Projects',
    'awards.html': 'Awards',
    'gallery.html': 'Gallery',
  };

  function normalizePage(path) {
    let p = (path || '').split('/').pop() || '';
    if (!p || p === '/') return 'index.html';
    if (!p.endsWith('.html')) return p + '.html';
    return p;
  }

  async function navigate(href, pushState) {
    if (pushState === undefined) pushState = true;
    const page = normalizePage(new URL(href, location.href).pathname);

    let section, title;
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error();
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');
      section = doc.querySelector('main > section');
      title = doc.title;
    } catch (_) {
      location.href = href;
      return;
    }

    if (!section) { location.href = href; return; }

    // Crossfade: fade out old content
    const main = document.querySelector('main');
    const oldSection = main.querySelector('section');
    if (oldSection) {
      oldSection.style.transition = 'opacity 0.3s ease';
      oldSection.style.opacity = '0';
      await new Promise(r => setTimeout(r, 300));
    }

    // Swap page content
    oldSection?.remove();
    section.style.opacity = '0';
    main.appendChild(section);
    section.offsetHeight; // force reflow before transition
    section.style.transition = 'opacity 0.3s ease';
    section.style.opacity = '1';
    document.title = title;

    if (pushState) history.pushState({ page }, '', href);
    window.scrollTo(0, 0);

    if (window.updateNavState) window.updateNavState(page);
    if (window.initPageScripts) window.initPageScripts(page);
  }

  // Intercept clicks on internal page links
  // Mobile nav links are excluded — they're handled by nav-loader with animations
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
    if (a.classList.contains('nav-m-home-link') || a.classList.contains('nav-m-page-link')) return;
    if (a.closest('.nav-m-socials')) return;
    const page = normalizePage(href);
    if (!PAGE_NAMES[page]) return;
    e.preventDefault();
    navigate(href);
  });

  // Handle browser back / forward
  window.addEventListener('popstate', function () {
    navigate(normalizePage(location.pathname), false);
  });

  window.router = { navigate };
})();
