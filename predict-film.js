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
  const player = box.querySelector('video');
  function edition() {
    box.hidden = document.documentElement.lang !== 'en';
    if (box.hidden) { player.pause(); box.open = false; }
    else if (location.hash === '#predict-video') {
      box.open = true;
      box.scrollIntoView({block:'start'});
    }
  }
  box.addEventListener('toggle', () => { if (!box.open) player.pause(); });
  document.addEventListener('vp:language', edition);
  window.addEventListener('hashchange', edition);
  edition();
})();
