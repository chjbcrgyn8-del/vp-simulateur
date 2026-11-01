/* home-v3.js · menus déroulants de l'en-tête, menu mobile et lanceur de démo par métier. */
(function () {
  var top = document.querySelector('.top.vn');
  if (top) {
    var dds = top.querySelectorAll('.dd'), burger = top.querySelector('.vburger');
    /* un seul menu ouvert à la fois */
    dds.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) dds.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
    function closeAll() { dds.forEach(function (d) { d.open = false; }); }
    function setMenu(open) {
      top.classList.toggle('open', open);
      if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) closeAll();
    }
    if (burger) burger.addEventListener('click', function () { setMenu(!top.classList.contains('open')); });
    /* clic à l'extérieur ou Échap : on referme */
    document.addEventListener('click', function (e) {
      if (!top.contains(e.target)) { closeAll(); setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); setMenu(false); }
    });
    /* un lien choisi referme le menu (ancres de la même page) */
    top.querySelectorAll('.vnav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* Lanceur de démo : ouvre la démonstration VP Expert du métier choisi */
  var f = document.getElementById('demo'), sel = document.getElementById('dlsel');
  if (f && sel) {
    try { var last = localStorage.getItem('vp-metier'); if (last && sel.querySelector('option[value="' + last + '"]')) sel.value = last; } catch (e) {}
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      try { localStorage.setItem('vp-metier', sel.value); } catch (er) {}
      location.href = sel.value;
    });
  }
})();
