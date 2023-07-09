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