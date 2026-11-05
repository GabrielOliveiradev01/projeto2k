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
