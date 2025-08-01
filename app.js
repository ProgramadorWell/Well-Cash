const API_URL = "http://localhost:3000/transacoes"; // Ajuste se backend estiver em outro lugar

let transacoes = [];
let grafico;

const form = document.getElementById("form-transacao");
const tbody = document.getElementById("tbody-transacoes");
const saldoEl = document.getElementById("saldo");
const ctx = document.getElementById("grafico").getContext("2d");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Preencha os campos corretamente!");
    return;
  }

  const novaTransacao = {
    descricao,
    valor,
    tipo,
    data: new Date()
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novaTransacao)
    });
    if (!res.ok) throw new Error("Erro ao adicionar transação");
    await carregarTransacoes();
    form.reset();
  } catch (error) {
    alert("Erro: " + error.message);
  }
});

async function carregarTransacoes() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Erro ao carregar transações");
    transacoes = await res.json();
    mostrarTransacoes();
    atualizarSaldo();
    atualizarGrafico();
  } catch (error) {
    alert("Erro: " + error.message);
  }
}

function mostrarTransacoes() {
  tbody.innerHTML = "";
  transacoes.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.descricao}</td>
      <td class="${t.tipo === "Receita" ? "receita" : "despesa"}">R$ ${t.valor.toFixed(2)}</td>
      <td>${t.tipo}</td>
      <td>${new Date(t.data).toLocaleDateString("pt-BR")}</td>
      <td>
        <button onclick="excluirTransacao('${t._id}')" class="btn-del">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function atualizarSaldo() {
  const saldo = transacoes.reduce((acc, t) => t.tipo === "Receita" ? acc + t.valor : acc - t.valor, 0);
  saldoEl.textContent = `Saldo Atual: R$ ${saldo.toFixed(2)}`;
}

function atualizarGrafico() {
  const receitas = transacoes.filter(t => t.tipo === "Receita").reduce((acc, t) => acc + t.valor, 0);
  const despesas = transacoes.filter(t => t.tipo === "Despesa").reduce((acc, t) => acc + t.valor, 0);

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [receitas, despesas],
        backgroundColor: ["green", "red"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Distribuição Financeira" }
      }
    }
  });
}

async function excluirTransacao(id) {
  if (!confirm("Deseja realmente excluir esta transação?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar transação");
    await carregarTransacoes();
  } catch (error) {
    alert("Erro: " + error.message);
  }
}

// Carregar transações ao iniciar app
carregarTransacoes();
