/* English walkthrough shared by the VP Predict simulator pages. */
(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const box = document.createElement('details');
  box.id = 'predict-video';
  box.lang = 'en';
  box.translate = false;
  box.hidden = true;
  box.innerHTML = `
    <summary><strong>Watch the VP Predict video</strong><span>English audio &amp; captions</span></summary>
    <p>See how to compare recorded rubber press cycles with an artificial drift, and what an alert can tell you.</p>
    <video controls playsinline preload="none" poster="video/en/vp-predict-test-bench.jpg" aria-label="VP Predict: recorded cycles and simulated drift">
      <source src="video/en/vp-predict-test-bench.mp4" type="video/mp4">
      <track kind="captions" srclang="en" label="English" src="video/en/vp-predict-test-bench.vtt" default>
    </video>`;
  const intro = main.querySelector(':scope > .bx-intro, :scope > h1');
  if (intro) intro.after(box); else main.prepend(box);
  const films = [box, document.getElementById('expert-video')].filter(Boolean);
  function edition() {
    for (const film of films) film.hidden = document.documentElement.lang !== 'en';
    for (const film of films) {
      if (film.hidden) { film.querySelector('video').pause(); film.open = false; }
      else if (location.hash === '#' + film.id) {
        film.open = true;
        film.scrollIntoView({block:'start'});
      }
    }
  }
  for (const film of films) {
    film.name = 'vp-walkthroughs';
    film.addEventListener('toggle', () => {
      if (!film.open) film.querySelector('video').pause();
    });
  }
  document.addEventListener('vp:language', edition);
  window.addEventListener('hashchange', edition);
  edition();
})();
