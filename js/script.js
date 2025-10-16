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

  // ===== FORMULÁRIO =====
  const form = document.getElementById("cadastroForm");
  const msg = document.getElementById("form-message");

  if (form) {
    // Data máxima dinâmica (18 anos)
    const nascimento = document.getElementById("nascimento");
    if (nascimento) {
      const hoje = new Date();
      hoje.setFullYear(hoje.getFullYear() - 18);
      nascimento.max = hoje.toISOString().split("T")[0];
    }

    // Máscaras simples
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

    form.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", e => {
        const { id, value } = e.target;
        if (mask[id]) e.target.value = mask[id](value);
      });
    });

    // ViaCEP automático
    const cep = document.getElementById("cep");
    if (cep) {
      cep.addEventListener("blur", async e => {
        const valor = e.target.value.replace(/\D/g, "");
        if (valor.length === 8) {
          try {
            const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
            const data = await res.json();
            if (!data.erro) {
              const enderecoEl = document.getElementById("endereco");
              const cidadeEl = document.getElementById("cidade");
              const estadoEl = document.getElementById("estado");
              if (enderecoEl) enderecoEl.value = `${data.logradouro || ""} ${data.bairro || ""}`.trim();
              if (cidadeEl) cidadeEl.value = data.localidade || "";
              if (estadoEl) estadoEl.value = data.uf || "";
            }
          } catch {
            console.warn("Falha ao buscar CEP");
          }
        }
      });
    }

    // Validação e feedback
    form.addEventListener("submit", e => {
      e.preventDefault();
      msg.classList.remove("success", "error");

      if (form.checkValidity()) {
        const formData = new FormData(form);
        const dados = Object.fromEntries(formData.entries());
        localStorage.setItem("cadastro", JSON.stringify(dados));

        msg.textContent = "Cadastro realizado com sucesso!";
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

  // ===== GRÁFICOS =====
  if (typeof Chart !== "undefined") {
    // Gráfico de pizza (Doughnut)
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

    // Gráfico de barras
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
