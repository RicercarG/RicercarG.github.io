document.addEventListener('DOMContentLoaded', function () {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  fetch('components/nav.html')
    .then(r => r.text())
    .then(html => {
      navContainer.innerHTML = html;

      // Highlight the nav item that matches the current page
      const page = window.location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === page || (page === '' && linkPage === 'index.html')) {
          link.closest('.nav-grouped')?.classList.add('active');
        }
      });
    });
});
