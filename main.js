(function(){
  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.setRangeText(text, start, end, 'end');
    textarea.focus();
  }

  window.renderMarkdown = function(mdText, container){
    if(!container){ return; }
    let text = mdText || '';
    text = text.replace(/\$\$(.+?)\$\$/gs, '<div class="latex-block">$1</div>');
    text = text.replace(/\$(.+?)\$/g, '<span class="latex-inline">$1</span>');
    const html = window.markdownit({html:true}).render(text);
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.querySelectorAll('img').forEach(img => {
      img.classList.add('md-image');
    });

    temp.querySelectorAll('audio').forEach(a => {
      a.setAttribute('controls', '');
      a.setAttribute('preload', 'none');
      a.classList.add('md-audio');
      a.tabIndex = 0;
      a.addEventListener('keydown', e => {
        if(e.code === 'Space' || e.code === 'Enter'){
          e.preventDefault();
          if(a.paused) a.play(); else a.pause();
        }
      });
    });

    temp.querySelectorAll('.latex-inline, .latex-block').forEach(el => {
      try {
        window.katex.render(el.textContent, el, {
          throwOnError: false,
          displayMode: el.classList.contains('latex-block')
        });
      } catch(err){
        el.style.color = 'red';
        el.setAttribute('aria-label', el.textContent);
      }
    });

    container.innerHTML = '';
    container.append(...temp.childNodes);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const previewBtn = document.getElementById('preview-answer-btn');
    const previewArea = document.getElementById('answer-preview');
    const answerInput = document.getElementById('new-answer');

    if(previewBtn && previewArea && answerInput){
      previewBtn.addEventListener('click', e => {
        e.preventDefault();
        window.renderMarkdown(answerInput.value, previewArea);
      });

      ['dragover','dragenter'].forEach(ev => {
        answerInput.addEventListener(ev, e => e.preventDefault());
      });
      answerInput.addEventListener('drop', e => {
        e.preventDefault();
        Array.from(e.dataTransfer.files).forEach(file => {
          if(file.size > 5 * 1024 * 1024){
            alert('Archivo demasiado grande');
            return;
          }
          if(!(file.type.startsWith('image') || file.type.startsWith('audio'))){
            return;
          }
          const reader = new FileReader();
          reader.onload = ev => {
            const dataUrl = ev.target.result;
            try{ localStorage.setItem('mdResource_' + Date.now(), dataUrl); }catch{}
            const tag = file.type.startsWith('audio')
              ? `<audio src="${dataUrl}" controls></audio>`
              : `![${file.name}](${dataUrl})`;
            insertAtCursor(answerInput, tag);
          };
          reader.readAsDataURL(file);
        });
      });
    }

    initAdaptiveExam();

    const menuBtn = document.getElementById('menu-btn');
    const sidePanel = document.getElementById('side-panel');
    const overlay = document.getElementById('side-overlay');

    function toggleMenu(forceClose) {
      if (!sidePanel || !overlay || !menuBtn) return;
      const open = forceClose ? false : !sidePanel.classList.contains('open');
      if (open) {
        sidePanel.classList.add('open');
        overlay.classList.add('open');
        menuBtn.setAttribute('aria-label', 'Cerrar menú');
        const firstLink = sidePanel.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        sidePanel.classList.remove('open');
        overlay.classList.remove('open');
        menuBtn.setAttribute('aria-label', 'Abrir menú');
        menuBtn.focus();
      }
    }

    if(menuBtn && overlay){
      menuBtn.addEventListener('click', () => toggleMenu());
      overlay.addEventListener('click', () => toggleMenu(true));
      document.addEventListener('keydown', e => {
        if(e.key === 'Escape' && sidePanel.classList.contains('open')){
          toggleMenu(true);
        }
      });
    }

    // ----- Persistence helpers -----
    const STORAGE_KEY = 'appData';
    function loadData(){
      try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {metrics:{}, activityLog:[]}; }
      catch{ return {metrics:{}, activityLog:[]}; }
    }

    function saveData(data){
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function ensureMetrics(topic){
      if(!appData.metrics[topic]){
        const cards = JSON.parse(localStorage.getItem('medicalFlashcards')||'[]');
        const total = cards.filter(c => c.specialty === topic).length;
        appData.metrics[topic] = {reviews:0, errors:0, totalCards: total};
      } else {
        const cards = JSON.parse(localStorage.getItem('medicalFlashcards')||'[]');
        appData.metrics[topic].totalCards = cards.filter(c => c.specialty === topic).length;
      }
    }

    function scheduleCard(card, quality){
      card.efactor = card.efactor || 2.5;
      card.repetitions = card.repetitions || 0;
      card.interval = card.interval || 0;

      if(quality < 3){
        card.repetitions = 0;
        card.interval = 1;
      }else{
        card.repetitions += 1;
        if(card.repetitions === 1) card.interval = 1;
        else if(card.repetitions === 2) card.interval = 6;
        else card.interval = Math.round(card.interval * card.efactor);

        card.efactor = card.efactor + (0.1 - (5 - quality)*(0.08 + (5 - quality)*0.02));
        if(card.efactor < 1.3) card.efactor = 1.3;
      }

      const next = new Date();
      next.setDate(next.getDate() + card.interval);
      card.nextReview = next.toISOString();
      card.lastReviewed = new Date().toISOString();
      card.quality = quality;
    }

    function updateDashboard(){
      const heatmapDiv = document.getElementById('study-heatmap');
      if(!heatmapDiv) return;
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = new Date(today);
      start.setDate(today.getDate()-364);
      const data = [];
      for(let i=0;i<365;i++){
        const d = new Date(start);
        d.setDate(start.getDate()+i);
        const key = d.toISOString().slice(0,10);
        const entry = appData.activityLog.find(a => a.date === key);
        if(entry){
          const acc = entry.count ? Math.round((entry.correct/entry.count)*100) : 0;
          data.push({date:key, reviews:entry.count, accuracy:acc, cards:[]});
        }else{
          data.push({date:key, reviews:0, cards:[]});
        }
      }
      renderStudyHeatmap(data);
    }

    let appData = loadData();
    updateDashboard();

    if(window.setDifficulty){
      const original = window.setDifficulty;
      window.setDifficulty = function(diff){
        const card = window.flashcards && window.flashcards[window.currentCardIndex];
        original(diff);
        if(card){
          const qMap = {easy:5, medium:4, hard:2};
          const q = qMap[diff] ?? 0;
          scheduleCard(card, q);
          ensureMetrics(card.specialty);
          const m = appData.metrics[card.specialty];
          m.reviews += 1;
          if(q <= 3) m.errors += 1;
          const today = new Date().toISOString().slice(0,10);
          let log = appData.activityLog.find(a => a.date === today);
          if(log){
            log.count += 1;
            if(q >= 4) log.correct += 1;
          }else{
            appData.activityLog.push({date: today, count:1, correct: q>=4?1:0});
          }
          saveData(appData);
          if(typeof saveFlashcards === 'function') saveFlashcards();
          updateDashboard();
        }
      };
    }
  });

  // ----- Adaptive exam mode -----
  const examState = {
    cards: [],
    results: [],
    idx: 0,
    timer: null,
    timeLeft: 0
  };

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
    } catch { return []; }
  }

  function buildExamSet(){
    const all = loadCards();
    const isNew = c => c.interval === 0;
    const difficult = all.filter(c => !isNew(c) && (c.quality ?? 0) <= 3);
    const newCards = all.filter(isNew);
    const rest = all.filter(c => !isNew(c) && (c.quality ?? 0) > 3);

    let needDiff = Math.round(40 * 0.6);
    let needNew = Math.round(40 * 0.3);
    let needRest = 40 - needDiff - needNew;

    if(difficult.length < needDiff){
      needRest += needDiff - difficult.length;
      needDiff = difficult.length;
    }
    if(newCards.length < needNew){
      needRest += needNew - newCards.length;
      needNew = newCards.length;
    }
    if(rest.length < needRest){
      let shortage = needRest - rest.length;
      needRest = rest.length;
      const takeDiff = Math.min(shortage, difficult.length - needDiff);
      needDiff += takeDiff;
      shortage -= takeDiff;
      if(shortage > 0){
        const takeNew = Math.min(shortage, newCards.length - needNew);
        needNew += takeNew;
      }
    }

    shuffle(difficult);
    shuffle(newCards);
    shuffle(rest);

    const set = [
      ...difficult.slice(0, needDiff).map(c => ({card: c, group: 'difícil'})),
      ...newCards.slice(0, needNew).map(c => ({card: c, group: 'nueva'})),
      ...rest.slice(0, needRest).map(c => ({card: c, group: 'resto'}))
    ];

    while(set.length < 40){
      const extra = [...difficult.slice(needDiff), ...newCards.slice(needNew), ...rest.slice(needRest)];
      if(extra.length === 0) break;
      const r = extra[Math.floor(Math.random()*extra.length)];
      set.push({card: r, group: r.interval === 0 ? 'nueva' : ((r.quality ?? 0) <=3 ? 'difícil' : 'resto')});
    }

    shuffle(set);
    return set.slice(0,40);
  }

  function initAdaptiveExam(){
    const startBtn = document.getElementById('start-exam-btn');
    if(!startBtn) return;
    startBtn.addEventListener('click', () => startAdaptiveExam());
    const ans = document.getElementById('exam-answer');
    const next = document.getElementById('exam-next-btn');
    if(ans && next){
      ans.addEventListener('input', () => {
        next.disabled = !ans.value.trim();
      });
      ans.addEventListener('keydown', e => {
        if(e.key === 'Enter' && !next.disabled){
          e.preventDefault();
          submitAnswer();
        }
      });
      next.addEventListener('click', () => submitAnswer());
    }
    window.addEventListener('beforeunload', () => clearInterval(examState.timer));
  }

  window.startAdaptiveExam = function(){
    examState.cards = buildExamSet();
    examState.results = [];
    examState.idx = 0;
    document.getElementById('exam-lobby').style.display = 'none';
    document.getElementById('exam-results').style.display = 'none';
    document.getElementById('exam-question').style.display = 'block';
    showQuestion(0);
  };

  function showQuestion(i){
    if(i >= examState.cards.length){
      finishExam();
      return;
    }
    examState.idx = i;
    const {card} = examState.cards[i];
    document.getElementById('exam-progress').textContent = `${i+1}/40`;
    document.getElementById('exam-q-text').textContent = card.question;
    const ans = document.getElementById('exam-answer');
    const next = document.getElementById('exam-next-btn');
    ans.value = '';
    next.disabled = true;
    ans.focus();

    examState.timeLeft = 90;
    updateTimer();
    clearInterval(examState.timer);
    examState.timer = setInterval(() => {
      examState.timeLeft--;
      updateTimer();
      if(examState.timeLeft <= 0){
        submitAnswer(true);
      }
    },1000);
  }

  function updateTimer(){
    const secs = examState.timeLeft;
    const bar = document.getElementById('time-bar-fill');
    const label = document.getElementById('time-bar');
    const txt = document.getElementById('time-remaining');
    if(bar) bar.style.width = `${(secs/90)*100}%`;
    if(label) label.setAttribute('aria-label', `Quedan ${secs} segundos`);
    if(txt){
      const m = String(Math.floor(secs/60)).padStart(2,'0');
      const s = String(secs%60).padStart(2,'0');
      txt.textContent = `${m}:${s}`;
    }
  }

  function submitAnswer(timedOut){
    clearInterval(examState.timer);
    const {card, group} = examState.cards[examState.idx];
    const ansInput = document.getElementById('exam-answer');
    const userAns = timedOut ? '' : ansInput.value.trim();
    const correct = userAns && userAns.toLowerCase() === String(card.answer).toLowerCase();
    const result = {
      cardId: card.question,
      answered: !timedOut && userAns !== '',
      correct,
      group,
      responseTime: 90 - examState.timeLeft
    };
    examState.results.push(result);
    showQuestion(examState.idx + 1);
  }

  function finishExam(){
    document.getElementById('exam-question').style.display = 'none';
    const resultsDiv = document.getElementById('exam-results');
    resultsDiv.style.display = 'block';

    const totalCorrect = examState.results.filter(r => r.correct).length;
    const unanswered = examState.results.filter(r => !r.answered).length;
    const avgTime = examState.results.reduce((s,r) => s + r.responseTime,0) / examState.results.length || 0;

    const dist = {difícil: {t:0,c:0}, nueva:{t:0,c:0}, resto:{t:0,c:0}};
    examState.results.forEach(r => {
      dist[r.group].t++;
      if(r.correct) dist[r.group].c++;
    });

    document.getElementById('exam-score').textContent = `Puntuación: ${Math.round((totalCorrect/ examState.results.length)*100)}%`;
    document.getElementById('exam-stats').innerHTML =
      `<p>Tiempo promedio: ${avgTime.toFixed(1)} s</p>`+
      `<p>No respondidas: ${unanswered}</p>`+
      `<p>Aciertos difícil: ${dist['difícil'].c}/${dist['difícil'].t}</p>`+
      `<p>Aciertos nuevas: ${dist['nueva'].c}/${dist['nueva'].t}</p>`+
      `<p>Aciertos resto: ${dist['resto'].c}/${dist['resto'].t}</p>`;

    const list = document.getElementById('review-list');
    list.innerHTML = '';
    examState.results.forEach((r,idx) => {
      if(!r.correct){
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = `Pregunta ${idx+1}`;
        a.addEventListener('click', e => {
          e.preventDefault();
          alert(`${examState.cards[idx].card.question}\n\nRespuesta correcta:\n${examState.cards[idx].card.answer}`);
        });
        li.appendChild(a);
        list.appendChild(li);
      }
    });

    const exams = JSON.parse(localStorage.getItem('exams') || '[]');
    exams.push({
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      score: Math.round((totalCorrect/ examState.results.length)*100),
      answers: examState.results.map(r => ({cardId:r.cardId, correct:r.correct, time:r.responseTime}))
    });
    localStorage.setItem('exams', JSON.stringify(exams));
  }
})();
