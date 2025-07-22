interface Flashcard {
    question: string;
    answer: string;
    specialty: string;
    difficulty: string;
    category: string;
    lastReviewed: string | null;
    nextReview: string | null;
    reviewCount: number;
    efactor?: number;
    repetitions?: number;
    interval?: number;
    quality?: number;
}

interface Topic {
    id: string;
    name: string;
    specialty: string;
    total: number;
    reviews: number;
    errors: number;
    mastery: number;
}
