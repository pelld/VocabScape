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
  $: mastery = cardTotal ? Math.round((cardsMastered / cardTotal) * 100) : 0;
</script>

<main class="home">
  <section class="hero">
    <div class="hero-text">
      <span class="eyebrow">YOUR LANGUAGE LEARNING SPACE</span>
      <h1>Make a little progress <em>every day.</em></h1>
      <p>Understand the rules, practise them in context and build confidence with each session. Choose the way you want to learn.</p>
      <div class="hero-actions">
        <button class="primary-action" onclick={languageCode === "fr" ? openLessons : openCards}>{languageCode === "fr" ? "Explore French lessons" : "Start practising"} <span>→</span></button>
        <button class="secondary-action" onclick={openCards}>Practise flashcards</button>
      </div>
    </div>
    <div class="feature">
      <div class="feature-top"><span>FEATURED FRENCH LESSON</span><span class="pill">B1 GRAMMAR</span></div>
      <div class="feature-body">
        <span class="feature-tag">A small shift. A different meaning.</span>
        <h2 lang="fr">Je ne mange <b>que</b> des légumes.</h2>
        <p>I only eat vegetables.</p>
        <div class="feature-rule"></div>
        <h2 lang="fr">Je ne mange des légumes <b>que</b> le dimanche.</h2>
        <p>I eat vegetables only on Sundays.</p>
      </div>
      <button class="feature-link" onclick={openFrenchLessons}>Understand the difference <span>→</span></button>
    </div>
  </section>

  <div class="section-heading"><div><span class="eyebrow">YOUR NEXT STEP</span><h2>Choose how to learn</h2></div><span>{languageName}</span></div>
  <section class="path-grid" aria-label="Learning activities">
    <button class="path" onclick={openLessons}>
      <span class="path-icon lessons-icon">Aa</span>
      <span class="eyebrow">UNDERSTAND</span>
      <strong>Guided lessons</strong>
      <p>Clear explanations, contrasting examples and varied practice that goes beyond memorising answers.</p>
      <span class="path-footer"><span>{languageCode === "fr" ? "3 B1 lessons" : "French lessons available"}</span><span>↗</span></span>
    </button>
    <button class="path" onclick={openCards}>
      <span class="path-icon cards-icon">✦</span>
      <span class="eyebrow">REMEMBER</span>
      <strong>Flashcard practice</strong>
      <p>Build vocabulary with visual scenes, useful phrases and repeatable practice at your pace.</p>
      <span class="path-footer"><span>{cardTotal} cards · {deckCount} decks</span><span>↗</span></span>
    </button>
  </section>

  <div class="section-heading progress-heading"><div><span class="eyebrow">YOUR JOURNEY</span><h2>Learning progress</h2></div><span>Saved on this device</span></div>
  <section class="stats" aria-label="Your learning progress">
    <div class="stat"><span>Cards attempted</span><strong>{cardsSeen}<small> / {cardTotal}</small></strong><small>In {languageName}</small></div>
    <div class="stat"><span>Cards mastered</span><strong>{cardsMastered}</strong><div class="meter"><div style:width={mastery + "%"}></div></div></div>
    <div class="stat"><span>Flashcard accuracy</span><strong>{accuracy === null ? "—" : accuracy + "%"}</strong><small>Across attempts</small></div>
    <div class="stat"><span>French lessons completed</span><strong>{lessonsFinished}<small> / 3</small></strong><small>Perfect-score rounds</small></div>
  </section>
</main>

<style>
  .home{width:min(1120px,calc(100% - 40px));margin:0 auto;padding:25px 0 52px;color:#17354b}
  .hero{display:grid;grid-template-columns:1.05fr .95fr;gap:26px;align-items:stretch}
  .hero-text{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:34px 12px 30px 3px}
  .eyebrow{font-size:11px;letter-spacing:.14em;font-weight:850;color:#267976}
  h1{font-size:clamp(36px,4.25vw,58px);line-height:1.06;letter-spacing:-.052em;margin:17px 0 17px;font-weight:850}
  h1 em{color:#24817d;font-style:normal}
  .hero-text p{font-size:16px;line-height:1.65;color:#5b7082;max-width:530px;margin:0}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:29px}
  .primary-action,.secondary-action{padding:15px 18px;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer}
  .primary-action{display:flex;gap:22px;align-items:center;background:#236f70;color:#fff;border:1px solid #236f70}
  .primary-action:hover{background:#15595b}
  .secondary-action{background:#fff;color:#24545e;border:1px solid #bed2d4}
  .secondary-action:hover{border-color:#247e78}
  .feature{background:#13384b;border-radius:23px;color:white;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 14px 34px #24415221}
  .feature-top{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;gap:12px;font-size:10px;letter-spacing:.11em;font-weight:850;color:#b2d7da}
  .pill{border:1px solid #638895;padding:7px 10px;border-radius:25px;white-space:nowrap}
  .feature-body{padding:12px 26px 22px;flex:1}
  .feature-tag{display:block;color:#9bd2cd;font-size:13px;margin-bottom:23px}
  .feature-body h2{font-size:clamp(18px,2vw,22px);letter-spacing:-.025em;line-height:1.35;margin:0}
  .feature-body h2 b{color:#ffca98}
  .feature-body p{color:#bfd6dd;font-size:13px;margin:7px 0}
  .feature-rule{height:1px;background:#446577;margin:22px 0}
  .feature-link{display:flex;justify-content:space-between;gap:20px;background:#1a4d5d;color:white;border:0;border-top:1px solid #436678;padding:17px 24px;font:inherit;font-weight:750;cursor:pointer}
  .feature-link:hover{background:#286475}
  .section-heading{display:flex;justify-content:space-between;align-items:end;gap:16px;margin:33px 0 15px}
  .section-heading h2{font-size:24px;letter-spacing:-.035em;margin:7px 0 0}
  .section-heading>span{color:#718593;font-size:13px;font-weight:650;padding-bottom:5px}
  .path-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .path{display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:23px;border-radius:20px;border:1px solid #dce5eb;background:#fff;color:#1c354a;cursor:pointer}
  .path:hover{border-color:#82adae;box-shadow:0 10px 25px #21435415;transform:translateY(-2px)}
  .path-icon{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:22px;font-weight:850;margin-bottom:21px}
  .lessons-icon{background:#e3f2ee;color:#257669}.cards-icon{background:#fff0e3;color:#c67a32}
  .path strong{font-size:22px;letter-spacing:-.035em;margin:8px 0}
  .path p{color:#657b8b;font-size:14px;line-height:1.55;margin:0;max-width:420px;min-height:44px}
  .path-footer{border-top:1px solid #e6edf1;margin-top:22px;padding-top:15px;width:100%;display:flex;justify-content:space-between;color:#267976;font-size:13px;font-weight:750}
  .progress-heading{margin-top:32px}
  .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
  .stat{display:flex;flex-direction:column;align-items:flex-start;min-height:141px;padding:20px;border:1px solid #dce5eb;border-radius:17px;background:#fff}
  .stat>span{color:#657f90;font-size:12px;font-weight:750}
  .stat strong{font-size:37px;letter-spacing:-.04em;margin:15px 0 8px;line-height:1.1}
  .stat strong small{font-size:15px;color:#7b8b99;font-weight:650;letter-spacing:0}
  .stat>small{font-size:12px;color:#8a9ba4;margin-top:auto}
  .meter{height:6px;width:100%;border-radius:20px;background:#e5efee;overflow:hidden;margin-top:auto}
  .meter div{height:100%;background:#2e9d86;border-radius:20px}
  @media(max-width:850px){.hero{grid-template-columns:1fr}.hero-text{padding:18px 0 8px}.feature{min-height:280px}.stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:560px){.home{width:calc(100% - 28px);padding-top:12px}.hero-text h1{font-size:38px}.hero-actions{width:100%}.primary-action,.secondary-action{flex:1;justify-content:center}.path-grid{grid-template-columns:1fr}.path{padding:20px}.stats{gap:9px}.stat{padding:15px;min-height:120px}.stat strong{font-size:30px}.section-heading>span{font-size:11px}.feature-top{padding:17px 20px}.feature-body{padding:12px 20px 25px}}
</style>
