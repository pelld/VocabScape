<script lang="ts">
  import { LANGUAGES } from "./data/languages.js";
  import { SCENES } from "./data/scenes.js";

  type CardState = { correct: number; wrong: number };

  const languages: Record<string, any> = LANGUAGES;
  const actionDecks: any[] = SCENES.filter((scene: any) => scene.kind === "action");

  const progressKey = "vocabscape-card-progress-v2";

  let memory: Record<string, CardState> = {};
  try {
    memory = JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    memory = {};
  }

  let language = "fr";

  let deckIndex = 0;
  let currentDeck = actionDecks[deckIndex];
  let currentIndex = 0;
  let queue: number[] = [];
  let position = 1;
  let round = 1;
  let revealed = false;
  let feedback = "";
  let feedbackTone: "good" | "bad" | "neutral" = "neutral";
  let answerInput: HTMLInputElement;


  $: currentCard = currentDeck.objects[currentIndex];
  $: currentTerm = currentCard.terms[language];
  $: roundProgress = Math.round((position / currentDeck.objects.length) * 100);

  const asset = (file: string) =>
    file.startsWith("http") ? file : `${import.meta.env.BASE_URL}${currentDeck.id}/${file}`;

  function normalise(value: string) {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.!?;,]/g, "")
      .replace(/[’']/g, "'")
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

  function stateKey(card: any) {
    return `${language}:${card.id}`;
  }

  function stateFor(card: any): CardState {
    const key = stateKey(card);
    if (!memory[key]) memory[key] = { correct: 0, wrong: 0 };
    return memory[key];
  }

  function saveProgress() {
    localStorage.setItem(progressKey, JSON.stringify(memory));
  }

  function focusAnswer() {
    window.setTimeout(() => answerInput?.focus(), 0);
  }

  function resetDeck() {
    const order = shuffledIndices(currentDeck.objects.length);
    currentIndex = order.shift() ?? 0;
    queue = order;
    position = 1;
    round = 1;
    revealed = false;
    feedback = "";
    feedbackTone = "neutral";
    if (answerInput) answerInput.value = "";
    focusAnswer();
  }

  function nextCard() {
    if (queue.length === 0) {
      queue = shuffledIndices(currentDeck.objects.length, currentIndex);
      position = 0;
      round += 1;
    }

    currentIndex = queue.shift() ?? currentIndex;
    position += 1;
    revealed = false;
    feedback = "";
    feedbackTone = "neutral";

    if (answerInput) answerInput.value = "";
    focusAnswer();
  }

  function acceptedAnswers() {
    return currentTerm.looseAnswers.map(normalise);
  }

  function checkAnswer() {
    if (!answerInput?.value.trim()) return;

    const state = stateFor(currentCard);
    const correct = acceptedAnswers().includes(normalise(answerInput.value));

    if (correct) {
      state.correct += 1;
      feedback = currentTerm.display;
      feedbackTone = "good";
      revealed = true;
    } else {
      state.wrong += 1;
      feedback = "Not quite.";
      feedbackTone = "bad";
    }

    saveProgress();
  }

  function revealAnswer() {
    revealed = true;
    feedback = currentTerm.display;
    feedbackTone = "neutral";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      if (revealed) nextCard();
      else checkAnswer();
    }
  }

  function switchLanguage(code: string) {
    language = code;
    resetDeck();
  }

  function switchDeck(index: number) {
    deckIndex = index;
    currentDeck = actionDecks[index];
    resetDeck();
  }

  resetDeck();
</script>

<svelte:head>
  <title>VocabScape · Visual language cards</title>
  <meta
    name="description"
    content="Learn French and Spanish from visual flashcards and vocabulary scenes."
  />
</svelte:head>

<div class="app-shell">
  <header class="topbar">
    <a class="brand" href={import.meta.env.BASE_URL} aria-label="VocabScape home">
      <span class="brand-mark">V</span>
      <span>
        <strong>VocabScape</strong>
        <small>See it. Say it.</small>
      </span>
    </a>

    <div class="top-actions">
      <div class="language-switcher" aria-label="Target language">
        {#each Object.entries(languages) as [code, config]}
          <button class:active={language === code} onclick={() => switchLanguage(code)}>
            {config.nativeName}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <main class="card-page">
      <section class="flashcard">
        <div class="flashcard-media">
          <img src={asset(currentCard.asset)} alt={currentCard.concept} draggable="false" />
        </div>

        <div class="flashcard-body">
          <div class="card-meta">
            <div class="deck-switcher" aria-label="Flashcard topic">
              {#each actionDecks as deck, index}
                <button class:active={index === deckIndex} onclick={() => switchDeck(index)}>
                  {deck.name}
                </button>
              {/each}
            </div>
            <strong>Card {position} / {currentDeck.objects.length}</strong>
          </div>

          <span class="round-label">{languages[language].name} · Round {round}</span>

          <div class="card-progress" aria-hidden="true">
            <div class="card-progress-fill" style={`width:${roundProgress}%`}></div>
          </div>

          <div class="card-prompt">
            <span class="prompt-label">Translate this sentence</span>
            <h1>{currentCard.concept}</h1>
          </div>

          <div class="answer-row">
            <input
              bind:this={answerInput}
              type="text"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              placeholder={language === "fr" ? "Type the French sentence…" : "Type the Spanish sentence…"}
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

</div>
