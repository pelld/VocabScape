<script lang="ts">
  export let languageName = "French";
  export let languageCode = "fr";
  export let cardTotal = 0;
  export let cardsSeen = 0;
  export let cardsMastered = 0;
  export let accuracy: number | null = null;
  export let deckCount = 0;
  export let lessonsFinished = 0;
  export let openLessons: () => void;
  export let openCards: () => void;
  export let openFrenchLessons: () => void;
  $: mastery = cardTotal ? Math.round(cardsMastered / cardTotal * 100) : 0;
</script>

<main class="home">
  <header class="home-heading">
    <div>
      <span class="overline">{languageName.toUpperCase()} / VOCABSCAPE</span>
      <h1>Back to {languageName}.</h1>
    </div>
    <span class="heading-aside">Pick up a lesson, or test what you remember.</span>
  </header>

  <section class="home-grid" aria-label="Choose what to study">
    <div class="study-stack">
      <button class="study-tile lesson-tile" onclick={openLessons}>
        <span class="tile-index">01 / LEARN</span>
        <span class="tile-content">
          <span class="tile-icon" aria-hidden="true">Aa</span>
          <span>
            <strong>Lessons</strong>
            <small>Grammar that makes sense. Examples, explanations, then the tricky bits.</small>
          </span>
        </span>
        <span class="tile-foot"><span>{languageCode === "fr" ? "3 French lessons · B1" : "French lessons available"}</span><span aria-hidden="true">↗</span></span>
      </button>
      <button class="study-tile cards-tile" onclick={openCards}>
        <span class="tile-index">02 / RECALL</span>
        <span class="tile-content">
          <span class="tile-icon" aria-hidden="true">✳</span>
          <span>
            <strong>Flashcards</strong>
            <small>Words and phrases. Fewer repeats of what you already know.</small>
          </span>
        </span>
        <span class="tile-foot"><span>{cardTotal} cards · {deckCount} decks</span><span aria-hidden="true">↗</span></span>
      </button>
    </div>
    <div class="feature">
      <div class="feature-top"><span>UNDER THE MICROSCOPE</span><span>FRENCH · B1</span></div>
      <div class="feature-body">
        <span class="feature-intro">One word. Two meanings.</span>
        <div class="sentence" lang="fr">Je ne mange <b>que</b> des légumes.</div>
        <div class="translation">I eat nothing but vegetables.</div>
        <div class="rule"></div>
        <div class="sentence" lang="fr">Je ne mange des légumes <b>que</b> le dimanche.</div>
        <div class="translation">I eat vegetables only on Sundays.</div>
      </div>
      <button class="feature-link" onclick={openFrenchLessons}>Why does <i>que</i> move? <span aria-hidden="true">→</span></button>
    </div>
  </section>

  <section class="progress" aria-label="Learning progress">
    <div class="progress-title"><strong>In the bank</strong><span>Progress on this device</span></div>
    <div class="metrics">
      <div class="metric"><span>Cards tried</span><strong>{cardsSeen}<small> / {cardTotal}</small></strong></div>
      <div class="metric"><span>Cards secure</span><strong>{cardsMastered}</strong><div class="meter"><span style:width={mastery + "%"}></span></div></div>
      <div class="metric"><span>Accuracy</span><strong>{accuracy === null ? "—" : accuracy + "%"}</strong></div>
      <div class="metric"><span>French lessons</span><strong>{lessonsFinished}<small> / 3</small></strong></div>
    </div>
  </section>
</main>

<style>
  .home{width:min(1120px,calc(100% - 36px));margin:0 auto;height:calc(100dvh - 128px);min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:clamp(12px,2vh,22px);padding:clamp(10px,2vh,19px) 0 15px;color:#17354b}
  .home-heading{display:flex;align-items:end;justify-content:space-between;gap:16px}
  .overline,.tile-index,.feature-top{font-size:10px;font-weight:850;letter-spacing:.13em}
  .overline{color:#237974}
  h1{font-size:clamp(28px,3.6vw,46px);letter-spacing:-.055em;line-height:1.1;margin:5px 0 0}
  .heading-aside{color:#6b7e8d;font-size:13px;padding-bottom:5px}
  .home-grid{min-height:0;display:grid;grid-template-columns:.9fr 1.1fr;gap:16px}
  .study-stack{min-height:0;display:grid;grid-template-rows:1fr 1fr;gap:14px}
  .study-tile{min-height:0;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;text-align:left;border:1px solid #d7e2e7;border-radius:18px;background:#fff;padding:clamp(15px,2.2vh,23px);cursor:pointer;color:#17354b;transition:border-color .15s,background .15s}
  .study-tile:hover{border-color:#5a9895;background:#fafdfe}
  .tile-index{color:#56837f}
  .tile-content{display:flex;align-items:center;gap:17px}
  .tile-icon{display:grid;place-items:center;flex:0 0 52px;height:52px;border-radius:13px;background:#e4f1ec;color:#287c71;font-size:23px;font-weight:800}
  .cards-tile .tile-icon{background:#faeee3;color:#ad692e}
  .tile-content strong{display:block;font-size:clamp(20px,2.2vw,27px);letter-spacing:-.035em;margin-bottom:5px}
  .tile-content small{display:block;color:#657b8a;font-size:13px;line-height:1.45;max-width:300px}
  .tile-foot{display:flex;justify-content:space-between;border-top:1px solid #e6edef;padding-top:11px;color:#247974;font-size:12px;font-weight:800}
  .tile-foot span:last-child{font-size:19px;line-height:.8}
  .feature{min-height:0;background:#123748;color:white;border-radius:18px;overflow:hidden;display:flex;flex-direction:column}
  .feature-top{display:flex;justify-content:space-between;gap:14px;padding:clamp(17px,2.5vh,25px) 25px;color:#9bc5c9}
  .feature-body{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;padding:0 25px 15px}
  .feature-intro{color:#8ed1cc;font-size:14px;margin-bottom:clamp(15px,3vh,32px)}
  .sentence{font-size:clamp(19px,2.2vw,29px);font-weight:700;line-height:1.2;letter-spacing:-.03em}
  .sentence b{color:#f9bd86}
  .translation{font-size:13px;color:#c4d8de;margin-top:8px}
  .rule{height:1px;background:#436374;margin:clamp(15px,3vh,29px) 0}
  .feature-link{display:flex;justify-content:space-between;align-items:center;text-align:left;border:0;border-top:1px solid #456978;background:#1b4a5b;color:#fff;padding:15px 25px;font:inherit;font-size:14px;font-weight:800;cursor:pointer}
  .feature-link:hover{background:#246073}
  .feature-link span{font-size:19px}
  .progress{display:grid;grid-template-columns:160px 1fr;align-items:stretch;gap:16px;min-height:95px}
  .progress-title{display:flex;flex-direction:column;justify-content:center}
  .progress-title strong{font-size:17px;letter-spacing:-.025em}
  .progress-title span{font-size:11px;color:#83919c;margin-top:7px}
  .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
  .metric{background:#fff;border:1px solid #dbe5e9;border-radius:13px;padding:13px 16px;display:flex;flex-direction:column;justify-content:space-between;min-width:0}
  .metric>span{font-size:11px;font-weight:700;color:#678192}
  .metric strong{font-size:clamp(23px,2.6vw,32px);line-height:1.1;letter-spacing:-.045em;margin-top:8px}
  .metric strong small{font-size:13px;color:#82919c;font-weight:650}
  .meter{height:4px;border-radius:5px;background:#e8efee;margin-top:7px;overflow:hidden}.meter span{display:block;height:100%;background:#298979}
  @media(max-height:700px) and (min-width:801px){.home{gap:10px;padding:7px 0 10px}.tile-content{gap:12px}.tile-icon{height:40px;flex-basis:40px}.tile-content small{font-size:12px}.feature-intro{margin-bottom:10px}.rule{margin:12px 0}.feature-top{padding:13px 22px}.progress{min-height:78px}.metric{padding:9px 14px}}
  @media(max-width:800px){.home{height:auto;min-height:calc(100dvh - 128px);display:block;padding:20px 0 32px}.home-heading{margin-bottom:17px}.home-grid{grid-template-columns:1fr}.study-stack{grid-template-rows:auto auto}.study-tile{min-height:195px}.feature{min-height:310px;margin-top:14px}.progress{grid-template-columns:1fr;margin-top:22px}.progress-title{display:flex;flex-direction:row;justify-content:space-between}.metrics{margin-top:10px}}
  @media(max-width:520px){.heading-aside{display:none}.home{width:calc(100% - 26px)}.metrics{grid-template-columns:repeat(2,1fr)}.study-tile{min-height:180px}.tile-icon{flex-basis:43px;height:43px}.feature-body{padding:0 20px 18px}.feature-top,.feature-link{padding-left:20px;padding-right:20px}.progress-title{font-size:13px}}
</style>
