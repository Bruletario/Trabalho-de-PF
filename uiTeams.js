// ===============================
// uiTeams.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    // Seções e Menu
    const sections = document.querySelectorAll("section");
    const menuLinks = document.querySelectorAll(".menu li a");

    // Seletores da Home
    const ctxHome = document.getElementById("homeChart").getContext("2d");
    const selectCriterio = document.getElementById("select-criterio");
    const selectOrdem = document.getElementById("select-ordem");

    // Seletores da aba Times
    const teamCardsContainer = document.getElementById("team-cards");
    const teamDetailsContainer = document.getElementById("team-details-container");
    const teamDetailsText = document.getElementById("team-details-text");
    const ctxResults = document.getElementById("chartTeamResults").getContext("2d");
    const ctxGoals = document.getElementById("chartTeamGoals").getContext("2d");

    // Seletores do formulário
    const formCadastrar = document.getElementById("form-cadastrar");

    // Estado dos gráficos
    let homeChart;
    let chartTeamResults, chartTeamGoals;

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

    // ===============================
    // Renderização da Home
    // ===============================
    const updateHomeChart = () => {
        const criterio = selectCriterio.value;
        const ordem = selectOrdem.value;

        let times = loadData();

        times.sort((a, b) => {
            let valueA, valueB;

            if (criterio === "goalDifference") {
                valueA = a.dataTime.goalsScored - a.dataTime.goalsConceded;
                valueB = b.dataTime.goalsScored - b.dataTime.goalsConceded;
            } else {
                valueA = a.dataTime[criterio];
                valueB = b.dataTime[criterio];
            }

            if (ordem === 'desc') {
                return valueB - valueA;
            } else {
                return valueA - valueB;
            }
        });

        const labels = times.map(t => t.name);
        const data = times.map(t => {
            if (criterio === "goalDifference") {
                return t.dataTime.goalsScored - t.dataTime.goalsConceded;
            }
            return t.dataTime[criterio];
        });
        
        const chartLabel = selectCriterio.options[selectCriterio.selectedIndex].text;

        if (homeChart) {
            homeChart.destroy();
        }

        homeChart = new Chart(ctxHome, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: chartLabel,
                    data: data,
                    backgroundColor: "rgba(75, 192, 192, 0.95)",
                }]
            },
            options: {
                indexAxis: 'y', 
                plugins: {
                    legend: {
                        labels: {
                            color: "white", 
                            font: {
                                size: 15,
                                weight: "bold"
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" } }
                }
            }
        });
    };

    // ===============================
    // Renderização dos detalhes de um time
    // ===============================
    const renderTeamDetails = (teamId) => {
        const times = loadData();
        const team = times.find(t => t.id === teamId);
        if (!team) return;

        if (chartTeamResults) chartTeamResults.destroy();
        if (chartTeamGoals) chartTeamGoals.destroy();

        teamDetailsContainer.style.display = 'flex';

        teamDetailsText.innerHTML = `
            <h2>${team.name}</h2>
            <p><b>Ano de Fundação:</b> ${team.foundation}</p>
            <p><b>Apelido:</b> ${team.nickname}</p>
            <p><b>Maior Ídolo:</b> ${team.bestPlayer}</p>
            <p><b>Cores:</b> ${team.color}</p>
            <hr style="margin: 10px 0; opacity: .3;">
            <p><b>Total de Jogos:</b> ${team.dataTime.games}</p>
            <p><b>Vitórias:</b> ${team.dataTime.victories}</p>
            <p><b>Empates:</b> ${team.dataTime.draws}</p>
            <p><b>Derrotas:</b> ${team.dataTime.defeats}</p>
            <p><b>Gols Marcados:</b> ${team.dataTime.goalsScored}</p>
            <p><b>Gols Sofridos:</b> ${team.dataTime.goalsConceded}</p>
            <p><b>Saldo de Gols:</b> ${team.dataTime.goalsScored - team.dataTime.goalsConceded}</p>
        `;

        chartTeamResults = new Chart(ctxResults, {
            type: "doughnut",
            data: {
                labels: ["Vitórias", "Empates", "Derrotas"],
                datasets: [{
                    data: [team.dataTime.victories, team.dataTime.draws, team.dataTime.defeats],
                    backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"]
                }]
            },
            options: {
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: 'white' } },
                    title: { display: true, text: 'Resultados', color: 'white' }
                }
            }
        });

        chartTeamGoals = new Chart(ctxGoals, {
            type: "doughnut",
            data: {
                labels: ["Gols Pró", "Gols Contra"],
                datasets: [{
                    data: [team.dataTime.goalsScored, team.dataTime.goalsConceded],
                    backgroundColor: ["#3498db", "#95a5a6"]
                }]
            },
            options: {
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: 'white' } },
                    title: { display: true, text: 'Gols', color: 'white' }
                }
            }
        });
    };

    // ===============================
    // Renderização dos cards de times
    // ===============================
    const renderTeamCards = () => {
        const times = loadData();
        const modal = document.getElementById("edit-modal");
        
        teamCardsContainer.innerHTML = "";

        // Esconde a área de detalhes dos times ao renderizar os cards
        teamDetailsContainer.style.display = 'none';
        teamDetailsText.innerHTML = "<p>Selecione um time para ver as estatísticas.</p>";
        
        if (chartTeamResults) chartTeamResults.destroy();
        if (chartTeamGoals) chartTeamGoals.destroy();


        times.forEach(team => {
            const card = document.createElement("div");
            card.classList.add("team-card");
            
            card.innerHTML = `
            <img src="${team.badge || 'https://via.placeholder.com/100'}" alt="${team.name}" class="team-logo">
            <h3>${team.name}</h3>
            <p>${team.nickname}</p>
            <div class="team-actions">
                <button class="btn update">🔄 Atualizar</button>
                <button class="btn delete">🗑️ Deletar</button>
            </div>
            `;
            
            // Lógica do botão ATUALIZAR
            card.querySelector(".update").addEventListener("click", () => {
                document.getElementById("update-team-id").value = team.id;
                document.getElementById("update-timeName").value = team.name;
                document.getElementById("update-timeFoundation").value = team.foundation;
                document.getElementById("update-timeNickname").value = team.nickname;
                document.getElementById("update-timeBestPlayer").value = team.bestPlayer;
                document.getElementById("update-timeColor").value = team.color;
                document.getElementById("update-timeVictories").value = team.dataTime.victories;
                document.getElementById("update-timeDraws").value = team.dataTime.draws;
                document.getElementById("update-timeDefeats").value = team.dataTime.defeats;
                document.getElementById("update-timeGoalsScored").value = team.dataTime.goalsScored;
                document.getElementById("update-timeGoalsConceded").value = team.dataTime.goalsConceded;
                document.getElementById("update-teamBadge").value = team.badge || ''; // Adicionado para a URL
                
                modal.style.display = "block";
            });

            // Lógica do botão DELETAR
            card.querySelector(".delete").addEventListener("click", () => {
                if (!confirm(`Deseja deletar o time ${team.name}?`)) return;
                const updatedTimes = soccer.deleteTime(loadData(), team.id);
                soccer.saveTimes(updatedTimes);
                renderTeamCards();
                updateHomeChart();
            });

            // Clicar no card para exibir detalhes
            card.addEventListener("click", (e) => {
                if (e.target.classList.contains('btn')) return;
                renderTeamDetails(team.id);
            });
            teamCardsContainer.appendChild(card);
        });
    };

    // ===============================
    // Lógica do Modal de Edição
    // ===============================
    const modal = document.getElementById("edit-modal");
    const updateForm = document.getElementById("form-update");
    const closeButton = document.querySelector(".close-button");

    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });

    updateForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const teamId = parseInt(document.getElementById("update-team-id").value);
        const victories = parseInt(document.getElementById("update-timeVictories").value);
        const draws = parseInt(document.getElementById("update-timeDraws").value);
        const defeats = parseInt(document.getElementById("update-timeDefeats").value);
        
        const updates = {
            name: document.getElementById("update-timeName").value,
            foundation: parseInt(document.getElementById("update-timeFoundation").value),
            nickname: document.getElementById("update-timeNickname").value,
            bestPlayer: document.getElementById("update-timeBestPlayer").value,
            color: document.getElementById("update-timeColor").value,
            badge: document.getElementById("update-teamBadge").value, // Captura a URL
            dataTime: {
                victories: victories,
                draws: draws,
                defeats: defeats,
                games: victories + draws + defeats,
                goalsScored: parseInt(document.getElementById("update-timeGoalsScored").value),
                goalsConceded: parseInt(document.getElementById("update-timeGoalsConceded").value)
            }
        };
        
        const times = loadData();
        const updatedTimes = soccer.updateTimes(times, teamId, updates);
        soccer.saveTimes(updatedTimes);

        modal.style.display = "none";
        renderTeamCards();
        updateHomeChart();
        
        // Mantém os detalhes do time abertos se ele for o que foi editado
        const selectedTeamId = document.querySelector("#team-details-text h2")?.textContent === updates.name ? teamId : null;
        if (selectedTeamId) {
            renderTeamDetails(selectedTeamId);
        }
    });

    // ===============================
    // Cadastro de Time
    // ===============================
    formCadastrar.addEventListener("submit", (e) => {
        e.preventDefault();

        const victories = parseInt(document.getElementById("timeVictories").value, 10);
        const defeats = parseInt(document.getElementById("timeDefeats").value, 10);
        const draws = parseInt(document.getElementById("timeDraws").value, 10);
        const goalsScored = parseInt(document.getElementById("timeGoalsScored").value, 10);
        const goalsConceded = parseInt(document.getElementById("timeGoalsConceded").value, 10);
        const games = victories + defeats + draws;

        const times = loadData();
        const newTime = {
            name: document.getElementById("timeName").value,
            foundation: parseInt(document.getElementById("timeFoundation").value, 10),
            nickname: document.getElementById("timeNickname").value,
            bestPlayer: document.getElementById("timeBestPlayer").value,
            color: document.getElementById("timeColor").value,
            badge: document.getElementById("timeBadge").value || 'https://via.placeholder.com/100', // Pega a URL ou usa um padrão
            dataTime: { 
                games: games, 
                victories: victories, 
                draws: draws,
                defeats: defeats, 
                goalsScored: goalsScored, 
                goalsConceded: goalsConceded
            }
        };

        const updated = soccer.addTimes(times, newTime);
        soccer.saveTimes(updated);

        alert("✅ Time cadastrado com sucesso!");
        formCadastrar.reset();
        renderTeamCards();
        updateHomeChart();
    });

    // ===============================
    // Eventos de Filtro e Ordenação
    // ===============================
    selectCriterio.addEventListener("change", updateHomeChart);
    selectOrdem.addEventListener("change", updateHomeChart);

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

            if (sectionId === "home") updateHomeChart(); 
            
            if (sectionId === "times") {
                renderTeamCards();
            }
        });
    });

    // ===============================
    // Inicialização
    // ===============================
    updateHomeChart(); 
    renderTeamCards();
});
