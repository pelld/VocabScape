<script lang="ts">
  type Tone = "good" | "bad" | "neutral";
  type DeckId = "basics" | "travel" | "sounds";

  type Card = {
    id: string;
    prompt: string;
    answer: string;
    accepted?: string[];
    sound?: string;
    note?: string;
    speak?: string;
  };

  type Deck = {
    id: DeckId;
    name: string;
    kicker: string;
    title: string;
    description: string;
    cards: Card[];
  };

  type CardState = { correct: number; wrong: number };

  const decks: Deck[] = [
    {
      id: "basics",
      name: "First words",
      kicker: "Polski · Start here",
      title: "First words",
      description: "The small set worth being able to produce without thinking.",
      cards: [
        { id: "dzien-dobry", prompt: "Good morning / hello", answer: "Dzień dobry", sound: "jyen DOH-bri", speak: "Dzień dobry" },
        { id: "czesc", prompt: "Hi / bye", answer: "Cześć", sound: "cheshch", speak: "Cześć" },
        { id: "dziekuje", prompt: "Thank you", answer: "Dziękuję", sound: "jen-KOO-yeh", speak: "Dziękuję" },
        { id: "prosze", prompt: "Please / you're welcome / here you are", answer: "Proszę", sound: "PROH-sheh", speak: "Proszę" },
        { id: "przepraszam", prompt: "Sorry / excuse me", answer: "Przepraszam", sound: "psheh-PRAH-sham", speak: "Przepraszam" },
        { id: "nie-mowie", prompt: "I don't speak Polish", answer: "Nie mówię po polsku", sound: "nyeh MOO-vyeh poh POL-skoo", speak: "Nie mówię po polsku" },
        { id: "english", prompt: "Do you speak English?", answer: "Czy mówi pan po angielsku?", accepted: ["Czy mówi pan po angielsku", "Czy mówi pani po angielsku"], sound: "chih MOO-vee pan poh an-GYEL-skoo", note: "Use pani instead of pan when speaking to a woman.", speak: "Czy mówi pan po angielsku?" },
        { id: "poprosze", prompt: "I'd like… / …please", answer: "Poproszę…", accepted: ["Poproszę"], sound: "poh-PROH-sheh", speak: "Poproszę" }
      ]
    },
    {
      id: "travel",
      name: "Out & about",
      kicker: "Polski · Wrocław",
      title: "Out & about",
      description: "Cafés, tickets, paying and getting unstuck.",
      cards: [
        { id: "cost", prompt: "How much does it cost?", answer: "Ile to kosztuje?", sound: "EE-leh toh kosh-TOO-yeh", speak: "Ile to kosztuje?" },
        { id: "toilet", prompt: "Where is the toilet?", answer: "Gdzie jest toaleta?", sound: "g-jyeh yest toh-ah-LEH-tah", speak: "Gdzie jest toaleta?" },
        { id: "tickets", prompt: "Two tickets, please", answer: "Dwa bilety, proszę", sound: "dvah bee-LEH-tih PROH-sheh", speak: "Dwa bilety, proszę" },
        { id: "here", prompt: "For here / eat in", answer: "Na miejscu", sound: "nah MYEY-stsoo", speak: "Na miejscu" },
        { id: "takeaway", prompt: "Takeaway / to go", answer: "Na wynos", sound: "nah VIH-nos", speak: "Na wynos" },
        { id: "card", prompt: "By card, please", answer: "Kartą, proszę", sound: "KAR-tohn PROH-sheh", speak: "Kartą, proszę" },
        { id: "yes", prompt: "Yes", answer: "Tak", sound: "tahk", speak: "Tak" },
        { id: "no", prompt: "No", answer: "Nie", sound: "nyeh", speak: "Nie" }
      ]
    },
    {
      id: "sounds",
      name: "Polish sounds",
      kicker: "Polski · Pronunciation",
      title: "Decode the spelling",
      description: "Learn the recurring sound rules rather than memorising phonetics for every word.",
      cards: [
        { id: "w", prompt: "How is Polish “w” pronounced?", answer: "v", accepted: ["v", "like v"], note: "Wrocław starts with a v sound." },
        { id: "l-stroke", prompt: "How is “ł” pronounced?", answer: "like English w", accepted: ["w", "like w", "english w"], note: "In Wrocław, ł gives the 'w' sound." },
        { id: "j", prompt: "How is Polish “j” pronounced?", answer: "y", accepted: ["y", "like y"], note: "jest ≈ yest." },
        { id: "c", prompt: "How is Polish “c” pronounced?", answer: "ts", accepted: ["ts"], note: "The c in Wrocław is a ts sound." },
        { id: "cz", prompt: "How is “cz” pronounced?", answer: "ch", accepted: ["ch", "like ch"], note: "As in English 'church'." },
        { id: "sz", prompt: "How is “sz” pronounced?", answer: "sh", accepted: ["sh", "like sh"], note: "proszę contains this sound." },
        { id: "rz", prompt: "How are “rz” and “ż” roughly pronounced?", answer: "zh", accepted: ["zh", "like zh"], note: "Like the middle sound in 'measure'." },
        { id: "o-accent", prompt: "How is “ó” pronounced?", answer: "oo", accepted: ["oo", "u", "like oo"], note: "mówię begins roughly MOO…" }
      ]
    }
  ];

  const progressKey = "vocabscape-polish-intro-v2";
  let memory: Record<string, CardState> = {};

  try {
    memory = JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    memory = {};
  }

  let deckIndex = 0;
  let currentDeck = decks[deckIndex];
  let currentIndex = 0;
  let position = 1;
  let round = 1;
  let queue: number[] = [];
  let answer = "";
  let revealed = false;
  let feedback = "";
  let feedbackTone: Tone = "neutral";
  let answerInput: HTMLInputElement;

  $: currentCard = currentDeck.cards[currentIndex];
  $: progress = Math.round((position / currentDeck.cards.length) * 100);
  $: stats = deckStats(currentDeck);

  function normalise(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[łŁ]/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.!?,;:…“”"'’]/g, "")
      .replace(/\s+/g, " ");
  }

  function shuffledIndices(length: number, avoidFirst = -1) {
    const indices = Array.from({ length }, (_, index) => index);

    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    if (indices.length > 1 && indices[0] === avoidFirst) {
      [indices[0], indices[1]] = [indices[1], indices[0]];
    }

    return indices;
  }

  function stateFor(card: Card) {
    if (!memory[card.id]) memory[card.id] = { correct: 0, wrong: 0 };
    return memory[card.id];
  }

  function isMastered(card: Card) {
    const state = stateFor(card);
    const attempts = state.correct + state.wrong;
    return state.correct >= 2 && attempts > 0 && state.correct / attempts >= 0.67;
  }

  function deckStats(deck: Deck) {
    let seen = 0;
    let mastered = 0;
    let correct = 0;
    let attempts = 0;

    for (const card of deck.cards) {
      const state = stateFor(card);
      const cardAttempts = state.correct + state.wrong;
      if (cardAttempts) seen += 1;
      if (isMastered(card)) mastered += 1;
      correct += state.correct;
      attempts += cardAttempts;
    }

    return {
      seen,
      mastered,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0
    };
  }

  function saveProgress() {
    localStorage.setItem(progressKey, JSON.stringify(memory));
  }

  function focusAnswer() {
    window.setTimeout(() => answerInput?.focus(), 0);
  }

  function resetDeck() {
    const order = shuffledIndices(currentDeck.cards.length);
    currentIndex = order.shift() ?? 0;
    queue = order;
    position = 1;
    round = 1;
    clearCard();
  }

  function clearCard() {
    answer = "";
    revealed = false;
    feedback = "";
    feedbackTone = "neutral";
    focusAnswer();
  }

  function switchDeck(index: number) {
    deckIndex = index;
    currentDeck = decks[index];
    resetDeck();
  }

  function checkAnswer() {
    if (!answer.trim()) return;

    const accepted = currentCard.accepted ?? [currentCard.answer];
    const correct = accepted.some((candidate) => normalise(candidate) === normalise(answer));
    const state = stateFor(currentCard);

    if (correct) {
      state.correct += 1;
      feedback = currentCard.answer;
      feedbackTone = "good";
      revealed = true;
    } else {
      state.wrong += 1;
      feedback = "Not quite.";
      feedbackTone = "bad";
    }

    memory = { ...memory };
    saveProgress();
  }

  function revealAnswer() {
    revealed = true;
    feedback = currentCard.answer;
    feedbackTone = "neutral";
  }

  function nextCard() {
    if (!queue.length) {
      queue = shuffledIndices(currentDeck.cards.length, currentIndex);
      position = 0;
      round += 1;
    }

    currentIndex = queue.shift() ?? currentIndex;
    position += 1;
    clearCard();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      if (revealed) nextCard();
      else checkAnswer();
    }
  }

  function bestPolishVoice() {
    const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("pl"));
    if (!voices.length) return undefined;

    const preferred = /(natural|online|google|zofia|marek)/i;
    return voices.find((voice) => preferred.test(voice.name)) ?? voices[0];
  }

  function speakPolish() {
    if (!currentCard.speak || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentCard.speak);
    const voice = bestPolishVoice();

    if (voice) utterance.voice = voice;
    utterance.lang = "pl-PL";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  resetDeck();
</script>

<main class="card-page polish-card-page">
  <section class="flashcard polish-flashcard">
    <div class="flashcard-media text-only-media polish-card-media">
      <div class="text-deck-panel polish-deck-panel">
        <span class="text-deck-kicker">{currentDeck.kicker}</span>
        <h2>{currentDeck.title}</h2>
        <p>{currentDeck.description}</p>

        {#if currentDeck.id === "basics"}
          <div class="polish-place-word">
            <strong>Wrocław</strong>
            <span>VROT-swahf</span>
          </div>
        {:else if currentDeck.id === "travel"}
          <div class="polish-place-word">
            <strong>Poproszę…</strong>
            <span>“I’d like… / …please”</span>
          </div>
        {:else}
          <div class="polish-place-word sounds-word">
            <strong>w · ł · j · c · cz · sz · rz · ó</strong>
            <span>Small rules, lots of words.</span>
          </div>
        {/if}

        <small>{currentDeck.cards.length} cards · Polish introduction</small>
      </div>
    </div>

    <div class="flashcard-body">
      <div class="card-meta">
        <div class="deck-switcher" aria-label="Polish topic">
          {#each decks as deck, index}
            <button class:active={index === deckIndex} onclick={() => switchDeck(index)}>{deck.name}</button>
          {/each}
        </div>
        <strong>Card {position} / {currentDeck.cards.length}</strong>
      </div>

      <div class="study-toolbar">
        <span class="round-label">Polish · Round {round}</span>
      </div>

      <div class="progress-summary" aria-label="Learning progress">
        <span><strong>{stats.seen}</strong>/{currentDeck.cards.length} seen</span>
        <span><strong>{stats.mastered}</strong> mastered</span>
        <span><strong>{stats.accuracy}%</strong> accuracy</span>
      </div>

      <div class="card-progress" aria-hidden="true">
        <div class="card-progress-fill" style={`width:${progress}%`}></div>
      </div>

      <div class="card-prompt">
        <span class="prompt-label">{currentDeck.id === "sounds" ? "Answer the pronunciation question" : "Translate into Polish"}</span>
        <h1>{currentCard.prompt}</h1>

        {#if revealed}
          <div class="polish-reveal">
            {#if currentCard.sound}<span class="pronunciation">{currentCard.sound}</span>{/if}
            {#if currentCard.note}<p>{currentCard.note}</p>{/if}
            {#if currentCard.speak}
              <button class="polish-audio-button" onclick={speakPolish}>▶ Hear Polish <small>computer voice</small></button>
            {/if}
          </div>
        {/if}
      </div>

      <div class="answer-row">
        <input
          bind:this={answerInput}
          bind:value={answer}
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder={currentDeck.id === "sounds" ? "Type the sound…" : "Type the Polish…"}
          onkeydown={handleKeydown}
        />
        <button class="primary" onclick={checkAnswer}>Check</button>
      </div>

      <div class="feedback" class:good={feedbackTone === "good"} class:bad={feedbackTone === "bad"}>
        {feedback}
      </div>

      <div class="card-actions">
        <button class="quiet" onclick={revealAnswer}>Reveal answer</button>
        <button class="next-button" onclick={nextCard}>Next card</button>
      </div>
    </div>
  </section>
</main>
