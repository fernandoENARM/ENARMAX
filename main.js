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
  });
})();
