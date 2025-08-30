const soccer = (() => {

  const STORAGE_KEY = "liga::times"

  // =============================
  // Persistência
  // =============================

  // carrega a lista de time do localStorage ou [] se não tiver nada
  const loadTimes = () => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  // salva a lista de times no localstorage como string
  const saveTimes = times =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(times))

  // apaga tudo relacionado aos times do localtorage
  const clearTimes = () => {
    localStorage.removeItem(STORAGE_KEY)
    console.log("Limpeza concluída.")
  }

  // coloca time inicial no localStorage
  const resetTimes = () => {
    const times = [
      {
        id: 1,
        name: "Corinthians",
        foundation: 1910,
        color: "preto e branco",
        nickname: "Timão",
        bestPlayer: "Sócrates",
        badge: "https://tse1.mm.bing.net/th/id/OIP.LMOAYurYCi2q9nmSLQqVIAHaHa?pid=Api&P=0&h=180",
        dataTime: {
          games: 5850,
          victories: 3105,
          draws: 1576,
          defeats: 1567,
          goalsScored: 9700,
          goalsConceded: 7800
        }
      },
      {
        id: 2,
        name: "Flamengo",
        foundation: 1895,
        color: "vermelho e preto",
        nickname: "Mengão",
        bestPlayer: "Zico",
        badge: "https://tse4.mm.bing.net/th/id/OIP.o8sjkU0ruMxq6E326AJzsQHaJB?pid=Api&P=0&h=180",
        dataTime: {
          games: 6000,
          victories: 3570,
          draws: 1568,
          defeats: 1567,
          goalsScored: 10500,
          goalsConceded: 7600
        }
      },
    ]

    saveTimes(times)
    console.log("Times iniciais salvos.")
  }

  // ===================================
  // CRUD funcional
  // ===================================

  // adiciona um time novo e gera um id novo
  const addTimes = (times, newTime) => {
    const newId = times.length > 0
      ? times.reduce((max, time) => (time.id > max ? time.id : max), 0) + 1
      : 1

    const timeWithId = { ...newTime, id: newId }
    return [...times, timeWithId]
  }

  // atualiza um time pelo id retorna novo array
  const updateTimes = (times, id, updates) =>
    times.map(time => (time.id === id ? { ...time, ...updates } : time))

  // remove um time pelo id 
  const deleteTime = (times, id) =>
    times.filter(time => time.id !== id)

  // ========================
  // Listagem e busca
  // ========================

  // monta uma listinha simples de times 
  const listTimes = times =>
    times.map(time =>
      `${time.id} - "${time.name}" (${time.foundation})`
    ).join('\n')

  // filtra times por um campo aletarorio
  const listTimesByField = (times, field, value) =>
    times.filter(time => String(time[field]) === String(value))

  // ========================
  // Estatísticas
  // ========================

  // pega o time que mais tem no campo passado  vitorias derrotas etc etc
  const getMostByField = (times, field) =>
    times.reduce(
      (acc, time) => time.dataTime[field] > (acc?.dataTime[field] || 0) ? time : acc,
      null
    )

  return {
    // Persistência
    loadTimes,
    saveTimes,
    resetTimes,
    clearTimes,

    // CRUD
    addTimes,
    updateTimes,
    deleteTime,

    // Exibição
    listTimes,
    listTimesByField,

    // Estatísticas
    getMostByField
  }

})()
