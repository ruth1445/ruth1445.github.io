(() => {
  'use strict';

  const mapButtons = document.querySelectorAll('.about-copy .home-map[data-interest-place]');
  mapButtons.forEach(button => {
    button.addEventListener('click', () => {
      // The place-photo gallery will live inside the interests route once its images are added.
      location.hash = 'interests';
    });
  });

  // On desktop, keep the existing right-hand card centered beside the part of
  // the About page being read. Its contents and dimensions remain untouched.
  const board = document.querySelector('.about-board');
  const sideCard = document.querySelector('.about-right');
  const desktop = window.matchMedia('(min-width: 701px)');
  let followFrame = 0;

  function updateSideCardPosition() {
    followFrame = 0;
    if (!board || !sideCard || !desktop.matches) {
      sideCard?.style.removeProperty('--about-follow-y');
      return;
    }

    const boardBounds = board.getBoundingClientRect();
    const targetTop = (window.innerHeight - sideCard.offsetHeight) / 2;
    const maxOffset = Math.max(0, board.offsetHeight - sideCard.offsetHeight);
    const offset = Math.min(maxOffset, Math.max(0, targetTop - boardBounds.top));
    sideCard.style.setProperty('--about-follow-y', `${Math.round(offset * 100) / 100}px`);
  }

  function scheduleSideCardPosition() {
    if (!followFrame) followFrame = requestAnimationFrame(updateSideCardPosition);
  }

  window.addEventListener('scroll', scheduleSideCardPosition, { passive: true });
  window.addEventListener('resize', scheduleSideCardPosition);
  desktop.addEventListener?.('change', scheduleSideCardPosition);
  scheduleSideCardPosition();
})();
