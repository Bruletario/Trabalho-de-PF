const soccer = (() => {

const STORAGE_KEY = "liga::times"

// =============================
// Persistência
//==============================

// Vai no local storage, verifica se data existe. Se existir: pega os dados que estão em string e converte em objeto. Se não: devolve []
const loadTimes = () => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

// Recebe times, vai no local storage e coloca a informação em formato de string
const saveTimes = times =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(times)) 

// Vai no local storage e apaga a storage key e confirma a limpeza com o console.log
const clearTimes = () => {
    localStorage.removeItem(STORAGE_KEY)
    console.log("Limpeza concluída.")
  }

// Salva times iniciais no localStorage
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
        victories: 2830,
        defeats: 1780,
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
        victories: 3100,
        defeats: 1600,
        goalsScored: 10500,
        goalsConceded: 7600
      }
    },
    {
      id: 3,
      name: "Santos",
      foundation: 1912,
      color: "branco e preto",
      nickname: "Peixe",
      bestPlayer: "Pelé",
      badge: "https://tse3.mm.bing.net/th/id/OIP.UpSijRN-ylVVdEXX4ODzUwHaHx?pid=Api&P=0&h=180",
      dataTime: {
        games: 5900,
        victories: 3000,
        defeats: 1650,
        goalsScored: 12300,
        goalsConceded: 7900
      }
    },
  ];

  saveTimes(times);
  console.log("Times iniciais salvos.");
};

// ===================================
// Crud funcional
// ===================================

const addTimes = (times, newTime) => {
    // Calcula o novo ID: Usando lenght para verificar se há times na lista e reduce para percorrer a lista e encontrar o maior id.
    
    const newId = times.length > 0
        ? times.reduce((max, time) => (time.id > max ? time.id : max), 0) + 1
        : 1;

    // Cria um novo objeto `newTime` com o ID
    const timeWithId = { ...newTime, id: newId };
    
    // Retorna um novo array com o novo time adicionado
    return [...times, timeWithId];
};

 // Recebe times, id, e a atualização, e altera a informação.
 const updateTimes = (times, id, updates) =>
    times.map(time => (time.id === id ? { ...time, ...updates } : time))

 // Verifica o id do time, se ele existir pega a lista e seleciona os do id diferente do id que foi passado(exclui (!==))
 const deleteTime = (times, id) =>
    times.filter(time => time.id !== id)

// ========================
// Listagem e formatação
// ========================

// Lista os times formatadamente, por meio do map. Mapeia os times e organiza a informação deles
 const listTimes = times =>
    times.map(time =>
      `${time.id} - "${time.name}" (${time.foundation})`
    ).join('\n')
//Essa funciona como filtro: os objetos dentro do time sao combinados ao field, ex: times.foundation e transformados em string
//Essa string é comparada ao que voce quer filtrar(outra string)
  const listTimesByField = (times, field, value) => 
    times.filter(time => String(time[field]) === String(value))

// ========================
// Estatísticas Gerais
// ========================

//Recebe a lista de times e um campo (vitória, derrota, etc) e verifica se o número do campo é maior que o acumulador ou zero.
//Se for retorna o time se não retorna o acumulador
const getMostByField = (times, field) => {
  return times.reduce((acc, team) => team.dataTime[field] > (acc?.dataTime[field] || 0) ? team : acc,null)} 


  
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

    //Estatísticas
    getMostByField
     }


}) ()

