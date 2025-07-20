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

  async function showProcess(text){
    const box = document.getElementById('process-container');
    if(box){
      box.style.display = 'flex';
      const t = box.querySelector('#progress-text');
      if(t) t.textContent = text || 'Procesando…';
    }
  }

  function hideProcess(){
    const box = document.getElementById('process-container');
    if(box){
      box.style.display = 'none';
    }
  }

  window.importApkgFile = async function(file){
    const start = performance.now();
    if(!file) return [];
    if(file.size > 50 * 1024 * 1024){
      alert('Paquete demasiado grande');
      return [];
    }
    await showProcess('Procesando…');
    try{
      const buf = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      const col = zip.file('collection.anki2');
      if(!col){ hideProcess(); alert('Paquete Anki inválido'); return []; }
      const colData = await col.async('uint8array');
      const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` });
      const db = new SQL.Database(colData);
      const notesRes = db.exec('SELECT id, flds FROM notes');
      const cardsRes = db.exec('SELECT nid FROM cards');
      const cardNids = new Set(cardsRes[0] ? cardsRes[0].values.map(v=>v[0]) : []);
      const mediaMap = zip.file('media') ? JSON.parse(await zip.file('media').async('string')) : {};
      const mediaBlobs = {};
      for(const id in mediaMap){
        const f = zip.file(id);
        if(f && f._data.uncompressedSize <= 5*1024*1024){
          mediaBlobs[id] = await f.async('blob');
        }
      }
      const cards = [];
      if(notesRes[0]){
        for(const row of notesRes[0].values){
          const nid = row[0];
          if(!cardNids.has(nid)) continue;
          const parts = String(row[1]).split('\u001f');
          if(parts.length !== 2) continue;
          let [front, back] = parts;
          front = replaceMedia(front);
          back = replaceMedia(back);
          cards.push({
            question: front,
            answer: back,
            specialty: `Importado-${file.name.replace(/\.apkg$/,'')}`,
            difficulty: 'medium',
            category: 'definicion',
            lastReviewed: null,
            nextReview: null,
            reviewCount: 0
          });
          if(cards.length >= 10000) break;
        }
      }
      hideProcess();
      const secs = ((performance.now()-start)/1000).toFixed(1);
      alert(`Se importaron ${cards.length} tarjetas en ${secs} s`);
      return cards;

      function replaceMedia(text){
        return text.replace(/<img[^>]+src="(\d+)"[^>]*>/g, (m,id)=>{
          const b = mediaBlobs[id];
          if(!b) return m;
          const url = URL.createObjectURL(b);
          return m.replace(id, url);
        }).replace(/\[sound:(\d+)\]/g,(m,id)=>{
          const b = mediaBlobs[id];
          if(!b) return '';
          const url = URL.createObjectURL(b);
          return `<audio src="${url}" controls></audio>`;
        });
      }
    }catch(err){
      hideProcess();
      console.error(err);
      alert('Paquete Anki inválido');
      return [];
    }
  };

  window.exportDeckToApkg = async function(deckName, cards){
    if(!cards || !cards.length) return;
    await showProcess('Procesando…');
    try{
      const SQL = await initSqlJs({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` });
      const db = new SQL.Database();
      const now = Math.floor(Date.now()/1000);
      db.run('CREATE TABLE col(id integer primary key, crt integer, mod integer, scm integer, ver integer, dty integer, usn integer, ls integer, conf text, models text, decks text, dconf text, tags text);');
      db.run('CREATE TABLE notes(id integer primary key, guid text, mid integer, mod integer, usn integer, tags text, flds text, sfld integer, csum integer, flags integer, data text);');
      db.run('CREATE TABLE cards(id integer primary key, nid integer, did integer, ord integer, mod integer, usn integer, type integer, queue integer, due integer, ivl integer, factor integer, reps integer, lapses integer, left integer, odue integer, odid integer, flags integer, data text);');
      db.run('CREATE TABLE revlog(id integer primary key, cid integer, usn integer, ease integer, ivl integer, lastIvl integer, factor integer, time integer, type integer);');
      const decksObj = {"1":{id:1,name:deckName,mod:now,usn:0}};
      const modelsObj = {"1":{id:1,name:'Basic',did:1,mod:now,usn:0,flds:[{name:'Front'},{name:'Back'}],tmpls:[{name:'Card 1',qfmt:'{{Front}}',afmt:'{{FrontSide}}<hr id=answer>{{Back}}'}]}};
      db.run('INSERT INTO col VALUES (1,?,?,?,?,11,0,0,0,?,?,?,?);',[now,now,now,JSON.stringify({}),JSON.stringify(modelsObj),JSON.stringify(decksObj),JSON.stringify({}),JSON.stringify([])]);
      let noteId=1, cardId=1;
      const media = {};
      const mediaFiles = {};
      let mediaId = 0;
      for(const c of cards){
        const flds = `${c.question}\u001f${c.answer}`;
        db.run("INSERT INTO notes VALUES (?,?,?,?,0,'',?, ?,0,0,'');", [noteId, `g${noteId}${now}`, 1, now, flds, c.question]);
        db.run("INSERT INTO cards VALUES (?,?,?,?,0,0,0,0,?,?,0,0,0,0,0,0,0,'');", [cardId, noteId, 1, 0, now, now]);
        for(const url of extractUrls(c.question+c.answer)){
          try{
            const resp = await fetch(url);
            const blob = await resp.blob();
            if(blob.size > 5*1024*1024) continue;
            const ext = blob.type.split('/')[1]||'bin';
            const name = `media${mediaId}.${ext}`;
            media[mediaId] = name;
            mediaFiles[`media/${name}`] = blob;
            mediaId++;
          }catch{}
        }
        noteId++; cardId++;
      }
      const dbData = db.export();
      const zip = new JSZip();
      zip.file('collection.anki2', dbData);
      zip.file('media', JSON.stringify(media));
      for(const k in mediaFiles){ zip.file(k, mediaFiles[k]); }
      const blob = await zip.generateAsync({type:'blob'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${deckName}.apkg`;
      a.click();
      hideProcess();
      alert('Exportación completada ✓');

      function extractUrls(text){
        const res=[]; const r=/src="(blob:[^"]+)"/g; let m; while((m=r.exec(text))) res.push(m[1]); return res;
      }
    }catch(err){
      hideProcess();
      console.error(err);
      alert('Error al exportar');
    }
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
  });
})();
