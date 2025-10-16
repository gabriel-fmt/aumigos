document.addEventListener("DOMContentLoaded", () => {
  // ===== MENU RESPONSIVO =====
  const navToggle = document.querySelector(".nav-toggle");
  const primaryMenu = document.querySelector(".primary-menu");

  if (navToggle && primaryMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      primaryMenu.classList.toggle("open", !expanded);
    });
  }

  // ===== MÁSCARAS =====
  const mask = {
    cpf: v => v.replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
    telefone: v => v.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2"),
    cep: v => v.replace(/\D/g, "")
      .replace(/(\d{5})(\d{3})$/, "$1-$2")
  };

  // ===== FUNÇÃO DE CONFIGURAÇÃO DE FORMULÁRIO =====
  function setupForm(formId, storageKey) {
    const form = document.getElementById(formId);
    const msg = form?.querySelector(".form-message");

    if (!form || !msg) return;

    // Máscaras
    form.querySelectorAll("input").forEach(input => {
      const id = input.id;
      if (mask[id]) {
        input.addEventListener("input", e => {
          e.target.value = mask[id](e.target.value);
        });
      }
    });

    // ViaCEP para formulário de cadastro
    if (formId === "cadastroForm") {
      const cep = document.getElementById("cep");
      if (cep) {
        cep.addEventListener("blur", async e => {
          const valor = e.target.value.replace(/\D/g, "");
          if (valor.length === 8) {
            try {
              const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
              const data = await res.json();
              if (!data.erro) {
                document.getElementById("endereco")?.setAttribute("value", `${data.logradouro || ""} ${data.bairro || ""}`.trim());
                document.getElementById("cidade")?.setAttribute("value", data.localidade || "");
                document.getElementById("estado")?.setAttribute("value", data.uf || "");
              }
            } catch {
              console.warn("Falha ao buscar CEP");
            }
          }
        });
      }

      // Limitar data de nascimento
      const nascimento = document.getElementById("nascimento");
      if (nascimento) {
        const hoje = new Date();
        hoje.setFullYear(hoje.getFullYear() - 18);
        nascimento.max = hoje.toISOString().split("T")[0];
      }
    }

    // Submit
    form.addEventListener("submit", e => {
      e.preventDefault();
      msg.classList.remove("success", "error");

      if (form.checkValidity()) {
        const data = Object.fromEntries(new FormData(form).entries());
        const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
        stored.push({ ...data, createdAt: new Date().toISOString() });
        localStorage.setItem(storageKey, JSON.stringify(stored));

        msg.textContent = storageKey === "cadastro" 
          ? "Cadastro realizado com sucesso!"
          : "Mensagem enviada com sucesso!";
        msg.classList.add("success");
        msg.setAttribute("role", "status");
        form.reset();
      } else {
        msg.textContent = "Por favor, preencha todos os campos obrigatórios corretamente.";
        msg.classList.add("error");
        msg.setAttribute("role", "alert");
      }
    });
  }

  // Configura ambos os formulários
  setupForm("cadastroForm", "cadastro");
  setupForm("contatoForm", "aumigos_contatos");

  // ===== GRÁFICOS =====
  if (typeof Chart !== "undefined") {
    const gastos = document.getElementById("graficoGastos");
    if (gastos) {
      new Chart(gastos.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: ["Atendimento Veterinário", "Alimentação", "Resgates", "Infraestrutura", "Campanhas"],
          datasets: [{
            data: [35, 25, 15, 15, 10],
            backgroundColor: ["#4CAF50", "#FFC107", "#03A9F4", "#E91E63", "#9C27B0"]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Distribuição dos Gastos (%)" }
          }
        }
      });
    }

    const doacoes = document.getElementById("graficoDoacoes");
    if (doacoes) {
      new Chart(doacoes.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio"],
          datasets: [{
            label: "Doações (R$)",
            data: [350, 420, 380, 450, 500],
            backgroundColor: "rgba(242,183,5,0.7)"
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            title: { display: true, text: "Transparência das Doações" }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }
});
