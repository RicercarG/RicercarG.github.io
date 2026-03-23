document.addEventListener('DOMContentLoaded', function () {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  const PAGE_NAMES = {
    'index.html': 'Home',
    'about.html': 'About',
    'projects.html': 'Projects',
    'awards.html': 'Awards',
    'gallery.html': 'Gallery',
  };
  const PAGE_ORDER = ['index.html', 'about.html', 'projects.html', 'awards.html', 'gallery.html'];

  function normalizePage(path) {
    let p = (path || '').split('/').pop() || '';
    if (!p || p === '/') return 'index.html';
    if (!p.endsWith('.html')) return p + '.html';
    return p;
  }

  function doNavigate(href) {
    if (window.router) window.router.navigate(href);
    else location.href = href;
  }

  // Called by router after every SPA navigation (and on initial load)
  function updateNavState(page) {
    const isHome = page === 'index.html';

    // Desktop: update active class
    document.querySelectorAll('.nav-grouped').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === page)
        link.closest('.nav-grouped')?.classList.add('active');
    });

    const navMHome = document.getElementById('nav-m-home');
    const navMPage = document.getElementById('nav-m-page');
    const isMobile = window.innerWidth <= 980;

    if (!isMobile) {
      // On desktop, clear inline styles so CSS display:none takes over
      if (navMHome) navMHome.style.display = '';
      if (navMPage) navMPage.style.display = '';
    } else if (isHome) {
      if (navMPage) navMPage.style.display = 'none';
      if (navMHome) {
        navMHome.style.display = 'block';
        navMHome.querySelector('.nav-m-home-links')?.classList.remove('folding');
        const titleEl = navMHome.querySelector('.nav-m-home-title');
        if (titleEl) titleEl.textContent = 'Home';
      }
    } else {
      if (navMHome) navMHome.style.display = 'none';
      if (navMPage) {
        navMPage.style.display = 'block';
        navMPage.classList.remove('expanded');

        const nameEl = document.getElementById('nav-m-page-name');
        if (nameEl) nameEl.textContent = PAGE_NAMES[page] || page;

        // Rebuild link list with Home first, current page excluded
        const linksDiv = document.getElementById('nav-m-page-links');
        if (linksDiv) {
          linksDiv.innerHTML = '';
          PAGE_ORDER.filter(p => p !== page).forEach(p => {
            const a = document.createElement('a');
            a.className = 'nav-m-page-link';
            a.href = p;
            a.textContent = PAGE_NAMES[p] || p;
            linksDiv.appendChild(a);
          });
        }
      }
    }
  }

  window.updateNavState = updateNavState;

  fetch('components/nav.html')
    .then(r => r.text())
    .then(html => {
      navContainer.innerHTML = html;

      // ── Home nav: fold-up on link click ──
      const navMHome = document.getElementById('nav-m-home');
      if (navMHome) {
        navMHome.addEventListener('click', function (e) {
          const link = e.target.closest('.nav-m-home-link');
          if (!link) return;
          e.preventDefault();
          const href = link.getAttribute('href');
          const titleEl = navMHome.querySelector('.nav-m-home-title');
          const linksDiv = navMHome.querySelector('.nav-m-home-links');
          if (titleEl) titleEl.textContent = PAGE_NAMES[href] || href;
          if (linksDiv) linksDiv.classList.add('folding');
          setTimeout(() => doNavigate(href), 260);
        });
      }

      // ── Page nav: toggle expand on header click ──
      const navMPage = document.getElementById('nav-m-page');
      const pageTop  = document.getElementById('nav-m-page-top');
      if (pageTop && navMPage) {
        pageTop.addEventListener('click', function () {
          navMPage.classList.toggle('expanded');
        });
      }

      // ── Page nav: navigate on link click ──
      const linksDiv = document.getElementById('nav-m-page-links');
      if (linksDiv && navMPage) {
        linksDiv.addEventListener('click', function (e) {
          const link = e.target.closest('.nav-m-page-link');
          if (!link) return;
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href === 'index.html') {
            doNavigate(href);
            return;
          }
          const nameEl = document.getElementById('nav-m-page-name');
          if (nameEl) nameEl.textContent = PAGE_NAMES[href] || href;
          navMPage.classList.remove('expanded');
          setTimeout(() => doNavigate(href), 260);
        });
      }

      // Set initial state for current page
      updateNavState(normalizePage(location.pathname));

      // Re-evaluate mobile/desktop layout on resize
      let _resizeTimer;
      window.addEventListener('resize', function () {
        clearTimeout(_resizeTimer);
        _resizeTimer = setTimeout(function () {
          updateNavState(normalizePage(location.pathname));
        }, 80);
      });
    });
});
