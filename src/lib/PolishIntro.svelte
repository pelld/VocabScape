<script lang="ts">
  type Phrase = {
    polish: string;
    english: string;
    sound: string;
    note?: string;
    answers?: string[];
  };

  const essentials: Phrase[] = [
    { polish: "Dzień dobry", english: "Good morning / hello", sound: "jyen DOH-bri" },
    { polish: "Cześć", english: "Hi / bye", sound: "cheshch" },
    { polish: "Dziękuję", english: "Thank you", sound: "jen-KOO-yeh" },
    { polish: "Proszę", english: "Please / you're welcome / here you are", sound: "PROH-sheh" },
    { polish: "Przepraszam", english: "Sorry / excuse me", sound: "psheh-PRAH-sham" },
    { polish: "Nie mówię po polsku", english: "I don't speak Polish", sound: "nyeh MOO-vyeh poh POL-skoo" },
    { polish: "Czy mówi pan po angielsku?", english: "Do you speak English?", sound: "chih MOO-vee pan poh an-GYEL-skoo", note: "Use pani instead of pan when speaking to a woman.", answers: ["Czy mówi pan po angielsku", "Czy mówi pani po angielsku"] },
    { polish: "Poproszę…", english: "I'd like… / …please", sound: "poh-PROH-sheh" }
  ];

  const useful: Phrase[] = [
    { polish: "Ile to kosztuje?", english: "How much does it cost?", sound: "EE-leh toh kosh-TOO-yeh" },
    { polish: "Gdzie jest toaleta?", english: "Where is the toilet?", sound: "g-jyeh yest toh-ah-LEH-tah" },
    { polish: "Dwa bilety, proszę", english: "Two tickets, please", sound: "dvah bee-LEH-tih PROH-sheh" },
    { polish: "Na miejscu", english: "Eat in / for here", sound: "nah MYEY-stsoo" },
    { polish: "Na wynos", english: "Takeaway / to go", sound: "nah VIH-nos" },
    { polish: "Kartą, proszę", english: "By card, please", sound: "KAR-tohn PROH-sheh" },
    { polish: "Tak", english: "Yes", sound: "tahk" },
    { polish: "Nie", english: "No", sound: "nyeh" }
  ];

  const sounds = [
    { letters: "w", sound: "v", example: "Wrocław starts with a v sound" },
    { letters: "ł", sound: "English w", example: "Wrocław: the ł is like w" },
    { letters: "j", sound: "y", example: "jest ≈ yest" },
    { letters: "c", sound: "ts", example: "Wrocław has ts before ł" },
    { letters: "cz", sound: "ch", example: "cześć starts roughly ch…" },
    { letters: "sz", sound: "sh", example: "proszę contains sh" },
    { letters: "rz / ż", sound: "zh", example: "like the s in measure" },
    { letters: "ó", sound: "oo", example: "mówię begins MOO…" }
  ];

  let practiceIndex = 0;
  let practiceAnswer = "";
  let practiceFeedback = "";
  let practiceTone: "good" | "bad" | "neutral" = "neutral";

  $: practicePhrase = essentials[practiceIndex];

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace("…", ""));
    utterance.lang = "pl-PL";
    utterance.rate = 0.82;
    window.speechSynthesis.speak(utterance);
  }

  function normalise(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[łŁ]/g, "l")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.!?,;:…]/g, "")
      .replace(/\s+/g, " ");
  }

  function checkPractice() {
    if (!practiceAnswer.trim()) return;
    const accepted = practicePhrase.answers ?? [practicePhrase.polish];
    const correct = accepted.some((answer) => normalise(answer) === normalise(practiceAnswer));

    if (correct) {
      practiceFeedback = practicePhrase.polish;
      practiceTone = "good";
      speak(practicePhrase.polish);
    } else {
      practiceFeedback = "Not quite — try once more, or reveal it.";
      practiceTone = "bad";
    }
  }

  function revealPractice() {
    practiceFeedback = practicePhrase.polish;
    practiceTone = "neutral";
    speak(practicePhrase.polish);
  }

  function nextPractice() {
    practiceIndex = (practiceIndex + 1) % essentials.length;
    practiceAnswer = "";
    practiceFeedback = "";
    practiceTone = "neutral";
  }

  function handlePracticeKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      if (practiceTone === "good" || practiceTone === "neutral" && practiceFeedback) nextPractice();
      else checkPractice();
    }
  }
</script>

<section class="polish-intro">
  <div class="polish-hero">
    <div>
      <span class="polish-kicker">Polski · Introduction</span>
      <h1>Enough Polish to actually use it.</h1>
      <p>Start with greetings, politeness and the phrases most likely to be useful in Wrocław. Listen, copy the sound, then test yourself.</p>
    </div>
    <div class="polish-place">
      <span class="flag-pl" aria-hidden="true"><i></i></span>
      <strong>Wrocław</strong>
      <span>VROT-swahf</span>
      <button class="sound-button hero-sound" onclick={() => speak("Wrocław")}>▶ Hear it</button>
    </div>
  </div>

  <div class="intro-grid">
    <article class="intro-panel phrase-panel">
      <div class="panel-heading">
        <div>
          <span class="section-number">01</span>
          <h2>Say these first</h2>
        </div>
        <span class="panel-note">Tap ▶ to hear Polish</span>
      </div>

      <div class="phrase-list">
        {#each essentials as phrase}
          <div class="phrase-row">
            <button class="sound-button compact" onclick={() => speak(phrase.polish)} aria-label="Hear Polish phrase">▶</button>
            <div class="phrase-polish">
              <strong>{phrase.polish}</strong>
              <span>{phrase.sound}</span>
            </div>
            <div class="phrase-english">
              <span>{phrase.english}</span>
              {#if phrase.note}<small>{phrase.note}</small>{/if}
            </div>
          </div>
        {/each}
      </div>
    </article>

    <article class="intro-panel pronunciation-panel">
      <div class="panel-heading">
        <div>
          <span class="section-number">02</span>
          <h2>Decode the spelling</h2>
        </div>
      </div>
      <p class="panel-copy">Polish looks harder than it sounds because the same letter combinations are very consistent. Learn these and a lot of signs become pronounceable.</p>

      <div class="sound-grid">
        {#each sounds as item}
          <div class="sound-tile">
            <strong>{item.letters}</strong>
            <span>{item.sound}</span>
            <small>{item.example}</small>
          </div>
        {/each}
      </div>

      <div class="wroclaw-breakdown">
        <span>W</span><span>ro</span><span>c</span><span>ł</span><span>aw</span>
        <small>v + ro + ts + w + ahf → <b>VROT-swahf</b></small>
      </div>
    </article>

    <article class="intro-panel useful-panel">
      <div class="panel-heading">
        <div>
          <span class="section-number">03</span>
          <h2>Café, tickets, getting unstuck</h2>
        </div>
      </div>

      <div class="useful-grid">
        {#each useful as phrase}
          <button class="useful-phrase" onclick={() => speak(phrase.polish)}>
            <span class="mini-play">▶</span>
            <strong>{phrase.polish}</strong>
            <span>{phrase.english}</span>
            <small>{phrase.sound}</small>
          </button>
        {/each}
      </div>
    </article>

    <article class="intro-panel practice-panel">
      <div class="panel-heading">
        <div>
          <span class="section-number">04</span>
          <h2>Quick practice</h2>
        </div>
        <span class="panel-note">{practiceIndex + 1} / {essentials.length}</span>
      </div>

      <div class="practice-card">
        <span class="practice-label">Say this in Polish</span>
        <h3>{practicePhrase.english}</h3>

        <div class="practice-answer">
          <input
            bind:value={practiceAnswer}
            type="text"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="Type the Polish…"
            onkeydown={handlePracticeKeydown}
          />
          <button class="primary" onclick={checkPractice}>Check</button>
        </div>

        <p class="practice-hint">Polish accents are optional when checking your answer.</p>
        <div class="practice-feedback" class:good={practiceTone === "good"} class:bad={practiceTone === "bad"}>{practiceFeedback}</div>

        <div class="practice-actions">
          <button class="quiet" onclick={revealPractice}>Reveal + hear</button>
          <button class="next-button" onclick={nextPractice}>Next</button>
        </div>
      </div>
    </article>
  </div>
</section>
