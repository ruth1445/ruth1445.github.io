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
  const languageSection = document.querySelector('.about-cell--languages');
  const desktop = window.matchMedia('(min-width: 701px)');
  let followFrame = 0;

  function updateSideCardPosition() {
    followFrame = 0;
    if (!board || !sideCard || !desktop.matches) {
      sideCard?.style.removeProperty('--about-follow-y');
      sideCard?.style.removeProperty('--about-side-scale');
      return;
    }

    const languageBounds = languageSection?.getBoundingClientRect();
    if (!languageBounds || languageBounds.top > window.innerHeight * 0.72) {
      sideCard.style.setProperty('--about-follow-y', '0px');
      sideCard.style.setProperty('--about-side-scale', '1');
      return;
    }

    const boardBounds = board.getBoundingClientRect();
    const targetTop = (window.innerHeight - sideCard.offsetHeight) / 2;
    const maxOffset = Math.max(0, board.offsetHeight - sideCard.offsetHeight);
    const naturalOffset = Math.min(maxOffset, Math.max(0, targetTop - boardBounds.top));
    const activation = Math.max(0, Math.min(1, (window.innerHeight * 0.72 - languageBounds.top) / (window.innerHeight * 0.28)));
    const offset = naturalOffset * activation;
    const focus = languageBounds
      ? Math.max(0, Math.min(1, 1 - Math.abs((languageBounds.top + languageBounds.height * 0.46) - window.innerHeight * 0.5) / (window.innerHeight * 0.74)))
      : 0;
    const scale = 1 - focus * 0.5;
    sideCard.style.setProperty('--about-follow-y', `${Math.round(offset * 100) / 100}px`);
    sideCard.style.setProperty('--about-side-scale', `${Math.round(scale * 1000) / 1000}`);
  }

  function scheduleSideCardPosition() {
    if (!followFrame) followFrame = requestAnimationFrame(updateSideCardPosition);
  }

  window.addEventListener('scroll', scheduleSideCardPosition, { passive: true });
  window.addEventListener('resize', scheduleSideCardPosition);
  desktop.addEventListener?.('change', scheduleSideCardPosition);
  scheduleSideCardPosition();
})();
