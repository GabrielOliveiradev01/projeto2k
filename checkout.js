const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
});

function closeMenu() {
  nav?.classList.remove('open');
  menuToggle?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  menuToggle?.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('menu-open');
}

menuToggle?.addEventListener('click', () => {
  if (nav?.classList.contains('open')) {
    closeMenu();
  } else {
    nav?.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu');
    document.body.classList.add('menu-open');
  }
});

document.querySelectorAll('.nav-links a, .nav-cta').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) closeMenu();
});

const CHECKOUT_PLANS = {
  'cuts-limited': {
    name: 'Cuts Limited',
    price: 'R$ 89,90',
    value: 89.9,
    badge: 'Limited',
    type: 'limited',
    desc: 'Cortes de cabelo com limite mensal',
    features: ['Cortes de cabelo', 'Quantidade limitada/mês', 'Agendamento online'],
  },
  'barb-limited': {
    name: 'Barb Limited',
    price: 'R$ 119,90',
    value: 119.9,
    badge: 'Limited',
    type: 'limited',
    desc: 'Barba com limite mensal',
    features: ['Design de barba', 'Quantidade limitada/mês', 'Produtos premium'],
  },
  'duos-limited': {
    name: 'Duos Limited',
    price: 'R$ 179,90',
    value: 179.9,
    badge: 'Limited',
    type: 'limited',
    desc: 'Corte + barba com limite mensal',
    features: ['Corte + barba', 'Quantidade limitada/mês', 'Melhor custo-benefício'],
  },
  'cuts-infinite': {
    name: 'Cuts Infinite',
    price: 'R$ 99,90',
    value: 99.9,
    badge: 'Infinite',
    type: 'infinite',
    desc: 'Cortes ilimitados durante o mês',
    features: ['Cortes ilimitados', 'Sem restrição de visitas', 'Prioridade no agendamento'],
  },
  'barb-infinite': {
    name: 'Barb Infinite',
    price: 'R$ 129,90',
    value: 129.9,
    badge: 'Infinite',
    type: 'infinite',
    desc: 'Barba ilimitada durante o mês',
    features: ['Barba ilimitada', 'Sem restrição de visitas', 'Tratamentos inclusos'],
  },
  'duos-infinite': {
    name: 'Duos Infinite',
    price: 'R$ 199,90',
    value: 199.9,
    badge: 'Infinite',
    type: 'infinite',
    desc: 'Corte + barba ilimitados',
    features: ['Corte + barba ilimitados', 'Experiência VIP completa', 'Acesso total aos serviços'],
  },
};

const checkoutForm = document.getElementById('checkout-form');
const checkoutPlanSelect = document.getElementById('checkout-plan');
const summaryBadge = document.getElementById('summary-badge');
const summaryPlan = document.getElementById('summary-plan');
const summaryDesc = document.getElementById('summary-desc');
const summaryFeatures = document.getElementById('summary-features');
const summaryPrice = document.getElementById('summary-price');
const checkoutError = document.getElementById('checkout-error');
const nameInput = document.getElementById('checkout-name');
const emailInput = document.getElementById('checkout-email');
const cardNameInput = document.getElementById('checkout-card-name');
const cardNumberInput = document.getElementById('checkout-card-number');
const cardExpiryInput = document.getElementById('checkout-card-expiry');
const cardCvvInput = document.getElementById('checkout-card-cvv');
const cpfInput = document.getElementById('checkout-cpf');
const phoneInput = document.getElementById('checkout-phone');
const checkoutSubmitBtn = document.getElementById('checkout-submit');

function getPlanFromUrl() {
  return new URLSearchParams(window.location.search).get('plan');
}

function showCheckoutError(message) {
  if (!checkoutError) return;
  checkoutError.textContent = message;
  checkoutError.hidden = !message;
}

function setCheckoutLoading(isLoading) {
  if (!checkoutSubmitBtn) return;
  checkoutSubmitBtn.disabled = isLoading;
  checkoutSubmitBtn.textContent = isLoading ? 'Processando...' : 'Assinar com cartão';
}

function updateCheckoutSummary(planId) {
  const plan = CHECKOUT_PLANS[planId];
  if (!plan || !checkoutPlanSelect) return;

  checkoutPlanSelect.value = planId;
  summaryBadge.textContent = plan.badge;
  summaryBadge.className = `checkout-plan-badge ${plan.type}`;
  summaryPlan.textContent = plan.name;
  summaryDesc.textContent = plan.desc;
  summaryPrice.textContent = plan.price;
  summaryFeatures.innerHTML = plan.features.map((feature) => `<li>${feature}</li>`).join('');
}

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function luhnCheck(number) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function validateCheckoutForm() {
  const cardDigits = cardNumberInput?.value.replace(/\D/g, '') || '';
  const expiry = cardExpiryInput?.value || '';
  const cvv = cardCvvInput?.value.replace(/\D/g, '') || '';
  const [month, year] = expiry.split('/');

  if (cardDigits.length < 13 || !luhnCheck(cardDigits)) {
    alert('Informe um número de cartão válido.');
    cardNumberInput?.focus();
    return false;
  }

  if (!month || !year || Number(month) < 1 || Number(month) > 12) {
    alert('Informe uma validade válida (MM/AA).');
    cardExpiryInput?.focus();
    return false;
  }

  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const expYear = Number(year);
  const expMonth = Number(month);

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    alert('O cartão informado está vencido.');
    cardExpiryInput?.focus();
    return false;
  }

  if (cvv.length < 3) {
    alert('Informe o CVV do cartão.');
    cardCvvInput?.focus();
    return false;
  }

  return true;
}

async function submitCheckout() {
  if (window.location.protocol === 'file:') {
    throw new Error(
      'O checkout não funciona abrindo o arquivo direto. Use "npm run dev" na pasta do projeto ou acesse o site publicado no Netlify.'
    );
  }

  const [month, yearShort] = cardExpiryInput.value.split('/');

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    cpf: cpfInput.value,
    phone: phoneInput.value,
    planId: checkoutPlanSelect.value,
    cardHolderName: cardNameInput.value.trim(),
    cardNumber: cardNumberInput.value,
    expiryMonth: month,
    expiryYear: yearShort ? `20${yearShort}` : '',
    cvv: cardCvvInput.value,
  };

  let response;

  try {
    response = await fetch('/.netlify/functions/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor de pagamento. Para testar localmente, rode "npm run dev" na pasta do projeto.'
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível concluir a assinatura.');
  }

  const planName = encodeURIComponent(data.plan || CHECKOUT_PLANS[payload.planId]?.name || '');
  window.location.href = `/obrigado.html?assinatura=1&plano=${planName}`;
}

function initCheckout() {
  if (!checkoutForm || !checkoutPlanSelect) return;

  const initialPlan = getPlanFromUrl();
  if (initialPlan && CHECKOUT_PLANS[initialPlan]) {
    updateCheckoutSummary(initialPlan);
  } else {
    updateCheckoutSummary(checkoutPlanSelect.value);
  }

  checkoutPlanSelect.addEventListener('change', () => {
    const planId = checkoutPlanSelect.value;
    updateCheckoutSummary(planId);
    const url = new URL(window.location.href);
    url.searchParams.set('plan', planId);
    history.replaceState(null, '', url);
  });

  cardNumberInput?.addEventListener('input', () => {
    cardNumberInput.value = formatCardNumber(cardNumberInput.value);
  });

  cardExpiryInput?.addEventListener('input', () => {
    cardExpiryInput.value = formatExpiry(cardExpiryInput.value);
  });

  cardCvvInput?.addEventListener('input', () => {
    cardCvvInput.value = cardCvvInput.value.replace(/\D/g, '').slice(0, 4);
  });

  cpfInput?.addEventListener('input', () => {
    cpfInput.value = formatCpf(cpfInput.value);
  });

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    showCheckoutError('');

    if (!validateCheckoutForm()) return;

    setCheckoutLoading(true);

    try {
      await submitCheckout();
    } catch (error) {
      showCheckoutError(error.message || 'Erro ao processar assinatura.');
      setCheckoutLoading(false);
    }
  });
}

initCheckout();
