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
    // console.log(nav)

    nav.addEventListener('click', function() {
      navs.forEach(function(nav) {
        nav.classList.remove('active');
        const sectionId = nav.getElementsByClassName("nav-link")[0].getAttribute("href").substring(1);
        console.log(sectionId)
        document.getElementById(sectionId).classList.remove('active');
      });
      nav.classList.add('active');
      const sectionId = nav.getElementsByClassName("nav-link")[0].getAttribute("href").substring(1);
      console.log(nav)
      document.getElementById(sectionId).classList.toggle('active');
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

// to open link in new tab
// Find all anchor tags in the document
const anchorTags = document.getElementsByTagName('a');

// Loop through each anchor tag and set target="_blank" attribute if it doesn't have the class "catalog"
for (let i = 0; i < anchorTags.length; i++) {
    if (!anchorTags[i].classList.contains('catalog') && !anchorTags[i].classList.contains('nav-link')) {
        anchorTags[i].setAttribute('target', '_blank');
    }
}
