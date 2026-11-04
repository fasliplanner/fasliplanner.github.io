/* Fasli site: interactions. No libraries. */
(function () {
  var doc = document.documentElement, rtl = doc.dir === 'rtl';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var ease = function (x) { return 1 - Math.pow(1 - x, 3); };

  /* ---------- reveal on enter ---------- */
  var rises = $$('.rise');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    rises.forEach(function (e) { io.observe(e); });
    var slip = $('.slip.tear');
    if (slip) {
      var io2 = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { slip.classList.add('torn'); io2.disconnect(); } });
      }, { threshold: 0.55 });
      io2.observe(slip);
    }
  } else { rises.forEach(function (e) { e.classList.add('in'); }); }

  /* ---------- hero: tilt + floating cards ---------- */
  var hero = $('.hero'), stage = $('.hero-stage'), phone = stage && $('.phone', stage), cards = $$('.fcard');
  if (stage && !reduce) {
    if (fine) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        phone.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
        phone.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
        phone.style.setProperty('--sheen', (120 - (x + 0.5) * 140).toFixed(1) + '%');
        cards.forEach(function (c) {
          var d = parseFloat(c.dataset.depth || 1);
          c.style.setProperty('--tx', (x * d * 18).toFixed(1) + 'px');
          c.style.setProperty('--ty', (y * d * 14).toFixed(1) + 'px');
        });
      });
      hero.addEventListener('pointerleave', function () {
        phone.style.setProperty('--ry', '0deg'); phone.style.setProperty('--rx', '0deg');
        cards.forEach(function (c) { c.style.setProperty('--tx', '0px'); c.style.setProperty('--ty', '0px'); });
      });
    } else {
      stage.classList.add('bob');
    }
  }

  /* ---------- hero: chalk dust ---------- */
  var cv = $('.dust');
  if (cv && !reduce && cv.getContext) {
    var cx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), parts = [], heroOn = true;
    var size = function () {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(clamp(W * H / 26000, 18, 60)); parts = [];
      for (var i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + 0.3, v: Math.random() * 0.25 + 0.05, a: Math.random() * 0.5 + 0.15, g: Math.random() < 0.3, t: Math.random() * 6 });
    };
    size(); window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { heroOn = es[0].isIntersecting; }).observe(hero);
    (function tick() {
      if (heroOn) {
        cx.clearRect(0, 0, W, H);
        parts.forEach(function (p) {
          p.y -= p.v; p.t += 0.01; p.x += Math.sin(p.t) * 0.12;
          if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
          cx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.t * 2));
          cx.fillStyle = p.g ? '#E0A83F' : '#F3F1EA';
          cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
        });
      }
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) $$('.magnet').forEach(function (b) {
    var s = b.firstElementChild;
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      b.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.25).toFixed(1) + 'px)';
      s.style.transform = 'translate(' + (x * 0.08).toFixed(1) + 'px,' + (y * 0.1).toFixed(1) + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; s.style.transform = ''; });
  });

  /* ---------- spotlight ---------- */
  if (fine) $$('.spot').forEach(function (s) {
    s.addEventListener('pointermove', function (e) {
      var r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); s.style.setProperty('--so', 1);
    });
    s.addEventListener('pointerleave', function () { s.style.setProperty('--so', 0); });
  });

  /* ---------- scroll-linked: top bar, story, route ---------- */
  var bar = $('.bar-top'), wk = bar && $('.wk', bar), mr = bar && $('.mr', bar);
  var story = $('.story'), chaps = $$('.chap'), shots = $$('.story-phone img'), rail = $$('.rail li'), railMark = $('.rail-mark'), halo = $('.halo');
  var route = $('.route'), rdraw = $('.r-draw'), rbase = $('.r-base'), rsvg = $('.route-svg'), rdot = $('.r-dot'), stations = $$('.station');
  var plen = rbase ? rbase.getTotalLength() : 0;
  var cur = -1, lastWeek = 0, samples = null, total = 0, sw = 0, shh = 0;
  function build(sr) {
    sw = sr.width; shh = sr.height; samples = []; total = 0; var N = 400, px, py;
    for (var i = 0; i <= N; i++) {
      var pt = rbase.getPointAtLength(i / N * plen), x = pt.x / 400 * sw, y = pt.y / 1000 * shh;
      if (i) total += Math.hypot(x - px, y - py);
      samples.push({ x: x, y: y, l: total }); px = x; py = y;
    }
    rdraw.style.strokeDasharray = total.toFixed(1) + ' ' + (total + 10).toFixed(1);
    rdraw.classList.add('ready');
  }
  var lastLit = [], lastK = [];
  var words = chaps.map(function (c) { return $$('.fill span', c); });

  function setChapter(i) {
    if (i === cur) return; cur = i;
    chaps.forEach(function (c, j) { c.classList.toggle('on', j === i); c.classList.toggle('past', j < i); });
    shots.forEach(function (s, j) { s.classList.toggle('on', j === i); });
    rail.forEach(function (r, j) { r.classList.toggle('on', j === i); });
    if (railMark && rail[i]) { railMark.style.left = rail[i].offsetLeft + 'px'; railMark.style.width = rail[i].offsetWidth + 'px'; }
  }
  function num(el, k) {
    var a = parseFloat(el.dataset.from), b = parseFloat(el.dataset.to), dec = parseInt(el.dataset.dec || '0', 10);
    el.textContent = (a + (b - a) * k).toFixed(dec);
  }
  function widget(c, k) {
    var w = $('.inst', c); if (!w) return;
    var e = ease(clamp(k / 0.8, 0, 1));
    w.style.setProperty('--q', e.toFixed(3));
    $$('.num', w).forEach(function (n) { num(n, e); });
    var lis = $$('.inst-path li', w);
    if (lis.length) {
      var done = 0;
      lis.forEach(function (li) { var on = k >= parseFloat(li.dataset.at); li.classList.toggle('ok', on); if (on) done++; });
      var iv = $('.iv', w); iv.textContent = iv.dataset.done.replace('{}', done);
    }
    var days = $$('.days li', w);
    if (days.length) { var d = Math.min(days.length - 1, Math.floor(k * days.length)); days.forEach(function (x, j) { x.classList.toggle('on', j === d); }); }
    if (w.classList.contains('inst-count')) w.style.setProperty('--q', (1 - e * (11 / 14)).toFixed(3));
    if (w.classList.contains('inst-credits')) { w.style.setProperty('--q', (85 / 133 * e).toFixed(3)); var st = $('.stamp', w); st.classList.toggle('in', k > 0.82); }
    if (w.classList.contains('inst-gpa')) w.style.setProperty('--q', (3.22 / 4 * e).toFixed(3));
  }

  function frame() {
    var vh = window.innerHeight, y = window.scrollY || window.pageYOffset, max = document.documentElement.scrollHeight - vh;
    var p = clamp(y / Math.max(1, max), 0, 1);
    if (bar) {
      bar.classList.toggle('show', y > hero.offsetHeight * 0.7);
      mr.style.setProperty('--p', p.toFixed(4));
      var week = p > 0.985 ? 15 : 1 + Math.floor(p * 13.999);
      if (week !== lastWeek) { lastWeek = week; wk.textContent = week > 14 ? wk.dataset.finals : wk.dataset.fmt.replace('{}', week); }
    }
  }

  /* ---------- app story: plays by itself ---------- */
  var DUR = 6000, si = 0, elapsed = 0, last = 0, visible = false, hoverPause = false;
  function showChapter(i, k) {
    setChapter(i);
    var ws = words[i], lit = reduce ? ws.length : Math.round(clamp(k * 1.8, 0, 1) * ws.length);
    if (lit !== lastLit[i]) { lastLit[i] = lit; ws.forEach(function (s, j) { s.classList.toggle('lit', j < lit); }); }
    var kq = Math.round(k * 200) / 200;
    if (kq !== lastK[i]) { lastK[i] = kq; widget(chaps[i], k); }
    if (railMark) railMark.style.setProperty('--t', k.toFixed(3));
  }
  function go(i) { si = (i + chaps.length) % chaps.length; elapsed = 0; lastLit[si] = -1; lastK[si] = -1; showChapter(si, reduce ? 1 : 0); }
  function loop(now) {
    var dt = last ? Math.min(100, now - last) : 0; last = now;
    if (visible && !hoverPause && !document.hidden && !reduce) {
      elapsed += dt;
      var k = elapsed / DUR;
      if (k >= 1) go(si + 1); else showChapter(si, k);
    }
    requestAnimationFrame(loop);
  }
  if (story) {
    go(0);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(story);
    else visible = true;
    var copy = $('.story-copy');
    if (fine && copy) { copy.addEventListener('pointerenter', function () { hoverPause = true; }); copy.addEventListener('pointerleave', function () { hoverPause = false; }); }
    requestAnimationFrame(loop);
  }

  /* ---------- graduation route: draws itself when it comes into view ---------- */
  var rq = 0, sr0 = null;
  function placeRoute(q) {
    var rr = route.getBoundingClientRect(), sr = rsvg.getBoundingClientRect();
    if (!samples || sr.width !== sw || sr.height !== shh) build(sr);
    sr0 = sr;
    var s = samples[Math.round(q * (samples.length - 1))];
    rdraw.style.strokeDashoffset = (total - s.l).toFixed(1);
    var dx = sr.left - rr.left + s.x, dy = s.y;
    rdot.style.setProperty('--dx', dx.toFixed(1) + 'px'); rdot.style.setProperty('--dy', dy.toFixed(1) + 'px');
    stations.forEach(function (st) { st.classList.toggle('on', dy + 40 >= st.offsetTop); });
  }
  if (route && plen) {
    placeRoute(0);
    var started = false;
    var startRoute = function () {
      if (started) return; started = true;
      if (reduce) { rq = 1; placeRoute(1); return; }
      var s0 = performance.now(), D = 5200;
      (function step(now) { var x = clamp((now - s0) / D, 0, 1); rq = x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; placeRoute(rq); if (x < 1) requestAnimationFrame(step); })(s0);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) startRoute(); }, { threshold: 0.2 }).observe(route);
    else startRoute();
  }

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; frame(); }); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { var c = cur; cur = -1; setChapter(c < 0 ? 0 : c); if (route && plen) placeRoute(rq); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { var c = cur; cur = -1; setChapter(c < 0 ? 0 : c); });
  frame();

  /* rail: tap a chapter to show it */
  rail.forEach(function (li, j) {
    li.style.cursor = 'pointer';
    li.addEventListener('click', function () { go(j); });
  });
})();
