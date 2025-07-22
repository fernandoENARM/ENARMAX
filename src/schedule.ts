// @ts-nocheck
(function(){
  window.scheduleCard = function scheduleCard(card: Flashcard, quality: number){
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
  };
})();
