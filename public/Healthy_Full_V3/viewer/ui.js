(() => {
  const viewer = document.getElementById('viewer');
  const button = document.getElementById('fullscreen');
  if (!viewer || !button) return;
  const update = () => {
    const active = document.fullscreenElement === viewer;
    button.setAttribute('aria-expanded', String(active));
    button.setAttribute('aria-controls', 'viewer');
    button.textContent = active ? 'Exit full screen' : 'Full screen';
    button.title = active ? 'Return to the page (or press Escape)' : 'Expand the viewer to full screen';
  };
  if (button.dataset.standaloneFullscreen === 'true') {
    if (!document.fullscreenEnabled) { button.hidden = true; return; }
    button.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === viewer) await document.exitFullscreen();
        else await viewer.requestFullscreen();
      } catch (error) {
        const status = document.getElementById('status');
        if (status) { status.hidden = false; status.textContent = 'Full screen is unavailable in this browser or embedded page.'; }
      }
    });
  }
  document.addEventListener('fullscreenchange', update);
  update();
})();