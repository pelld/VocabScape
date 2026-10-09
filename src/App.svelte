<script lang="ts">
  import { LANGUAGES } from "./data/languages.js";
  import { SCENES } from "./data/scenes.js";

  type CardState = { correct: number; wrong: number };
  type Level = "ALL" | "A" | "B" | "C";
  type StudyThreshold = null | 50 | 70 | 90;

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
  let availableDecks = decksForLanguage(language);
  let deckIndex = preferredDeckIndex(language, availableDecks);
  let currentDeck = availableDecks[deckIndex];
  let selectedLevel: Level = "ALL";
  let currentIndex = 0;
  let queue: number[] = [];
  let position = 1;
  let round = 1;
  let revealed = false;
  let feedback = "";
  let feedbackTone: "good" | "bad" | "neutral" = "neutral";
  let answerInput: HTMLInputElement;
  let studyThreshold: StudyThreshold = null;
  let filteredCards: any[] = [];
  let progressOpen = false;
  let focusMessage = "";
  let attemptedThisCard = false;
  let selectedCardIds: string[] = [];
  let activeSelectionIds: string[] | null = null;

  $: currentCard = filteredCards[currentIndex] ?? filteredCards[0];
  $: currentTerm = currentCard?.terms?.[language];
  $: deckStats = progressForCards(currentDeck.objects, memory);
  $: seenProgress = deckStats.total ? Math.round((deckStats.seen / deckStats.total) * 100) : 0;
  $: masteredProgress = deckStats.total ? Math.round((deckStats.mastered / deckStats.total) * 100) : 0;
  $: progressRows = progressTableRows(currentDeck.objects, memory);
  $: currentCardStats = currentCard ? cardStats(currentCard, memory) : { attempts: 0, correct: 0, wrong: 0, rate: null };
  $: levelStats = {
    A: progressForCards(cardsForLevel(currentDeck, "A"), memory),
    B: progressForCards(cardsForLevel(currentDeck, "B"), memory),
    C: progressForCards(cardsForLevel(currentDeck, "C"), memory)
  };

  const asset = (file?: string) =>
    !file ? "" : /^(https?:|data:)/.test(file) ? file : `${import.meta.env.BASE_URL}${currentDeck.id}/${file}`;

  function decksForLanguage(code: string) {
    return actionDecks.filter((deck: any) => {
      if (deck.languages) return deck.languages.includes(code);
      return deck.objects.some((card: any) => Boolean(card.terms?.[code]));
    });
  }

  function preferredDeckIndex(code: string, decks: any[]) {
    const preferredId = code === "fr" ? "my-french" : code === "pl" ? "my-polish" : "";
    const index = preferredId ? decks.findIndex((deck: any) => deck.id === preferredId) : -1;
    return index >= 0 ? index : 0;
  }

  function cardsForLevel(deck: any, level: Level) {
    return level === "ALL" ? deck.objects : deck.objects.filter((card: any) => card.level === level);
  }

  function attemptsFor(card: any) {
    const state = memory[stateKey(card)] ?? { correct: 0, wrong: 0 };
    return state.correct + state.wrong;
  }

  function successRate(card: any): number | null {
    const state = memory[stateKey(card)] ?? { correct: 0, wrong: 0 };
    const attempts = state.correct + state.wrong;
    return attempts ? Math.round((state.correct / attempts) * 100) : null;
  }

  function baseCardsForStudy(deck: any, level: Level) {
    const cards = cardsForLevel(deck, level);
    if (!activeSelectionIds) return cards;

    const selected = new Set(activeSelectionIds);
    return cards.filter((card: any) => selected.has(card.id));
  }

  function cardsForStudy(deck: any, level: Level, threshold: StudyThreshold) {
    const cards = baseCardsForStudy(deck, level);
    if (threshold === null) return cards;

    return cards.filter((card: any) => {
      const rate = successRate(card);
      return rate === null || rate < threshold;
    });
  }

  function weaknessScore(card: any, threshold: StudyThreshold) {
    const rate = successRate(card);
    return rate === null ? (threshold ?? 50) : rate;
  }

  function orderedIndices(cards: any[], threshold: StudyThreshold, avoidFirst = -1) {
    if (threshold === null) return shuffledIndices(cards.length, avoidFirst);

    const indices = Array.from({ length: cards.length }, (_, index) => index);
    indices.sort((a, b) => {
      const scoreDifference = weaknessScore(cards[a], threshold) - weaknessScore(cards[b], threshold);
      if (scoreDifference !== 0) return scoreDifference;
      return attemptsFor(cards[b]) - attemptsFor(cards[a]);
    });

    if (indices.length > 1 && indices[0] === avoidFirst) {
      [indices[0], indices[1]] = [indices[1], indices[0]];
    }

    return indices;
  }

  function cardStats(card: any, snapshot: Record<string, CardState> = memory) {
    const state = snapshot[stateKey(card)] ?? { correct: 0, wrong: 0 };
    const attempts = state.correct + state.wrong;

    return {
      attempts,
      correct: state.correct,
      wrong: state.wrong,
      rate: attempts ? Math.round((state.correct / attempts) * 100) : null
    };
  }

  function progressTableRows(cards: any[], snapshot: Record<string, CardState> = memory) {
    return cards
      .map((card: any) => {
        const stats = cardStats(card, snapshot);

        return {
          card,
          target: card.terms?.[language]?.display ?? "",
          ...stats,
          sortScore: stats.rate === null ? 50 : stats.rate
        };
      })
      .sort((a: any, b: any) => a.sortScore - b.sortScore || b.attempts - a.attempts || a.card.concept.localeCompare(b.card.concept));
  }

  function isMastered(card: any, snapshot: Record<string, CardState> = memory) {
    const stats = cardStats(card, snapshot);
    return stats.correct >= 2 && stats.attempts > 0 && stats.correct / stats.attempts >= 0.67;
  }

  function progressForCards(cards: any[], snapshot: Record<string, CardState> = memory) {
    let seen = 0;
    let mastered = 0;
    let correct = 0;
    let wrong = 0;
    let attempts = 0;

    for (const card of cards) {
      const stats = cardStats(card, snapshot);
      if (stats.attempts > 0) seen += 1;
      if (isMastered(card, snapshot)) mastered += 1;
      correct += stats.correct;
      wrong += stats.wrong;
      attempts += stats.attempts;
    }

    return {
      total: cards.length,
      seen,
      mastered,
      correct,
      wrong,
      attempts,
      accuracy: attempts ? Math.round((correct / attempts) * 100) : null
    };
  }

  function normalise(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[łŁ]/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.!?;,:…]/g, "")
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
    const cards = cardsForStudy(currentDeck, selectedLevel, studyThreshold);

    if (cards.length === 0 && studyThreshold !== null) {
      focusMessage = activeSelectionIds
        ? `No selected cards are currently below ${studyThreshold}%, so all selected cards are shown.`
        : `No cards are currently below ${studyThreshold}% in this level, so all cards are shown.`;
      studyThreshold = null;
      filteredCards = baseCardsForStudy(currentDeck, selectedLevel);
    } else {
      focusMessage = "";
      filteredCards = cards;
    }

    const order = orderedIndices(filteredCards, studyThreshold);
    currentIndex = order.shift() ?? 0;
    queue = order;
    position = 1;
    round = 1;
    revealed = false;
    feedback = "";
    feedbackTone = "neutral";
    attemptedThisCard = false;
    if (answerInput) answerInput.value = "";
    focusAnswer();
  }

  function nextCard() {
    if (queue.length === 0) {
      const refreshed = cardsForStudy(currentDeck, selectedLevel, studyThreshold);

      if (refreshed.length) {
        filteredCards = refreshed;
      } else if (studyThreshold !== null) {
        focusMessage = activeSelectionIds
          ? `No selected cards remain below ${studyThreshold}% — showing your full selection.`
          : `No cards remain below ${studyThreshold}% — switching back to all cards.`;
        studyThreshold = null;
        filteredCards = baseCardsForStudy(currentDeck, selectedLevel);
      }

      const order = orderedIndices(filteredCards, studyThreshold, currentIndex);
      currentIndex = order.shift() ?? currentIndex;
      queue = order;
      position = 1;
      round += 1;
    } else {
      currentIndex = queue.shift() ?? currentIndex;
      position += 1;
    }

    revealed = false;
    feedback = "";
    feedbackTone = "neutral";
    attemptedThisCard = false;

    if (answerInput) answerInput.value = "";
    focusAnswer();
  }

  function acceptedAnswers() {
    return currentTerm.looseAnswers.map(normalise);
  }

  function checkAnswer() {
    if (!answerInput?.value.trim() || !currentTerm) return;

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

    attemptedThisCard = true;
    memory = { ...memory };
    saveProgress();
  }

  function revealAnswer() {
    if (!currentTerm) return;

    if (!attemptedThisCard) {
      const state = stateFor(currentCard);
      state.wrong += 1;
      attemptedThisCard = true;
      memory = { ...memory };
      saveProgress();
    }

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
    availableDecks = decksForLanguage(code);
    deckIndex = preferredDeckIndex(code, availableDecks);
    currentDeck = availableDecks[deckIndex];
    selectedLevel = "ALL";
    studyThreshold = null;
    selectedCardIds = [];
    activeSelectionIds = null;
    progressOpen = false;
    resetDeck();
  }

  function switchDeck(index: number) {
    deckIndex = index;
    currentDeck = availableDecks[index];
    selectedLevel = "ALL";
    studyThreshold = null;
    selectedCardIds = [];
    activeSelectionIds = null;
    progressOpen = false;
    resetDeck();
  }

  function switchLevel(level: Level) {
    selectedLevel = level;
    activeSelectionIds = null;
    selectedCardIds = [];
    resetDeck();
  }

  function setStudyThreshold(threshold: StudyThreshold) {
    studyThreshold = threshold;
    resetDeck();
  }

  function studyCard(card: any) {
    selectedLevel = "ALL";
    studyThreshold = null;
    activeSelectionIds = null;
    selectedCardIds = [];
    filteredCards = cardsForLevel(currentDeck, "ALL");
    currentIndex = Math.max(0, filteredCards.findIndex((item: any) => item.id === card.id));
    queue = shuffledIndices(filteredCards.length).filter((index: number) => index !== currentIndex);
    position = 1;
    round = 1;
    revealed = false;
    feedback = "";
    feedbackTone = "neutral";
    attemptedThisCard = false;
    progressOpen = false;
    if (answerInput) answerInput.value = "";
    focusAnswer();
  }

  function openProgress() {
    selectedCardIds = activeSelectionIds
      ? [...activeSelectionIds]
      : currentDeck.objects.map((card: any) => card.id);
    progressOpen = true;
  }

  function toggleCardSelection(cardId: string) {
    selectedCardIds = selectedCardIds.includes(cardId)
      ? selectedCardIds.filter((id) => id !== cardId)
      : [...selectedCardIds, cardId];
  }

  function selectAllCards() {
    selectedCardIds = currentDeck.objects.map((card: any) => card.id);
  }

  function clearCardSelection() {
    selectedCardIds = [];
  }

  function studySelectedCards() {
    if (!selectedCardIds.length) return;

    activeSelectionIds = [...selectedCardIds];
    selectedLevel = "ALL";
    studyThreshold = null;
    progressOpen = false;
    resetDeck();
    focusMessage = `Studying ${activeSelectionIds.length} selected card${activeSelectionIds.length === 1 ? "" : "s"}.`;
  }

  function clearCustomSelection() {
    activeSelectionIds = null;
    selectedCardIds = [];
    selectedLevel = "ALL";
    studyThreshold = null;
    resetDeck();
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && progressOpen) progressOpen = false;
  }

  $: answerKind = currentDeck.id === "polish-numbers" ? "number" : (currentTerm?.display ?? "").trim().replace(/[.!?…]+$/, "").split(/\s+/).length > 1 ? "phrase" : "word";
  $: placeholderText = `Type the ${languages[language]?.name ?? "target language"} ${answerKind}…`;
  $: promptText = currentDeck.id === "polish-numbers" ? "How many? Write the number in Polish" : `Translate this ${answerKind === "word" ? "word" : "phrase"}`;

  resetDeck();
</script>

<svelte:head>
  <title>VocabScape · Visual language cards</title>
  <meta
    name="description"
    content="Learn French, Spanish and Polish with visual flashcards and vocabulary scenes."
  />
</svelte:head>

<svelte:window onkeydown={handleWindowKeydown} />

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
      <div class="language-control">
        <span class="language-label">Language</span>
        <div class="language-switcher" aria-label="Target language">
          {#each Object.entries(languages) as [code, config]}
            <button class:active={language === code} onclick={() => switchLanguage(code)}>
              {config.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </header>

  <main class="card-page">
    <section class="flashcard">
      <div class="flashcard-media" class:text-only-media={currentDeck.textOnly}>
        {#if currentDeck.textOnly || !currentCard?.asset}
          <div class="text-deck-panel">
            <span class="text-deck-kicker">{currentDeck.kicker ?? `${languages[language].name} practice`}</span>
            <h2>{currentDeck.name}</h2>
            <p>{currentDeck.description ?? "A personal deck built from recent practice."}</p>
            <small>{currentDeck.objects.length} cards</small>
          </div>
        {:else}
          <img src={asset(currentCard.asset)} alt={currentCard.concept} draggable="false" />
        {/if}
      </div>

      <div class="flashcard-body">
        <div class="card-meta">
          <div class="deck-switcher" aria-label="Flashcard topic">
            {#each availableDecks as deck, index}
              <button class:active={index === deckIndex} onclick={() => switchDeck(index)}>
                {deck.name}
              </button>
            {/each}
          </div>
          <strong>Card {position} / {filteredCards.length}</strong>
        </div>

        <div class="study-toolbar">
          <span class="round-label">{languages[language].name} · Round {round}</span>

          <div class="level-switcher" aria-label="Difficulty level">
            <button class:active={selectedLevel === "ALL"} onclick={() => switchLevel("ALL")}>All</button>
            {#if levelStats.A.total}
              <button class:active={selectedLevel === "A"} onclick={() => switchLevel("A")} title="Level A · Easy">
                A <small>{levelStats.A.mastered}/{levelStats.A.total}</small>
              </button>
            {/if}
            {#if levelStats.B.total}
              <button class:active={selectedLevel === "B"} onclick={() => switchLevel("B")} title="Level B · Medium">
                B <small>{levelStats.B.mastered}/{levelStats.B.total}</small>
              </button>
            {/if}
            {#if levelStats.C.total}
              <button class:active={selectedLevel === "C"} onclick={() => switchLevel("C")} title="Level C · Hard">
                C <small>{levelStats.C.mastered}/{levelStats.C.total}</small>
              </button>
            {/if}
          </div>
        </div>

        <div class="progress-summary" aria-label="Learning progress">
          <span><strong>{deckStats.seen}</strong>/{deckStats.total} tried</span>
          <span><strong>{deckStats.correct}</strong> correct</span>
          <span><strong>{deckStats.wrong}</strong> incorrect</span>
          <span><strong>{deckStats.accuracy === null ? "—" : `${deckStats.accuracy}%`}</strong> accuracy</span>
          <span><strong>{deckStats.mastered}</strong> secure</span>
          <button class="progress-link" onclick={openProgress}>Details</button>
        </div>

        <div class="learning-progress" aria-label={`${deckStats.seen} seen and ${deckStats.mastered} mastered out of ${deckStats.total}`}>
          <div class="learning-progress-seen" style={`width:${seenProgress}%`}></div>
          <div class="learning-progress-mastered" style={`width:${masteredProgress}%`}></div>
        </div>

        <div class="focus-row">
          <span>Study</span>
          <div class="focus-switcher" aria-label="Study cards by success rate">
            <button class:active={studyThreshold === null} onclick={() => setStudyThreshold(null)}>All</button>
            <button class:active={studyThreshold === 50} onclick={() => setStudyThreshold(50)}>&lt;50%</button>
            <button class:active={studyThreshold === 70} onclick={() => setStudyThreshold(70)}>&lt;70%</button>
            <button class:active={studyThreshold === 90} onclick={() => setStudyThreshold(90)}>&lt;90%</button>
          </div>
          {#if activeSelectionIds}
            <small class="custom-selection-note">{activeSelectionIds.length} selected</small>
            <button class="clear-selection-link" onclick={clearCustomSelection}>All cards</button>
          {:else if studyThreshold !== null}
            <small>{filteredCards.length} cards · weakest first · refreshes next round</small>
          {/if}
        </div>

        {#if currentCardStats.attempts > 0}
          <div class="current-card-progress">
            This card: <strong>{currentCardStats.correct}/{currentCardStats.attempts}</strong>
            {#if currentCardStats.rate !== null}<span>· {currentCardStats.rate}%</span>{/if}
          </div>
        {/if}

        {#if focusMessage}
          <div class="focus-message">{focusMessage}</div>
        {/if}

        <div class="card-prompt">
          <span class="prompt-label">{promptText} <b class="level-badge">Level {currentCard.level ?? "A"}</b></span>
          <h1>{currentCard.concept}</h1>
        </div>

        <div class="answer-row">
          <input
            bind:this={answerInput}
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder={placeholderText}
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

  {#if progressOpen}
    <div class="progress-modal-backdrop" role="presentation" onclick={() => progressOpen = false}>
      <section class="progress-modal" role="dialog" aria-modal="true" aria-label={`${currentDeck.name} progress`} onclick={(event) => event.stopPropagation()}>
        <div class="progress-modal-header">
          <div>
            <span class="eyebrow">{languages[language].name} · {currentDeck.name}</span>
            <h2>Card progress</h2>
            <p>Check records the result immediately. Reveal counts as incorrect if you have not tried the card. Unseen cards are shown as New.</p>
          </div>
          <button class="modal-close" aria-label="Close progress" onclick={() => progressOpen = false}>×</button>
        </div>

        <div class="progress-modal-focus">
          <span>Build a study round:</span>
          <button onclick={() => { setStudyThreshold(50); progressOpen = false; }}>&lt;50%</button>
          <button onclick={() => { setStudyThreshold(70); progressOpen = false; }}>&lt;70%</button>
          <button onclick={() => { setStudyThreshold(90); progressOpen = false; }}>&lt;90%</button>
        </div>

        <div class="progress-selection-bar">
          <span><strong>{selectedCardIds.length}</strong> of {currentDeck.objects.length} selected</span>
          <button onclick={selectAllCards}>Select all</button>
          <button onclick={clearCardSelection}>Clear</button>
          <button class="study-selected-button" disabled={selectedCardIds.length === 0} onclick={studySelectedCards}>
            Study selected
          </button>
        </div>

        <div class="progress-table-wrap">
          <table class="progress-table">
            <thead>
              <tr>
                <th>Card</th>
                <th>Attempts</th>
                <th>Correct</th>
                <th>Incorrect</th>
                <th>Success</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each progressRows as row}
                <tr>
                  <td>
                    <label class="card-selection">
                      <input
                        type="checkbox"
                        checked={selectedCardIds.includes(row.card.id)}
                        onchange={() => toggleCardSelection(row.card.id)}
                      />
                      <span>
                        <strong>{row.card.concept}</strong>
                        <small>{row.target}</small>
                      </span>
                    </label>
                  </td>
                  <td>{row.attempts}</td>
                  <td>{row.correct}</td>
                  <td>{row.wrong}</td>
                  <td>
                    {#if row.rate === null}
                      <span class="rate-new">New</span>
                    {:else}
                      <span class:rate-low={row.rate < 70}>{row.rate}%</span>
                    {/if}
                  </td>
                  <td><button class="study-link" onclick={() => studyCard(row.card)}>Study</button></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  {/if}
</div>
