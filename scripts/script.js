// Handle hash-based navigation
function handleHashNavigation() {
  const hash = window.location.hash;
  
  if (hash) {
    const section = document.querySelector(hash);
    const navLink = document.querySelector(`.nav-link[href="${hash}"]`);
    
    if (section && navLink) {
      const navItem = navLink.closest('.nav-grouped');
      
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.nav-grouped').forEach(n => n.classList.remove('active'));
      
      section.classList.add('active');
      if (navItem) {
        navItem.classList.add('active');
      }
    }
  } else {
    // Show home tab by default when no hash
    document.getElementById('home').classList.add('active');
    const homeNav = document.querySelector('.nav-link[href="#home"]').closest('.nav-grouped');
    if (homeNav) homeNav.classList.add('active');
  }
}

// Initialize hash navigation on page load
window.addEventListener('DOMContentLoaded', () => {
  handleHashNavigation();
});

// Handle hash changes (e.g., browser back/forward)
window.addEventListener('hashchange', handleHashNavigation);

// randomly add decorations to the first page
window.addEventListener('DOMContentLoaded', () => {
  const randomItems = document.querySelectorAll('.sticker');
  const container = document.querySelector('.name');
  const containerWidth = container.clientWidth - 100;
  const containerHeight = container.clientHeight;

  randomItems.forEach(item => {
    const left = Math.floor(Math.random() * containerWidth); // Random value for left position
    const top = Math.floor(Math.random() * containerHeight); // Random value for top position

    item.style.left = `${left}px`;
    item.style.top = `${top}px`;
  });
});

// Function to scroll to the top of the page
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// // Show/hide the button based on the scroll position
// window.onscroll = function() {
//   var scrollToTopButton = document.getElementById("scrollToTop");
//   if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
//     scrollToTopButton.style.display = "block";
//   } else {
//     scrollToTopButton.style.display = "none";
//   }
// };


// toggle expander
// function toggleExpander(expanderId) {
//   var content = document.getElementById("expander" + expanderId + "Content");
//   content.classList.toggle("show");
// }

document.addEventListener('DOMContentLoaded', function() {
  const expanders = document.querySelectorAll('.expander');

  expanders.forEach(function(expander) {
    const heading = expander.querySelector('.expander-header');

    heading.addEventListener('click', function() {
      expander.classList.toggle('show');
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
//   const navs = document.querySelectorAll('.nav-grouped');
  const navs = document.querySelectorAll(['.nav-grouped']);

  navs.forEach(function(nav) {
    nav.addEventListener('click', function() {
      navs.forEach(function(nav) {
        nav.classList.remove('active');
        const sectionId = nav.getElementsByClassName("nav-link")[0].getAttribute("href").substring(1);
        document.getElementById(sectionId).classList.remove('active');
      });
      nav.classList.add('active');
      const sectionId = nav.getElementsByClassName("nav-link")[0].getAttribute("href").substring(1);
      document.getElementById(sectionId).classList.add('active');
    });
  });
});

// JavaScript for the scroll indicator
// window.addEventListener('DOMContentLoaded', function () {
//   var containerIds = ['intro', 'background', 'projects'];
//   var scrollIndicator = document.getElementById('catalogs');
//
//   // Create the links for each container ID
//   for (var i = 0; i < containerIds.length; i++) {
//     var containerId = containerIds[i];
//     var link = document.createElement('a');
//     link.href = '#' + containerId;
//     link.textContent = containerId;
//     scrollIndicator.appendChild(link);
//   }

// Add scroll event listener
// window.addEventListener('scroll', function () {
//   var containerIds = ['intro', 'background', 'projects', 'awards', 'gallery'];
//   var scrollIndicators = document.getElementsByClassName('catalog');
//   var scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
//
//   // Highlight the active link based on the scroll position
//   for (var i = 0; i < containerIds.length; i++) {
//     var container = document.getElementById(containerIds[i]);
//     var link = scrollIndicators[i];
//
//     // if (container['id'] === 'background' && container.offsetTop <= scrollPosition && container.offsetTop + container.offsetHeight > scrollPosition) {
//     //   for (var j = 0; j <= scrollIndicators.length; j++) {
//     //     scrollIndicators[j].classList.add('bg-dark', 'text-light');
//     //     link.classList.remove('text-light');
//     //     link.classList.add('active');
//     //   }
//     // } else {
//     //     link.classList.remove('bg-dark', 'text-light');
//     // }
//
//     if (container.offsetTop <= scrollPosition && container.offsetTop + container.offsetHeight > scrollPosition) {
//       link.classList.remove('text-light');
//       link.classList.add('active');
//
//     } else {
//       link.classList.remove('active');
//     }
//   }
// });


// document.addEventListener("DOMContentLoaded", function () {
//   const tabLinks = document.querySelectorAll(".tab-links li a");
//   const tabContents = document.querySelectorAll(".swiper-slide");
//
//   tabLinks.forEach(function (link) {
//     link.addEventListener("click", function (e) {
//       e.preventDefault();
//       // Remove the "active" class from all tab links and tab contents
//       tabLinks.forEach(function (tabLink) {
//         tabLink.parentElement.classList.remove("active");
//       });
//       tabContents.forEach(function (tabContent) {
//         tabContent.classList.remove("active");
//       });
//
//       // Add the "active" class to the clicked tab link and the corresponding tab content
//       const target = this.getAttribute("href");
//       document.querySelector(target).classList.add("active");
//       this.parentElement.classList.add("active");
//     });
//   });
// });

// Gallery masonry layout + filter
document.addEventListener('DOMContentLoaded', function () {
  const container  = document.querySelector('.gallery-masonry');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const allItems   = Array.from(document.querySelectorAll('.gallery-item'));
  const GAP = 10;

  function colCount() {
    const w = window.innerWidth;
    if (w >= 1800) return 5;
    if (w >= 1400) return 4;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  function layout() {
    if (!container) return;
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
  const imgs = container ? Array.from(container.querySelectorAll('img')) : [];
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
    if (e.key === 'ArrowLeft'  && currentIndex > 0)                         { currentIndex--; showItem(); }
    if (e.key === 'ArrowRight' && currentIndex < currentItems.length - 1)   { currentIndex++; showItem(); }
  });

  const allGalleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  allGalleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const visible = allGalleryItems.filter(it => !it.classList.contains('hidden'));
      const idx = visible.indexOf(item);
      const label = item.dataset.section || 'Gallery';
      open(visible, idx, label);
    });
  });
});

// to open link in new tab
// Find all anchor tags in the document
const anchorTags = document.getElementsByTagName('a');

// Loop through each anchor tag and set target="_blank" attribute if it doesn't have the class "catalog"
for (let i = 0; i < anchorTags.length; i++) {
    if (!anchorTags[i].classList.contains('catalog') && !anchorTags[i].classList.contains('nav-link')) {
        anchorTags[i].setAttribute('target', '_blank');
    }
}
