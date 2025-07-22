(function(){
  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function loadCards(){
    try {
      return JSON.parse(localStorage.getItem('medicalFlashcards')) || [];
    } catch {
      return [];
    }
  }

  window.shuffle = shuffle;
  window.loadCards = loadCards;
})();
