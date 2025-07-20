// Sample medical flashcards data
let flashcards = [
    {
        question: "¿Qué es la hipertensión arterial?",
        answer: "Es una condición médica en la que la presión arterial es persistentemente elevada, generalmente definida como una presión sistólica de 140 mmHg o más y/o una presión diastólica de 90 mmHg o más.",
        specialty: "medicina-interna",
        difficulty: "medium",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuáles son los signos vitales principales?",
        answer: "1. Temperatura corporal\n2. Frecuencia cardíaca (pulso)\n3. Presión arterial\n4. Frecuencia respiratoria\n5. Saturación de oxígeno",
        specialty: "medicina-interna",
        difficulty: "easy",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Qué es el síndrome de Cushing?",
        answer: "Es un trastorno hormonal causado por la exposición prolongada a niveles altos de cortisol. Los síntomas incluyen obesidad central, cara de luna llena, joroba de búfalo, estrías violáceas, hipertensión y diabetes mellitus.",
        specialty: "medicina-interna",
        difficulty: "hard",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la causa más frecuente de bronquiolitis?",
        answer: "Virus sincitial respiratorio",
        specialty: "pediatria",
        difficulty: "medium",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Edad gestacional para tamizaje de diabetes gestacional?",
        answer: "Entre las semanas 24 y 28 de gestación.",
        specialty: "gineco-obstetricia",
        difficulty: "medium",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la tríada de la colecistitis aguda?",
        answer: "Dolor en cuadrante superior derecho, fiebre y leucocitosis.",
        specialty: "cirugia",
        difficulty: "medium",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuál es la secuencia primaria de la evaluación en ATLS?",
        answer: "A - Vía aérea con control cervical, B - Respiración, C - Circulación, D - Déficit neurológico, E - Exposición.",
        specialty: "atls",
        difficulty: "easy",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Dosis de adrenalina en paro cardiaco durante RCP?",
        answer: "1 mg IV cada 3-5 minutos.",
        specialty: "acls",
        difficulty: "easy",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    }
];

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
const themeToggle = document.getElementById('theme-toggle');
const specialtyTitle = document.getElementById("specialty-title");

const specialtyNames = {"medicina-interna":"Medicina Interna","pediatria":"Pediatría","gineco-obstetricia":"Ginecología y Obstetricia","cirugia":"Cirugía","atls":"ATLS","acls":"ACLS"};
// App state
let currentCardIndex = 0;
let cardsReviewedToday = 0;
let pendingCards = 0;
let newCards = 0;
let isFlipped = false;

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = 'Modo Día';
    }
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? 'Modo Día' : 'Modo Noche';
}

// Initialize the app
function init() {
    loadFlashcards();
    const specialty = getQueryParam("specialty");
    if (specialty) {
        flashcards = flashcards.filter(c => c.specialty === specialty);
        if (specialtyTitle) specialtyTitle.textContent = specialtyNames[specialty] || "";
    }
    loadTheme();
    updatePendingAndNewCounts();
    updateStats();
    showCard();
    nextBtn.addEventListener('click', showNextCard);
    flipBtn.addEventListener('click', flipCard);
    addCardBtn.addEventListener('click', addNewCard);
    prevBtn.addEventListener("click", showPreviousCard);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Difficulty buttons
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
}

// Load flashcards from localStorage or use sample data
function loadFlashcards() {
    const savedFlashcards = localStorage.getItem('medicalFlashcards');
    if (savedFlashcards) {
        flashcards = JSON.parse(savedFlashcards);
    }
    updatePendingAndNewCounts();
}

// Save flashcards to localStorage
function saveFlashcards() {
    localStorage.setItem('medicalFlashcards', JSON.stringify(flashcards));
    updatePendingAndNewCounts();
}

// Update pending and new card counts
function updatePendingAndNewCounts() {
    const today = new Date().toDateString();
    pendingCards = 0;
    newCards = 0;
    
    flashcards.forEach(card => {
        if (!card.lastReviewed) {
            newCards++;
        } else if (card.nextReview && new Date(card.nextReview).toDateString() <= today) {
            pendingCards++;
        }
    });
    
    updateStats();
}

// Update statistics display
function updateStats() {
    todayCount.textContent = cardsReviewedToday;
    pendingCount.textContent = pendingCards;
    newCount.textContent = newCards;
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
    answerElement.textContent = currentCard.answer;
    
    // Reset card to front
    if (isFlipped) {
        flashcard.classList.remove('flipped');
        flipBtn.textContent = 'Mostrar Respuesta';
        isFlipped = false;
    }
    
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
        
        // Mark as reviewed if it's the first time
        const currentCard = flashcards[currentCardIndex];
        if (currentCard.reviewCount === 0) {
            cardsReviewedToday++;
            updateStats();
        }
    } else {
        flashcard.classList.remove('flipped');
        flipBtn.textContent = 'Mostrar Respuesta';
    }
}

// Set difficulty and schedule next review
function setDifficulty(difficulty) {
    if (flashcards.length === 0 || !isFlipped) return;
    
    const currentCard = flashcards[currentCardIndex];
    const now = new Date();
    
    // Update card data
    currentCard.difficulty = difficulty;
    currentCard.lastReviewed = now.toISOString();
    currentCard.reviewCount = (currentCard.reviewCount || 0) + 1;
    
    // Calculate next review date based on difficulty
    let daysToAdd = 1; // Default for easy
    
    if (difficulty === 'medium') {
        daysToAdd = 3;
    } else if (difficulty === 'hard') {
        daysToAdd = 7;
    }
    
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(now.getDate() + daysToAdd);
    currentCard.nextReview = nextReviewDate.toISOString();
    
    // Save and update
    saveFlashcards();
    
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
    
    if (question && answer) {
        const newCard = {
            question,
            answer,
            difficulty: 'medium',
            lastReviewed: null,
            nextReview: null,
            reviewCount: 0
        };
        
        flashcards.push(newCard);
        saveFlashcards();
        
        // Reset form
        newQuestionInput.value = '';
        newAnswerInput.value = '';
        
        // Show the new card
        currentCardIndex = flashcards.length - 1;
        showCard();
    } else {
        alert('Por favor ingresa tanto la pregunta como la respuesta.');
    }
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
document.addEventListener('DOMContentLoaded', init);
