/* Hao Zheng — Academic Homepage interactions */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav state ---------- */
  var nav = document.querySelector('.site-nav');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) navLinks.classList.remove('open');
    });
  }

  /* ---------- Scrollspy ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], section[id]'));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));

  function spy() {
    if (!sections.length) return;
    var pos = window.scrollY + 120;
    var currentId = sections[0].id;
    sections.forEach(function (s) {
      if (s.offsetTop <= pos) currentId = s.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Typewriter ---------- */
  var typeEl = document.getElementById('typewriter');
  if (typeEl) {
    var phrases = (typeEl.getAttribute('data-phrases') || '').split('|').filter(Boolean);
    var pi = 0, ci = 0, deleting = false;
    var textNode = document.createTextNode('');
    var cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    typeEl.textContent = '';
    typeEl.appendChild(textNode);
    typeEl.appendChild(cursor);

    function tick() {
      if (!phrases.length) return;
      var current = phrases[pi];
      if (!deleting) {
        ci++;
        textNode.textContent = current.slice(0, ci);
        if (ci === current.length) { deleting = true; return setTimeout(tick, 1600); }
        setTimeout(tick, reducedMotion ? 10 : 55);
      } else {
        ci--;
        textNode.textContent = current.slice(0, ci);
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, 300); }
        setTimeout(tick, 28);
      }
    }
    tick();
  }

  /* ---------- Animated counters ---------- */
  var nums = document.querySelectorAll('.stat .num[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reducedMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { cio.observe(n); });
  } else {
    nums.forEach(function (n) { n.textContent = n.getAttribute('data-count') + (n.getAttribute('data-suffix') || ''); });
  }

  /* ---------- Particle field (hero) ---------- */
  var canvas = document.getElementById('particles');
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext('2d');
    var W, H, pts = [];
    var DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var count = Math.min(90, Math.floor(W * H / 16000));
      pts = [];
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
          r: Math.random() * 1.6 + .4
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.fill();
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          d = (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
          if (d < 130 * 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.09 * (1 - d / (130 * 130))) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  /* ---------- Publication filter ---------- */
  var tabs = document.querySelectorAll('.pub-tab');
  var pubs = document.querySelectorAll('.pub-item');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      pubs.forEach(function (p) {
        var match = filter === 'all' || p.getAttribute('data-type') === filter;
        p.classList.toggle('hidden', !match);
      });
    });
  });

  /* ---------- Parallax tilt on portrait ---------- */
  var portrait = document.querySelector('.portrait-wrap');
  if (portrait && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    portrait.parentElement.addEventListener('mousemove', function (e) {
      var r = portrait.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      portrait.style.transform = 'perspective(900px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    portrait.parentElement.addEventListener('mouseleave', function () {
      portrait.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
    });
  }
})();
