const MAX_ZOOM = 3;
const DESKTOP_ZOOM = 2.5;
const MIN_USEFUL_ZOOM = 1.15;

const states = new WeakMap();
const gesture = { img: null, mode: null, panX: 0, panY: 0, originX: 0, originY: 0, startDist: 0, startScale: 1 };

function stateFor(img) {
  let state = states.get(img);
  if (!state) {
    state = { scale: 1, x: 0, y: 0 };
    states.set(img, state);
  }
  return state;
}

function getSwiper() {
  const el = document.querySelector('.swiper__product-images');
  return el && el.swiper ? el.swiper : null;
}

function setSwiperMove(allow) {
  const swiper = getSwiper();
  if (swiper) swiper.allowTouchMove = allow;
}

function distance(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function midpoint(a, b) {
  return { x: (a.clientX + b.clientX) / 2, y: (a.clientY + b.clientY) / 2 };
}

function maxScaleFor(img) {
  const media = img.closest('.product__media');
  const declared = Number(media && media.dataset.sourceWidth);
  const source = declared || img.naturalWidth || 0;
  const displayed = img.clientWidth || (media && media.clientWidth) || 1;
  if (!source || !displayed) return MAX_ZOOM;
  return Math.min(MAX_ZOOM, Math.max(1, source / displayed));
}

function applyTransform(img, state) {
  img.style.transform = 'translate3d(' + state.x + 'px, ' + state.y + 'px, 0) scale(' + state.scale + ')';
}

function clampState(img, state) {
  const media = img.closest('.product__media');
  const width = media ? media.clientWidth : 0;
  const height = media ? media.clientHeight : 0;

  if (state.scale <= 1 || !width || !height) {
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    return;
  }

  const minX = width * (1 - state.scale);
  const minY = height * (1 - state.scale);
  state.x = Math.min(0, Math.max(minX, state.x));
  state.y = Math.min(0, Math.max(minY, state.y));
}

function setZoomed(img, zoomed) {
  const media = img.closest('.product__media');
  if (media) media.classList.toggle('is-zoomed', zoomed);
}

function setSuggestionsHidden(hidden) {
  document.querySelectorAll('.swiper__product-images .suggestion-click').forEach((el) => {
    el.classList.toggle('hide-suggestion', hidden);
  });
}

function upgradeSource(img) {
  const media = img.closest('.product__media');
  const zoomSrc = media && media.dataset.zoomSrc;
  if (!zoomSrc || img.dataset.zoomState === 'ready' || img.dataset.zoomState === 'pending') return;

  img.dataset.zoomState = 'pending';
  const preload = new Image();
  preload.onload = () => {
    if (!img.isConnected) return;
    img.src = zoomSrc;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.dataset.zoomState = 'ready';
  };
  preload.onerror = () => {
    img.dataset.zoomState = 'failed';
  };
  preload.src = zoomSrc;
}

function resetImage(img) {
  const state = stateFor(img);
  state.scale = 1;
  state.x = 0;
  state.y = 0;
  img.style.transform = '';
  setZoomed(img, false);
}

function resetMobileZoom() {
  document.querySelectorAll('.swiper__product-images .product__media img').forEach(resetImage);
  gesture.img = null;
  gesture.mode = null;
  setSwiperMove(true);
  setSuggestionsHidden(false);
}

function imageFromEvent(event) {
  const media = event.target.closest('.product__media');
  if (!media || media.classList.contains('is-media-error') || media.classList.contains('zoom-unavailable')) return null;
  return media.querySelector('img');
}

function beginPinch(img, event) {
  const state = stateFor(img);
  const media = img.closest('.product__media');
  const rect = media.getBoundingClientRect();
  const mid = midpoint(event.touches[0], event.touches[1]);

  gesture.img = img;
  gesture.mode = 'pinch';
  gesture.startDist = distance(event.touches[0], event.touches[1]);
  gesture.startScale = state.scale;
  gesture.originX = (mid.x - rect.left - state.x) / state.scale;
  gesture.originY = (mid.y - rect.top - state.y) / state.scale;

  setSwiperMove(false);
  upgradeSource(img);
}

function updatePinch(img, event) {
  const state = stateFor(img);
  const media = img.closest('.product__media');
  const rect = media.getBoundingClientRect();
  const mid = midpoint(event.touches[0], event.touches[1]);
  const dist = distance(event.touches[0], event.touches[1]);
  if (!gesture.startDist) return;

  const next = gesture.startScale * (dist / gesture.startDist);
  state.scale = Math.min(maxScaleFor(img), Math.max(1, next));
  state.x = mid.x - rect.left - gesture.originX * state.scale;
  state.y = mid.y - rect.top - gesture.originY * state.scale;
  clampState(img, state);
  applyTransform(img, state);

  const zoomed = state.scale > 1.01;
  setZoomed(img, zoomed);
  setSuggestionsHidden(zoomed);
}

function beginPan(img, event) {
  const state = stateFor(img);
  gesture.img = img;
  gesture.mode = 'pan';
  gesture.panX = event.touches[0].clientX - state.x;
  gesture.panY = event.touches[0].clientY - state.y;
  setSwiperMove(false);
}

function updatePan(img, event) {
  const state = stateFor(img);
  state.x = event.touches[0].clientX - gesture.panX;
  state.y = event.touches[0].clientY - gesture.panY;
  clampState(img, state);
  applyTransform(img, state);
}

function onTouchStart(event) {
  const root = event.currentTarget;
  if (!root.contains(event.target)) return;

  if (event.touches.length >= 2) {
    const img = imageFromEvent(event);
    if (!img) return;
    if (img.clientWidth > 0 && maxScaleFor(img) < MIN_USEFUL_ZOOM) {
      img.closest('.product__media').classList.add('zoom-unavailable');
      return;
    }
    beginPinch(img, event);
    return;
  }

  if (event.touches.length === 1) {
    const img = imageFromEvent(event);
    if (!img) return;
    if (stateFor(img).scale > 1.01) beginPan(img, event);
  }
}

function onTouchMove(event) {
  if (!gesture.img) return;

  if (gesture.mode === 'pinch' && event.touches.length >= 2) {
    event.preventDefault();
    event.stopPropagation();
    updatePinch(gesture.img, event);
    return;
  }

  if (gesture.mode === 'pan' && event.touches.length === 1 && stateFor(gesture.img).scale > 1.01) {
    event.preventDefault();
    event.stopPropagation();
    updatePan(gesture.img, event);
  }
}

function onTouchEnd(event) {
  if (!gesture.img) return;
  const img = gesture.img;
  const state = stateFor(img);

  if (gesture.mode === 'pinch' && event.touches.length === 1 && state.scale > 1.01) {
    beginPan(img, event);
    return;
  }

  if (event.touches.length > 0) return;

  gesture.img = null;
  gesture.mode = null;

  if (state.scale <= 1.01) {
    resetImage(img);
    setSwiperMove(true);
    setSuggestionsHidden(false);
  }
}

function setupTouch(root) {
  if (!root || root.dataset.zoomReady === 'true') return;
  root.dataset.zoomReady = 'true';

  root.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
  root.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
  root.addEventListener('touchend', onTouchEnd, { capture: true });
  root.addEventListener('touchcancel', onTouchEnd, { capture: true });
}

function bindSlideReset() {
  const swiper = getSwiper();
  if (!swiper || swiper.el.dataset.zoomSlideBound === 'true') return;
  swiper.el.dataset.zoomSlideBound = 'true';
  swiper.on('slideChange', resetMobileZoom);
}

function setupMobile() {
  setupTouch(document.querySelector('.swiper__product-images'));
  setupTouch(document.querySelector('[data-product-images="desktop"]'));
  bindSlideReset();
  if (!getSwiper()) window.addEventListener('load', bindSlideReset, { once: true });
}

function desktopEnabled() {
  return window.matchMedia('(min-width: 1025px)').matches;
}

function onDesktopEnter(media, img) {
  if (!desktopEnabled() || media.classList.contains('is-media-error')) return;
  media.dataset.hoverScale = String(DESKTOP_ZOOM);
  upgradeSource(img);
}

function onDesktopMove(media, img, event) {
  if (!desktopEnabled()) return;
  const max = Number(media.dataset.hoverScale);
  if (!max) return;
  const rect = media.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  img.style.transformOrigin = x + '% ' + y + '%';
  img.style.transform = 'scale(' + max + ')';
}

function onDesktopLeave(img) {
  if (!desktopEnabled()) return;
  img.style.transform = '';
  img.style.transformOrigin = '';
}

function desktopImageFromEvent(event) {
  const item = event.target.closest('.product__media-item');
  if (!item || !event.currentTarget.contains(item)) return null;
  const img = item.querySelector('.product__media img');
  if (!img || img.closest('.product__media').classList.contains('is-media-error')) return null;
  return img;
}

function setupDesktop() {
  const root = document.querySelector('[data-product-images="desktop"]');
  if (!root || root.dataset.hoverReady === 'true') return;
  root.dataset.hoverReady = 'true';

  root.addEventListener('mouseover', (event) => {
    const img = desktopImageFromEvent(event);
    if (!img || img.dataset.hoverOn === 'true') return;
    img.dataset.hoverOn = 'true';
    onDesktopEnter(img.closest('.product__media'), img);
  });

  root.addEventListener('mousemove', (event) => {
    const img = desktopImageFromEvent(event);
    if (!img) return;
    onDesktopMove(img.closest('.product__media'), img, event);
  });

  root.addEventListener('mouseout', (event) => {
    const img = desktopImageFromEvent(event);
    if (!img) return;
    const item = img.closest('.product__media-item');
    if (event.relatedTarget && item.contains(event.relatedTarget)) return;
    img.dataset.hoverOn = '';
    onDesktopLeave(img);
  });
}

function onImageError(event) {
  const img = event.currentTarget;
  if (img.dataset.zoomState === 'pending') return;

  const media = img.closest('.product__media');
  const fallback = media && media.querySelector('.product__media-error');
  img.hidden = true;
  if (fallback) fallback.hidden = false;
  if (media) media.classList.add('is-media-error');
}

function bindImageErrors() {
  document.querySelectorAll('.product__images .product__media img').forEach((img) => {
    if (img.dataset.errorBound === 'true') return;
    img.dataset.errorBound = 'true';
    img.addEventListener('error', onImageError);
  });
}

function initZoom() {
  bindImageErrors();
  setupMobile();
  setupDesktop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initZoom);
} else {
  initZoom();
}
