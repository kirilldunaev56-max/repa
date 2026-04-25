/* 
   Медоварня — main.js
   */

const Storage = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.error('Storage write error:', e); }
  },
  del(key) {
    try { localStorage.removeItem(key); }
    catch (e) { console.error('Storage delete error:', e); }
  }
};


const Toast = (() => {
  const el      = document.getElementById('toast');
  const msgEl   = document.getElementById('toastMessage');
  const iconEl  = document.getElementById('toastIcon');
  let timer;

  const ICONS = { success: '✅', error: '❌', info: '💬', warning: '⚠️' };

  return {
    show(message, type = 'info', duration = 3200) {
      clearTimeout(timer);
      el.className = `toast ${type}`;
      iconEl.textContent = ICONS[type] || ICONS.info;
      msgEl.textContent  = message;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('show'));
      });
      timer = setTimeout(() => el.classList.remove('show'), duration);
    }
  };
})();


function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function on(el, ev, cb) { if (el) el.addEventListener(ev, cb); }
function randomBetween(a, b) { return a + Math.random() * (b - a); }


const Modal = (() => {
  const registry = {};

  function close(id) {
    const m = registry[id];
    if (m) { m.classList.remove('show'); document.body.style.overflow = ''; }
  }
  function open(id) {
    Object.keys(registry).forEach(k => registry[k].classList.remove('show'));
    const m = registry[id];
    if (m) { m.classList.add('show'); document.body.style.overflow = 'hidden'; }
  }
  function register(id) {
    const el = document.getElementById(id);
    if (el) registry[id] = el;
  }
  function closeAll() {
    Object.values(registry).forEach(m => m.classList.remove('show'));
    document.body.style.overflow = '';
  }

  
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
      closeAll();
    }
  });
 
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  return { open, close, closeAll, register };
})();


function initNav() {
  const nav      = qs('#navbar');
  const links    = qsa('.nav-link');
  const sections = qsa('section[id]');
  const burger   = qs('#burgerBtn');
  const navLinks = qs('#navLinks');
  const overlay  = qs('#mobileOverlay');

  
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  
  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        links.forEach(l => l.classList.remove('active'));
        const active = links.find(l => l.getAttribute('href') === `#${sec.id}`);
        if (active) active.classList.add('active');
      }
    });
  }

  
  links.forEach(link => {
    on(link, 'click', e => {
      e.preventDefault();
      const target = qs(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobileMenu();
    });
  });

  
  function openMobileMenu() {
    navLinks.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('show');
  }
  function closeMobileMenu() {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('show');
  }

  on(burger, 'click', () => {
    navLinks.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
  });
  on(overlay, 'click', closeMobileMenu);

  
  on(qs('.logo'), 'click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMobileMenu();
  });
}


function initParticles() {
  const container = qs('#particles');
  if (!container) return;
  const COUNT = window.innerWidth < 768 ? 12 : 24;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${randomBetween(5, 95)}%;
      --dur: ${randomBetween(10, 22)}s;
      --delay: ${randomBetween(0, 12)}s;
      width: ${randomBetween(2, 5)}px;
      height: ${randomBetween(2, 5)}px;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}


function initScrollReveal() {
  const els = qsa('[data-reveal]');
  if (!els.length) {
    
    qsa('.about-card, .menu-card, .booking-card, .review-card.static-review, .contact-card').forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  qsa('[data-reveal]').forEach(el => io.observe(el));
}


function initMenuTabs() {
  const tabs  = qsa('.tab-btn');
  const cards = qsa('.menu-card');

  tabs.forEach(tab => {
    on(tab, 'click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;

      cards.forEach((card, i) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !match);
        if (match) {
          card.style.transitionDelay = `${(i % 4) * 0.05}s`;
          card.classList.add('reveal');
        }
      });
    });
  });
}


function initMenuCards() {
  on(qs('#menuGrid'), 'click', e => {
    const card = e.target.closest('.menu-card');
    if (!card) return;

    qs('#modalImg').src          = card.dataset.img;
    qs('#modalImg').alt          = card.dataset.name;
    qs('#modalName').textContent  = card.dataset.name;
    qs('#modalPrice').textContent = card.dataset.price;
    qs('#modalDescription').textContent = card.dataset.description;

    qs('#btnOrderProduct').dataset.product = card.dataset.name;
    qs('#btnOrderProduct').dataset.price   = card.dataset.price;

    Modal.open('productModal');
  });

  
  on(qs('#btnOrderProduct'), 'click', () => {
    const productName  = qs('#btnOrderProduct').dataset.product || '';
    const productPrice = qs('#btnOrderProduct').dataset.price   || '';
    const label = productName ? `Товар: ${productName} — ${productPrice}` : 'Заказ товара';

    qs('#selectedPackage').textContent = label;
    qs('#bookingMessage').textContent  = '';
    qs('#bookingMessage').className    = '';

    Modal.closeAll();
    setTimeout(() => Modal.open('bookingModal'), 150);
  });
}


function initBooking() {
  
  const dateInput = qs('#bookingDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  
  qsa('.btn-booking').forEach(btn => {
    on(btn, 'click', () => {
      qs('#selectedPackage').textContent = `Пакет: ${btn.dataset.package}`;
      qs('#bookingMessage').textContent  = '';
      qs('#bookingMessage').className    = '';
      Modal.open('bookingModal');
    });
  });

  
  on(qs('#bookingForm'), 'submit', e => {
    e.preventDefault();
    const name   = qs('#bookingName').value.trim();
    const email  = qs('#bookingEmail').value.trim();
    const phone  = qs('#bookingPhone').value.trim();
    const date   = qs('#bookingDate').value;
    const people = qs('#bookingPeople').value;
    const msgEl  = qs('#bookingMessage');

    const setMsg = (msg, type) => {
      msgEl.textContent = msg;
      msgEl.className   = type;
    };

    if (!name || !email || !phone || !date) {
      return setMsg('Пожалуйста, заполните все поля', 'error');
    }
    if (!isValidEmail(email)) {
      return setMsg('Введите корректный email', 'error');
    }

    const pkg = qs('#selectedPackage') ? qs('#selectedPackage').textContent.replace('Пакет: ', '') : 'Не выбран';
    const booking = { pkg, name, email, phone, date, people, ts: Date.now() };
    const bookings = Storage.get('bookings') || [];
    bookings.push(booking);
    Storage.set('bookings', bookings);

    // ── Web3Forms ─────────────────────────────────────────
    // 1. Зайдите на https://web3forms.com
    // 2. Введите medovarna55@gmail.com → нажмите "Get your Access Key"
    // 3. Скопируйте ключ из письма и вставьте сюда:
    const WEB3FORMS_KEY = '0f43c5ef-b31c-4b36-9595-5b098b205f3e';
    // ────────────────────────────────────────────────────

    const submitBtn = qs('#bookingForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: '🍯 Новая бронь — ' + pkg,
        from_name: name,
        email: email,
        message:
          '📦 Пакет/товар: ' + pkg + '\n' +
          '👤 Имя: ' + name + '\n' +
          '📞 Телефон: ' + phone + '\n' +
          '📧 Email: ' + email + '\n' +
          '📅 Дата: ' + date + '\n' +
          '👥 Гостей: ' + people,
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        console.log('Письмо отправлено');
      } else {
        console.error('Ошибка Web3Forms:', data);
      }
    })
    .catch(err => console.error('Ошибка сети:', err))
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
    });

    setMsg(`✓ Готово! Бронь на ${date} принята. Мы свяжемся с вами.`, 'success');
    qs('#bookingForm').reset();
    setTimeout(() => Modal.closeAll(), 2800);
    Toast.show(`Бронирование оформлено, ${name}!`, 'success');
  });
}


function initAuth() {
  Modal.register('profileModal');
  Modal.register('loginModal');
  Modal.register('registerModal');

  on(qs('#profileBtn'), 'click', () => {
    updateProfileUI();
    Modal.open('profileModal');
  });

  on(qs('#openLogin'), 'click', () => Modal.open('loginModal'));
  on(qs('#openRegister'), 'click', () => Modal.open('registerModal'));
  on(qs('#switchToRegister'), 'click', e => { e.preventDefault(); Modal.open('registerModal'); });
  on(qs('#switchToLogin'), 'click', e => { e.preventDefault(); Modal.open('loginModal'); });

  
  qsa('.toggle-password').forEach(btn => {
    on(btn, 'click', () => {
      const inp = qs(`#${btn.dataset.target}`);
      if (!inp) return;
      const isPass = inp.type === 'password';
      inp.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁';
    });
  });

  
  on(qs('#loginBtn'), 'click', () => {
    const email    = qs('#loginEmail').value.trim();
    const password = qs('#loginPassword').value;
    if (!email || !password) return Toast.show('Заполните все поля', 'error');

    const user = Storage.get('user');
    if (!user) return Toast.show('Пользователь не найден. Зарегистрируйтесь.', 'error');
    if (user.email !== email || user.password !== password) return Toast.show('Неверный email или пароль', 'error');

    Storage.set('loggedUser', email);
    Modal.closeAll();
    updateProfileUI();
    renderReviews();
    Toast.show(`С возвращением, ${user.name}! 🍯`, 'success');
    qs('#loginEmail').value = '';
    qs('#loginPassword').value = '';
  });

  
  on(qs('#registerBtn'), 'click', () => {
    const name     = qs('#regName').value.trim();
    const email    = qs('#regEmail').value.trim();
    const password = qs('#regPassword').value;

    if (!name || !email || !password) return Toast.show('Заполните все поля', 'error');
    if (!isValidEmail(email)) return Toast.show('Введите корректный email', 'error');
    if (password.length < 6) return Toast.show('Пароль — минимум 6 символов', 'error');

    Storage.set('user', { name, email, password });
    Storage.set('loggedUser', email);
    Modal.closeAll();
    updateProfileUI();
    renderReviews();
    Toast.show(`Добро пожаловать, ${name}! 🍯`, 'success');
    qs('#regName').value = '';
    qs('#regEmail').value = '';
    qs('#regPassword').value = '';
  });

  
  on(qs('#logoutBtn'), 'click', () => {
    Storage.del('loggedUser');
    Modal.closeAll();
    updateProfileUI();
    renderReviews();
    Toast.show('Вы вышли из аккаунта', 'info');
  });
}

function updateProfileUI() {
  const loggedEmail = Storage.get('loggedUser');
  const user        = Storage.get('user');
  const profileBtn  = qs('#profileBtn');

  const loggedIn  = qs('#profileLoggedIn');
  const notLogged = qs('#profileNotLogged');

  if (loggedEmail && user) {
    if (loggedIn)  loggedIn.style.display  = 'block';
    if (notLogged) notLogged.style.display = 'none';
    const profName  = qs('#profName');
    const profEmail = qs('#profEmail');
    if (profName)  profName.textContent  = user.name;
    if (profEmail) profEmail.textContent = user.email;
    if (profileBtn) {
      const textEl = qs('.profile-btn-text', profileBtn);
      if (textEl) textEl.textContent = user.name.split(' ')[0];
    }
  } else {
    if (loggedIn)  loggedIn.style.display  = 'none';
    if (notLogged) notLogged.style.display = 'block';
    if (profileBtn) {
      const textEl = qs('.profile-btn-text', profileBtn);
      if (textEl) textEl.textContent = 'Войти';
    }
  }
}


let selectedRating = 5;

const STAR_LABELS = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично!'];

function initStarRating() {
  const stars   = qsa('.star', qs('#starRating'));
  const label   = qs('#starLabel');
  const starWrap = qs('#starRating');

  function setRating(r) {
    selectedRating = r;
    stars.forEach((s, i) => {
      s.classList.toggle('active', i < r);
      s.setAttribute('aria-checked', i < r ? 'true' : 'false');
    });
    if (label) label.textContent = STAR_LABELS[r] || '';
  }

  function previewRating(r) {
    stars.forEach((s, i) => {
      s.classList.toggle('hover', i < r);
      s.classList.toggle('active', false);
    });
    
    stars.forEach((s, i) => {
      if (i < r) s.classList.add('active');
    });
    if (label) label.textContent = STAR_LABELS[r] || '';
  }

  stars.forEach((star, idx) => {
    on(star, 'click', () => setRating(idx + 1));
    on(star, 'mouseenter', () => previewRating(idx + 1));
    on(star, 'keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRating(idx + 1); }
      if (e.key === 'ArrowRight' && idx < 4) stars[idx + 1].focus();
      if (e.key === 'ArrowLeft'  && idx > 0) stars[idx - 1].focus();
    });
  });

  on(starWrap, 'mouseleave', () => setRating(selectedRating));

  
  setRating(5);
}


let pendingDeleteId = null;

function initReviews() {
  Modal.register('reviewModal');
  Modal.register('deleteModal');

  
  on(qs('#addReviewBtn'), 'click', () => {
    const logged = Storage.get('loggedUser');
    if (!logged) {
      Toast.show('Войдите, чтобы оставить отзыв', 'warning');
      updateProfileUI();
      Modal.open('profileModal');
      return;
    }
    selectedRating = 5;
    initStarRating(); 
    qs('#reviewText').value = '';
    qs('#charCount').textContent = '0 / 500';
    Modal.open('reviewModal');
  });

  
  on(qs('#reviewText'), 'input', () => {
    const len = qs('#reviewText').value.length;
    const counter = qs('#charCount');
    counter.textContent = `${len} / 500`;
    counter.style.color = len > 450 ? '#E57373' : 'var(--text-4)';
  });

  
  on(qs('#submitReview'), 'click', () => {
    const text = qs('#reviewText').value.trim();
    if (!text) return Toast.show('Напишите текст отзыва', 'error');
    if (text.length < 10) return Toast.show('Минимум 10 символов', 'error');
    if (text.length > 500) return Toast.show('Максимум 500 символов', 'error');

    const user = Storage.get('user');
    const review = {
      id: Date.now(),
      author: user.name,
      authorEmail: user.email,
      text,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      rating: selectedRating
    };

    const reviews = Storage.get('reviews') || [];
    reviews.unshift(review);
    Storage.set('reviews', reviews);

    Modal.closeAll();
    renderReviews();
    Toast.show('Спасибо за ваш отзыв! 🍯', 'success');
  });

  
  on(qs('#confirmDelete'), 'click', () => {
    if (pendingDeleteId === null) return;
    const reviews = (Storage.get('reviews') || []).filter(r => r.id !== pendingDeleteId);
    Storage.set('reviews', reviews);
    pendingDeleteId = null;
    Modal.closeAll();
    renderReviews();
    Toast.show('Отзыв удалён', 'info');
  });
  on(qs('#cancelDelete'), 'click', () => { pendingDeleteId = null; Modal.closeAll(); });

  
  renderReviews();
}

window.openDeleteModal = function(id) {
  pendingDeleteId = id;
  Modal.open('deleteModal');
};

function renderReviews() {
  const list        = qs('#reviewsList');
  const savedRevs   = Storage.get('reviews') || [];
  const loggedEmail = Storage.get('loggedUser');

  
  qsa('.dynamic-review', list).forEach(el => el.remove());

  
  [...savedRevs].forEach(rev => {
    const canDelete = loggedEmail && rev.authorEmail === loggedEmail;
    const card = buildReviewCard(rev, canDelete);

    const firstStatic = qs('.static-review', list);
    if (firstStatic) list.insertBefore(card, firstStatic);
    else list.appendChild(card);
  });
}

function buildReviewCard(rev, canDelete) {
  const card = document.createElement('div');
  card.className = 'review-card dynamic-review';

  const initials  = rev.author.charAt(0).toUpperCase();
  const colors    = ['#D4AF37','#8B6914','#A0522D','#C07C2C','#6B4E17'];
  const colorIdx  = rev.author.charCodeAt(0) % colors.length;
  const stars     = Array.from({ length: 5 }, (_, i) =>
    `<span class="star-display ${i < rev.rating ? 'filled' : ''}" aria-hidden="true">★</span>`
  ).join('');

  const deleteBtn = canDelete
    ? `<button class="btn-delete-review" onclick="openDeleteModal(${rev.id})" aria-label="Удалить отзыв">🗑 Удалить</button>`
    : '';

  card.innerHTML = `
    ${deleteBtn}
    <div class="review-header">
      <div class="review-avatar" style="--avatar-color:${colors[colorIdx]}">${initials}</div>
      <div class="review-meta">
        <h4>${escapeHtml(rev.author)}</h4>
        <p class="review-date">${rev.date}</p>
      </div>
    </div>
    <div class="review-rating" role="img" aria-label="Оценка: ${rev.rating} из 5">${stars}</div>
    <p class="review-text">${escapeHtml(rev.text)}</p>
  `;

  card.style.animation = 'fadeDown 0.5s ease both';
  return card;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}


function initRipple() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-primary, .btn-booking, .btn-add-review');
    if (!btn) return;

    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size / 2}px;
      top: ${e.clientY - rect.top - size / 2}px;
      transform: scale(0);
      pointer-events: none;
      animation: rippleAnim 0.55s ease-out;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}


function initParallax() {
  const heroContent = qs('.hero-content');
  if (!heroContent || window.innerWidth < 768) return;

  let frame;
  const limit = window.innerHeight;

  window.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const s = window.scrollY;
      if (s < limit) {
        const pct = s / limit;
        heroContent.style.transform = `translateY(${s * 0.3}px)`;
        heroContent.style.opacity   = `${1 - pct * 0.8}`;
      }
      frame = null;
    });
  }, { passive: true });
}


document.addEventListener('DOMContentLoaded', () => {
  
  ['productModal', 'bookingModal', 'profileModal', 'loginModal',
   'registerModal', 'reviewModal', 'deleteModal'].forEach(id => Modal.register(id));

  initNav();
  initParticles();
  initMenuTabs();
  initMenuCards();
  initBooking();
  initAuth();
  initStarRating();
  initReviews();
  initScrollReveal();
  initRipple();
  initParallax();
  updateProfileUI();

  
  if (!document.querySelector('#rippleStyle')) {
    const s = document.createElement('style');
    s.id = 'rippleStyle';
    s.textContent = `
      @keyframes rippleAnim {
        to { transform: scale(3.5); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }

  console.log('🍯 Медоварня готова!');
});