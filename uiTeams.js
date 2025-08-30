// ===============================
// uiTeams.js 
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // Helpers 
  // ===============================

  // atalho pra pegar elemento por id
  const byId = id => document.getElementById(id)

  // atalho pra o Selector
  const $ = sel => document.querySelector(sel)

  // parse numérico seguro (
  const num = id => parseInt(byId(id).value, 10)

  // calcula saldo de gols
  const goalDiff = d => d.goalsScored - d.goalsConceded

  // carrega times do storag
  const loadData = () => {
    let times = soccer.loadTimes()
    if (times.length === 0) {
      soccer.resetTimes()
      times = soccer.loadTimes()
    }
    return times
  }

  // preenche select de ordem se estiver vazio
  const ensureOrderSelect = () => {
    const selectOrdem = byId("select-ordem")
    if (selectOrdem.options.length === 0) {
      const options = [
        { v: "desc", l: "Decrescente" },
        { v: "asc", l: "Crescente" }
      ]
      options.forEach(o => {
        const opt = document.createElement("option")
        opt.value = o.v
        opt.textContent = o.l
        selectOrdem.appendChild(opt)
      })
      selectOrdem.value = "desc"
    }
  }

  // pega a metrica escolhida para um time 
  const getTimeMetric = (time, criterio) => {
    if (criterio === "goalDifference") {
      return goalDiff(time.dataTime)
    }
    return time.dataTime[criterio]
  }

  // preenche o formulário de edicaoo com os dados do time 
  const fillUpdateForm = time => {
    byId("update-time-id").value = time.id
    byId("update-timeName").value = time.name
    byId("update-timeFoundation").value = time.foundation
    byId("update-timeNickname").value = time.nickname
    byId("update-timeBestPlayer").value = time.bestPlayer
    byId("update-timeColor").value = time.color
    byId("update-timeVictories").value = time.dataTime.victories
    byId("update-timeDraws").value = time.dataTime.draws
    byId("update-timeDefeats").value = time.dataTime.defeats
    byId("update-timeGoalsScored").value = time.dataTime.goalsScored
    byId("update-timeGoalsConceded").value = time.dataTime.goalsConceded
    byId("update-timeBadge").value = time.badge || ""
  }

  // le formulário de edição e monta o objeto de atualização 
  const readUpdateForm = () => {
    const victories = num("update-timeVictories")
    const draws = num("update-timeDraws")
    const defeats = num("update-timeDefeats")

    return {
      id: parseInt(byId("update-time-id").value, 10),
      updates: {
        name: byId("update-timeName").value,
        foundation: num("update-timeFoundation"),
        nickname: byId("update-timeNickname").value,
        bestPlayer: byId("update-timeBestPlayer").value,
        color: byId("update-timeColor").value,
        badge: byId("update-timeBadge").value,
        dataTime: {
          victories,
          draws,
          defeats,
          games: victories + draws + defeats,
          goalsScored: num("update-timeGoalsScored"),
          goalsConceded: num("update-timeGoalsConceded")
        }
      }
    }
  }

  // le formulário de cadastro e monta um time novo
  const readCreateForm = () => {
    const victories = num("timeVictories")
    const defeats = num("timeDefeats")
    const draws = num("timeDraws")
    const goalsScored = num("timeGoalsScored")
    const goalsConceded = num("timeGoalsConceded")
    const games = victories + defeats + draws

    return {
      name: byId("timeName").value,
      foundation: num("timeFoundation"),
      nickname: byId("timeNickname").value,
      bestPlayer: byId("timeBestPlayer").value,
      color: byId("timeColor").value,
      badge: byId("timeBadge").value || "https://via.placeholder.com/100",
      dataTime: {
        games,
        victories,
        draws,
        defeats,
        goalsScored,
        goalsConceded
      }
    }
  }

  // ===============================
  // Seletores fixos da página
  // ===============================

  // seções e menu
  const sections = document.querySelectorAll("section")
  const menuLinks = document.querySelectorAll(".menu li a")

  // home
  const ctxHome = byId("homeChart").getContext("2d")
  const selectCriterio = byId("select-criterio")
  const selectOrdem = byId("select-ordem")

  // aba times
  const timeCardsContainer = byId("time-cards")
  const timeDetailsContainer = byId("time-details-container")
  const timeDetailsText = byId("time-details-text")

  // formulários
  const formCadastrar = byId("form-cadastrar")

  // estado dos gráficos
  let homeChart
  let chartTimeResults
  let chartTimeGoals

  // ===============================
  // Renderização da Home 
  // ===============================

  // atualiza o gráfico principal da home com base no critério/ordem
  const updateHomeChart = () => {
    const criterio = selectCriterio.value
    const ordem = selectOrdem.value || "desc"

    const times = [...loadData()].sort((a, b) => {
      const va = getTimeMetric(a, criterio)
      const vb = getTimeMetric(b, criterio)
      return ordem === "desc" ? (vb - va) : (va - vb)
    })

    const labels = times.map(t => t.name)
    const data = times.map(t => getTimeMetric(t, criterio))
    const chartLabel = selectCriterio.options[selectCriterio.selectedIndex].text

    if (homeChart) homeChart.destroy()

    homeChart = new Chart(ctxHome, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: chartLabel,
          data,
          backgroundColor: "rgba(75, 192, 192, 0.95)"
        }]
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: {
            labels: {
              color: "white",
              font: { size: 15, weight: "bold" }
            }
          }
        },
        scales: {
          x: { ticks: { color: "white" } },
          y: { ticks: { color: "white" } }
        }
      }
    })
  }

  // ===============================
  // Detalhes de um time
  // ===============================

  // mostra detalhes do time 
  const renderTimeDetails = (timeId) => {
    const times = loadData()
    const time = times.find(t => t.id === timeId)
    if (!time) return

    // pega os contextos só quando o canvas existe
    const ctxResultados = byId("chartTimeResults").getContext("2d")
    const ctxGols = byId("chartTimeGoals").getContext("2d")

    if (chartTimeResults) chartTimeResults.destroy()
    if (chartTimeGoals) chartTimeGoals.destroy()

    timeDetailsContainer.style.display = "flex"

    timeDetailsText.innerHTML = `
      <h2>${time.name}</h2>
      <p><b>Ano de Fundação:</b> ${time.foundation}</p>
      <p><b>Apelido:</b> ${time.nickname}</p>
      <p><b>Maior Ídolo:</b> ${time.bestPlayer}</p>
      <p><b>Cores:</b> ${time.color}</p>
      <hr style="margin: 10px 0; opacity: .3;">
      <p><b>Total de Jogos:</b> ${time.dataTime.games}</p>
      <p><b>Vitórias:</b> ${time.dataTime.victories}</p>
      <p><b>Empates:</b> ${time.dataTime.draws}</p>
      <p><b>Derrotas:</b> ${time.dataTime.defeats}</p>
      <p><b>Gols Marcados:</b> ${time.dataTime.goalsScored}</p>
      <p><b>Gols Sofridos:</b> ${time.dataTime.goalsConceded}</p>
      <p><b>Saldo de Gols:</b> ${goalDiff(time.dataTime)}</p>
    `

    chartTimeResults = new Chart(ctxResultados, {
      type: "doughnut",
      data: {
        labels: ["Vitórias", "Empates", "Derrotas"],
        datasets: [{
          data: [time.dataTime.victories, time.dataTime.draws, time.dataTime.defeats],
          backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"]
        }]
      },
      options: {
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: "white" } },
          title: { display: true, text: "Resultados", color: "white" }
        }
      }
    })

    chartTimeGoals = new Chart(ctxGols, {
      type: "doughnut",
      data: {
        labels: ["Gols Pró", "Gols Contra"],
        datasets: [{
          data: [time.dataTime.goalsScored, time.dataTime.goalsConceded],
          backgroundColor: ["#3498db", "#95a5a6"]
        }]
      },
      options: {
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: "white" } },
          title: { display: true, text: "Gols", color: "white" }
        }
      }
    })
  }

  // ===============================
  // Cards do time
  // ===============================

  // monta a grade de cards de time
  const renderTimeCards = () => {
    const times = loadData()
    const modal = byId("edit-modal")

    timeCardsContainer.innerHTML = ""

    // esconde detalhes ao recarregar a pagina cards
    timeDetailsContainer.style.display = "none"
    timeDetailsText.innerHTML = "<p>Selecione um time para ver as estatísticas.</p>"

    if (chartTimeResults) chartTimeResults.destroy()
    if (chartTimeGoals) chartTimeGoals.destroy()

    times.forEach(time => {
      const card = document.createElement("div")
      card.classList.add("time-card")

      card.innerHTML = `
        <img src="${time.badge || 'https://via.placeholder.com/100'}" alt="${time.name}" class="time-logo">
        <h3>${time.name}</h3>
        <p>${time.nickname}</p>
        <div class="time-actions">
          <button class="btn update">🔄 Atualizar</button>
          <button class="btn delete">🗑️ Deletar</button>
        </div>
      `

      // botão atualizar abre modal com dados do time
      card.querySelector(".update").addEventListener("click", () => {
        fillUpdateForm(time)
        modal.style.display = "block"
      })

      // botão deletar remove o time e atualiza tela
      card.querySelector(".delete").addEventListener("click", () => {
        if (!confirm(`Deseja deletar o time ${time.name}?`)) return
        const updatedTimes = soccer.deleteTime(loadData(), time.id)
        soccer.saveTimes(updatedTimes)
        renderTimeCards()
        updateHomeChart()
      })

      // clique no card mostra detalhes
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn")) return
        renderTimeDetails(time.id)
      })

      timeCardsContainer.appendChild(card)
    })
  }

  // ===============================
  // Modal de Edição
  // ===============================

  const modal = byId("edit-modal")
  const updateForm = byId("form-update")
  const closeButton = $(".close-button")

  // fecha o modal no X
  closeButton.addEventListener("click", () => {
    modal.style.display = "none"
  })

  // fecha o modal clicando fora
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none"
  })

  // salva edicao do time e atualiza tela
  updateForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const { id, updates } = readUpdateForm()
    const times = loadData()
    const updatedTimes = soccer.updateTimes(times, id, updates)
    soccer.saveTimes(updatedTimes)

    modal.style.display = "none"
    renderTimeCards()
    updateHomeChart()

    // se os detalhes abertos eram desse time continua atualizados
    const openedName = $("#time-details-text h2")?.textContent
    if (openedName && openedName === updates.name) {
      renderTimeDetails(id)
    }
  })

  // ===============================
  // Cadastro de Time
  // ===============================

  // cria um time novo e atualiza tudo
  formCadastrar.addEventListener("submit", (e) => {
    e.preventDefault()

    const times = loadData()
    const newTime = readCreateForm()
    const updated = soccer.addTimes(times, newTime)
    soccer.saveTimes(updated)

    alert("✅ Time cadastrado com sucesso!")
    formCadastrar.reset()
    renderTimeCards()
    updateHomeChart()
  })

  // ===============================
  // Filtros/ordenacão + navegação
  // ===============================

  // atualiza gráfico quando mudar a ordem
  selectCriterio.addEventListener("change", updateHomeChart)
  selectOrdem.addEventListener("change", updateHomeChart)

  // navegação do menu
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section")

      menuLinks.forEach(l => l.classList.remove("active"))
      link.classList.add("active")

      sections.forEach(sec => sec.classList.remove("active"))
      byId(sectionId).classList.add("active")

      if (sectionId === "home") updateHomeChart()
      if (sectionId === "times") renderTimeCards()
    })
  })

  // ===============================
  // Inicialização
  // ===============================

  ensureOrderSelect()
  updateHomeChart()
  renderTimeCards()
})
