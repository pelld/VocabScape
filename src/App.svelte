<script lang="ts">
  import GardenPhotoScene from "./lib/GardenPhotoScene.svelte";
  import SceneView from "./lib/SceneView.svelte";
  import { LANGUAGES } from "./data/languages.js";
  import { SCENES } from "./data/scenes.js";

  type View = "cards" | "explore";
  type CardState = { correct: number; wrong: number };

  const languages: Record<string, any> = LANGUAGES;
  const actionDeck: any = SCENES.find((scene: any) => scene.id === "action-garden");
  const exploreScenes: any[] = SCENES.filter((scene: any) => scene.id === "garden" || scene.id === "kitchen");

  const progressKey = "vocabscape-card-progress-v2";
  const languageKey = "vocabscape-language";

  let memory: Record<string, CardState> = {};
  try {
    memory = JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    memory = {};
  }

  let language = "fr";

  let view: View = "cards";
  let currentIndex = 0;
  let queue: number[] = [];
  let position = 1;
  let round = 1;
  let revealed = false;
  let feedback = "";
  let feedbackTone: "good" | "bad" | "neutral" = "neutral";
  let answerInput: HTMLInputElement;

  let exploreIndex = 0;
  let showOutlines = false;

  $: currentCard = actionDeck.objects[currentIndex];
  $: currentTerm = currentCard.terms[language];
  $: currentExploreScene = exploreScenes[exploreIndex];
  $: roundProgress = Math.round((position / actionDeck.objects.length) * 100);

  const asset = (file: string) => `${import.meta.env.BASE_URL}action-garden/${file}`;

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
    const order = shuffledIndices(actionDeck.objects.length);
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
      queue = shuffledIndices(actionDeck.objects.length, currentIndex);
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

  function switchView(nextView: View) {
    view = nextView;
    if (view === "cards") focusAnswer();
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
      <div class="view-switcher" aria-label="Study view">
        <button class:active={view === "cards"} onclick={() => switchView("cards")}>Cards</button>
        <button class:active={view === "explore"} onclick={() => switchView("explore")}>Explore</button>
      </div>

      <div class="language-switcher" aria-label="Target language">
        {#each Object.entries(languages) as [code, config]}
          <button class:active={language === code} onclick={() => switchLanguage(code)}>
            {config.nativeName}
          </button>
        {/each}
      </div>
    </div>
  </header>

  {#if view === "cards"}
    <main class="card-page">
      <section class="flashcard">
        <div class="flashcard-media">
          <img src={asset(currentCard.asset)} alt={currentCard.concept} draggable="false" />
        </div>

        <div class="flashcard-body">
          <div class="card-meta">
            <div>
              <span class="eyebrow">{languages[language].name} · Garden actions</span>
              <span class="round-label">Round {round}</span>
            </div>
            <strong>Card {position} / {actionDeck.objects.length}</strong>
          </div>

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
  {:else}
    <main class="explore-page">
      <section class="explore-heading">
        <div>
          <div class="eyebrow">{languages[language].name} · Explore</div>
          <h1>{currentExploreScene.name}</h1>
          <p>Click objects in the scene to reveal their vocabulary.</p>
        </div>

        <div class="scene-tabs">
          {#each exploreScenes as scene, index}
            <button class:active={index === exploreIndex} onclick={() => (exploreIndex = index)}>
              {scene.name}
            </button>
          {/each}
        </div>
      </section>

      {#if currentExploreScene.id === "garden"}
        <GardenPhotoScene
          scene={currentExploreScene}
          {language}
          mode="explore"
          currentIndex={0}
          showAll={showOutlines}
          masteredIds={new Set()}
          onhit={() => {}}
        />
      {:else}
        <SceneView
          scene={currentExploreScene}
          {language}
          mode="explore"
          currentIndex={0}
          showAll={showOutlines}
          masteredIds={new Set()}
          onhit={() => {}}
        />
      {/if}

      <label class="outline-toggle">
        <input type="checkbox" bind:checked={showOutlines} />
        Show object outlines
      </label>
    </main>
  {/if}
</div>
