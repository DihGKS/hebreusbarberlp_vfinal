// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── DROPDOWN MENU ──
const navServicos = document.getElementById('navServicos');
const servicosToggle = document.getElementById('servicosToggle');
const servicosDropdown = document.getElementById('servicosDropdown');

if (servicosToggle && servicosDropdown) {
  servicosToggle.addEventListener('click', (e) => {
    e.preventDefault();
    servicosDropdown.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (navServicos && !navServicos.contains(e.target)) {
      servicosDropdown.classList.remove('active');
    }
  });

  document.querySelectorAll('#servicosDropdown a').forEach(a => {
    a.addEventListener('click', () => servicosDropdown.classList.remove('active'));
  });
}

// ── HAMBURGER / MENU MOBILE ──
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

// Cria o overlay dinamicamente
let overlay = document.getElementById('mobileMenuOverlay');
if (!overlay) {
  overlay = document.createElement('div');
  overlay.id = 'mobileMenuOverlay';
  overlay.className = 'mobile-menu-overlay';
  document.body.appendChild(overlay);
}

function openMobileMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });

  // Fechar ao clicar no overlay
  overlay.addEventListener('click', closeMobileMenu);

  // Fechar ao clicar em qualquer link do menu mobile
  document.querySelectorAll('.mobile-link, .mobile-menu .nav-cta').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
}

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
if (reveals.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => observer.observe(el));
}

// ── FAQ ──
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      const icon = i.querySelector('.faq-icon');
      if (icon) icon.textContent = '+';
    });
    if (!wasOpen) {
      item.classList.add('open');
      const icon = q.querySelector('.faq-icon');
      if (icon) icon.textContent = '−';
    }
  });
});

// ── COUNTER ANIMATION ──
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(ease * target);
    el.innerHTML = val + (suffix ? '<span class="number-sym">' + suffix + '</span>' : '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Lê o alvo e o sufixo do contador.
// Prioridade: data-count / data-suffix no HTML. Se não existirem, deduz a
// partir do próprio conteúdo (dígitos = alvo, .number-sym = sufixo), o que
// funciona para qualquer valor — inclusive 1000+, que a lógica antiga
// interpretava erradamente como 100%.
function readCounter(el) {
  const symEl = el.querySelector('.number-sym');
  const suffix = el.dataset.suffix !== undefined
    ? el.dataset.suffix
    : (symEl ? symEl.textContent.trim() : '');

  const raw = el.dataset.count !== undefined
    ? el.dataset.count
    : el.textContent.replace(/[^\d]/g, '');

  const target = parseInt(raw, 10);
  const isStatic = el.dataset.animate === 'false' || suffix === '★';

  return { target: Number.isNaN(target) ? null : target, suffix, isStatic };
}

function renderCounter(el, target, suffix) {
  el.innerHTML = target + (suffix ? '<span class="number-sym">' + suffix + '</span>' : '');
}

const numbersObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;

    const el = e.target.querySelector('.number-val');
    if (el) {
      const { target, suffix, isStatic } = readCounter(el);
      if (target !== null) {
        if (isStatic) renderCounter(el, target, suffix);
        else animateCounter(el, target, suffix);
      }
    }
    numbersObserver.unobserve(e.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.number-item').forEach(el => numbersObserver.observe(el));

// ── FILTROS DE SERVIÇOS ──
const filtros = document.querySelectorAll('.btn-filtro');
if (filtros.length > 0) {
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtro = btn.dataset.filtro;
      document.querySelectorAll('.servico-card').forEach(card => {
        if (filtro === 'todos' || card.dataset.categoria === filtro) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ── CARROSSEL ──

// Carrossel das demais páginas (1 card por vez, só no mobile)
function initMobileCarousel(wrapperId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const track = wrapper.querySelector('.carousel-track');
  const btnPrev = wrapper.querySelector('.carousel-btn-prev');
  const btnNext = wrapper.querySelector('.carousel-btn-next');
  if (!track || !btnPrev || !btnNext) return;

  // Filtra apenas filhos diretos que são elementos (ignora texto/comentários)
  const cards = Array.from(track.children).filter(el => el.nodeType === 1);
  if (cards.length === 0) return;

  let current = 0;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function updateButtons() {
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === cards.length - 1;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, cards.length - 1));
    const offset = current * 100;
    cards.forEach(card => {
      card.style.transform = `translateX(-${offset}%)`;
    });
    updateButtons();
  }

  function activate() {
    goTo(current);
  }

  function deactivate() {
    cards.forEach(card => {
      card.style.transform = '';
    });
  }

  function handleResize() {
    if (isMobile()) {
      activate();
    } else {
      deactivate();
    }
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));

  handleResize();
  window.addEventListener('resize', handleResize);
}

// Carrossel da home (desktop + mobile): desliza a "track" e calcula
// quantos cards cabem por visualização, exibindo as setas só quando há overflow.
function initResponsiveCarousel(wrapperId) {
  const wrapper = document.getElementById(wrapperId);
  if (!wrapper) return;

  const track = wrapper.querySelector('.carousel-track');
  const btnPrev = wrapper.querySelector('.carousel-btn-prev');
  const btnNext = wrapper.querySelector('.carousel-btn-next');
  if (!track || !btnPrev || !btnNext) return;

  const cards = Array.from(track.children).filter(el => el.nodeType === 1);
  if (cards.length === 0) return;

  let index = 0;

  function getStep() {
    const cardW = cards[0].getBoundingClientRect().width;
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || '0') || 0;
    return { step: cardW + gap, gap };
  }

  function getMaxIndex() {
    const { step, gap } = getStep();
    if (step <= 0) return 0;
    const viewport = wrapper.getBoundingClientRect().width;
    const perView = Math.max(1, Math.round((viewport + gap) / step));
    return Math.max(0, cards.length - perView);
  }

  function update() {
    const { step } = getStep();
    const maxIndex = getMaxIndex();
    index = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(-${index * step}px)`;

    const hasOverflow = maxIndex > 0;
    btnPrev.style.display = hasOverflow ? 'flex' : 'none';
    btnNext.style.display = hasOverflow ? 'flex' : 'none';
    btnPrev.disabled = index <= 0;
    btnNext.disabled = index >= maxIndex;
  }

  btnPrev.addEventListener('click', () => { index--; update(); });
  btnNext.addEventListener('click', () => { index++; update(); });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 120);
  });

  requestAnimationFrame(update);
  window.addEventListener('load', update);
}

// Inicializa os carrosséis conforme a página
if (document.body.classList.contains('home')) {
  ['carouselServicos', 'carouselDepoimentos'].forEach(initResponsiveCarousel);
} else {
  ['carouselServicos', 'carouselDepoimentos', 'carouselBeneficios'].forEach(initMobileCarousel);
}

// ── WHATSAPP FLOAT: visibilidade conforme o scroll ──
// Mobile: escondido enquanto o HERO está na tela; surge (suave) a partir do Bloco 2.
// Desktop: sempre visível em todos os blocos.
(function () {
  function initWhatsappVisibility() {
    const heroEl = document.querySelector('.hero');
    const waWrap = document.querySelector('.whatsapp-float-wrap');
    if (!heroEl || !waWrap) return;

    const MOBILE_BP = 768;
    const isMobile = () => window.innerWidth <= MOBILE_BP;

    let heroVisible = true;

    function apply() {
      if (isMobile() && heroVisible) {
        waWrap.classList.add('wa-hidden');
      } else {
        waWrap.classList.remove('wa-hidden');
      }
    }

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { heroVisible = e.isIntersecting; });
      apply();
    }, { threshold: 0.15 });

    heroObserver.observe(heroEl);

    let waResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(waResizeTimer);
      waResizeTimer = setTimeout(apply, 120);
    });

    apply();
  }

  // Garante que o botão exista no DOM mesmo se o <script> rodar cedo (ex.: no meio da página)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsappVisibility);
  } else {
    initWhatsappVisibility();
  }
})();
