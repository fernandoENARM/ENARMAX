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

(function(){
  const editor = document.getElementById('deck-editor');
  if(!editor) return;

  let hierarchy = [];

  function genId(){
    return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  function truncate(t){
    return t.length > 100 ? t.slice(0,100) + '…' : t;
  }

  function loadHierarchy(){
    try {
      hierarchy = JSON.parse(localStorage.getItem('decksHierarchy')) || [];
    } catch { hierarchy = []; }
    if(!Array.isArray(hierarchy) || hierarchy.length === 0){
      hierarchy = [{id: genId(), type:'deck', title:'Mazo', children:[]}];
      saveHierarchy();
    }
  }

  function saveHierarchy(){
    localStorage.setItem('decksHierarchy', JSON.stringify(hierarchy));
  }

  function buildLi(node, level){
    const li = document.createElement('li');
    li.dataset.id = node.id;
    li.dataset.type = node.type;
    li.setAttribute('role','treeitem');
    li.setAttribute('aria-level', level);

    const row = document.createElement('div');
    row.className = 'deck-row';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = node.children && node.children.length ? '\u25BE' : '';
    arrow.addEventListener('click', () => toggle(li));

    const icon = document.createElement('span');
    icon.textContent = node.type==='deck'?'\uD83D\uDCC1':(node.type==='subdeck'?'\uD83D\uDCD2':'\uD83D\uDCC4');

    const title = document.createElement('span');
    title.className = 'node-title';
    title.textContent = truncate(node.title);
    title.dataset.full = node.title;
    title.tabIndex = 0;
    title.addEventListener('dblclick', () => startEdit(title,node));
    title.addEventListener('keydown', e => { if(e.key==='Enter') startEdit(title,node); });

    const input = document.createElement('input');
    input.className = 'edit-input';
    input.value = node.title;
    input.style.display = 'none';
    input.addEventListener('blur', () => finishEdit(title,input,node));
    input.addEventListener('keydown', e => {
      if(e.key==='Enter') input.blur();
      if(e.key==='Escape'){ input.value=node.title; input.blur(); }
    });

    row.append(arrow, icon, title, input);

    if(node.type !== 'card'){
      const addSub = document.createElement('button');
      addSub.className = 'icon-btn';
      addSub.textContent = '+';
      addSub.setAttribute('aria-label','Añadir submazo');
      addSub.addEventListener('click', () => addSubdeck(node));
      row.appendChild(addSub);

      const addCardBtn = document.createElement('button');
      addCardBtn.className = 'icon-btn';
      addCardBtn.textContent = '+T';
      addCardBtn.setAttribute('aria-label','Añadir tarjeta');
      addCardBtn.addEventListener('click', () => addCard(node));
      row.appendChild(addCardBtn);
    }

    const del = document.createElement('button');
    del.className = 'icon-btn';
    del.textContent = '\u2716';
    del.setAttribute('aria-label','Eliminar');
    del.addEventListener('click', () => deleteNode(node.id));
    row.appendChild(del);

    li.appendChild(row);

    const ul = document.createElement('ul');
    if(node.children && node.children.length){
      node.children.forEach(c => ul.appendChild(buildLi(c, level+1)));
    } else {
      ul.style.display = 'none';
    }
    li.appendChild(ul);
    return li;
  }

  function toggle(li){
    const ul = li.querySelector('ul');
    if(!ul) return;
    const arrow = li.querySelector('.arrow');
    const show = ul.style.display === 'none';
    ul.style.display = show ? 'block' : 'none';
    arrow.textContent = show ? '\u25BE' : '\u25B8';
  }

  function addSubdeck(parent){
    parent.children.push({id:genId(), type:'subdeck', title:'Submazo', children:[]});
    saveHierarchy();
    render();
  }

  function addCard(parent){
    parent.children.push({id:genId(), type:'card', title:'Tarjeta', children:[]});
    saveHierarchy();
    render();
  }

  function deleteNode(id){
    if(!confirm(`Eliminar '${findTitle(id)}' y todo su contenido?`)) return;
    removeById(hierarchy, id);
    saveHierarchy();
    render();
  }

  function findTitle(id,list=hierarchy){
    for(const n of list){
      if(n.id===id) return n.title;
      const t = findTitle(id,n.children||[]);
      if(t) return t;
    }
    return '';
  }

  function removeById(list, id){
    const idx = list.findIndex(n => n.id===id);
    if(idx>-1){ list.splice(idx,1); return true; }
    for(const n of list){
      if(n.children && removeById(n.children,id)) return true;
    }
    return false;
  }

  function startEdit(span,node){
    const input = span.nextElementSibling;
    span.style.display = 'none';
    input.style.display = 'inline-block';
    input.value = node.title;
    input.focus();
  }

  function finishEdit(span,input,node){
    let val = input.value.trim();
    if(!val){
      alert('El título no puede quedar vacío');
      input.focus();
      return;
    }
    if(val.length>100) val = val.slice(0,100);
    node.title = val;
    span.dataset.full = val;
    span.textContent = truncate(val);
    span.style.display = '';
    input.style.display = 'none';
    saveHierarchy();
  }

  function expandCollapseAll(exp){
    editor.querySelectorAll('ul').forEach(ul => {
      ul.style.display = exp?'block':'none';
    });
    editor.querySelectorAll('.arrow').forEach(a => {
      a.textContent = exp ? '\u25BE' : '\u25B8';
    });
  }

  function parseUl(ul){
    return Array.from(ul.children).map(li => ({
      id: li.dataset.id,
      type: li.dataset.type,
      title: li.querySelector('.node-title').dataset.full,
      children: parseUl(li.querySelector('ul')||document.createElement('ul'))
    }));
  }

  function updateFromDom(){
    const root = editor.querySelector('.tree-root');
    if(root) hierarchy = parseUl(root);
    saveHierarchy();
  }

  function initSortables(root){
    if(typeof Sortable==='undefined') return;
    root.querySelectorAll('ul').forEach(ul => {
      if(ul.parentElement && ul.parentElement.dataset.type==='card') return;
      Sortable.create(ul, {
        group: 'nested',
        animation: 150,
        fallbackOnBody: true,
        onStart: e => e.item.classList.add('dragging'),
        onEnd: e => { e.item.classList.remove('dragging'); updateFromDom(); },
        onMove: evt => {
          const destLi = evt.to.closest('li');
          if(destLi && destLi.dataset.type==='card') return false;
          if(evt.dragged.contains(destLi)) return false;
        }
      });
    });
  }

  function render(){
    editor.innerHTML = '';

    if(typeof Sortable==='undefined'){
      const banner = document.createElement('div');
      banner.className = 'banner error';
      banner.textContent = 'Arrastrar-y-soltar no disponible, revisa tu conexión';
      editor.appendChild(banner);
    }

    const controls = document.createElement('div');
    const newBtn = document.createElement('button');
    newBtn.textContent = 'Nuevo Mazo';
    newBtn.className = 'small-btn';
    const expBtn = document.createElement('button');
    expBtn.textContent = 'Expandir todo';
    expBtn.className = 'small-btn';
    const colBtn = document.createElement('button');
    colBtn.textContent = 'Contraer todo';
    colBtn.className = 'small-btn';
    controls.append(newBtn, expBtn, colBtn);
    editor.appendChild(controls);

    const tree = document.createElement('ul');
    tree.className = 'tree-root';
    hierarchy.forEach(n => tree.appendChild(buildLi(n,1)));
    editor.appendChild(tree);

    newBtn.addEventListener('click', () => {
      hierarchy.push({id:genId(), type:'deck', title:'Mazo', children:[]});
      saveHierarchy();
      render();
    });
    expBtn.addEventListener('click', () => expandCollapseAll(true));
    colBtn.addEventListener('click', () => expandCollapseAll(false));

    initSortables(editor);
  }

  function handleKeys(e){
    const t = document.activeElement;
    if(!t.classList.contains('node-title')) return;
    const li = t.closest('li');
    if(e.key==='ArrowDown'){
      const n = li.nextElementSibling;
      if(n) n.querySelector('.node-title').focus();
      e.preventDefault();
    } else if(e.key==='ArrowUp'){
      const p = li.previousElementSibling;
      if(p) p.querySelector('.node-title').focus();
      e.preventDefault();
    } else if(e.key==='ArrowRight'){
      const ul = li.querySelector('ul');
      if(ul && ul.style.display==='none'){
        toggle(li);
      } else if(ul){
        const c = ul.querySelector('.node-title');
        if(c) c.focus();
      }
      e.preventDefault();
    } else if(e.key==='ArrowLeft'){
      const ul = li.querySelector('ul');
      if(ul && ul.style.display!=='none'){
        toggle(li);
      } else {
        const parent = li.parentElement.closest('li');
        if(parent) parent.querySelector('.node-title').focus();
      }
      e.preventDefault();
    } else if(e.key==='Enter'){
      startEdit(t, findNode(li.dataset.id));
      e.preventDefault();
    }
  }

  function findNode(id,list=hierarchy){
    for(const n of list){
      if(n.id===id) return n;
      const r = findNode(id,n.children||[]);
      if(r) return r;
    }
    return null;
  }

  function init(){
    loadHierarchy();
    render();
    editor.addEventListener('keydown', handleKeys);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
