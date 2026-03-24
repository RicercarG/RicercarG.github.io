// Fade header background in as user scrolls (runs once, persistent across SPA navigation)
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  const minOpacity = 0.4;
  const maxScroll = 120;
  function updateHeader() {
    const opacity = minOpacity + Math.min(window.scrollY / maxScroll, 1) * (0.99 - minOpacity);
    header.style.background = `rgba(251, 246, 239, ${opacity})`;
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
})();

// Expander toggle — event delegation so it works after SPA content swap without re-init
document.addEventListener('click', function (e) {
  const h = e.target.closest('.expander-header');
  if (h) h.closest('.expander')?.classList.toggle('show');
});

// ── Per-page initializers ──

function initStickers() {
  const items = document.querySelectorAll('.sticker');
  const container = document.querySelector('.name');
  if (!container || items.length === 0) return;
  const headerH = document.getElementById('header')?.offsetHeight || 0;
  document.documentElement.style.setProperty('--header-h', headerH + 'px');
  const w = container.clientWidth - 100;
  const h = container.clientHeight;
  items.forEach(item => {
    item.style.left = Math.floor(Math.random() * w) + 'px';
    item.style.top  = headerH + Math.floor(Math.random() * (h - headerH)) + 'px';
  });
}

let _galleryResizeHandler = null;

async function initGallery() {
  const container = document.querySelector('.gallery-masonry');
  const filterBar = document.querySelector('.gallery-filter-bar');
  if (!container || !filterBar) return;

  // Remove previous resize handler to avoid accumulation
  if (_galleryResizeHandler) {
    window.removeEventListener('resize', _galleryResizeHandler);
    _galleryResizeHandler = null;
  }

  // Load gallery manifest
  let galleryData;
  try {
    const res = await fetch('resources/Gallery/gallery.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    galleryData = await res.json();
  } catch (e) {
    console.error('Failed to load gallery manifest:', e);
    return;
  }

  // Build filter buttons from folder names
  const totalCount = Object.values(galleryData).reduce((n, imgs) => n + imgs.length, 0);
  filterBar.innerHTML = `<button class="gallery-filter-btn active" data-filter="all">All <span class="filter-count">${totalCount}</span></button>`;
  for (const [folder, images] of Object.entries(galleryData)) {
    const filterId = folder.toLowerCase().replace(/\s+/g, '-');
    const btn = document.createElement('button');
    btn.className = 'gallery-filter-btn';
    btn.dataset.filter = filterId;
    btn.innerHTML = `${folder} <span class="filter-count">${images.length}</span>`;
    filterBar.appendChild(btn);
  }

  // Sort toggle button
  let sortAsc = true;
  const sortBtn = document.createElement('button');
  sortBtn.className = 'gallery-sort-btn';
  sortBtn.title = 'Toggle sort order';
  sortBtn.innerHTML = '<i class="fas fa-sort-amount-up"></i>';
  filterBar.appendChild(sortBtn);

  // Build gallery items with descriptions from gallery.json
  const VIDEO_EXTS = /\.(mp4|webm|mov)$/i;
  const DATE_PREFIX = /^(\d{4}\.\d{2}\.\d{2})/;
  container.innerHTML = '';

  // Flatten all items across folders and sort oldest-first by default
  const allEntries = [];
  for (const [folder, images] of Object.entries(galleryData)) {
    for (const imgData of images) {
      allEntries.push({ folder, imgData });
    }
  }
  allEntries.sort((a, b) => {
    const da = (DATE_PREFIX.exec(a.imgData.filename) || [''])[0];
    const db = (DATE_PREFIX.exec(b.imgData.filename) || [''])[0];
    return da.localeCompare(db);
  });

  for (const { folder, imgData } of allEntries) {
    const filterId = folder.toLowerCase().replace(/\s+/g, '-');
    const src     = `resources/Gallery/${encodeURIComponent(folder)}/${encodeURIComponent(imgData.filename)}`;
      const isVideo = VIDEO_EXTS.test(imgData.filename);
      const item    = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.category  = filterId;
      item.dataset.section   = folder;
      item.dataset.mediaType = isVideo ? 'video' : 'image';
      item.dataset.date      = (DATE_PREFIX.exec(imgData.filename) || [''])[0];

      if (isVideo) {
        const video = document.createElement('video');
        video.src         = src;
        video.muted       = true;
        video.autoplay    = true;
        video.loop        = true;
        video.playsInline = true;
        const badge = document.createElement('div');
        badge.className = 'video-badge';
        item.appendChild(video);
        item.appendChild(badge);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = imgData.description;
        item.appendChild(img);
      }

      const caption = document.createElement('p');
      caption.className   = 'caption';
      caption.textContent = imgData.description;
      item.appendChild(caption);
      container.appendChild(item);
  }

  const allItems   = Array.from(container.querySelectorAll('.gallery-item'));
  const filterBtns = Array.from(filterBar.querySelectorAll('.gallery-filter-btn'));
  const GAP = 10;

  function colCount() {
    const w = window.innerWidth;
    if (w >= 1800) return 5;
    if (w >= 1400) return 4;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 2;
  }

  function layout() {
    const visible = allItems.filter(el => !el.classList.contains('hidden'));
    const cols    = colCount();
    const colW    = (container.offsetWidth - GAP * (cols - 1)) / cols;
    const heights = new Array(cols).fill(0);
    visible.forEach(item => {
      item.style.width = colW + 'px';
      const s = heights.indexOf(Math.min(...heights));
      item.style.left = (s * (colW + GAP)) + 'px';
      item.style.top  = heights[s] + 'px';
      heights[s] += item.offsetHeight + GAP;
    });
    container.style.height = Math.max(...heights) + 'px';
  }

  let loaded = 0;
  const mediaEls = Array.from(container.querySelectorAll('img, video'));
  if (mediaEls.length === 0) {
    layout();
  } else {
    const onReady = () => { if (++loaded === mediaEls.length) layout(); };
    mediaEls.forEach(el => {
      if (el.tagName === 'VIDEO') {
        if (el.readyState >= 1) onReady();
        else el.addEventListener('loadedmetadata', onReady, { once: true });
      } else {
        if (el.complete) onReady();
        else el.addEventListener('load', onReady, { once: true });
      }
    });
  }

  let resizeTimer;
  _galleryResizeHandler = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 80); };
  window.addEventListener('resize', _galleryResizeHandler);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      allItems.forEach(item => item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter));
      layout();
    });
  });

  sortBtn.addEventListener('click', () => {
    sortAsc = !sortAsc;
    sortBtn.innerHTML = sortAsc
      ? '<i class="fas fa-sort-amount-up"></i>'
      : '<i class="fas fa-sort-amount-down"></i>';
    const items = Array.from(container.querySelectorAll('.gallery-item'));
    items.sort((a, b) => sortAsc
      ? a.dataset.date.localeCompare(b.dataset.date)
      : b.dataset.date.localeCompare(a.dataset.date)
    );
    items.forEach((item, i) => { container.appendChild(item); allItems[i] = item; });
    layout();
  });

  // Lightbox — remove old overlay before creating new one
  document.querySelector('.lightbox-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-image-panel">
      <img class="lightbox-img" src="" alt="">
      <video class="lightbox-video" controls playsinline></video>
      <div class="lightbox-dots"></div>
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
    </div>`;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lightbox-img');
  const lbVideo   = overlay.querySelector('.lightbox-video');
  const lbIndex   = overlay.querySelector('.lightbox-index');
  const lbCaption = overlay.querySelector('.lightbox-caption-text');
  const lbCounter = overlay.querySelector('.lightbox-counter');
  const lbLabel   = overlay.querySelector('.lightbox-section-label');
  const lbClose   = overlay.querySelector('.lightbox-close');
  const lbPrev    = overlay.querySelector('#lb-prev');
  const lbNext    = overlay.querySelector('#lb-next');
  const lbDots    = overlay.querySelector('.lightbox-dots');

  let currentItems = [], currentIndex = 0, sectionLabel = '';

  const MAX_DOTS = 9;
  function updateDots() {
    const total = currentItems.length;
    if (total <= 1) { lbDots.innerHTML = ''; return; }
    const half = Math.floor(MAX_DOTS / 2);
    let start = Math.max(0, Math.min(currentIndex - half, total - MAX_DOTS));
    let end   = Math.min(total, start + MAX_DOTS);
    let html  = '';
    for (let i = start; i < end; i++) {
      html += `<span class="lightbox-dot${i === currentIndex ? ' active' : ''}"></span>`;
    }
    lbDots.innerHTML = html;
  }

  function dateFromSrc(src) {
    const m = src.split('/').pop().match(/^(\d{4})\.(\d{2})\.(\d{2})/);
    if (!m) return '';
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m[2]-1]
           + ` ${+m[3]}, ${m[1]}`;
  }

  function showItem() {
    const item    = currentItems[currentIndex];
    const isVideo = item.dataset.mediaType === 'video';
    const mediaEl = item.querySelector(isVideo ? 'video' : 'img');
    const cap     = item.querySelector('.caption');

    lbVideo.pause();
    if (isVideo) {
      lbImg.style.display   = 'none';
      lbVideo.style.display = 'block';
      lbVideo.src           = mediaEl.src;
    } else {
      lbVideo.style.display = 'none';
      lbVideo.src           = '';
      lbImg.style.display   = 'block';
      lbImg.src             = mediaEl.src;
      lbImg.alt             = mediaEl.alt;
    }

    lbCaption.textContent = cap ? cap.textContent.trim() : '';
    lbIndex.textContent   = dateFromSrc(mediaEl.src);
    lbCounter.textContent = `${currentIndex + 1} \u2014 ${currentItems.length}`;
    lbLabel.textContent   = item.dataset.section || sectionLabel;
    lbPrev.disabled       = currentIndex === 0;
    lbNext.disabled       = currentIndex === currentItems.length - 1;
    updateDots();
  }

  let _scrollY = 0;

  function openLB(items, idx, label) {
    currentItems = items; currentIndex = idx; sectionLabel = label;
    showItem();
    overlay.classList.add('open');
    _scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_scrollY}px`;
    document.body.style.width = '100%';
  }

  function closeLB() {
    lbVideo.pause();
    lbVideo.src = '';
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, _scrollY);
  }

  lbClose.addEventListener('click', closeLB);

  // Swipe to navigate on mobile
  let _touchStartX = 0;
  overlay.addEventListener('touchstart', e => { _touchStartX = e.touches[0].clientX; }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - _touchStartX;
    if (Math.abs(dx) < 40) return;
    if (dx < 0 && currentIndex < currentItems.length - 1) { currentIndex++; showItem(); }
    if (dx > 0 && currentIndex > 0)                       { currentIndex--; showItem(); }
  }, { passive: true });

  overlay.querySelector('.lightbox-image-panel').addEventListener('click', closeLB);
  lbVideo.addEventListener('click', e => e.stopPropagation());
  lbPrev.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; showItem(); } });
  lbNext.addEventListener('click', () => { if (currentIndex < currentItems.length - 1) { currentIndex++; showItem(); } });

  // Self-removing keydown handler — cleans itself up when the overlay is replaced
  document.addEventListener('keydown', function lbKeys(e) {
    if (!overlay.isConnected) { document.removeEventListener('keydown', lbKeys); return; }
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft'  && currentIndex > 0)                       { currentIndex--; showItem(); }
    if (e.key === 'ArrowRight' && currentIndex < currentItems.length - 1) { currentIndex++; showItem(); }
  });

  allItems.forEach(item => {
    item.addEventListener('click', () => {
      const visible = allItems.filter(it => !it.classList.contains('hidden'));
      openLB(visible, visible.indexOf(item), item.dataset.section || 'Gallery');
    });
  });
}

function initExternalLinks() {
  // Only target main content links so nav links are unaffected
  document.querySelectorAll('main a').forEach(a => {
    if (!a.classList.contains('catalog') && !a.classList.contains('nav-link'))
      a.setAttribute('target', '_blank');
  });
}

// Called by router after every SPA navigation, and once on initial load
window.initPageScripts = function (page) {
  if (page === 'index.html') initStickers();
  if (page === 'gallery.html') initGallery();
  initExternalLinks();
};

document.addEventListener('DOMContentLoaded', function () {
  let page = location.pathname.split('/').pop() || '';
  if (!page || page === '/') page = 'index.html';
  else if (!page.endsWith('.html')) page = page + '.html';
  window.initPageScripts(page);
});
