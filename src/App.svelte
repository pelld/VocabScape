<script lang="ts">
  import SceneView from "./lib/SceneView.svelte";
  import { LANGUAGES } from "./data/languages.js";
  import { SCENES } from "./data/scenes.js";

  type Mode = "type" | "click" | "explore";
  type WordState = { correct: number; wrong: number; mastered: boolean };

  const languages: Record<string, any> = LANGUAGES;
  const scenes: any[] = SCENES;
  const progressKey = "vocabscape-progress-v1";
  const languageKey = "vocabscape-language";

  let memory: Record<string, WordState> = {};
  try {
    memory = JSON.parse(localStorage.getItem(progressKey) || "{}");
  } catch {
    memory = {};
  }

  let language = localStorage.getItem(languageKey) || "fr";
  if (!languages[language]) language = Object.keys(languages)[0];

  let sceneIndex = 0;
  let currentIndex = 0;
  let mode: Mode = "type";
  let strictMode = Boolean(languages[language].strictDefault);
  let showAll = false;
  let feedback = "";
  let feedbackTone: "good" | "bad" | "neutral" = "neutral";
  let sessionCorrect = 0;
  let sessionAttempts = 0;
  let countedCurrent = false;
  let answerInput: HTMLInputElement;

  $: currentScene = scenes[sceneIndex];
  $: currentObject = currentScene.objects[currentIndex];
  $: currentTerm = currentObject.terms[language];
  $: strictAvailable = Boolean(languages[language].strictLabel);
  $: sceneMastered = currentScene.objects.filter((object: any) => stateFor(object).mastered).length;
  $: sceneProgress = Math.round((sceneMastered / Math.max(1, currentScene.objects.length)) * 100);
  $: allObjects = scenes.flatMap((scene: any) => scene.objects);
  $: languageKeys = [...new Set(allObjects.map((object: any) => memoryKey(object)))];
  $: globalMastered = languageKeys.filter((key: string) => memory[key]?.mastered).length;
  $: masteredIds = new Set(
    currentScene.objects.filter((object: any) => stateFor(object).mastered).map((object: any) => object.id)
  );

  function normalise(value: string) {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, "'")
      .replace(/\s+/g, " ");
  }

  function memoryKey(object: any) {
    return `${language}:${object.id}`;
  }

  function stateFor(object: any): WordState {
    const key = memoryKey(object);
    if (!memory[key]) memory[key] = { correct: 0, wrong: 0, mastered: false };
    return memory[key];
  }

  function save() {
    localStorage.setItem(progressKey, JSON.stringify(memory));
  }

  function clearFeedback() {
    feedback = "";
    feedbackTone = "neutral";
  }

  function focusAnswer() {
    if (mode === "type") window.setTimeout(() => answerInput?.focus(), 0);
  }

  function switchLanguage(code: string) {
    language = code;
    localStorage.setItem(languageKey, language);
    strictMode = Boolean(languages[language].strictDefault);
    currentIndex = 0;
    sessionCorrect = 0;
    sessionAttempts = 0;
    countedCurrent = false;
    clearFeedback();
    focusAnswer();
  }

  function switchScene(index: number) {
    sceneIndex = index;
    currentIndex = 0;
    countedCurrent = false;
    clearFeedback();
    focusAnswer();
  }

  function switchMode(nextMode: Mode) {
    mode = nextMode;
    countedCurrent = false;
    clearFeedback();
    focusAnswer();
  }

  function acceptedAnswers() {
    const answers = strictMode && strictAvailable ? currentTerm.strictAnswers : currentTerm.looseAnswers;
    return answers.map(normalise);
  }

  function checkTyped() {
    if (mode !== "type" || !answerInput?.value.trim()) return;

    sessionAttempts += 1;
    const correct = acceptedAnswers().includes(normalise(answerInput.value));

    if (correct) {
      if (!countedCurrent) {
        const state = stateFor(currentObject);
        state.correct += 1;
        state.mastered = true;
        sessionCorrect += 1;
        countedCurrent = true;
        save();
      }

      feedback = `Correct — ${currentTerm.display}`;
      feedbackTone = "good";
      window.setTimeout(nextQuestion, 650);
    } else {
      stateFor(currentObject).wrong += 1;
      save();
      feedback = strictMode && languages[language].strictHint
        ? `Not quite. ${languages[language].strictHint}`
        : "Not quite. Try again.";
      feedbackTone = "bad";
    }
  }

  function handleSceneHit(index: number) {
    if (mode === "type") {
      currentIndex = index;
      countedCurrent = false;
      clearFeedback();
      focusAnswer();
      return;
    }

    if (mode !== "click") return;

    sessionAttempts += 1;

    if (index === currentIndex) {
      const state = stateFor(currentObject);
      state.correct += 1;
      state.mastered = true;
      sessionCorrect += 1;
      save();
      feedback = `Correct — ${currentTerm.display}`;
      feedbackTone = "good";
      window.setTimeout(nextQuestion, 650);
    } else {
      stateFor(currentObject).wrong += 1;
      save();
      feedback = "Not that one — try again.";
      feedbackTone = "bad";
    }
  }

  function nextQuestion() {
    if (currentScene.objects.length < 2) return;

    const ranked = currentScene.objects
      .map((object: any, index: number) => {
        const state = stateFor(object);
        return { index, score: state.correct * 2 - state.wrong * 2 + (state.mastered ? 4 : 0) };
      })
      .filter((item: any) => item.index !== currentIndex)
      .sort((a: any, b: any) => a.score - b.score || Math.random() - 0.5);

    const pool = ranked.slice(0, Math.max(3, Math.ceil(ranked.length / 2)));
    currentIndex = pool[Math.floor(Math.random() * pool.length)].index;
    countedCurrent = false;
    if (answerInput) answerInput.value = "";
    clearFeedback();
    focusAnswer();
  }

  function showAnswer() {
    feedback = currentTerm.display;
    feedbackTone = "neutral";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") checkTyped();
  }
</script>

<svelte:head>
  <title>VocabScape · {currentScene.name}</title>
</svelte:head>

<div class="app-shell">
  <header class="topbar">
    <a class="brand" href={import.meta.env.BASE_URL} aria-label="VocabScape home">
      <span class="brand-mark">V</span>
      <span>
        <strong>VocabScape</strong>
        <small>Learn words where they live</small>
      </span>
    </a>

    <div class="language-switcher" aria-label="Target language">
      {#each Object.entries(languages) as [code, config]}
        <button class:active={language === code} onclick={() => switchLanguage(code)}>
          {config.nativeName}
        </button>
      {/each}
    </div>
  </header>

  <main class="layout">
    <nav class="scene-nav" aria-label="Scenes">
      <div class="eyebrow">Scenes</div>

      {#each scenes as scene, index}
        <button class="scene-link" class:active={index === sceneIndex} onclick={() => switchScene(index)}>
          <span>{scene.name}</span>
          <small>{scene.objects.length} objects</small>
        </button>
      {/each}

      <div class="nav-progress">
        <span>Language progress</span>
        <strong>{globalMastered}/{languageKeys.length}</strong>
      </div>
    </nav>

    <section class="content">
      <div class="scene-heading">
        <div>
          <div class="eyebrow">{languages[language].name} · visual vocabulary</div>
          <h1>{currentScene.name}</h1>
          <p>{currentScene.objects.length} objects in this scene</p>
        </div>

        <div class="mode-switcher" aria-label="Practice mode">
          <button class:active={mode === "type"} onclick={() => switchMode("type")}>Type</button>
          <button class:active={mode === "click"} onclick={() => switchMode("click")}>Click</button>
          <button class:active={mode === "explore"} onclick={() => switchMode("explore")}>Explore</button>
        </div>
      </div>

      <div class="progress-row">
        <div class="progress-track" aria-label="Scene progress">
          <div class="progress-fill" style={`width:${sceneProgress}%`}></div>
        </div>
        <span>{sceneMastered}/{currentScene.objects.length} learned</span>
      </div>

      <SceneView
        scene={currentScene}
        {language}
        {mode}
        {currentIndex}
        {showAll}
        {masteredIds}
        onhit={handleSceneHit}
      />

      <div class="practice-grid">
        <section class="practice-card">
          {#if mode === "type"}
            <span class="prompt-label">What is the highlighted object in {languages[language].name}?</span>
            <h2>{currentObject.concept}</h2>

            <div class="answer-row">
              <input
                bind:this={answerInput}
                type="text"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder="Type the word…"
                onkeydown={handleKeydown}
              />
              <button class="primary" onclick={checkTyped}>Check</button>
            </div>
          {:else if mode === "click"}
            <span class="prompt-label">Find this in the picture</span>
            <h2>{currentTerm.display}</h2>
            <p class="supporting">Click the {currentObject.concept}.</p>
          {:else}
            <span class="prompt-label">Explore the scene</span>
            <h2>Click anything outlined</h2>
            <p class="supporting">The {languages[language].name} word will appear on the picture.</p>
          {/if}

          {#if mode !== "explore"}
            <div class="feedback" class:good={feedbackTone === "good"} class:bad={feedbackTone === "bad"}>
              {feedback}
            </div>

            <div class="practice-actions">
              <button class="quiet" onclick={showAnswer}>Show answer</button>
              <button class="quiet" onclick={nextQuestion}>Next</button>
            </div>
          {/if}
        </section>

        <aside class="settings-card">
          <div class="stat">
            <span>This session</span>
            <strong>{sessionCorrect}/{sessionAttempts}</strong>
          </div>

          {#if strictAvailable}
            <label class="setting-row">
              <span>{languages[language].strictLabel}</span>
              <input type="checkbox" bind:checked={strictMode} />
            </label>
          {/if}

          <label class="setting-row">
            <span>Show all outlines</span>
            <input type="checkbox" bind:checked={showAll} />
          </label>

          <div class="tip">
            Smaller overlapping objects are placed above larger hotspots, so things such as the bench remain clickable.
          </div>
        </aside>
      </div>

      {#if currentScene.credit}
        <p class="credit">{currentScene.credit}</p>
      {/if}
    </section>
  </main>
</div>
