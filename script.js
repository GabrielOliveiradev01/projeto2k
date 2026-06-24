// Header scroll effect
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

function closeMenu() {
  nav.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
}

function openMenu() {
  nav.classList.add('open');
  menuToggle.classList.add('open');
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Fechar menu');
  document.body.classList.add('menu-open');
}

menuToggle.addEventListener('click', () => {
  if (nav.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

document.querySelectorAll('.nav-links a, .nav-cta').forEach(link => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
});

// Cursor glow
const cursorGlow = document.querySelector('.cursor-glow');
if (window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// Reveal on scroll
const revealElements = document.querySelectorAll('.reveal');
const planCards = document.querySelectorAll('.plan-card');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
);

revealElements.forEach(el => observer.observe(el));
planCards.forEach(el => observer.observe(el));

// Counter animation
const statNumbers = document.querySelectorAll('.stat-number');

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);

statNumbers.forEach(el => counterObserver.observe(el));

function animateCounter(el, target) {
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Form submit loading state (Netlify handles submission)
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.textContent = 'Enviando...';
      btn.disabled = true;
    }
  });
}

const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

// Smooth parallax on hero (desktop only)
window.addEventListener('scroll', () => {
  if (isMobile()) return;

  const scrolled = window.scrollY;
  const heroContent = document.querySelector('.hero-content');
  const heroPhotoLeft = document.querySelector('.hero-photo-left');
  const heroPhotoRight = document.querySelector('.hero-photo-right');

  if (heroContent && scrolled < window.innerHeight) {
    heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
    heroContent.style.opacity = 1 - scrolled / (window.innerHeight * 0.8);
  }

  if (heroPhotoLeft && scrolled < window.innerHeight) {
    heroPhotoLeft.style.transform = `translateY(${scrolled * 0.08}px)`;
  }

  if (heroPhotoRight && scrolled < window.innerHeight) {
    heroPhotoRight.style.transform = `translateY(${scrolled * 0.05}px)`;
  }
});

// Gallery scroll carousel
const gallery = document.getElementById('galeria');
const galleryTrack = document.querySelector('.gallery-track');
const galleryViewport = document.querySelector('.gallery-viewport');
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryProgressFill = document.querySelector('.gallery-progress-fill');
const galleryCounterCurrent = document.querySelector('.gallery-counter-current');
const galleryScrollHint = document.querySelector('.gallery-scroll-hint');

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function getGalleryMaxScroll() {
  if (!galleryTrack || !galleryViewport) return 0;
  return Math.max(0, galleryTrack.scrollWidth - galleryViewport.clientWidth);
}

function setGalleryHeight() {
  if (!gallery) return;
  const maxScroll = getGalleryMaxScroll();
  const vh = getViewportHeight();
  gallery.style.height = `${vh + maxScroll}px`;
}

function getGalleryProgress() {
  if (!gallery) return 0;

  const vh = getViewportHeight();
  const rect = gallery.getBoundingClientRect();
  const scrollable = gallery.offsetHeight - vh;

  if (scrollable <= 0) return 0;
  if (rect.top > 0) return 0;
  if (rect.bottom <= vh) return 1;

  return Math.min(Math.max(-rect.top / scrollable, 0), 1);
}

function updateGalleryCarousel() {
  if (!gallery || !galleryTrack) return;

  const maxScroll = getGalleryMaxScroll();
  const progress = getGalleryProgress();

  galleryTrack.style.transform = `translate3d(-${progress * maxScroll}px, 0, 0)`;

  if (galleryProgressFill) {
    galleryProgressFill.style.width = `${progress * 100}%`;
  }

  const activeIndex = galleryItems.length <= 1
    ? 0
    : Math.min(
        Math.round(progress * (galleryItems.length - 1)),
        galleryItems.length - 1
      );

  galleryItems.forEach((item, i) => {
    item.classList.toggle('active', i === activeIndex);
  });

  if (galleryCounterCurrent) {
    galleryCounterCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
  }

  if (galleryScrollHint) {
    galleryScrollHint.style.opacity = progress > 0.05 && progress < 0.98 ? '0' : '1';
  }
}

function refreshGallery() {
  setGalleryHeight();
  updateGalleryCarousel();
}

function initGallery() {
  if (!gallery || !galleryTrack || !galleryViewport) return;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateGalleryCarousel();
      ticking = false;
    });
  };

  refreshGallery();
  gallery.classList.add('is-ready');

  gallery.querySelectorAll('.gallery-image img').forEach(img => {
    if (!img.complete) {
      img.addEventListener('load', refreshGallery, { once: true });
      img.addEventListener('error', refreshGallery, { once: true });
    }
  });

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(refreshGallery);
    resizeObserver.observe(galleryTrack);
    resizeObserver.observe(galleryViewport);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', refreshGallery);
  window.addEventListener('load', refreshGallery);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refreshGallery);
    window.visualViewport.addEventListener('scroll', onScroll);
  }

  const galleryObserver = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        refreshGallery();
      }
    },
    { threshold: 0 }
  );
  galleryObserver.observe(gallery);
}

initGallery();

// Plan card tilt effect (desktop only)
if (window.matchMedia('(pointer: fine)').matches) {
  planCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
