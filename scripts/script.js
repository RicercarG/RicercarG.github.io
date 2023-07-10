// randomly add decorations to the first page
window.addEventListener('DOMContentLoaded', () => {
  const randomItems = document.querySelectorAll('.material-symbols-rounded');
  const container = document.querySelector('.name');
  const containerWidth = container.clientWidth;
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

// Show/hide the button based on the scroll position
window.onscroll = function() {
  var scrollToTopButton = document.getElementById("scrollToTop");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollToTopButton.style.display = "block";
  } else {
    scrollToTopButton.style.display = "none";
  }
};


// toggle expander
function toggleExpander(expanderId) {
  var content = document.getElementById("expander" + expanderId + "Content");
  content.classList.toggle("show");
  // if (content.style.display === "none") {
  //   content.style.display = "block";
  // } else {
  //   content.style.display = "none";
  // }
}