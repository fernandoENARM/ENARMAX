// Sample medical flashcards data
let flashcards = [
    {
        question: "¿Qué es la hipertensión arterial?",
        answer: "Es una condición médica en la que la presión arterial en las arterias es persistentemente elevada, generalmente definida como una presión sistólica de 140 mmHg o más y/o una presión diastólica de 90 mmHg o más.",
        difficulty: "medium",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Cuáles son los signos vitales principales?",
        answer: "1. Temperatura corporal\n2. Frecuencia cardíaca (pulso)\n3. Presión arterial\n4. Frecuencia respiratoria\n5. Saturación de oxígeno",
        difficulty: "easy",
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0
    },
    {
        question: "¿Qué es el síndrome de Cushing?",
        answer: "Es un trastorno hormonal causado por la exposición prolongada a niveles altos de cortisol. Los síntomas incluyen obesidad central, cara de luna llena, joroba de búfalo, estrías violáceas, hipertensión y diabetes mellitus.",
        difficulty: "hard",
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

// App state
let currentCardIndex = 0;
let cardsReviewedToday = 0;
let pendingCards = 0;
let newCards = 0;
let isFlipped = false;

// Initialize the app
function init() {
    loadFlashcards();
    updateStats();
    showCard();
    
    // Event listeners
    prevBtn.addEventListener('click', showPreviousCard);
    nextBtn.addEventListener('click', showNextCard);
    flipBtn.addEventListener('click', flipCard);
    addCardBtn.addEventListener('click', addNewCard);
    
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
