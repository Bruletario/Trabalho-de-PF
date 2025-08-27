// ===============================
// ui.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // Seções
  const sections = document.querySelectorAll("section");
  const menuLinks = document.querySelectorAll(".menu li a");

  // Seletores da Home
  const ctxVictories = document.getElementById("chartVictories").getContext("2d");
  const ctxDefeats = document.getElementById("chartDefeats").getContext("2d");
  const ctxGoals = document.getElementById("chartGoals").getContext("2d");

  // Seletores da aba Times
  const timeInfo = document.getElementById("time-info");
  const ctxTeamBalance = document.getElementById("chartTeamBalance").getContext("2d");

  // Seletores do formulário
  const formCadastrar = document.getElementById("form-cadastrar");

  // Estado dos gráficos (para evitar duplicar)
  let chartVictories, chartDefeats, chartGoals, chartTeamBalance;

  // ===============================
  // Helpers
  // ===============================
  const loadData = () => {
    let times = soccer.loadTimes();
    if (times.length === 0) {
      soccer.resetTimes();
      times = soccer.loadTimes();
    }
    return times;
  };

  const clearCharts = () => {
    if (chartVictories) chartVictories.destroy();
    if (chartDefeats) chartDefeats.destroy();
    if (chartGoals) chartGoals.destroy();
    if (chartTeamBalance) chartTeamBalance.destroy();
  };

  // ===============================
  // Renderização da Home
  // ===============================
  const renderHomeCharts = () => {
    const times = loadData();
    const labels = times.map(t => t.name);

    clearCharts();

    chartVictories = new Chart(ctxVictories, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Vitórias",
          data: times.map(t => t.dataTime.victories),
          backgroundColor: "rgba(75, 192, 192, 0.6)"
        }]
      }
    });

    chartDefeats = new Chart(ctxDefeats, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Derrotas",
          data: times.map(t => t.dataTime.defeats),
          backgroundColor: "rgba(255, 99, 132, 0.6)"
        }]
      }
    });

    chartGoals = new Chart(ctxGoals, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "Gols Marcados",
          data: times.map(t => t.dataTime.goalsScored),
          backgroundColor: "rgba(54, 162, 235, 0.6)"
        }]
      }
    });
  };

  // ===============================
  // Renderização de um time específico
  // ===============================
  const renderTeamChart = (teamId) => {
    const times = loadData();
    const team = times.find(t => t.id === teamId);
    if (!team) return;

    const saldo = team.dataTime.goalsScored - team.dataTime.goalsConceded;

    if (chartTeamBalance) chartTeamBalance.destroy();

    chartTeamBalance = new Chart(ctxTeamBalance, {
      type: "doughnut",
      data: {
        labels: ["Saldo de Gols"],
        datasets: [{
          label: team.name,
          data: [saldo],
          backgroundColor: saldo >= 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
        }]
      }
    });

    timeInfo.innerHTML = `
      <h2>${team.name}</h2>
      <p><b>Fundação:</b> ${team.foundation}</p>
      <p><b>Apelido:</b> ${team.nickname}</p>
      <p><b>Maior ídolo:</b> ${team.bestPlayer}</p>
      <p><b>Saldo de gols:</b> ${saldo}</p>
    `;
  };

  // ===============================
  // Lista de times na aba "Times"
  // ===============================
  const renderTimesList = () => {
    const times = loadData();
    const listDiv = document.createElement("div");

    times.forEach(t => {
      const btn = document.createElement("button");
      btn.textContent = t.name;
      btn.classList.add("button");
      btn.style.margin = "5px";
      btn.addEventListener("click", () => renderTeamChart(t.id));
      listDiv.appendChild(btn);
    });

    // Substitui a lista anterior
    const oldList = document.getElementById("times-list");
    if (oldList) oldList.remove();

    listDiv.id = "times-list";
    timeInfo.insertAdjacentElement("beforebegin", listDiv);
  };

  // ===============================
  // Cadastro de Time
  // ===============================
  formCadastrar.addEventListener("submit", (e) => {
    e.preventDefault();

    const times = loadData();

    const newTime = {
      name: document.getElementById("timeName").value,
      foundation: parseInt(document.getElementById("timeFoundation").value),
      nickname: document.getElementById("timeNickname").value,
      bestPlayer: document.getElementById("timeBestPlayer").value,
      color: document.getElementById("timeColor").value,
      badge: null,
      dataTime: {
        games: 0,
        victories: 0,
        defeats: 0,
        goalsScored: 0,
        goalsConceded: 0
      }
    };

    const updated = soccer.addTimes(times, newTime);
    soccer.saveTimes(updated);

    alert("✅ Time cadastrado com sucesso!");

    formCadastrar.reset();
    renderHomeCharts();
    renderTimesList();
  });

  // ===============================
  // Navegação do Menu
  // ===============================
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section");

      // alterna active no menu
      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // alterna active nas sections
      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      // renderizações específicas
      if (sectionId === "home") renderHomeCharts();
      if (sectionId === "times") {
        renderTimesList();
        timeInfo.innerHTML = "<p>Selecione um time para ver estatísticas</p>";
        if (chartTeamBalance) chartTeamBalance.destroy();
      }
    });
  });

  // ===============================
  // Inicialização
  // ===============================
  renderHomeCharts();
});
