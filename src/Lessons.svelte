<script lang="ts">
  export let language = "fr";

  type Question = { prompt: string; choices: string[]; correct: number; why: string };
  type LessonSection = { title: string; explanation: string; examples: { fr: string; en: string; note?: string }[] };
  type Lesson = { sections?: LessonSection[]; id: string; title: string; level: string; minutes: number; objective: string; explanation: string; examples: { fr: string; en: string }[]; tip: string; questions: Question[] };

  const baseLessons: Lesson[] = [
    {
      id: "ne-que", title: "Ne… que: only", level: "B1", minutes: 8,
      objective: "Say 'only' naturally without using seulement every time.",
      explanation: "Ne… que means 'only'. Place ne before the conjugated verb and que immediately before the thing being limited. In spoken French, ne is often dropped, but keep it in writing.",
      examples: [
        { fr: "Je n'ai que dix minutes.", en: "I only have ten minutes." },
        { fr: "Elle ne boit que de l'eau.", en: "She only drinks water." },
        { fr: "Nous ne sommes partis qu'à midi.", en: "We didn't leave until noon." }
      ],
      tip: "Before a vowel, que becomes qu'. Remember: ne… que is a restriction, not an ordinary negative.",
      questions: [
        { prompt: "I only have five euros.", choices: ["Je n'ai que cinq euros.", "Je n'ai pas cinq euros.", "Je ne que ai cinq euros."], correct: 0, why: "Que goes directly before cinq euros, the amount being limited." },
        { prompt: "Choose the meaning: Il ne mange que des légumes.", choices: ["He never eats vegetables.", "He only eats vegetables.", "He doesn't eat vegetables."], correct: 1, why: "Ne… que means only, not 'not'." },
        { prompt: "We only have one day.", choices: ["Nous n'avons pas un jour.", "Nous n'avons qu'un jour.", "Nous ne qu'avons un jour."], correct: 1, why: "Que contracts to qu' before un." }
      ]
    },
    {
      id: "venir-de", title: "Venir de: just did", level: "B1", minutes: 8,
      objective: "Talk about something that happened moments ago.",
      explanation: "Use venir (in the present tense) + de + infinitive to say that you have just done something. Conjugate venir for the person; the second verb remains in the infinitive.",
      examples: [
        { fr: "Je viens de rentrer.", en: "I've just got home." },
        { fr: "On vient de finir.", en: "We've just finished." },
        { fr: "Elle vient d'arriver.", en: "She's just arrived." }
      ],
      tip: "De becomes d' before a vowel. Compare je viens de partir (I have just left) with je vais partir (I'm going to leave).",
      questions: [
        { prompt: "I have just eaten.", choices: ["Je vais manger.", "Je viens de manger.", "Je suis venir manger."], correct: 1, why: "Viens de + infinitive describes the recent past." },
        { prompt: "They have just arrived.", choices: ["Ils viennent d'arriver.", "Ils vient d'arriver.", "Ils viennent arrivent."], correct: 0, why: "Ils takes viennent, followed by d'arriver." },
        { prompt: "What does 'Tu viens de sortir' mean?", choices: ["You will go out.", "You usually go out.", "You have just gone out."], correct: 2, why: "Venir de + infinitive is the recent past." }
      ]
    },
    {
      id: "meme-si", title: "Même si: even if / even though", level: "B1", minutes: 9,
      objective: "Connect two ideas and express a contrast.",
      explanation: "Même si introduces a contrast: 'even if' for a possibility, or 'even though' for a fact. It normally takes the indicative, not the subjunctive.",
      examples: [
        { fr: "Je vais courir même s'il pleut.", en: "I'll go running even if it's raining." },
        { fr: "Même si c'est difficile, je continue.", en: "Even though it's difficult, I carry on." },
        { fr: "Elle est venue même si elle était fatiguée.", en: "She came even though she was tired." }
      ],
      tip: "Si becomes s' before il or ils: même s'il pleut. Use the indicative after même si.",
      questions: [
        { prompt: "Even if I'm tired, I'll go.", choices: ["Même si je suis fatigué, j'irai.", "Même que je suis fatigué, j'irai.", "Même si je sois fatigué, j'irai."], correct: 0, why: "Même si takes the indicative: je suis." },
        { prompt: "Meaning of 'même s'il pleut'?", choices: ["Because it rains", "Even if it rains", "Unless it rains"], correct: 1, why: "Même si expresses a contrast or concession." },
        { prompt: "Choose the correct phrase.", choices: ["Même si il est tard", "Même s'il est tard", "Même qu'il est tard"], correct: 1, why: "Si contracts before il: s'il." }
      ]
    }
  ];

  const extensions: Record<string, { sections: LessonSection[]; extraQuestions: Question[] }> = {
    "ne-que": {
      sections: [
        {
          title: "1. Start with the thing you're limiting",
          explanation: "Imagine the word ONLY as a spotlight. In French, que sits just before whatever is under that spotlight. Ne goes before the conjugated verb. This is a restriction, not a negative statement.",
          examples: [
            { fr: "Je ne bois que de l'eau.", en: "I drink only water.", note: "Spotlight: WATER — not juice, coffee or tea." },
            { fr: "Je ne bois de l'eau que le matin.", en: "I drink water only in the morning.", note: "Spotlight: THE MORNING — this doesn't tell you what you drink later." },
            { fr: "Je ne vois que Marie.", en: "I only see Marie.", note: "Spotlight: MARIE — no one else." }
          ]
        },
        {
          title: "2. The Sunday puzzle: two different meanings",
          explanation: "English 'I only eat vegetables on Sundays' can mean two different things. French can make the distinction clearer. Ask yourself: are we limiting the FOOD or the DAY?",
          examples: [
            { fr: "Je ne mange des légumes que le dimanche.", en: "I eat vegetables only on Sundays.", note: "Only when? On Sunday. You might eat other food any day." },
            { fr: "Le dimanche, je ne mange que des légumes.", en: "On Sundays, I eat only vegetables.", note: "Only what? Vegetables. On Sunday you don't eat anything else." },
            { fr: "Je ne mange que des légumes le dimanche.", en: "I only eat vegetables on Sundays.", note: "Usually understood as limiting what you eat on Sundays. To make the timing restriction unambiguous, place que before le dimanche." }
          ]
        },
        {
          title: "3. Change one word, change the focus",
          explanation: "Try reading each sentence aloud and mentally putting a box around whatever follows que. If you're limiting a time, place que before the time. If you're limiting a person or thing, put it there instead.",
          examples: [
            { fr: "Elle ne travaille que le lundi.", en: "She works only on Mondays.", note: "Only the time: Monday." },
            { fr: "Le lundi, elle ne travaille qu'avec Paul.", en: "On Mondays, she works only with Paul.", note: "Only the person: Paul." },
            { fr: "Nous n'avons que dix minutes.", en: "We only have ten minutes.", note: "Only the amount: ten minutes. Que becomes qu' before a vowel." }
          ]
        },
        {
          title: "4. Compare it with a real negative",
          explanation: "Ne… pas says something does NOT happen. Ne… que says something is LIMITED. They look similar but mean very different things. In everyday speech, French speakers often omit ne; the que still marks the restriction.",
          examples: [
            { fr: "Je ne mange pas de légumes.", en: "I don't eat vegetables.", note: "Negative: no vegetables." },
            { fr: "Je ne mange que des légumes.", en: "I eat only vegetables.", note: "Restriction: vegetables and nothing else." },
            { fr: "Je mange que des légumes.", en: "I only eat vegetables. (Informal speech)", note: "Spoken French may drop ne; keep it in standard written French." }
          ]
        }
      ],
      extraQuestions: [
        { prompt: "You eat vegetables on Sundays, and no other food that day. Which sentence says this?", choices: ["Je ne mange des légumes que le dimanche.", "Le dimanche, je ne mange que des légumes.", "Je ne mange pas de légumes le dimanche."], correct: 1, why: "The restriction is on WHAT you eat, so que comes immediately before des légumes." },
        { prompt: "You eat vegetables only on Sundays, but eat other food throughout the week. Choose the precise sentence.", choices: ["Je ne mange des légumes que le dimanche.", "Le dimanche, je ne mange que des légumes.", "Je ne mange jamais de légumes."], correct: 0, why: "The restriction is on WHEN you eat vegetables, so que comes before le dimanche." },
        { prompt: "What does 'Elle ne travaille que le lundi' restrict?", choices: ["The person she works with", "The day she works", "The kind of work she does"], correct: 1, why: "Que le lundi means only on Monday." },
        { prompt: "What is restricted in 'Elle ne travaille qu'avec Paul'?", choices: ["Who she works with", "When she works", "Where she works"], correct: 0, why: "Qu'avec Paul means only with Paul." },
        { prompt: "Which says 'I don't drink water'?", choices: ["Je ne bois que de l'eau.", "Je ne bois pas d'eau.", "Je ne bois de l'eau que le matin."], correct: 1, why: "Ne… pas is negative. Ne… que means only." },
        { prompt: "You want to say 'I only travel in July' (not other months).", choices: ["Je ne voyage qu'en juillet.", "En juillet, je ne voyage qu'en train.", "Je ne voyage pas en juillet."], correct: 0, why: "Qu'en juillet puts the restriction on the month." },
        { prompt: "Meaning of 'En juillet, je ne voyage qu'en train'?", choices: ["I travel by train only in July.", "In July I travel only by train.", "I don't travel by train in July."], correct: 1, why: "The time is set first. Que restricts the transport: en train." },
        { prompt: "Which French sentence means 'We have only two hours'?", choices: ["Nous n'avons pas deux heures.", "Nous n'avons que deux heures.", "Nous n'avons deux heures que demain."], correct: 1, why: "Que directly precedes deux heures, the limited amount." }
      ]
    },
    "venir-de": {
      sections: [
        { title: "1. Think 'just now', not 'come from'", explanation: "Venir normally means 'to come', but venir de + infinitive is a special construction for something very recent. The second verb stays in its dictionary form.",
          examples: [
            { fr: "Je viens de courir.", en: "I've just been running.", note: "Je viens + de + courir." },
            { fr: "Il vient de téléphoner.", en: "He's just phoned.", note: "Il vient, not il viens." },
            { fr: "Nous venons de partir.", en: "We've just left.", note: "Nous venons + de + infinitive." }
          ] },
        { title: "2. Compare past, recent past, and future", explanation: "Put three phrases on a mental timeline. J'ai mangé describes a past event. Je viens de manger means it happened just now. Je vais manger means it hasn't happened yet.",
          examples: [
            { fr: "J'ai mangé.", en: "I ate / I've eaten.", note: "Past — not necessarily just now." },
            { fr: "Je viens de manger.", en: "I've just eaten.", note: "Very recent past." },
            { fr: "Je vais manger.", en: "I'm going to eat.", note: "Near future." }
          ] },
        { title: "3. Change the person, not the infinitive", explanation: "Conjugate venir to match the subject: je viens, tu viens, il/elle vient, nous venons, vous venez, ils/elles viennent. Keep de + infinitive unchanged. Before a vowel, de becomes d'.",
          examples: [
            { fr: "Tu viens d'arriver ?", en: "Have you just arrived?", note: "D'arriver because arriver begins with a vowel." },
            { fr: "Vous venez de finir ?", en: "Have you just finished?", note: "Vous venez." },
            { fr: "Elles viennent de rentrer.", en: "They've just got back.", note: "Elles viennent." }
          ] }
      ],
      extraQuestions: [
        { prompt: "Which sentence means 'I'm about to leave'?", choices: ["Je viens de partir.", "Je vais partir.", "Je suis parti."], correct: 1, why: "Je vais partir is near future; je viens de partir is just left." },
        { prompt: "Which expresses the most recent completed action?", choices: ["Je viens de finir.", "J'ai fini hier.", "Je vais finir."], correct: 0, why: "Venir de highlights the recent past." },
        { prompt: "We have just arrived.", choices: ["Nous venons d'arriver.", "Nous vient d'arriver.", "Nous allons arriver."], correct: 0, why: "Nous venons d'arriver: venir is conjugated; arriver remains infinitive." },
        { prompt: "You (plural/formal) have just called.", choices: ["Vous venez d'appeler.", "Vous viens d'appeler.", "Vous allez appeler."], correct: 0, why: "Vous takes venez, and de contracts to d'." },
        { prompt: "Which verb changes for the subject in venir de + infinitive?", choices: ["The second verb", "Both verbs", "Venir"], correct: 2, why: "Conjugate venir; retain the second verb as an infinitive." },
        { prompt: "What does 'Elle vient de sortir' mean?", choices: ["She has just gone out.", "She is going out tomorrow.", "She comes from outside."], correct: 0, why: "Vient de + infinitive signals a very recent action." }
      ]
    },
    "meme-si": {
      sections: [
        { title: "1. A result that doesn't change", explanation: "Même si means that one fact or possibility doesn't stop another action. Think: 'That may be true, BUT the outcome stays the same.'",
          examples: [
            { fr: "Même s'il pleut, je cours.", en: "Even if it's raining, I run.", note: "Rain doesn't change the decision." },
            { fr: "Même si c'est cher, je l'achète.", en: "Even if it's expensive, I'm buying it.", note: "Price doesn't change the decision." },
            { fr: "Je continue même si c'est difficile.", en: "I carry on even though it's difficult.", note: "Difficulty doesn't stop me." }
          ] },
        { title: "2. Possibility or fact?", explanation: "English often distinguishes 'even if' (hypothetical) from 'even though' (actual). French uses même si for both. Context and tense help you decide which translation fits.",
          examples: [
            { fr: "Même s'il neige demain, j'irai.", en: "Even if it snows tomorrow, I'll go.", note: "The snow is a possibility." },
            { fr: "Même s'il neige aujourd'hui, je sors.", en: "Even though it's snowing today, I'm going out.", note: "Context can make the snow an existing fact." },
            { fr: "Même si elle était fatiguée, elle a terminé.", en: "Even though she was tired, she finished.", note: "A real past contrast." }
          ] },
        { title: "3. Don't confuse it with malgré", explanation: "Même si introduces a clause with a verb. Malgré is followed by a noun or noun phrase. In standard French, même si normally uses the indicative, not the subjunctive.",
          examples: [
            { fr: "Même si je suis fatigué, je viens.", en: "Even though I'm tired, I'm coming.", note: "Même si + je suis (indicative)." },
            { fr: "Malgré la fatigue, je viens.", en: "Despite the tiredness, I'm coming.", note: "Malgré + a noun." },
            { fr: "Même s'il est tard, on continue.", en: "Even though it's late, we're continuing.", note: "Si contracts to s' before il." }
          ] }
      ],
      extraQuestions: [
        { prompt: "Even if it rains tomorrow, I'll run.", choices: ["Même s'il pleut demain, je courrai.", "Malgré il pleut demain, je courrai.", "Même s'il pleuve demain, je courrai."], correct: 0, why: "Même si + indicative: il pleut. Future in the main clause: je courrai." },
        { prompt: "Choose the correct version of 'Despite the rain, I run'.", choices: ["Malgré il pleut, je cours.", "Malgré la pluie, je cours.", "Même si la pluie, je cours."], correct: 1, why: "Malgré is followed by a noun; même si needs a clause." },
        { prompt: "In 'Même si c'est difficile, je continue', what stays the same?", choices: ["The difficulty", "My decision to continue", "The time of day"], correct: 1, why: "The obstacle doesn't change the outcome." },
        { prompt: "Even though she was tired, she came.", choices: ["Même si elle était fatiguée, elle est venue.", "Même si elle soit fatiguée, elle est venue.", "Malgré elle était fatiguée, elle est venue."], correct: 0, why: "Même si + indicative (était) expresses a genuine contrast." },
        { prompt: "Which phrase is written correctly?", choices: ["Même si il arrive", "Même s'il arrive", "Même qu'il arrive"], correct: 1, why: "Si contracts before il." },
        { prompt: "Does même si always describe something hypothetical?", choices: ["Yes", "No, it can refer to an actual fact too", "Only with future tense"], correct: 1, why: "Même si can mean even if or even though, depending on context." }
      ]
    }
  };

  const lessons: Lesson[] = baseLessons.map(lesson => ({
    ...lesson,
    minutes: lesson.id === "ne-que" ? 20 : 16,
    sections: extensions[lesson.id].sections,
    questions: [...lesson.questions, ...extensions[lesson.id].extraQuestions]
  }));

  const storageKey = "vocabscape-lessons-v1";
  let completed: string[] = [];
  try { completed = JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { completed = []; }
  let activeId: string | null = null;
  let step: "learn" | "practice" | "finished" = "learn";
  let questionIndex = 0;
  let selected: number | null = null;
  let correctCount = 0;
  $: active = lessons.find(lesson => lesson.id === activeId);
  $: question = active?.questions[questionIndex];

  function start(id: string) {
    activeId = id;
    step = "learn";
    questionIndex = 0;
    selected = null;
    correctCount = 0;
  }

  function answer(index: number) {
    if (selected !== null || !question) return;
    selected = index;
    if (index === question.correct) correctCount += 1;
  }

  function advance() {
    if (!active) return;
    if (questionIndex + 1 < active.questions.length) {
      questionIndex += 1;
      selected = null;
    } else {
      step = "finished";
      if (correctCount === active.questions.length && !completed.includes(active.id)) {
        completed = [...completed, active.id];
        localStorage.setItem(storageKey, JSON.stringify(completed));
      }
    }
  }

  function speak(text: string) {
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }
</script>

<section class="lesson-shell">
  {#if language !== "fr"}
    <div class="lesson-empty">
      <span class="eyebrow">Lessons</span>
      <h1>Structured lessons are coming to this language</h1>
      <p>The first lessons cover B1 French. Switch to French to try them; your existing flashcards remain available in every language.</p>
    </div>
  {:else if !active}
    <div class="lesson-header">
      <div>
        <span class="eyebrow">French · B1</span>
        <h1>Lessons</h1>
        <p>Learn a useful rule, see it in context, then practise it. Work through the lessons at your own pace.</p>
      </div>
      <div class="lesson-total"><strong>{completed.length}/{lessons.length}</strong><span>completed</span></div>
    </div>
    <div class="lesson-list">
      {#each lessons as lesson, i}
        <button class="lesson-tile" onclick={() => start(lesson.id)}>
          <span class="lesson-number">{String(i + 1).padStart(2, "0")}</span>
          <span class="lesson-info"><strong>{lesson.title}</strong><small>{lesson.objective}</small><span class="lesson-meta">{lesson.level} · {lesson.minutes} min · {lesson.questions.length} practice questions</span></span>
          <span class="lesson-action">{completed.includes(lesson.id) ? "✓ Completed" : "Start →"}</span>
        </button>
      {/each}
    </div>
  {:else}
    <button class="back-link" onclick={() => activeId = null}>← All lessons</button>
    <div class="lesson-header">
      <div><span class="eyebrow">French · {active.level} · {active.minutes} minutes</span><h1>{active.title}</h1><p>{active.objective}</p></div>
      <span class="lesson-stage">{step === "learn" ? "1 · Learn" : step === "practice" ? "2 · Practise" : "3 · Recap"}</span>
    </div>
    {#if step === "learn"}
      <div class="lesson-panel">
        <h2>How it works</h2>
        <p>{active.explanation}</p>
        {#each active.sections ?? [] as section}
          <div class="lesson-chapter">
            <h3>{section.title}</h3>
            <p>{section.explanation}</p>
            {#each section.examples as example}
              <div class="example-row">
                <div><strong lang="fr">{example.fr}</strong><span>{example.en}</span>{#if example.note}<small class="example-note">{example.note}</small>{/if}</div>
                <button class="audio-button" aria-label="Listen to French example" onclick={() => speak(example.fr)}>▶ Listen</button>
              </div>
            {/each}
          </div>
        {/each}
        <h3>More examples</h3>
        {#each active.examples as example}
          <div class="example-row">
            <div><strong lang="fr">{example.fr}</strong><span>{example.en}</span></div>
            <button class="audio-button" aria-label="Listen to French example" onclick={() => speak(example.fr)}>▶ Listen</button>
          </div>
        {/each}
        <div class="lesson-tip"><strong>Remember</strong><p>{active.tip}</p></div>
        <button class="lesson-primary" onclick={() => { step = "practice"; questionIndex = 0; selected = null; correctCount = 0; }}>Practise what you've learned →</button>
      </div>
    {:else if step === "practice" && question}
      <div class="lesson-panel">
        <div class="question-meta"><span>Question {questionIndex + 1} of {active.questions.length}</span><span>{correctCount} correct so far</span></div>
        <div class="question-track"><div style:width={((questionIndex + 1) / active.questions.length) * 100 + "%"}></div></div>
        <h2>{question.prompt}</h2>
        <div class="choices">
          {#each question.choices as choice, i}
            <button class:chosen={selected === i} class:right={selected !== null && question.correct === i} class:wrong={selected === i && i !== question.correct} disabled={selected !== null} onclick={() => answer(i)}>
              <span>{String.fromCharCode(65 + i)}</span>{choice}
            </button>
          {/each}
        </div>
        {#if selected !== null}
          <div class="answer-feedback"><strong>{selected === question.correct ? "Correct!" : "Not quite."}</strong><p>{question.why}</p></div>
          <button class="lesson-primary" onclick={advance}>{questionIndex + 1 === active.questions.length ? "See results →" : "Next question →"}</button>
        {/if}
      </div>
    {:else if step === "finished"}
      <div class="lesson-panel recap">
        <span class="eyebrow">Lesson recap</span>
        <h2>{correctCount} out of {active.questions.length} correct</h2>
        <p>{correctCount === active.questions.length ? "Excellent — you got every question right. This lesson is marked complete." : "Good practice. Get all the questions right in a round to mark this lesson complete."}</p>
        <div class="recap-actions">
          <button class="lesson-primary" onclick={() => start(active.id)}>Try again</button>
          <button class="lesson-secondary" onclick={() => activeId = null}>All lessons →</button>
        </div>
      </div>
    {/if}
  {/if}
</section>

<style>
  .lesson-shell{max-width:900px;margin:0 auto;padding:30px 18px 80px;color:#243449}
  .lesson-header{display:flex;justify-content:space-between;align-items:center;gap:22px;margin:16px 0 28px}
  .eyebrow{font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:#476c8f}
  h1{font-size:clamp(32px,5vw,48px);margin:8px 0 10px;line-height:1.1}
  h2{font-size:26px;margin:0 0 18px}
  h3{font-size:17px;margin:30px 0 12px}
  p{line-height:1.65;color:#526277;margin:0}
  .lesson-total{background:#e8f3f0;color:#215749;border-radius:20px;padding:18px 26px;text-align:center;min-width:110px}
  .lesson-total strong{display:block;font-size:30px}.lesson-total span{font-size:12px;font-weight:700}
  .lesson-list{display:grid;gap:14px}
  .lesson-tile{width:100%;display:flex;gap:20px;align-items:center;text-align:left;padding:22px;border:1px solid #dbe4ed;border-radius:18px;background:#fff;cursor:pointer;color:inherit}
  .lesson-tile:hover{border-color:#6a9cab;box-shadow:0 8px 25px #24344912}
  .lesson-number{font-size:24px;font-weight:800;color:#9cb5c7}
  .lesson-info{display:grid;gap:6px;flex:1}.lesson-info strong{font-size:20px}.lesson-info small{font-size:14px;line-height:1.4;color:#526277}
  .lesson-meta{font-size:12px;color:#667b8d;margin-top:5px}
  .lesson-action{font-weight:700;color:#216e6a;white-space:nowrap}
  .back-link{background:none;border:0;padding:8px 0;color:#216e6a;font-weight:800;cursor:pointer}
  .lesson-stage{white-space:nowrap;background:#e5f1f4;border-radius:30px;padding:10px 16px;color:#286b77;font-size:13px;font-weight:800}
  .lesson-panel,.lesson-empty{background:#fff;border:1px solid #dbe4ed;border-radius:22px;padding:clamp(20px,4vw,42px)}
  .lesson-panel>p{font-size:17px}
  .example-row{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid #e9eef2;padding:17px 0}
  .example-row div{display:grid;gap:7px}.example-row strong{font-size:19px}.example-row span{color:#65768b;font-size:14px}
  .audio-button,.lesson-secondary{border:1px solid #cedde5;background:#f8fbfc;color:#265f70;border-radius:10px;padding:10px 14px;cursor:pointer;font-weight:700;white-space:nowrap}
  .lesson-chapter{padding:20px 0;border-bottom:1px solid #e2eaf0}.lesson-chapter h3{font-size:22px;margin:0 0 12px}.lesson-chapter>p{margin-bottom:18px}.example-note{font-size:13px;color:#3f7980;line-height:1.5}
  .lesson-tip{background:#f0f7f5;border-left:4px solid #4c9b89;border-radius:9px;padding:18px;margin:20px 0 26px}.lesson-tip p{margin-top:5px}
  .lesson-primary{border:0;border-radius:12px;background:#246f72;color:white;padding:15px 22px;font-size:15px;font-weight:800;cursor:pointer;margin-top:18px}
  .lesson-primary:hover{background:#17585a}
  .question-meta{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#5f7388;margin-bottom:12px}
  .question-track{height:7px;background:#e7edf1;border-radius:9px;overflow:hidden;margin-bottom:35px}.question-track div{height:100%;background:#439d92}
  .choices{display:grid;gap:12px;margin:28px 0 12px}
  .choices button{display:flex;align-items:center;gap:16px;text-align:left;padding:17px;border:2px solid #e0e8ee;border-radius:14px;background:white;color:#243449;font:inherit;cursor:pointer}
  .choices button span{display:grid;place-items:center;width:32px;height:32px;flex-shrink:0;border-radius:9px;background:#edf2f6;font-size:13px;font-weight:800}
  .choices button:not(:disabled):hover{border-color:#69a2aa}
  .choices button.right{background:#e9f7ef;border-color:#459b70}.choices button.wrong{background:#fff0ef;border-color:#d87474}
  .answer-feedback{padding:18px;background:#f1f6fa;border-radius:12px;margin-top:20px}.answer-feedback p{margin-top:6px}
  .recap{text-align:center}.recap h2{font-size:36px;margin:15px 0}.recap-actions{display:flex;justify-content:center;align-items:center;gap:15px;margin-top:22px}
  @media(max-width:600px){.lesson-header{align-items:flex-start}.lesson-total{padding:12px}.lesson-tile{gap:10px;padding:16px;flex-wrap:wrap}.lesson-action{margin-left:36px}.example-row{align-items:flex-start;flex-direction:column}.lesson-stage{font-size:11px}.recap-actions{flex-wrap:wrap}}
</style>
