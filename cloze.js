document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('cloze-title');
    const textInput = document.getElementById('cloze-text');
    const previewArea = document.getElementById('preview-area');
    const previewBtn = document.getElementById('preview-btn');
    const saveBtn = document.getElementById('save-btn');
    const titleError = document.getElementById('title-error');
    const textError = document.getElementById('text-error');

    const hasCloze = str => /\{\{[^}]+\}\}/.test(str);

    function renderPreview() {
        const text = textInput.value;
        previewArea.innerHTML = '';
        titleError.textContent = '';
        textError.textContent = '';
        if (!hasCloze(text)) {
            textError.textContent = 'Debes marcar al menos una omisión';
            return;
        }
        const html = text.replace(/\{\{[^}]+\}\}/g, '<span class="cloze-blank">______</span>');
        previewArea.innerHTML = html;
    }

    previewBtn.addEventListener('click', e => {
        e.preventDefault();
        renderPreview();
    });

    saveBtn.addEventListener('click', e => {
        e.preventDefault();
        let valid = true;
        titleError.textContent = '';
        textError.textContent = '';
        const title = titleInput.value.trim();
        const text = textInput.value;
        if (!title) {
            titleError.textContent = 'El título es obligatorio';
            valid = false;
        }
        if (!hasCloze(text)) {
            textError.textContent = 'Debes marcar al menos una omisión';
            valid = false;
        }
        if (!valid) return;
        const cards = JSON.parse(localStorage.getItem('clozeCards') || '[]');
        cards.push({ title, text });
        localStorage.setItem('clozeCards', JSON.stringify(cards));
        titleInput.value = '';
        textInput.value = '';
        previewArea.innerHTML = '';
    });
});
