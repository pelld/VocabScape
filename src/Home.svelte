<script lang="ts">
  export let languageName = "French";
  export let languageCode = "fr";
  export let cardTotal = 0;
  export let cardsSeen = 0;
  export let cardsMastered = 0;
  export let accuracy: number | null = null;
  export let deckCount = 0;
  export let lessonsFinished = 0;
  export let chooseLanguage: (code: string) => void;
  export let openLessons: () => void;
  export let openCards: () => void;

  const languages = [
    { code: "fr", name: "French", native: "Français", mark: "Fr", detail: "Lessons & flashcards" },
    { code: "es", name: "Spanish", native: "Español", mark: "Es", detail: "Flashcards" },
    { code: "pl", name: "Polish", native: "Polski", mark: "Pl", detail: "Flashcards" }
  ];

  $: mastery = cardTotal ? Math.round(cardsMastered / cardTotal * 100) : 0;
</script>

<main class="home">
  <header class="masthead">
    <div>
      <span class="eyebrow">THE LANGUAGE DESK</span>
      <h1>Vocab<span>Scape</span><span class="fullstop">.</span></h1>
    </div>
    <p>Three languages. Two ways to study.<br />What are we learning today?</p>
  </header>

  <section class="language-section" aria-label="Select a language">
    <div class="section-label"><span>01</span><strong>Choose a language</strong><span class="section-hint">Currently: {languageName}</span></div>
    <div class="language-grid">
      {#each languages as item}
        <button
          class="language-tile"
          class:chosen={languageCode === item.code}
          aria-pressed={languageCode === item.code}
          onclick={() => chooseLanguage(item.code)}
        >
          <span class="lang-monogram">{item.mark}</span>
          <span class="language-copy"><strong>{item.name}</strong><small>{item.native}</small></span>
          <span class="language-detail">{item.detail}</span>
          <span class="selection-mark" aria-hidden="true">{languageCode === item.code ? "✓" : "↗"}</span>
        </button>
      {/each}
    </div>
  </section>

  <section class="activity-section" aria-label="Select a study activity">
    <div class="section-label"><span>02</span><strong>Choose what to do</strong><span class="section-hint">Studying {languageName}</span></div>
    <div class="activity-grid">
      <button class="activity" onclick={openLessons}>
        <span class="activity-symbol" aria-hidden="true">Aa</span>
        <span class="activity-copy">
          <strong>Lessons</strong>
          <small>{languageCode === "fr" ? "Understand the grammar. Then put it to work." : "Structured lessons are currently available in French."}</small>
          <span class="activity-note">{languageCode === "fr" ? "3 lessons · B1" : "French lessons only for now"}</span>
        </span>
        <span class="activity-arrow" aria-hidden="true">↗</span>
      </button>
      <button class="activity" onclick={openCards}>
        <span class="activity-symbol flash-symbol" aria-hidden="true">✳</span>
        <span class="activity-copy">
          <strong>Flashcards</strong>
          <small>Vocabulary, expressions and a little memory testing.</small>
          <span class="activity-note">{cardTotal} cards · {deckCount} decks in {languageName}</span>
        </span>
        <span class="activity-arrow" aria-hidden="true">↗</span>
      </button>
    </div>
  </section>

  <section class="progress-section" aria-label="Progress for selected language">
    <div class="section-label progress-label"><span>03</span><strong>{languageName} at a glance</strong><span class="section-hint">Saved on this device</span></div>
    <div class="progress-grid">
      <div class="stat"><span>Cards tried</span><strong>{cardsSeen}<small> / {cardTotal}</small></strong></div>
      <div class="stat"><span>Cards secure</span><strong>{cardsMastered}</strong><div class="meter"><span style:width={mastery + "%"}></span></div></div>
      <div class="stat"><span>Accuracy</span><strong>{accuracy === null ? "—" : accuracy + "%"}</strong></div>
      {#if languageCode === "fr"}
        <div class="stat"><span>Lessons finished</span><strong>{lessonsFinished}<small> / 3</small></strong></div>
      {:else}
        <div class="stat stat-empty"><span>Lessons</span><strong class="soon">Coming soon</strong></div>
      {/if}
    </div>
  </section>
</main>

<style>
  .home{width:min(1130px,calc(100% - 36px));height:calc(100dvh - 128px);min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) minmax(0,1fr) auto;gap:clamp(12px,1.9vh,22px);margin:0 auto;padding:clamp(12px,2vh,20px) 0 16px;color:#183448}
  .masthead{display:flex;justify-content:space-between;align-items:end;gap:24px}
  .eyebrow{font-size:10px;color:#41837c;font-weight:850;letter-spacing:.2em}
  .masthead h1{font-size:clamp(38px,4.6vw,64px);font-weight:900;letter-spacing:-.075em;line-height:1;margin:5px 0 0}
  .masthead h1>span:first-child{color:#267c79}.fullstop{color:#e08c59}
  .masthead p{margin:0 0 2px;color:#637b8a;font-size:14px;line-height:1.55;text-align:right}
  .language-section,.activity-section,.progress-section{min-height:0;display:flex;flex-direction:column;gap:10px}
  .section-label{display:flex;align-items:baseline;gap:10px;flex-shrink:0}
  .section-label>span:first-child{font-size:11px;font-weight:900;color:#af876c}
  .section-label strong{font-size:15px;letter-spacing:-.015em}
  .section-hint{font-size:12px;color:#738897;margin-left:auto}
  .language-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;min-height:0;flex:1}
  .language-tile{background:#fff;border:2px solid #dce5e9;border-radius:17px;min-height:0;padding:clamp(13px,2vh,22px);text-align:left;cursor:pointer;display:grid;grid-template-columns:52px 1fr auto;grid-template-rows:1fr auto;align-items:center;column-gap:13px;row-gap:8px;color:#1a3548}
  .language-tile:hover{border-color:#94b7b5}
  .language-tile.chosen{border-color:#247b77;background:#f3faf8;box-shadow:inset 0 0 0 1px #247b77}
  .lang-monogram{width:49px;height:49px;border-radius:13px;display:grid;place-items:center;background:#e8efef;color:#236d72;font-weight:900;font-size:20px;letter-spacing:-.05em}
  .chosen .lang-monogram{background:#d9ede7;color:#176a65}
  .language-copy{display:flex;flex-direction:column;gap:4px}
  .language-copy strong{font-size:clamp(19px,2vw,25px);letter-spacing:-.03em}
  .language-copy small{font-size:13px;color:#688090}
  .language-detail{grid-column:1 / span 2;align-self:end;font-size:12px;color:#718b92;font-weight:600}
  .selection-mark{grid-column:3;grid-row:1 / span 2;align-self:center;color:#448a83;font-size:20px;font-weight:800}
  .activity-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;min-height:0;flex:1}
  .activity{min-height:0;display:flex;align-items:center;gap:17px;border-radius:17px;background:#153b4b;border:1px solid #153b4b;color:#fff;text-align:left;padding:clamp(16px,2.3vh,27px);cursor:pointer}
  .activity:last-child{background:#fff;color:#1b364a;border-color:#dbe5e9}
  .activity:hover{border-color:#72a7a1;box-shadow:0 5px 18px #243b4a12}
  .activity-symbol{width:58px;height:58px;border-radius:15px;background:#2b5c66;color:#e2f0e9;display:grid;place-items:center;flex-shrink:0;font-weight:900;font-size:25px}
  .flash-symbol{background:#f9eee3;color:#b77435}
  .activity-copy{display:flex;flex-direction:column;gap:7px;flex:1;min-width:0}
  .activity-copy strong{font-size:clamp(21px,2.3vw,29px);letter-spacing:-.035em}
  .activity-copy small{color:#c0d6db;font-size:13px;line-height:1.35;max-width:290px}
  .activity:last-child .activity-copy small{color:#66808e}
  .activity-note{font-size:11px;font-weight:750;color:#8dd0bb;margin-top:5px}
  .activity:last-child .activity-note{color:#267c76}
  .activity-arrow{align-self:flex-start;font-size:21px;color:#a9d2ca}
  .activity:last-child .activity-arrow{color:#518980}
  .progress-section{gap:9px}
  .progress-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}
  .stat{background:#fff;border:1px solid #dce5e9;border-radius:13px;min-height:84px;padding:12px 17px;display:flex;flex-direction:column;justify-content:space-between}
  .stat>span{font-size:11px;font-weight:750;color:#6b8492}
  .stat strong{font-size:clamp(23px,2.4vw,32px);line-height:1.1;letter-spacing:-.04em}
  .stat strong small{font-size:13px;letter-spacing:0;color:#7a929c;font-weight:650}
  .stat .soon{font-size:16px;letter-spacing:0;color:#82929a}
  .meter{height:4px;border-radius:10px;background:#e6eeec;overflow:hidden;margin-top:5px}
  .meter span{display:block;background:#308c7b;height:100%}
  @media(max-height:750px) and (min-width:821px){.home{gap:9px;padding:9px 0 11px}.masthead h1{font-size:40px}.language-tile{padding:12px}.lang-monogram{width:42px;height:42px}.activity{padding:14px}.activity-symbol{width:44px;height:44px}.stat{min-height:69px;padding:9px 14px}}
  @media(max-width:820px){.home{height:auto;min-height:calc(100dvh - 128px);display:flex;flex-direction:column;gap:22px;padding:20px 0 32px}.language-grid{min-height:150px}.activity-grid{min-height:170px}.masthead h1{font-size:45px}}
  @media(max-width:610px){.masthead{align-items:start}.masthead p{display:none}.home{width:calc(100% - 26px)}.language-grid{grid-template-columns:1fr;gap:10px}.language-tile{min-height:87px;grid-template-columns:43px 1fr auto;padding:12px}.lang-monogram{width:41px;height:41px}.language-detail{grid-column:2;grid-row:2}.activity-grid{grid-template-columns:1fr}.activity{min-height:120px}.progress-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.section-hint{font-size:11px}.progress-grid .stat{min-height:79px}}
</style>