// ===============================
// uiTeams.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // Seções e Menu
  const sections = document.querySelectorAll("section");
  const menuLinks = document.querySelectorAll(".menu li a");

  // Seletores da Home
  const ctxVictories = document.getElementById("chartVictories").getContext("2d");
  const ctxDefeats = document.getElementById("chartDefeats").getContext("2d");
  const ctxGoals = document.getElementById("chartGoals").getContext("2d");

  // Seletores da aba Times
  const teamInfo = document.getElementById("time-info");
  const teamCardsContainer = document.getElementById("team-cards");
  const ctxTeamBalance = document.getElementById("chartTeamBalance").getContext("2d");

  // Seletores do formulário
  const formCadastrar = document.getElementById("form-cadastrar");

  // Estado dos gráficos
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

    teamInfo.innerHTML = `
      <h2>${team.name}</h2>
      <p><b>Fundação:</b> ${team.foundation}</p>
      <p><b>Apelido:</b> ${team.nickname}</p>
      <p><b>Maior ídolo:</b> ${team.bestPlayer}</p>
      <p><b>Saldo de gols:</b> ${saldo}</p>
    `;
  };

  // ===============================
  // Renderização dos cards de times
  // ===============================
  const renderTeamCards = () => {
    const times = loadData();
    teamCardsContainer.innerHTML = "";

    times.forEach(team => {
      const card = document.createElement("div");
      card.classList.add("team-card");

      card.innerHTML = `
      <img src="${team.badge || 'https://via.placeholder.com/100'}" alt="${team.name}" class="team-logo">
      <h3>${team.name}</h3>
      <p>${team.nickname}</p>
      <div class="team-actions">
      <button class="btn update">Atualizar</button>
      <button class="btn delete">Deletar</button>
      </div>
        `;
      // Atualizar botão
      card.querySelector(".update").addEventListener("click", () => {
        const newName = prompt("Novo nome do time:", team.name);
        if (!newName) return;
        const updatedTeam = { ...team, name: newName };
        const updatedTimes = soccer.updateTimes(times, team.id, updatedTeam);
        soccer.saveTimes(updatedTimes);
        renderTeamCards();
        renderHomeCharts();
      });

      // Deletar botão
      card.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Deseja deletar o time ${team.name}?`)) return;
        const updatedTimes = soccer.deleteTime(times, team.id);
        soccer.saveTimes(updatedTimes);
        renderTeamCards();
        renderHomeCharts();
        teamInfo.innerHTML = "<p>Selecione um time para ver estatísticas</p>";
        if (chartTeamBalance) chartTeamBalance.destroy();
      });

      // Clicar no card exibe estatísticas
      card.addEventListener("click", () => renderTeamChart(team.id));

      teamCardsContainer.appendChild(card);
    });
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
      badge: document.getElementById("timeBadge").value || null,
      dataTime: { games:0, victories:0, defeats:0, goalsScored:0, goalsConceded:0 }
    };

    const updated = soccer.addTimes(times, newTime);
    soccer.saveTimes(updated);

    alert("✅ Time cadastrado com sucesso!");
    formCadastrar.reset();
    renderTeamCards();
    renderHomeCharts();
  });

  // ===============================
  // Navegação do Menu
  // ===============================
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section");

      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      if (sectionId === "home") renderHomeCharts();
      if (sectionId === "times") {
        renderTeamCards();
        teamInfo.innerHTML = "<p>Selecione um time para ver estatísticas</p>";
        if (chartTeamBalance) chartTeamBalance.destroy();
      }
    });
  });

  // ===============================
  // Inicialização
  // ===============================
  renderHomeCharts();
  renderTeamCards();
});
