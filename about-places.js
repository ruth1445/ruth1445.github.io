(() => {
  'use strict';

  // Replace the placeholder text here when Ruth's observations are ready.
  const findings = {
    'nj-riyadh': { title: 'new brunswick + riyadh', text: 'observation coming soon.' },
    'nj-kerala': { title: 'new brunswick + kerala', text: 'observation coming soon.' },
    'nj-hyderabad': { title: 'new brunswick + hyderabad', text: 'observation coming soon.' },
    'riyadh-kerala': { title: 'riyadh + kerala', text: 'observation coming soon.' },
    'riyadh-hyderabad': { title: 'riyadh + hyderabad', text: 'observation coming soon.' },
    'kerala-hyderabad': { title: 'kerala + hyderabad', text: 'observation coming soon.' },
  };

  const diagram = document.querySelector('.about-copy .home-venn');
  if (!diagram) return;
  const note = diagram.querySelector('.home-finding');
  const title = note.querySelector('.home-finding-title');
  const copy = note.querySelector('p');
  const regions = diagram.querySelectorAll('.home-overlap');
  const mapButtons = diagram.querySelectorAll('.home-map[data-interest-place]');
  let active = null;
  let pinned = false;
  let hideTimer;

  const keepOpen = () => clearTimeout(hideTimer);

  function close() {
    keepOpen();
    if (active) {
      active.removeAttribute('data-active');
      active.removeAttribute('aria-describedby');
      active.setAttribute('aria-expanded', 'false');
    }
    active = null;
    pinned = false;
    note.setAttribute('aria-hidden', 'true');
  }

  function open(region) {
    keepOpen();
    const finding = findings[region.dataset.finding];
    if (!finding) return;
    if (active !== region) close();
    active = region;
    title.textContent = finding.title;
    copy.textContent = finding.text;
    note.style.setProperty('--note-top', `${Number(region.dataset.noteY) / 790 * 100}%`);
    note.setAttribute('aria-hidden', 'false');
    region.setAttribute('data-active', '');
    region.setAttribute('aria-expanded', 'true');
    region.setAttribute('aria-describedby', 'home-finding-copy');
  }

  function scheduleClose() {
    keepOpen();
    if (pinned || (active && document.activeElement === active)) return;
    // The short delay lets the pointer travel from an overlap onto its note.
    hideTimer = setTimeout(close, 160);
  }

  function toggle(region) {
    if (active === region && pinned) close();
    else {
      open(region);
      pinned = true;
    }
  }

  regions.forEach(region => {
    region.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && !pinned) open(region);
    });
    region.addEventListener('pointerleave', scheduleClose);
    region.addEventListener('focus', () => open(region));
    region.addEventListener('blur', () => {
      pinned = false;
      scheduleClose();
    });
    region.addEventListener('click', () => toggle(region));
    region.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle(region);
      }
    });
  });

  mapButtons.forEach(button => {
    button.addEventListener('click', () => {
      // The place-photo gallery will live inside the interests route once its images are added.
      location.hash = 'interests';
    });
  });

  note.addEventListener('pointerenter', keepOpen);
  note.addEventListener('pointerleave', scheduleClose);
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.home-overlap, .home-finding')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('hashchange', close);
})();
