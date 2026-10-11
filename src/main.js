import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource-variable/manrope';
import './styles.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

window.__arminakBooted = true;
if (reduceMotion) root.classList.add('reduced-motion');

/* ------------------------------------------------------------------ */
/* Smooth scrolling                                                    */
/* ------------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const navH = () => ($('.nav')?.offsetHeight || 64);
function scrollToTarget(target) {
  if (!target) return;
  const offset = target.id === 'main' ? 0 : -navH() + 1;
  if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
  else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: reduceMotion ? 'auto' : 'smooth' });
}

// In-page anchors
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  e.preventDefault();
  closeMenu(false);
  scrollToTarget(target);
  // Move focus for keyboard / screen-reader users without a second jump.
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  history.replaceState(null, '', id === 'main' ? location.pathname : `#${id}`);
});

/* ------------------------------------------------------------------ */
/* Page curtain: intro + transitions to other pages                    */
/* ------------------------------------------------------------------ */
const curtain = $('.curtain');
function introCurtain() {
  if (!curtain) return gsap.timeline();
  if (reduceMotion) { curtain.remove(); return gsap.timeline(); }
  const tl = gsap.timeline();
  tl.from('.curtain__mark', { scale: 0.6, opacity: 0, duration: 0.8, ease: 'expo.out' })
    .from('.curtain__name', { yPercent: 120, opacity: 0, duration: 0.8, ease: 'expo.out' }, '-=0.6')
    .to('.curtain__inner', { yPercent: -30, opacity: 0, duration: 0.6, ease: 'power3.in' }, '+=0.25')
    .to(curtain, { clipPath: 'inset(0 0 100% 0)', duration: 1.0, ease: 'expo.inOut' }, '-=0.25')
    .set(curtain, { display: 'none' });
  return tl;
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-transition]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || reduceMotion || !curtain) return;
  e.preventDefault();
  gsap.set(curtain, { display: 'grid', clipPath: 'inset(100% 0 0 0)' });
  gsap.set('.curtain__inner', { yPercent: 0, opacity: 1 });
  gsap.to(curtain, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'expo.inOut', onComplete: () => { location.href = a.href; } });
});
// Restore page when returning via bfcache
window.addEventListener('pageshow', (e) => { if (e.persisted && curtain) gsap.set(curtain, { display: 'none' }); });

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
const nav = $('.nav');
const burger = $('.burger');
const menu = $('#menu');
let menuOpen = false;
let lastFocus = null;

function onScrollNav() {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', onScrollNav, { passive: true });
onScrollNav();

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  lastFocus = document.activeElement;
  menu.hidden = false;
  burger.setAttribute('aria-expanded', 'true');
  burger.setAttribute('aria-label', 'Close menu');
  nav.classList.add('menu-open');
  nav.classList.remove('is-light');
  lenis?.stop();
  document.body.style.overflow = 'hidden';
  const links = $$('.menu__list a span, .menu__list small', menu);
  if (reduceMotion) { gsap.set('.menu__bg', { clipPath: 'circle(150% at calc(100% - 3rem) 2.75rem)' }); }
  else {
    gsap.timeline()
      .to('.menu__bg', { clipPath: 'circle(150% at calc(100% - 3rem) 2.75rem)', duration: 0.9, ease: 'expo.inOut' })
      .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out' }, '-=0.45')
      .fromTo('.menu__foot > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.6, ease: 'power3.out' }, '-=0.6');
  }
  $('.menu__list a', menu)?.focus({ preventScroll: true });
}
function closeMenu(restoreFocus = true) {
  if (!menuOpen) return;
  menuOpen = false;
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  nav.classList.remove('menu-open');
  document.body.style.overflow = '';
  lenis?.start();
  const done = () => { menu.hidden = true; updateNavTheme(); };
  if (reduceMotion) { gsap.set('.menu__bg', { clipPath: 'circle(0% at calc(100% - 3rem) 2.75rem)' }); done(); }
  else gsap.to('.menu__bg', { clipPath: 'circle(0% at calc(100% - 3rem) 2.75rem)', duration: 0.7, ease: 'expo.inOut', onComplete: done });
  gsap.to('.menu__content', { opacity: 0, duration: 0.25, onComplete: () => gsap.set('.menu__content', { opacity: 1 }) });
  if (restoreFocus) lastFocus?.focus?.();
}
burger?.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
document.addEventListener('keydown', (e) => {
  if (!menuOpen) return;
  if (e.key === 'Escape') { closeMenu(); return; }
  if (e.key === 'Tab') {
    // Focus trap across the burger and the menu's focusable elements.
    const focusables = [burger, ...$$('a, button', menu)];
    const i = focusables.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); focusables.at(-1).focus(); }
    else if (!e.shiftKey && i === focusables.length - 1) { e.preventDefault(); focusables[0].focus(); }
  }
});
window.addEventListener('resize', () => { if (menuOpen && window.innerWidth >= 1100) closeMenu(false); });

/* ------------------------------------------------------------------ */
/* Section theme flow + nav contrast + active link                     */
/* ------------------------------------------------------------------ */
const themedSections = $$('main > section[data-theme], footer[data-theme]');
let currentTheme = 'dark';
function setTheme(theme) {
  if (theme === currentTheme) return;
  currentTheme = theme;
  root.dataset.theme = theme;
  updateNavTheme();
}
function updateNavTheme() {
  // Nav adopts whichever section sits under it.
  const y = navH() / 2;
  const under = themedSections.find((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
  nav.classList.toggle('is-light', !menuOpen && under?.dataset.theme === 'light');
}

function initThemeFlow() {
  if (!reduceMotion) root.classList.add('theme-flow');
  themedSections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => { if (self.isActive) setTheme(section.dataset.theme); },
    });
  });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: updateNavTheme });

  const navLinks = $$('.nav__links a');
  $$('main section[id]').forEach((section) => {
    const link = navLinks.find((a) => a.getAttribute('href') === `#${section.id}`);
    if (!link) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function heroIntro() {
  const tl = gsap.timeline();
  if (reduceMotion) return tl;
  tl.to('.hero__line > span', { y: 0, duration: 1.4, stagger: 0.12, ease: 'expo.out' })
    .fromTo('.hero__svg', { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', startAt: { y: 24 } }, 0.35)
    .from('.nav__inner > *', { opacity: 0, y: -16, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.4);
  return tl;
}

if (!reduceMotion) {
  // Layered parallax: each SVG layer drifts at its own depth.
  $$('.hero__svg .layer').forEach((layer) => {
    const depth = parseFloat(layer.dataset.depth || 0);
    gsap.to(layer, {
      y: () => -depth * window.innerHeight * 0.55,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
  gsap.to('.hero__photo', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Subtle pointer drift on the skyline.
  if (finePointer) {
    const layers = $$('.hero__svg .layer').map((el) => ({ el, depth: parseFloat(el.dataset.depth || 0), x: gsap.quickTo(el, 'x', { duration: 1.4, ease: 'power3.out' }) }));
    $('.hero').addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      layers.forEach((l) => l.x(-nx * l.depth * 80));
    });
  }
}

/* ------------------------------------------------------------------ */
/* Reveals                                                             */
/* ------------------------------------------------------------------ */
function initReveals() {
  if (reduceMotion) return;

  // Masked line-by-line headline reveals.
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.25,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });

  // Fade-and-rise.
  $$('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 36 }, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Staggered children.
  $$('[data-stagger]').forEach((group) => {
    gsap.set(group.children, { opacity: 0, y: 40 });
    ScrollTrigger.batch(group.children, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09, ease: 'power3.out', overwrite: true }),
    });
  });

  // Clip-path image reveals.
  $$('[data-clip]').forEach((el) => {
    gsap.to(el, {
      clipPath: 'inset(0% 0 0 0)', duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
    const img = el.querySelector('[data-parallax]') || el.querySelector('img, iframe');
    if (img && !el.querySelector('[data-parallax]')) gsap.from(img, { scale: 1.2, duration: 2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // Parallax.
  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || -10;
    gsap.fromTo(el, { yPercent: -amt }, {
      yPercent: amt, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Team cards: slight vertical offset per column for an editorial rhythm.
  if (window.matchMedia('(min-width: 1100px)').matches) {
    $$('.team__grid .member').forEach((card, i) => {
      const col = i % 5;
      gsap.fromTo(card, { y: col * 14 }, {
        y: -col * 14, ease: 'none',
        scrollTrigger: { trigger: '.team__grid', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  // Why pillars: draw icon strokes.
  $$('.pillar__icon').forEach((svg) => {
    const paths = $$('path, circle', svg);
    paths.forEach((p) => {
      const len = p.getTotalLength ? p.getTotalLength() : 200;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.to(paths, { strokeDashoffset: 0, duration: 1.8, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: svg, start: 'top 88%', once: true } });
  });
}

/* ------------------------------------------------------------------ */
/* Counters                                                            */
/* ------------------------------------------------------------------ */
function initCounters() {
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const comma = el.dataset.format === 'comma';
    const fmt = (v) => comma ? Math.round(v).toLocaleString('en-US') : v.toFixed(decimals);
    el.textContent = fmt(end);
    if (reduceMotion) return;
    const obj = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: end, duration: comma ? 2.6 : 2.2, ease: 'power3.out',
      onUpdate: () => { el.textContent = fmt(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Marquees (velocity-aware)                                           */
/* ------------------------------------------------------------------ */
function initMarquees() {
  if (reduceMotion) return;
  $$('[data-marquee]').forEach((m) => {
    const track = $('.marquee__track', m);
    const inner = document.createElement('div');
    inner.className = 'marquee__inner';
    m.insertBefore(inner, track);
    inner.appendChild(track);
    // Enough copies to cover wide screens, then loop over exactly one copy's width.
    const copies = Math.max(2, Math.ceil((window.innerWidth * 2) / Math.max(track.offsetWidth, 1)));
    for (let i = 1; i < copies; i++) inner.appendChild(track.cloneNode(true));
    const dir = m.classList.contains('marquee--reverse') ? 1 : -1;
    const width = track.offsetWidth;
    const speed = m.classList.contains('marquee--lg') ? 55 : 45; // px per second
    const tween = gsap.fromTo(inner, { x: dir < 0 ? 0 : -width }, { x: dir < 0 ? -width : 0, duration: width / speed, ease: 'none', repeat: -1 });
    // Speed up with scroll velocity, ease back to cruise.
    let boost = 1;
    ScrollTrigger.create({
      trigger: m, start: 'top bottom', end: 'bottom top',
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
      onUpdate: (self) => {
        boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 5);
        gsap.to(tween, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(tween, { timeScale: 1, duration: 1.2 }) });
      },
    });
    m.addEventListener('mouseenter', () => gsap.to(tween, { timeScale: 0.25, duration: 0.6, overwrite: true }));
    m.addEventListener('mouseleave', () => gsap.to(tween, { timeScale: 1, duration: 0.6, overwrite: true }));
  });
}

/* ------------------------------------------------------------------ */
/* Practice accordion                                                  */
/* ------------------------------------------------------------------ */
function initAccordion() {
  const items = $$('.acc');
  items.forEach((item) => {
    const btn = $('.acc__btn', item);
    if (btn.getAttribute('aria-expanded') === 'true') item.classList.add('is-open');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      // One open at a time keeps the list scannable.
      items.forEach((other) => { if (other !== item) toggle(other, false); });
      toggle(item, !open);
    });
  });

  function toggle(item, open) {
    const btn = $('.acc__btn', item);
    const panel = $('.acc__panel', item);
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (isOpen === open) return;
    btn.setAttribute('aria-expanded', String(open));
    item.classList.toggle('is-open', open);
    const after = () => ScrollTrigger.refresh();
    if (reduceMotion) { panel.hidden = !open; after(); return; }
    if (open) {
      panel.hidden = false;
      gsap.fromTo(panel, { height: 0 }, { height: 'auto', duration: 0.8, ease: 'expo.out', onComplete: after });
      gsap.fromTo($$('.acc__body > *, .tags li', panel), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.04, ease: 'power3.out', delay: 0.1 });
    } else {
      gsap.to(panel, { height: 0, duration: 0.6, ease: 'expo.inOut', onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height' }); after(); } });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Attorney timeline                                                   */
/* ------------------------------------------------------------------ */
function initTimeline() {
  const timeline = $('.timeline');
  if (!timeline) return;
  const bar = $('.timeline__progress span', timeline);
  const items = $$('.tl', timeline);
  if (reduceMotion) { items.forEach((i) => i.classList.add('is-active')); return; }
  gsap.fromTo(bar, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } });
  items.forEach((item) => {
    gsap.fromTo(item, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 85%', once: true } });
    ScrollTrigger.create({ trigger: item, start: 'top 62%', onToggle: (self) => item.classList.toggle('is-active', self.isActive || self.progress === 1), end: 'max' });
  });
}

/* ------------------------------------------------------------------ */
/* Media: pinned horizontal scroll on desktop                          */
/* ------------------------------------------------------------------ */
function initPressScroll() {
  if (reduceMotion) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const section = $('.media');
    const pin = $('.media__pin');
    const track = $('.press-track');
    section.classList.add('is-hscroll');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    // Cards tilt in as they travel.
    $$('.press', track).forEach((card) => {
      gsap.fromTo(card, { rotate: 2, y: 30, opacity: 0.4 }, {
        rotate: 0, y: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 65%', scrub: true },
      });
    });
    // Keep keyboard users oriented: focusing a card scrolls the pinned rail to it.
    $$('.press a', track).forEach((a) => a.addEventListener('focus', () => {
      const st = tween.scrollTrigger;
      const ratio = Math.min(1, a.parentElement.offsetLeft / Math.max(1, track.scrollWidth - window.innerWidth));
      const y = st.start + (st.end - st.start) * ratio;
      if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y);
    }));
    return () => section.classList.remove('is-hscroll');
  });
}

/* ------------------------------------------------------------------ */
/* Magnetic buttons                                                    */
/* ------------------------------------------------------------------ */
function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  $$('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const label = el.querySelector('span');
    const lx = label && gsap.quickTo(label, 'x', { duration: 0.6, ease: 'power3.out' });
    const ly = label && gsap.quickTo(label, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * 0.25); yTo(dy * 0.35);
      lx?.(dx * 0.1); ly?.(dy * 0.12);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); lx?.(0); ly?.(0); });
  });

  // Team cards: gentle 3D tilt.
  $$('.member__photo').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
}

/* ------------------------------------------------------------------ */
/* Mobile sticky CTA                                                   */
/* ------------------------------------------------------------------ */
function initMobileCta() {
  const cta = $('.mobile-cta');
  if (!cta) return;
  const contact = $('#contact');
  const update = () => {
    const pastHero = window.scrollY > window.innerHeight * 0.7;
    const r = contact.getBoundingClientRect();
    const atContact = r.top < window.innerHeight && r.bottom > 0;
    cta.classList.toggle('is-visible', pastHero && !atContact && !menuOpen);
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ------------------------------------------------------------------ */
/* Consultation form                                                   */
/* ------------------------------------------------------------------ */
function initForm() {
  const form = $('#consult-form');
  if (!form) return;
  const status = $('.form__status', form);
  const select = $('select', form);
  const syncSelect = () => select.classList.toggle('has-value', !!select.value);
  select.addEventListener('change', syncSelect);

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
    phone: (v) => (v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter a valid phone number.'),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    practice_area: (v) => (v ? '' : 'Please choose a practice area.'),
  };
  const validateField = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const msg = rule(input.value);
    const err = $(`#${input.id}-err`, form);
    if (err) err.textContent = msg;
    input.closest('.field').classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) input.setAttribute('aria-describedby', err.id);
    return !msg;
  };
  $$('input, select', form).forEach((input) => {
    input.addEventListener('blur', () => { if (input.value) validateField(input); });
    input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) validateField(input); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = $$('input, select', form);
    const results = fields.map(validateField);
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) {
      firstBad.focus();
      if (!reduceMotion) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    status.textContent = 'Sending…';
    const endpoint = form.dataset.endpoint;
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        // No backend configured: hand off to the visitor's email client.
        const body = `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nPractice area: ${data.practice_area}\n\n${data.message || ''}`;
        window.location.href = `mailto:info@arminaklaw.com?subject=${encodeURIComponent(`Consultation request: ${data.practice_area}`)}&body=${encodeURIComponent(body)}`;
      }
      form.classList.add('is-sent');
      status.textContent = endpoint
        ? 'Thank you. An attorney will be in touch shortly.'
        : 'Thank you. Your email app should open with your request ready to send.';
      if (endpoint) { form.reset(); syncSelect(); }
    } catch {
      status.textContent = 'Something went wrong. Please call (818) 584-2556 or email info@arminaklaw.com.';
    } finally {
      btn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
$$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

initAccordion();
initForm();
initMobileCta();
initMagnetic();

document.fonts.ready.then(() => {
  // The pinned press rail adds scroll distance, so create it before any trigger further down the page.
  initPressScroll();
  initThemeFlow();
  initReveals();
  initCounters();
  initMarquees();
  initTimeline();

  if (reduceMotion) {
    $('.curtain')?.remove();
    ScrollTrigger.refresh();
    return;
  }
  const master = gsap.timeline();
  master.add(introCurtain()).add(heroIntro(), '-=0.75');
  ScrollTrigger.refresh();

  // Honour a deep link once layout settles.
  if (location.hash.length > 1) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) setTimeout(() => scrollToTarget(target), 400);
  }
});
