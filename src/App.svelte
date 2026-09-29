<script lang="ts">
  import SceneView from "./lib/SceneView.svelte";
  import GardenPhotoScene from "./lib/GardenPhotoScene.svelte";
  import ActionGardenScene from "./lib/ActionGardenScene.svelte";
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
  let questionQueue: number[] = [];
  let questionPosition = 1;
  let roundNumber = 1;
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

  function resetQuestionRound() {
    const objectCount = scenes[sceneIndex].objects.length;
    const order = shuffledIndices(objectCount);

    currentIndex = order.shift() ?? 0;
    questionQueue = order;
    questionPosition = 1;
    roundNumber = 1;
    countedCurrent = false;

    if (answerInput) answerInput.value = "";
    clearFeedback();
    focusAnswer();
  }

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
    sessionCorrect = 0;
    sessionAttempts = 0;
    resetQuestionRound();
  }

  function switchScene(index: number) {
    sceneIndex = index;
    resetQuestionRound();
  }

  function switchMode(nextMode: Mode) {
    mode = nextMode;
    resetQuestionRound();
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
    const objectCount = currentScene.objects.length;
    if (objectCount < 2) return;

    if (questionQueue.length === 0) {
      questionQueue = shuffledIndices(objectCount, currentIndex);
      questionPosition = 0;
      roundNumber += 1;
    }

    currentIndex = questionQueue.shift() ?? currentIndex;
    questionPosition += 1;
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

  resetQuestionRound();
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
          <div class="eyebrow">{languages[language].name} · {currentScene.kind === "action" ? "visual verbs" : "visual vocabulary"}</div>
          <h1>{currentScene.name}</h1>
          <p>{currentScene.objects.length} {currentScene.kind === "action" ? "actions" : "objects"} in this scene</p>
        </div>

        <div class="mode-switcher" aria-label="Practice mode">
          <button class:active={mode === "type"} onclick={() => switchMode("type")}>{currentScene.kind === "action" ? "Describe" : "Type"}</button>
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

      {#if currentScene.id === "garden"}
        <GardenPhotoScene
          scene={currentScene}
          {language}
          {mode}
          {currentIndex}
          {showAll}
          {masteredIds}
          onhit={handleSceneHit}
        />
      {:else if currentScene.id === "action-garden"}
        <ActionGardenScene
          scene={currentScene}
          {language}
          {mode}
          {currentIndex}
          {showAll}
          {masteredIds}
          onhit={handleSceneHit}
        />
      {:else}
        <SceneView
          scene={currentScene}
          {language}
          {mode}
          {currentIndex}
          {showAll}
          {masteredIds}
          onhit={handleSceneHit}
        />
      {/if}

      <div class="practice-grid">
        <section class="practice-card">
          {#if mode === "type"}
            <span class="prompt-label">Question {questionPosition} of {currentScene.objects.length} · Round {roundNumber}</span>
            <span class="prompt-label prompt-secondary">
              {currentScene.kind === "action"
                ? `Describe the highlighted action in ${languages[language].name}.`
                : `What is the highlighted object in ${languages[language].name}?`}
            </span>
            <h2>{currentObject.concept}</h2>

            <div class="answer-row">
              <input
                bind:this={answerInput}
                type="text"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                placeholder={currentScene.kind === "action" ? "Type the sentence…" : "Type the word…"}
                onkeydown={handleKeydown}
              />
              <button class="primary" onclick={checkTyped}>Check</button>
            </div>
          {:else if mode === "click"}
            <span class="prompt-label">Question {questionPosition} of {currentScene.objects.length} · Round {roundNumber}</span>
            <span class="prompt-label prompt-secondary">{currentScene.kind === "action" ? "Find this action in the picture" : "Find this in the picture"}</span>
            <h2>{currentTerm.display}</h2>
            <p class="supporting">Click {currentScene.kind === "action" ? currentObject.concept : `the ${currentObject.concept}`}.</p>
          {:else}
            <span class="prompt-label">Explore the scene</span>
            <h2>{currentScene.kind === "action" ? "Click a person" : "Click anything outlined"}</h2>
            <p class="supporting">
              {currentScene.kind === "action"
                ? `The ${languages[language].name} sentence will appear on the picture.`
                : `The ${languages[language].name} word will appear on the picture.`}
            </p>
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
            {currentScene.kind === "action"
              ? "Each person is a separate transparent image layer over the garden background."
              : "Garden uses the original image with your precise object geometry; smaller overlapping objects win the click."}
          </div>
        </aside>
      </div>

      {#if currentScene.credit}
        <p class="credit">{currentScene.credit}</p>
      {/if}
    </section>
  </main>
</div>
