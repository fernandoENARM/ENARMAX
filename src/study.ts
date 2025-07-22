// @ts-nocheck
(function(){
  const params = new URLSearchParams(location.search);
  const topicId = params.get('topicId') || sessionStorage.getItem('topicId');

  function loadCards(): Flashcard[]{
    try { return JSON.parse(localStorage.getItem('medicalFlashcards')!) || []; }
    catch { return []; }
  }

  function shuffle<T>(arr: T[]): T[]{
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }


  const questionEl = document.getElementById('study-question');
  const answerEl = document.getElementById('study-answer');
  const showBtn = document.getElementById('show-answer-btn');
  const diffGroup = document.getElementById('difficulty-group');
  const progressFill = document.getElementById('progress-fill');
  const exitBtn = document.getElementById('exit-session');
  const modal = document.getElementById('session-complete');
  const summary = document.getElementById('session-summary');
  const backBtn = document.getElementById('session-back');

  let cards: Flashcard[] = [];
  let idx = 0;
  let revealed = false;
  let correct = 0;
  let wrong = 0;

  function start(){
    const all = loadCards();
    cards = all.filter(c => c.topicId === topicId);
    shuffle(cards);
    idx = 0;
    correct = 0;
    wrong = 0;
    showCard();
  }

  function showCard(){
    if(idx >= cards.length){
      finish();
      return;
    }
    revealed = false;
    const card = cards[idx];
    questionEl.textContent = card.question;
    if(window.renderMarkdown){
      window.renderMarkdown(card.answer, answerEl);
    }else{
      answerEl.textContent = card.answer;
    }
    answerEl.classList.remove('revealed');
    diffGroup.style.display = 'none';
    showBtn.style.display = 'inline-block';
    progressFill.style.width = `${(idx/cards.length)*100}%`;
  }

  function reveal(){
    if(revealed) return;
    revealed = true;
    answerEl.classList.add('revealed');
    showBtn.style.display = 'none';
    diffGroup.style.display = 'flex';
    progressFill.style.width = `${((idx+1)/cards.length)*100}%`;
  }

  function record(quality: number){
    const card = cards[idx];
    window.scheduleCard(card, quality);
    if(quality >=4) correct++; else wrong++;
    const all = loadCards();
    const i = all.findIndex(c => c.question === card.question);
    if(i !== -1){ all[i] = card; localStorage.setItem('medicalFlashcards', JSON.stringify(all)); }
    idx++;
    showCard();
  }

  function finish(){
    summary.textContent = `Aciertos: ${correct} \u2022 Errores: ${wrong}`;
    modal.setAttribute('aria-hidden','false');
  }

  showBtn.addEventListener('click', reveal);
  document.addEventListener('keydown', e => {
    if((e.code==='Space' || e.code==='Enter') && !revealed){
      e.preventDefault();
      reveal();
    }
  });
  diffGroup.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => record(parseInt(btn.dataset.quality,10)));
  });
  exitBtn.addEventListener('click', () => {
    history.back();
  });
  backBtn.addEventListener('click', () => {
    modal.setAttribute('aria-hidden','true');
    history.back();
  });

  start();
})();
