document.addEventListener("DOMContentLoaded", function () {
  const tabLinks = document.querySelectorAll(".tab-links li a");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      // Remove the "active" class from all tab links and tab contents
      tabLinks.forEach(function (tabLink) {
        tabLink.parentElement.classList.remove("active");
      });
      tabContents.forEach(function (tabContent) {
        tabContent.classList.remove("active");
      });

      // Add the "active" class to the clicked tab link and the corresponding tab content
      const target = this.getAttribute("href");
      document.querySelector(target).classList.add("active");
      this.parentElement.classList.add("active");
    });
  });
});
