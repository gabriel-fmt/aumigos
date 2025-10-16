document.addEventListener('DOMContentLoaded', () => {
  // Menu responsivo
  const navToggle = document.getElementById('nav-toggle');
  const primaryMenu = document.getElementById('primary-menu');

  if (navToggle && primaryMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      primaryMenu.style.display = expanded ? 'none' : 'block';
      primaryMenu.querySelectorAll('a').forEach(a => (a.tabIndex = expanded ? -1 : 0));
    });
  }

  // Rolagem suave para âncoras internas
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
        }
      }
    });
  });

  // Máscaras de formulário
  const maskCPF = v =>
    v
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

  const maskTel = v => {
    v = v.replace(/\D/g, '').slice(0, 11);
    return v.length <= 10
      ? v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
      : v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const maskCEP = v =>
    v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');

  const cpf = document.getElementById('cpf');
  const tel = document.getElementById('telefone');
  const cep = document.getElementById('cep');

  if (cpf) cpf.addEventListener('input', e => (e.target.value = maskCPF(e.target.value)));
  if (tel) tel.addEventListener('input', e => (e.target.value = maskTel(e.target.value)));
  if (cep) cep.addEventListener('input', e => (e.target.value = maskCEP(e.target.value)));

  // Busca de endereço via API ViaCEP
  if (cep) {
    cep.addEventListener('blur', async e => {
      const valor = e.target.value.replace(/\D/g, '');
      if (valor.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
          const data = await res.json();
          if (!data.erro) {
            document.getElementById('endereco')?.value('value', `${data.logradouro || ''} ${data.bairro || ''}`.trim());
            document.getElementById('cidade')?.value('value', data.localidade || '');
            document.getElementById('estado')?.value('value', data.uf || '');
          }
        } catch (err) {
          console.warn('Erro ao consultar CEP:', err);
        }
      }
    });
  }

  // Validação e envio de formulário
  const form = document.getElementById('cadastroForm');
  const msg = document.getElementById('form-message');

  if (form) {
    form.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => {
        if (el.checkValidity()) {
          el.classList.remove('invalid');
          el.removeAttribute('aria-invalid');
        } else {
          el.classList.add('invalid');
          el.setAttribute('aria-invalid', 'true');
        }
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        msg.textContent = 'Existem campos inválidos. Verifique e tente novamente.';
        msg.style.color = '#d9534f';
        form.querySelector(':invalid')?.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const key = 'aumigos_cadastros_v1';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      saved.push({ ...data, createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(saved));

      msg.textContent = 'Inscrição enviada com sucesso! Obrigado por se voluntariar.';
      msg.style.color = '#2a7f2a';
      form.reset();
    });
  }

  // Gráficos (se Chart.js estiver disponível)
  if (typeof Chart !== 'undefined') {
    const gastos = document.getElementById('graficoGastos');
    const doacoes = document.getElementById('graficoDoacoes');

    if (gastos) {
      new Chart(gastos, {
        type: 'doughnut',
        data: {
          labels: ['Atendimento Veterinário', 'Alimentação', 'Resgates', 'Infraestrutura', 'Campanhas'],
          datasets: [{
            data: [35, 25, 15, 15, 10],
            backgroundColor: ['#4CAF50', '#FFC107', '#03A9F4', '#E91E63', '#9C27B0']
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: 'Distribuição dos Gastos (%)' },
            legend: { position: 'bottom' }
          }
        }
      });
    }

    if (doacoes) {
      new Chart(doacoes, {
        type: 'bar',
        data: {
          labels: ['Dinheiro (R$)', 'Rações (kg)', 'Brinquedos', 'Shampoo (unid.)'],
          datasets: [{
            label: 'Doações 2025',
            data: [12800, 450, 320, 180],
            backgroundColor: ['#4CAF50', '#FFC107', '#03A9F4', '#E91E63']
          }]
        },
        options: {
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Quantidade / Valor (R$)' } }
          },
          plugins: {
            title: { display: true, text: 'Recursos e Itens Recebidos - 2025' },
            legend: { display: false }
          }
        }
      });
    }
  }
});

