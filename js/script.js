/* script.js
   - Toggle menu responsivo
   - Máscaras: CPF, telefone, CEP
   - Auto-fill CEP via ViaCEP
   - Validação em tempo real e submissão com localStorage (simulação)
   - Destaque de seção no menu por scroll
*/

document.addEventListener('DOMContentLoaded', () => {
  // NAV TOGGLE (mobile)
  const navToggle = document.getElementById('nav-toggle') || document.querySelector('.nav-toggle');
  const primaryMenu = document.getElementById('primary-menu') || document.querySelector('.primary-menu');
  if (navToggle && primaryMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      primaryMenu.style.display = expanded ? 'none' : 'block';
      primaryMenu.querySelectorAll('a').forEach(a => a.tabIndex = expanded ? -1 : 0);
    });
  }

  // Smooth scroll for internal anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.setAttribute('tabindex', '-1');
          target.focus({preventScroll: true});
          window.scrollTo({top: target.offsetTop - 60, behavior: 'smooth'});
        }
      }
    });
  });

  // Highlight menu item on scroll (sections with id)
  const sections = document.querySelectorAll('main section[id]');
  const menuLinks = document.querySelectorAll('.primary-menu a');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = document.querySelector(`.primary-menu a[href$="#${id}"]`);
      if (link) {
        if (scrollPos >= top && scrollPos < bottom) {
          link.classList.add('ativo');
        } else {
          link.classList.remove('ativo');
        }
      }
    });
  });

  /* ---------- Input masks ---------- */
  function maskCPF(value){
    return value.replace(/\D/g,'').slice(0,11)
      .replace(/(\d{3})(\d)/,'$1.$2')
      .replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3-$4');
  }

  function maskTel(value){
    const v = value.replace(/\D/g,'').slice(0,11);
    if (v.length <= 10) {
      return v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3').replace(/-$/,'');
    } else {
      return v.replace(/(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
    }
  }

  function maskCEP(value){
    return value.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');
  }

  const cpfInput = document.getElementById('cpf');
  if (cpfInput) cpfInput.addEventListener('input', e => e.target.value = maskCPF(e.target.value));

  const telInput = document.getElementById('telefone');
  if (telInput) telInput.addEventListener('input', e => e.target.value = maskTel(e.target.value));

  const cepInput = document.getElementById('cep');
  if (cepInput) cepInput.addEventListener('input', e => e.target.value = maskCEP(e.target.value));

  /* ---------- ViaCEP auto-fill ---------- */
  if (cepInput) {
    cepInput.addEventListener('blur', async (e) => {
      const cepVal = e.target.value.replace(/\D/g,'');
      if (cepVal.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
          if (!res.ok) throw new Error('Erro na busca do CEP');
          const data = await res.json();
          if (!data.erro) {
            const endereco = document.getElementById('endereco');
            const cidade = document.getElementById('cidade');
            const estado = document.getElementById('estado');
            if (endereco) endereco.value = `${data.logradouro} ${data.bairro || ''}`.trim();
            if (cidade) cidade.value = data.localidade || '';
            if (estado) estado.value = data.uf || '';
          }
        } catch (err) {
          // falha silenciosa (não bloqueia o formulário)
          console.warn('ViaCEP:', err);
        }
      }
    });
  }

  /* ---------- Form validation & localStorage (simulação) ---------- */
  const form = document.getElementById('cadastroForm');
  const msg = document.getElementById('form-message');

  if (form) {
    // Real-time validation feedback
    form.querySelectorAll('input,textarea,select').forEach(el => {
      el.addEventListener('input', () => {
        if (el.checkValidity()) {
          el.classList.remove('invalid');
          el.removeAttribute('aria-invalid');
        } else {
          el.classList.add('invalid');
          el.setAttribute('aria-invalid','true');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        if (msg) {
          msg.textContent = 'Existem campos inválidos. Verifique e tente novamente.';
          msg.style.color = '#d9534f';
        }
        return;
      }

      // Build object with form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Simulate server: store in localStorage (array)
      const key = 'aumigos_cadastros_v1';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({
        ...data,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(key, JSON.stringify(existing));

      // Success message
      if (msg) {
        msg.textContent = 'Inscrição enviada com sucesso! Obrigado por se voluntariar.';
        msg.style.color = '#2a7f2a';
      }

      form.reset();
    });
  }

  // Accessibility: ensure menu links are tabbable when menu is visible on small screens
  // (handled in nav toggle)

});
// ==============================
// GRÁFICOS - TRANSPARÊNCIA
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    const graficoGastos = document.getElementById("graficoGastos");
    const graficoDoacoes = document.getElementById("graficoDoacoes");

    // ===== Gráfico de Distribuição dos Gastos =====
    if (graficoGastos) {
        new Chart(graficoGastos, {
            type: 'doughnut',
            data: {
                labels: [
                    'Atendimento Veterinário',
                    'Alimentação',
                    'Resgates',
                    'Infraestrutura',
                    'Campanhas de Adoção'
                ],
                datasets: [{
                    data: [35, 25, 15, 15, 10],
                    backgroundColor: [
                        '#4CAF50',
                        '#FFC107',
                        '#03A9F4',
                        '#E91E63',
                        '#9C27B0'
                    ],
                    hoverOffset: 8
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição dos Gastos (em %)',
                        font: { size: 18, weight: 'bold' }
                    },
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // ===== Gráfico de Recursos e Itens Recebidos =====
    if (graficoDoacoes) {
        new Chart(graficoDoacoes, {
            type: 'bar',
            data: {
                labels: ['Dinheiro (R$)', 'Rações (kg)', 'Brinquedos', 'Shampoo (unid.)'],
                datasets: [
                    {
                        label: 'Doações Recebidas em 2025',
                        data: [12800, 450, 320, 180],
                        backgroundColor: [
                            '#4CAF50',
                            '#FFC107',
                            '#03A9F4',
                            '#E91E63'
                        ],
                        borderColor: '#222',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantidade / Valor (R$)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Recursos Arrecadados e Itens Recebidos - 2025',
                        font: { size: 18, weight: 'bold' }
                    },
                    legend: { display: false }
                }
            }
        });
    }
});
