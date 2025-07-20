// Sample medical flashcards data
let flashcards = [
    {
        question: "¿Qué es la hipertensión arterial?",
        answer: "Es una condición médica en la que la presión arterial es persistentemente elevada, generalmente definida como una presión sistólica de 140 mmHg o más y/o una presión diastólica de 90 mmHg o más.",
        specialty: "medicina-interna",
        difficulty: "medium",
        category: "definicion",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuáles son los signos vitales principales?",
        answer: "1. Temperatura corporal\n2. Frecuencia cardíaca (pulso)\n3. Presión arterial\n4. Frecuencia respiratoria\n5. Saturación de oxígeno",
        specialty: "medicina-interna",
        difficulty: "easy",
        category: "diagnostico",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Qué es el síndrome de Cushing?",
        answer: "Es un trastorno hormonal causado por la exposición prolongada a niveles altos de cortisol. Los síntomas incluyen obesidad central, cara de luna llena, joroba de búfalo, estrías violáceas, hipertensión y diabetes mellitus.",
        specialty: "medicina-interna",
        difficulty: "hard",
        category: "fisiopatologia",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la causa más frecuente de bronquiolitis?",
        answer: "Virus sincitial respiratorio",
        specialty: "pediatria",
        difficulty: "medium",
        category: "etiologia",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Edad gestacional para tamizaje de diabetes gestacional?",
        answer: "Entre las semanas 24 y 28 de gestación.",
        specialty: "gineco-obstetricia",
        difficulty: "medium",
        category: "diagnostico",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la tríada de la colecistitis aguda?",
        answer: "Dolor en cuadrante superior derecho, fiebre y leucocitosis.",
        specialty: "cirugia",
        difficulty: "medium",
        category: "cuadro-clinico",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la secuencia primaria de la evaluación en ATLS?",
        answer: "A - Vía aérea con control cervical, B - Respiración, C - Circulación, D - Déficit neurológico, E - Exposición.",
        specialty: "atls",
        difficulty: "easy",
        category: "tratamiento",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Dosis de adrenalina en paro cardiaco durante RCP?",
        answer: "1 mg IV cada 3-5 minutos.",
        specialty: "acls",
        difficulty: "easy",
        category: "tratamiento",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Qué es la diabetes mellitus tipo 1?",
        answer: "Enfermedad autoinmune caracterizada por destrucción de las células beta pancreáticas y deficiencia absoluta de insulina.",
        specialty: "medicina-interna",
        difficulty: "medium",
        category: "definicion",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Edad más frecuente de presentación del cáncer testicular?",
        answer: "Entre los 15 y 35 años de edad.",
        specialty: "cirugia",
        difficulty: "medium",
        category: "epidemiologia",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la complicación más grave de la influenza?",
        answer: "Neumonía viral o sobreinfección bacteriana severa.",
        specialty: "pediatria",
        difficulty: "medium",
        category: "complicaciones",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    }
];

const specialties = [
    { slug: 'medicina-interna', name: 'Medicina Interna', emoji: '🩺' },
    { slug: 'pediatria', name: 'Pediatría', emoji: '👶' },
    { slug: 'gineco-obstetricia', name: 'Ginecología y Obstetricia', emoji: '🤰' },
    { slug: 'cirugia', name: 'Cirugía', emoji: '🔪' },
    { slug: 'atls', name: 'ATLS', emoji: '🚑' },
    { slug: 'acls', name: 'ACLS', emoji: '❤️' }
];

const specialtyNames = specialties.reduce((acc, s) => {
    acc[s.slug] = s.name;
    return acc;
}, {});

// DOM Elements
const flashcard = document.getElementById('flashcard');
const questionElement = document.getElementById('question');
const answerElement = document.getElementById('answer');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');
const todayCount = document.getElementById('today-count');
const pendingCount = document.getElementById('pending-count');
const newCount = document.getElementById('new-count');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const addCardBtn = document.getElementById('add-card-btn');
const newQuestionInput = document.getElementById('new-question');
const newAnswerInput = document.getElementById('new-answer');
const newSpecialtySelect = document.getElementById('new-specialty');
const newCategorySelect = document.getElementById('new-category');
const editCardBtn = document.getElementById('edit-card-btn');
const deleteCardBtn = document.getElementById('delete-card-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');
const themeToggle = document.getElementById('theme-toggle');
const specialtyTitle = document.getElementById("specialty-title");
// Home page elements
const profilePic = document.getElementById('profile-pic');
const changePicBtn = document.getElementById('change-pic-btn');
const profilePicInput = document.getElementById('profile-pic-input');
const greeting = document.getElementById('greeting');
const changeNameBtn = document.getElementById('change-name-btn');
const userNameInput = document.getElementById('user-name-input');
const progressChartCanvas = document.getElementById('progress-chart');
const weakTopicsList = document.getElementById('weak-topics-list');

// App state
let allFlashcards = [];
let currentCardIndex = 0;
let cardsReviewedToday = 0;
let pendingCards = 0;
let newCards = 0;
let isFlipped = false;

// Enable or disable difficulty buttons
function setDifficultyButtonsEnabled(enabled) {
    difficultyBtns.forEach(btn => {
        btn.disabled = !enabled;
    });
}

function updateThemeIcon(isDark) {
    if (!themeToggle) return;
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

// Profile picture handling
function loadProfilePic() {
    const pic = localStorage.getItem('profilePic');
    if (pic && profilePic) {
        profilePic.src = pic;
    }
}

function handleProfilePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const data = ev.target.result;
        profilePic.src = data;
        localStorage.setItem('profilePic', data);
    };
    reader.readAsDataURL(file);
}

// User name handling
function loadUserName() {
    const name = localStorage.getItem('userName');
    if (name && greeting) {
        greeting.textContent = `Hola ${name}`;
    }
}

function handleNameChange() {
    if (!userNameInput) return;
    const name = userNameInput.value.trim();
    if (name) {
        localStorage.setItem('userName', name);
        greeting.textContent = `Hola ${name}`;
        userNameInput.style.display = 'none';
    }
}

// Progress chart and weak topics
function renderProgressChart() {
    if (!progressChartCanvas || typeof Chart === 'undefined') return;
    const counts = {};
    flashcards.forEach(card => {
        if (card.reviewCount && card.reviewCount > 0) {
            counts[card.specialty] = (counts[card.specialty] || 0) + 1;
        }
    });
    const labels = [];
    const data = [];
    Object.keys(specialtyNames).forEach(spec => {
        if (counts[spec]) {
            labels.push(specialtyNames[spec]);
            data.push(counts[spec]);
        }
    });
    if (labels.length === 0) {
        labels.push('Sin repasar');
        data.push(1);
    }
    new Chart(progressChartCanvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#4a6fa5',
                    '#28a745',
                    '#ffc107',
                    '#dc3545',
                    '#6c757d',
                    '#8e44ad'
                ]
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderWeakTopics() {
    if (!weakTopicsList) return;
    weakTopicsList.innerHTML = '';
    const weakCards = flashcards
        .filter(c => c.difficulty === 'hard')
        .slice(0, 5);
    if (weakCards.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Sin temas difíciles por ahora';
        weakTopicsList.appendChild(li);
        return;
    }
    weakCards.forEach(card => {
        const li = document.createElement('li');
        li.textContent = card.question;
        weakTopicsList.appendChild(li);
    });
}

// ---- Study Heatmap ----
function logReviewResult(difficulty) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const history = JSON.parse(localStorage.getItem('studyHistory') || '{}');
    const entry = history[todayKey] || { reviews: 0, correct: 0 };
    entry.reviews++;
    if (difficulty !== 'hard') entry.correct++;
    history[todayKey] = entry;
    localStorage.setItem('studyHistory', JSON.stringify(history));
}

function getStudyData() {
    const history = JSON.parse(localStorage.getItem('studyHistory') || '{}');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() - 364);
    const data = [];
    for (let i = 0; i < 365; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        const rec = history[key];
        if (rec) {
            const accuracy = rec.reviews ? Math.round((rec.correct / rec.reviews) * 100) : 0;
            data.push({ date: key, reviews: rec.reviews, accuracy });
        } else {
            data.push({ date: key, reviews: 0 });
        }
    }
    return data;
}

function getLevelClass(rev) {
    if (rev >= 11) return 'level-3';
    if (rev >= 6) return 'level-2';
    if (rev >= 1) return 'level-1';
    return 'level-0';
}

function renderStudyHeatmap(data) {
    const container = document.getElementById('study-heatmap');
    const metrics = document.getElementById('heatmap-metrics');
    if (!container || !metrics) return;
    container.innerHTML = '';
    metrics.innerHTML = '';

    const monthsDiv = document.createElement('div');
    monthsDiv.className = 'months';
    const cellsDiv = document.createElement('div');
    cellsDiv.className = 'cells';
    container.appendChild(monthsDiv);
    container.appendChild(cellsDiv);

    let longest = 0;
    let current = 0;
    let total = 0;
    let accSum = 0;
    let accCount = 0;
    const start = new Date(data[0].date);
    const startOffset = start.getDay();
    const monthLabels = [];

    data.forEach((item, idx) => {
        const date = new Date(item.date);
        const week = Math.floor((idx + startOffset) / 7);
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell ' + getLevelClass(item.reviews);
        cell.tabIndex = 0;
        const localDate = date.toLocaleDateString();
        const accText = item.accuracy !== undefined ? ` \u00B7 ${item.accuracy}% de aciertos` : '';
        cell.title = `${item.reviews} repasos el ${localDate}${accText}`;
        cell.style.gridRow = (date.getDay() + 1);
        cell.style.gridColumn = (week + 1);
        cell.addEventListener('click', () => openDayModal(item.date));
        cellsDiv.appendChild(cell);

        if (item.reviews > 0) {
            current += 1;
            longest = Math.max(longest, current);
            total += item.reviews;
            if (item.accuracy !== undefined) {
                accSum += item.accuracy;
                accCount++;
            }
        } else {
            current = 0;
        }

        if ((date.getDate() === 1 || idx === 0) && !monthLabels[week]) {
            monthLabels[week] = date.toLocaleString('default', { month: 'short' });
        }
    });

    for (let i = 0; i < 53; i++) {
        const label = document.createElement('div');
        label.textContent = monthLabels[i] || '';
        monthsDiv.appendChild(label);
    }

    const avgAcc = accCount ? (accSum / accCount).toFixed(1) : 'N/A';
    metrics.innerHTML =
        `<div>Racha actual: ${current} d\xEDas</div>` +
        `<div>Racha hist\xF3rica: ${longest} d\xEDas</div>` +
        `<div>Total de repasos: ${total}</div>` +
        `<div>Exactitud promedio: ${avgAcc}%</div>`;
}

function openDayModal(date) {
    alert(`Tarjetas repasadas el ${new Date(date).toLocaleDateString()}`);
}

function populateSpecialtySelect() {
    if (!newSpecialtySelect) return;
    newSpecialtySelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Especialidad';
    newSpecialtySelect.appendChild(placeholder);
    specialties.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.slug;
        opt.textContent = s.name;
        newSpecialtySelect.appendChild(opt);
    });
}

function renderSpecialtyCards() {
    const grid = document.getElementById('specialty-grid');
    if (!grid) return;
    grid.innerHTML = '';
    specialties.forEach(s => {
        const card = document.createElement('a');
        card.href = `flashcards.html?specialty=${s.slug}`;
        card.className = 'specialty-card';
        const emoji = document.createElement('span');
        emoji.className = 'emoji';
        emoji.textContent = s.emoji;
        const name = document.createElement('span');
        name.textContent = s.name;
        card.appendChild(emoji);
        card.appendChild(name);
        grid.appendChild(card);
    });
}

// Initialize flashcards page
function initFlashcardsPage() {
    populateSpecialtySelect();
    const specialty = getQueryParam("specialty");
    if (specialty) {
        flashcards = allFlashcards.filter(c => c.specialty === specialty);
        if (specialtyTitle) specialtyTitle.textContent = specialtyNames[specialty] || "";
    } else {
        flashcards = allFlashcards;
    }
    currentCardIndex = 0;
    loadTheme();
    updatePendingAndNewCounts();
    updateStats();
    showCard();
    setDifficultyButtonsEnabled(false);
    if (nextBtn) nextBtn.addEventListener('click', showNextCard);
    if (flipBtn) flipBtn.addEventListener('click', flipCard);
    if (addCardBtn) addCardBtn.addEventListener('click', addNewCard);
    if (editCardBtn) editCardBtn.addEventListener('click', editCurrentCard);
    if (deleteCardBtn) deleteCardBtn.addEventListener('click', deleteCurrentCard);
    if (exportBtn) exportBtn.addEventListener('click', exportFlashcards);
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', importFlashcards);
    }
    if (prevBtn) prevBtn.addEventListener("click", showPreviousCard);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
}

function initHomePage() {
    loadTheme();
    renderSpecialtyCards();
    loadProfilePic();
    loadUserName();
    renderProgressChart();
    renderWeakTopics();
    renderStudyHeatmap(getStudyData());
    if (changePicBtn && profilePicInput) {
        changePicBtn.addEventListener('click', () => profilePicInput.click());
        profilePicInput.addEventListener('change', handleProfilePicChange);
    }
    if (changeNameBtn && userNameInput) {
        changeNameBtn.addEventListener('click', () => {
            userNameInput.style.display = 'inline-block';
            userNameInput.focus();
        });
        userNameInput.addEventListener('change', handleNameChange);
    }
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
}

// Load flashcards from localStorage or use sample data
function loadFlashcards() {
    const savedFlashcards = localStorage.getItem('medicalFlashcards');
    if (savedFlashcards) {
        try {
            allFlashcards = JSON.parse(savedFlashcards);
            flashcards = allFlashcards;
        } catch (e) {
            localStorage.removeItem('medicalFlashcards');
            alert('Error al cargar las tarjetas guardadas. Se reinició el almacenamiento.');
            allFlashcards = flashcards;
        }
    } else {
        allFlashcards = flashcards;
    }
    updatePendingAndNewCounts();
}

// Save flashcards to localStorage
function saveFlashcards() {
    localStorage.setItem('medicalFlashcards', JSON.stringify(allFlashcards));
    updatePendingAndNewCounts();
}

// Update pending and new card counts
function updatePendingAndNewCounts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    pendingCards = 0;
    newCards = 0;

    flashcards.forEach(card => {
        if (!card.lastReviewed) {
            newCards++;
        } else if (card.nextReview && new Date(card.nextReview) <= today) {
            pendingCards++;
        }
    });
    
    updateStats();
}

// Update statistics display
function updateStats() {
    if (todayCount) todayCount.textContent = cardsReviewedToday;
    if (pendingCount) pendingCount.textContent = pendingCards;
    if (newCount) newCount.textContent = newCards;
}

// Show current card
function showCard() {
    if (flashcards.length === 0) {
        questionElement.textContent = "No hay tarjetas disponibles. ¡Agrega una nueva!";
        answerElement.textContent = "";
        return;
    }

    const currentCard = flashcards[currentCardIndex];
    questionElement.textContent = currentCard.question;
    if (typeof window.renderMarkdown === 'function') {
        window.renderMarkdown(currentCard.answer, answerElement);
    } else {
        answerElement.textContent = currentCard.answer;
    }

    const categories = ['definicion','epidemiologia','etiologia','fisiopatologia','cuadro-clinico','diagnostico','tratamiento','complicaciones'];
    categories.forEach(c => flashcard.classList.remove(c));
    if (currentCard.category) {
        flashcard.classList.add(currentCard.category);
    }

    // Reset card to front
    if (isFlipped) {
        flashcard.classList.remove('flipped');
        flipBtn.textContent = 'Mostrar Respuesta';
        isFlipped = false;
    }
    setDifficultyButtonsEnabled(false);
    
    // Update navigation buttons
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === flashcards.length - 1;
}

// Show next card
function showNextCard() {
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
        showCard();
    }
}

// Show previous card
function showPreviousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        showCard();
    }
}

// Flip the card
function flipCard() {
    if (flashcards.length === 0) return;
    
    isFlipped = !isFlipped;
    
    if (isFlipped) {
        flashcard.classList.add('flipped');
        flipBtn.textContent = 'Mostrar Pregunta';
        setDifficultyButtonsEnabled(true);
        
        // Mark as reviewed if it's the first time
        const currentCard = flashcards[currentCardIndex];
        if (currentCard.reviewCount === 0) {
            cardsReviewedToday++;
            updateStats();
        }
    } else {
        flashcard.classList.remove('flipped');
        flipBtn.textContent = 'Mostrar Respuesta';
        setDifficultyButtonsEnabled(false);
    }
}

// Set difficulty and schedule next review
function setDifficulty(difficulty) {
    if (flashcards.length === 0 || !isFlipped) return;

    const currentCard = flashcards[currentCardIndex];
    const now = new Date();

    logReviewResult(difficulty);

    // Update card data
    currentCard.difficulty = difficulty;
    currentCard.lastReviewed = now.toISOString();
    currentCard.reviewCount = (currentCard.reviewCount || 0) + 1;
    
    // Calculate next review date based on difficulty
    let daysToAdd = 3;

    if (difficulty === 'easy') {
        daysToAdd = 7;
    } else if (difficulty === 'hard') {
        daysToAdd = 1;
    }
    
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(now.getDate() + daysToAdd);
    currentCard.nextReview = nextReviewDate.toISOString();
    
    // Save and update
    saveFlashcards();
    setDifficultyButtonsEnabled(false);

    renderStudyHeatmap(getStudyData());
    
    // Show next card after a short delay
    setTimeout(() => {
        if (currentCardIndex < flashcards.length - 1) {
            currentCardIndex++;
        } else {
            currentCardIndex = 0;
        }
        showCard();
    }, 500);
}

// Add a new flashcard
function addNewCard() {
    const question = newQuestionInput.value.trim();
    const answer = newAnswerInput.value.trim();
    const specialty = newSpecialtySelect ? newSpecialtySelect.value : '';
    const category = newCategorySelect ? newCategorySelect.value : '';

    if (question && answer && specialty && category) {
        const newCard = {
            question,
            answer,
            specialty,
            difficulty: 'medium',
            category,
            lastReviewed: null,
            nextReview: null,
            reviewCount: 0
        };

        allFlashcards.push(newCard);
        const currentSpecialty = getQueryParam('specialty');
        if (!currentSpecialty || currentSpecialty === specialty) {
            flashcards.push(newCard);
        }
        saveFlashcards();
        
        // Reset form
        newQuestionInput.value = '';
        newAnswerInput.value = '';
        
        // Show the new card
        currentCardIndex = flashcards.length - 1;
        showCard();
    } else {
        alert('Por favor ingresa la pregunta, la respuesta, la especialidad y el rubro.');
    }
}

function editCurrentCard() {
    if (flashcards.length === 0) return;
    const currentCard = flashcards[currentCardIndex];
    const newQuestion = prompt('Editar pregunta:', currentCard.question);
    if (newQuestion === null) return;
    const newAnswer = prompt('Editar respuesta:', currentCard.answer);
    if (newAnswer === null) return;
    currentCard.question = newQuestion.trim();
    currentCard.answer = newAnswer.trim();
    saveFlashcards();
    showCard();
}

function deleteCurrentCard() {
    if (flashcards.length === 0) return;
    const confirmed = confirm('¿Eliminar esta tarjeta?');
    if (!confirmed) return;
    const card = flashcards[currentCardIndex];
    const indexAll = allFlashcards.indexOf(card);
    if (indexAll > -1) allFlashcards.splice(indexAll, 1);
    flashcards.splice(currentCardIndex, 1);
    if (currentCardIndex >= flashcards.length) currentCardIndex = flashcards.length - 1;
    saveFlashcards();
    showCard();
}

function exportFlashcards() {
    const dataStr = JSON.stringify(allFlashcards, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFlashcards(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result);
            if (Array.isArray(data)) {
                allFlashcards = data;
                const currentSpecialty = getQueryParam('specialty');
                flashcards = currentSpecialty ? allFlashcards.filter(c => c.specialty === currentSpecialty) : allFlashcards;
                currentCardIndex = 0;
                saveFlashcards();
                showCard();
            } else {
                alert('Archivo no válido');
            }
        } catch (err) {
            alert('Error al importar');
        }
    };
    reader.readAsText(file);
    importInput.value = '';
}

// Handle keyboard navigation
function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowLeft':
            showPreviousCard();
            break;
        case 'ArrowRight':
            showNextCard();
            break;
        case ' ':
        case 'Enter':
            e.preventDefault();
            flipCard();
            break;
        case '1':
            if (isFlipped) setDifficulty('easy');
            break;
        case '2':
            if (isFlipped) setDifficulty('medium');
            break;
        case '3':
            if (isFlipped) setDifficulty('hard');
            break;
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadFlashcards();
    if (document.querySelector('.home')) {
        initHomePage();
    } else {
        initFlashcardsPage();
    }
});
