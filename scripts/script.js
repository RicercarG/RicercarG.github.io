// Fade header background in as user scrolls
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  const minOpacity = 0.4;
  const maxScroll = 120; // px to reach full opacity

  function updateHeader() {
    const opacity = minOpacity + Math.min(window.scrollY / maxScroll, 1) * (0.99 - minOpacity);
    header.style.background = `rgba(251, 246, 239, ${opacity})`;
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // set initial state
})();

// Randomly position stickers on the home page
window.addEventListener('DOMContentLoaded', () => {
  const randomItems = document.querySelectorAll('.sticker');
  const container = document.querySelector('.name');
  if (!container || randomItems.length === 0) return;

  const containerWidth = container.clientWidth - 100;
  const containerHeight = container.clientHeight;

  randomItems.forEach(item => {
    const left = Math.floor(Math.random() * containerWidth);
    const top = Math.floor(Math.random() * containerHeight);
    item.style.left = `${left}px`;
    item.style.top = `${top}px`;
  });
});

// Toggle expander open/close
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.expander').forEach(function (expander) {
    const heading = expander.querySelector('.expander-header');
    heading.addEventListener('click', function () {
      expander.classList.toggle('show');
    });
  });
});

// Gallery masonry layout + filter
document.addEventListener('DOMContentLoaded', function () {
  const container  = document.querySelector('.gallery-masonry');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const allItems   = Array.from(document.querySelectorAll('.gallery-item'));
  const GAP = 10;

  if (!container) return;

  function colCount() {
    const w = window.innerWidth;
    if (w >= 1800) return 5;
    if (w >= 1400) return 4;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  function layout() {
    const visible = allItems.filter(el => !el.classList.contains('hidden'));
    const cols = colCount();
    const containerW = container.offsetWidth;
    const colW = (containerW - GAP * (cols - 1)) / cols;
    const heights = new Array(cols).fill(0);

    visible.forEach(item => {
      item.style.width = colW + 'px';
      const shortest = heights.indexOf(Math.min(...heights));
      item.style.left = (shortest * (colW + GAP)) + 'px';
      item.style.top  = heights[shortest] + 'px';
      heights[shortest] += item.offsetHeight + GAP;
    });

    container.style.height = Math.max(...heights) + 'px';
  }

  // Wait for all images to load before first layout
  const imgs = Array.from(container.querySelectorAll('img'));
  let loaded = 0;
  function onImgLoad() {
    loaded++;
    if (loaded === imgs.length) layout();
  }
  imgs.forEach(img => {
    if (img.complete) onImgLoad();
    else img.addEventListener('load', onImgLoad);
  });

  // Re-layout on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 80);
  });

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      allItems.forEach(item => {
        item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
      });
      layout();
    });
  });
});

// Lightbox
document.addEventListener('DOMContentLoaded', function () {
  const allGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  if (allGalleryItems.length === 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-image-panel">
      <img class="lightbox-img" src="" alt="">
    </div>
    <div class="lightbox-info-panel">
      <button class="lightbox-close">&times;</button>
      <div class="lightbox-section-label">Gallery</div>
      <div class="lightbox-index">01</div>
      <div class="lightbox-rule"></div>
      <p class="lightbox-caption-text"></p>
      <div class="lightbox-counter"></div>
      <div class="lightbox-nav">
        <button class="lightbox-nav-btn" id="lb-prev">&larr; Prev</button>
        <button class="lightbox-nav-btn" id="lb-next">Next &rarr;</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const lbImg      = overlay.querySelector('.lightbox-img');
  const lbIndex    = overlay.querySelector('.lightbox-index');
  const lbCaption  = overlay.querySelector('.lightbox-caption-text');
  const lbCounter  = overlay.querySelector('.lightbox-counter');
  const lbLabel    = overlay.querySelector('.lightbox-section-label');
  const lbClose    = overlay.querySelector('.lightbox-close');
  const lbPrev     = overlay.querySelector('#lb-prev');
  const lbNext     = overlay.querySelector('#lb-next');

  let currentItems = [];
  let currentIndex = 0;
  let sectionLabel = '';

  function dateFromSrc(src) {
    const filename = src.split('/').pop();
    const m = filename.match(/^(\d{4})\.(\d{2})\.(\d{2})/);
    if (!m) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m[2]) - 1]} ${parseInt(m[3])}, ${m[1]}`;
  }

  function showItem() {
    const item    = currentItems[currentIndex];
    const img     = item.querySelector('img');
    const caption = item.querySelector('.caption');
    lbImg.src             = img.src;
    lbImg.alt             = img.alt;
    lbCaption.textContent = caption ? caption.textContent.trim() : '';
    lbIndex.textContent   = dateFromSrc(img.src);
    lbCounter.textContent = `${currentIndex + 1} \u2014 ${currentItems.length}`;
    lbLabel.textContent   = sectionLabel;
    lbPrev.disabled       = currentIndex === 0;
    lbNext.disabled       = currentIndex === currentItems.length - 1;
  }

  function open(items, index, label) {
    currentItems = items;
    currentIndex = index;
    sectionLabel = label;
    showItem();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', close);
  overlay.querySelector('.lightbox-image-panel').addEventListener('click', close);
  lbPrev.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; showItem(); } });
  lbNext.addEventListener('click', () => { if (currentIndex < currentItems.length - 1) { currentIndex++; showItem(); } });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft'  && currentIndex > 0)                       { currentIndex--; showItem(); }
    if (e.key === 'ArrowRight' && currentIndex < currentItems.length - 1) { currentIndex++; showItem(); }
  });

  allGalleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const visible = allGalleryItems.filter(it => !it.classList.contains('hidden'));
      const idx = visible.indexOf(item);
      const label = item.dataset.section || 'Gallery';
      open(visible, idx, label);
    });
  });
});

// Open external links in a new tab
const anchorTags = document.getElementsByTagName('a');
for (let i = 0; i < anchorTags.length; i++) {
  if (!anchorTags[i].classList.contains('catalog') && !anchorTags[i].classList.contains('nav-link')) {
    anchorTags[i].setAttribute('target', '_blank');
  }
}
