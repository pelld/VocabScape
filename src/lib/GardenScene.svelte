<script lang="ts">
  export let scene: any;
  export let language: string;
  export let mode: "type" | "click" | "explore";
  export let currentIndex: number;
  export let showAll = false;
  export let masteredIds: Set<string> = new Set();
  export let onhit: (index: number) => void;

  let frame: HTMLDivElement;
  let label = "";
  let labelX = 20;
  let labelY = 20;
  let labelVisible = false;
  let labelTimer: number | undefined;

  const objectIndex = (id: string) => scene.objects.findIndex((object: any) => object.id === id);
  const isTarget = (id: string) => objectIndex(id) === currentIndex;
  const isMastered = (id: string) => masteredIds.has(id);

  function choose(id: string, event: MouseEvent) {
    const index = objectIndex(id);
    if (index < 0) return;

    if (mode === "explore") {
      const object = scene.objects[index];
      const term = object.terms[language];
      const box = frame.getBoundingClientRect();

      label = `${term.display} · ${object.concept}`;
      labelX = Math.max(12, Math.min(box.width - 190, event.clientX - box.left + 12));
      labelY = Math.max(12, Math.min(box.height - 52, event.clientY - box.top + 12));
      labelVisible = true;

      if (labelTimer) window.clearTimeout(labelTimer);
      labelTimer = window.setTimeout(() => (labelVisible = false), 2400);
      return;
    }

    onhit(index);
  }

  function keyboardChoose(id: string, event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(id, event as unknown as MouseEvent);
    }
  }
</script>

<div class="garden-frame" bind:this={frame}>
  <svg viewBox="0 0 1200 720" role="img" aria-label="Illustrated garden vocabulary scene">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b9dcf4"/>
        <stop offset="70%" stop-color="#e8f3f6"/>
        <stop offset="100%" stop-color="#f6efe0"/>
      </linearGradient>

      <linearGradient id="grass" x1="0" y1="0" x2="0.1" y2="1">
        <stop offset="0%" stop-color="#8dbd68"/>
        <stop offset="100%" stop-color="#5d984f"/>
      </linearGradient>

      <linearGradient id="path" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stop-color="#d7c6a8"/>
        <stop offset="100%" stop-color="#aa9578"/>
      </linearGradient>

      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#9b6136"/>
        <stop offset="100%" stop-color="#663c25"/>
      </linearGradient>

      <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6f4529"/>
        <stop offset="45%" stop-color="#97603a"/>
        <stop offset="100%" stop-color="#59331f"/>
      </linearGradient>

      <linearGradient id="hedge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#527f4c"/>
        <stop offset="100%" stop-color="#315f3d"/>
      </linearGradient>

      <linearGradient id="houseWall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f4d5b2"/>
        <stop offset="100%" stop-color="#d9ad83"/>
      </linearGradient>

      <linearGradient id="shedWall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#9a795c"/>
        <stop offset="100%" stop-color="#6f533e"/>
      </linearGradient>

      <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#15351f" flood-opacity=".22"/>
      </filter>

      <filter id="targetGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ff6e52" flood-opacity=".95"/>
        <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#fff6e8" flood-opacity=".95"/>
      </filter>

      <filter id="revealGlow" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#3f76d7" flood-opacity=".72"/>
      </filter>
    </defs>

    <!-- Background atmosphere -->
    <rect width="1200" height="720" fill="url(#sky)"/>
    <circle cx="1050" cy="92" r="44" fill="#fff4bd" opacity=".72"/>
    <path d="M0 300 C170 270 310 286 460 272 C650 254 770 280 950 258 C1070 244 1145 250 1200 244 L1200 395 L0 395 Z" fill="#799863" opacity=".42"/>

    <!-- 00A. Lawn: a true background object -->
    <g
      class="object lawn"
      class:target={isTarget("lawn")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("lawn")}
      role="button"
      tabindex="0"
      aria-label="lawn"
      onclick={(event) => choose("lawn", event)}
      onkeydown={(event) => keyboardChoose("lawn", event)}
    >
      <path d="M0 352 C190 326 353 356 515 340 C720 320 909 344 1200 318 L1200 720 L0 720 Z" fill="url(#grass)"/>
      <path d="M0 575 C210 538 426 558 625 535 C850 508 1000 526 1200 498" fill="none" stroke="#a7cd80" stroke-width="5" opacity=".28"/>
      <path d="M20 635 C245 600 425 620 640 596 C850 574 1025 590 1180 562" fill="none" stroke="#4f8845" stroke-width="4" opacity=".23"/>
    </g>

    <!-- 00B. House -->
    <g
      class="object"
      class:target={isTarget("house")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("house")}
      role="button"
      tabindex="0"
      aria-label="house"
      onclick={(event) => choose("house", event)}
      onkeydown={(event) => keyboardChoose("house", event)}
    >
      <path d="M765 118 L1138 118 L1200 190 L1200 394 L765 394 Z" fill="url(#houseWall)" filter="url(#softShadow)"/>
      <path d="M730 124 L920 22 L1154 22 L1200 88 L1200 132 L765 132 Z" fill="#5d5960"/>
      <path d="M928 152 H1036 V258 H928 Z" fill="#d9edf4" stroke="#695849" stroke-width="8"/>
      <path d="M982 154 V256 M930 204 H1034" stroke="#8c7561" stroke-width="5"/>
      <path d="M1080 170 H1164 V394 H1080 Z" fill="#79543d"/>
      <circle cx="1147" cy="284" r="5" fill="#d7b978"/>
      <path d="M780 333 H1200 V394 H780 Z" fill="#c89d77" opacity=".45"/>
    </g>

    <!-- 00C. Shed -->
    <g
      class="object"
      class:target={isTarget("shed")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("shed")}
      role="button"
      tabindex="0"
      aria-label="shed"
      onclick={(event) => choose("shed", event)}
      onkeydown={(event) => keyboardChoose("shed", event)}
    >
      <path d="M868 253 L1038 220 L1105 269 L1090 450 L873 448 Z" fill="url(#shedWall)" filter="url(#softShadow)"/>
      <path d="M848 262 L1035 205 L1120 264 L1107 286 L1036 239 L861 282 Z" fill="#4f4a43"/>
      <path d="M930 302 H1025 V447 H930 Z" fill="#5f4534" stroke="#46352a" stroke-width="5"/>
      <path d="M942 316 L1012 316 M942 340 L1012 340 M942 364 L1012 364 M942 388 L1012 388" stroke="#80614a" stroke-width="5"/>
      <circle cx="1010" cy="377" r="5" fill="#c6a96d"/>
    </g>

    <!-- 00D. Hedge -->
    <g
      class="object"
      class:target={isTarget("hedge")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("hedge")}
      role="button"
      tabindex="0"
      aria-label="hedge"
      onclick={(event) => choose("hedge", event)}
      onkeydown={(event) => keyboardChoose("hedge", event)}
    >
      <path d="M0 245
               C42 206 92 214 122 240
               C156 196 222 200 250 240
               C284 203 350 205 378 244
               C412 207 474 208 504 246
               C548 214 609 216 642 252
               C680 220 733 224 765 254
               L765 360 L0 360 Z" fill="url(#hedge)"/>
      <circle cx="76" cy="272" r="34" fill="#648f57" opacity=".58"/>
      <circle cx="198" cy="257" r="42" fill="#3f7246" opacity=".54"/>
      <circle cx="330" cy="280" r="38" fill="#6a995d" opacity=".52"/>
      <circle cx="472" cy="260" r="43" fill="#416d43" opacity=".52"/>
      <circle cx="624" cy="277" r="39" fill="#6b9757" opacity=".5"/>
    </g>

    <!-- 00E. Fence -->
    <g
      class="object"
      class:target={isTarget("fence")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("fence")}
      role="button"
      tabindex="0"
      aria-label="fence"
      onclick={(event) => choose("fence", event)}
      onkeydown={(event) => keyboardChoose("fence", event)}
    >
      <g fill="#c9ae82" stroke="#9c815e" stroke-width="3">
        <path d="M470 312 H487 V438 H470 Z"/>
        <path d="M528 307 H545 V438 H528 Z"/>
        <path d="M586 305 H603 V438 H586 Z"/>
        <path d="M644 304 H661 V438 H644 Z"/>
        <path d="M702 303 H719 V438 H702 Z"/>
      </g>
      <path d="M455 330 H732 V347 H455 Z M455 386 H732 V403 H455 Z" fill="#b89b72" stroke="#927650" stroke-width="3"/>
    </g>

    <!-- 00F. Gate -->
    <g
      class="object"
      class:target={isTarget("gate")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("gate")}
      role="button"
      tabindex="0"
      aria-label="gate"
      onclick={(event) => choose("gate", event)}
      onkeydown={(event) => keyboardChoose("gate", event)}
    >
      <rect x="560" y="314" width="126" height="130" rx="5" fill="#b69668" stroke="#7e6547" stroke-width="7"/>
      <path d="M572 327 L674 430 M674 327 L572 430" stroke="#876c4b" stroke-width="8"/>
      <path d="M568 344 H678 M568 412 H678" stroke="#d0b588" stroke-width="8"/>
      <circle cx="668" cy="375" r="6" fill="#4f493e"/>
    </g>

    <!-- 00G. Path -->
    <g
      class="object"
      class:target={isTarget("path")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("path")}
      role="button"
      tabindex="0"
      aria-label="path"
      onclick={(event) => choose("path", event)}
      onkeydown={(event) => keyboardChoose("path", event)}
    >
      <path d="M602 430
               C650 460 718 485 744 520
               C783 571 750 617 692 720
               H414
               C505 612 559 554 545 514
               C533 480 560 452 602 430 Z" fill="url(#path)"/>
      <path d="M583 454 C631 478 678 496 697 526 C724 566 687 623 624 704" fill="none" stroke="#e7d9c0" stroke-width="9" opacity=".5"/>
    </g>

    <!-- 00H. Tree -->
    <g
      class="object"
      class:target={isTarget("tree")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("tree")}
      role="button"
      tabindex="0"
      aria-label="tree"
      onclick={(event) => choose("tree", event)}
      onkeydown={(event) => keyboardChoose("tree", event)}
    >
      <path d="M170 526 C200 451 205 376 196 310 C190 264 201 210 235 176
               C225 239 248 291 269 325 C293 366 283 437 306 526 Z" fill="url(#trunk)" filter="url(#softShadow)"/>
      <path d="M219 257 C177 233 139 220 100 220 M245 229 C296 202 333 173 359 138 M244 292 C293 282 335 286 380 302"
            fill="none" stroke="#6a4027" stroke-width="22" stroke-linecap="round"/>
      <g fill="#477d4d">
        <circle cx="129" cy="153" r="84"/>
        <circle cx="220" cy="111" r="105"/>
        <circle cx="318" cy="151" r="88"/>
        <circle cx="162" cy="224" r="86"/>
        <circle cx="280" cy="224" r="96"/>
      </g>
      <g fill="#68955c" opacity=".72">
        <circle cx="106" cy="125" r="46"/>
        <circle cx="244" cy="77" r="55"/>
        <circle cx="337" cy="136" r="47"/>
        <circle cx="197" cy="213" r="50"/>
      </g>
      <g fill="#83a96d" opacity=".55">
        <circle cx="153" cy="91" r="31"/>
        <circle cx="290" cy="99" r="35"/>
        <circle cx="126" cy="205" r="28"/>
      </g>
    </g>

    <!-- 00I. Bird -->
    <g
      class="object"
      class:target={isTarget("bird")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("bird")}
      role="button"
      tabindex="0"
      aria-label="bird"
      onclick={(event) => choose("bird", event)}
      onkeydown={(event) => keyboardChoose("bird", event)}
      transform="translate(303 248)"
    >
      <path d="M0 12 C18 -4 41 -3 55 10 C44 9 34 14 27 21 C17 23 8 20 0 12 Z" fill="#344f71"/>
      <path d="M22 12 C34 -2 49 -8 62 -5 C52 4 48 13 50 20 Z" fill="#587ca0"/>
      <circle cx="51" cy="7" r="3.5" fill="#101821"/>
      <path d="M57 10 L71 15 L57 18 Z" fill="#d79b44"/>
      <path d="M8 18 L-6 29 L14 23 Z" fill="#263c58"/>
    </g>

    <!-- 00J. Flowers -->
    <g
      class="object"
      class:target={isTarget("flowers")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("flowers")}
      role="button"
      tabindex="0"
      aria-label="flowers"
      onclick={(event) => choose("flowers", event)}
      onkeydown={(event) => keyboardChoose("flowers", event)}
    >
      <path d="M742 412 C780 392 818 397 858 415 C883 426 916 428 951 414 L964 470 C917 487 862 491 812 481 C778 474 753 455 742 412 Z" fill="#6b743f" opacity=".55"/>
      <g stroke="#3f7747" stroke-width="5" stroke-linecap="round">
        <path d="M775 450 L780 405 M811 458 L817 399 M850 462 L854 408 M891 461 L887 402 M925 458 L931 413"/>
      </g>
      <g>
        <g transform="translate(780 401)" fill="#d7566e"><circle cx="-8" cy="0" r="9"/><circle cx="8" cy="0" r="9"/><circle cx="0" cy="-8" r="9"/><circle cx="0" cy="8" r="9"/><circle r="5" fill="#f7d36b"/></g>
        <g transform="translate(818 396)" fill="#8260ae"><circle cx="-8" cy="0" r="9"/><circle cx="8" cy="0" r="9"/><circle cx="0" cy="-8" r="9"/><circle cx="0" cy="8" r="9"/><circle r="5" fill="#f8d979"/></g>
        <g transform="translate(855 405)" fill="#e58a4f"><circle cx="-8" cy="0" r="9"/><circle cx="8" cy="0" r="9"/><circle cx="0" cy="-8" r="9"/><circle cx="0" cy="8" r="9"/><circle r="5" fill="#f8d979"/></g>
        <g transform="translate(888 399)" fill="#df6485"><circle cx="-8" cy="0" r="9"/><circle cx="8" cy="0" r="9"/><circle cx="0" cy="-8" r="9"/><circle cx="0" cy="8" r="9"/><circle r="5" fill="#f8d979"/></g>
        <g transform="translate(930 410)" fill="#7a69bb"><circle cx="-8" cy="0" r="9"/><circle cx="8" cy="0" r="9"/><circle cx="0" cy="-8" r="9"/><circle cx="0" cy="8" r="9"/><circle r="5" fill="#f8d979"/></g>
      </g>
    </g>

    <!-- 00K. Bench -->
    <g
      class="object"
      class:target={isTarget("bench")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("bench")}
      role="button"
      tabindex="0"
      aria-label="bench"
      onclick={(event) => choose("bench", event)}
      onkeydown={(event) => keyboardChoose("bench", event)}
      filter="url(#softShadow)"
    >
      <path d="M188 462 L423 462 L408 492 L201 492 Z" fill="url(#wood)" stroke="#4f3423" stroke-width="5"/>
      <path d="M203 414 L410 414 L417 449 L197 449 Z" fill="#8d5732" stroke="#4f3423" stroke-width="5"/>
      <path d="M213 424 H402 M207 438 H408" stroke="#b0784a" stroke-width="5" opacity=".76"/>
      <path d="M215 492 L198 571 M391 492 L409 571" stroke="#403a36" stroke-width="11" stroke-linecap="round"/>
      <path d="M222 449 L211 409 M390 449 L398 409" stroke="#403a36" stroke-width="10" stroke-linecap="round"/>
      <path d="M188 501 H424" stroke="#4b4038" stroke-width="8"/>
    </g>

    <!-- 00L. Watering can -->
    <g
      class="object"
      class:target={isTarget("watering_can")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("watering_can")}
      role="button"
      tabindex="0"
      aria-label="watering can"
      onclick={(event) => choose("watering_can", event)}
      onkeydown={(event) => keyboardChoose("watering_can", event)}
      transform="translate(76 548)"
      filter="url(#softShadow)"
    >
      <path d="M35 36 C35 12 52 0 77 0 C101 0 119 16 119 40 V93 H33 Z" fill="#5f8b8d" stroke="#3e6669" stroke-width="5"/>
      <path d="M116 45 L180 18 L192 35 L121 66 Z" fill="#6d9a9b" stroke="#3e6669" stroke-width="5"/>
      <path d="M184 16 L211 8 L220 30 L193 38 Z" fill="#4f7e80"/>
      <path d="M45 13 C14 7 0 29 8 54 C14 73 30 82 43 77" fill="none" stroke="#3e6669" stroke-width="10"/>
      <path d="M48 15 C49 41 98 45 103 13" fill="none" stroke="#a7c5c3" stroke-width="6"/>
    </g>

    <!-- 00M. Wheelbarrow -->
    <g
      class="object"
      class:target={isTarget("wheelbarrow")}
      class:reveal={showAll || mode === "explore"}
      class:mastered={isMastered("wheelbarrow")}
      role="button"
      tabindex="0"
      aria-label="wheelbarrow"
      onclick={(event) => choose("wheelbarrow", event)}
      onkeydown={(event) => keyboardChoose("wheelbarrow", event)}
      transform="translate(820 520)"
      filter="url(#softShadow)"
    >
      <path d="M0 18 H170 L142 86 H35 Z" fill="#788f55" stroke="#4d6337" stroke-width="6"/>
      <path d="M135 83 L187 129 M45 85 L21 135" stroke="#4d453c" stroke-width="10" stroke-linecap="round"/>
      <path d="M164 22 L225 3 M164 35 L232 21" stroke="#4d453c" stroke-width="9" stroke-linecap="round"/>
      <circle cx="115" cy="114" r="34" fill="#45413c"/>
      <circle cx="115" cy="114" r="16" fill="#a6a09a"/>
      <path d="M24 27 C58 0 108 -7 150 19" fill="#6c4d33"/>
      <path d="M38 18 C61 2 79 3 94 14 M85 10 C109 -2 129 4 144 16" stroke="#846244" stroke-width="8" stroke-linecap="round"/>
    </g>
  </svg>

  {#if labelVisible}
    <div class="floating-label" style={`left:${labelX}px;top:${labelY}px`}>{label}</div>
  {/if}
</div>

<style>
  .garden-frame {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 24px;
    background: #dcecf3;
    box-shadow: 0 18px 50px rgba(15, 34, 58, 0.13);
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .object {
    cursor: pointer;
    transform-box: fill-box;
    transform-origin: center;
    transition: filter 130ms ease, opacity 130ms ease, transform 130ms ease;
    outline: none;
  }

  .object:hover,
  .object:focus-visible {
    filter: url(#revealGlow);
  }

  .object.target {
    filter: url(#targetGlow);
  }

  .object.reveal:not(.target) {
    filter: url(#revealGlow);
  }

  .object.mastered:not(.target) {
    opacity: .93;
  }

  .object:active {
    transform: scale(.995);
  }

  .floating-label {
    position: absolute;
    z-index: 5;
    max-width: 230px;
    padding: 9px 12px;
    border: 1px solid rgba(20, 39, 66, 0.12);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.96);
    color: #10243e;
    font-size: .9rem;
    font-weight: 750;
    box-shadow: 0 10px 30px rgba(15, 34, 58, 0.18);
    pointer-events: none;
  }

  @media (max-width: 700px) {
    .garden-frame {
      border-radius: 18px;
    }
  }
</style>
