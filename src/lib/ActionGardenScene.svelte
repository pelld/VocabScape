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
  let labelX = 18;
  let labelY = 18;
  let labelVisible = false;
  let labelTimer: number | undefined;

  const src = (file: string) => `${import.meta.env.BASE_URL}action-garden/${file}`;

  function choose(event: MouseEvent, object: any, index: number) {
    if (mode === "type") return;

    if (mode === "explore") {
      const box = frame.getBoundingClientRect();
      const term = object.terms[language];

      label = `${term.display} · ${object.concept}`;
      labelX = Math.max(12, Math.min(box.width - 230, event.clientX - box.left + 12));
      labelY = Math.max(12, Math.min(box.height - 54, event.clientY - box.top + 12));
      labelVisible = true;

      if (labelTimer) window.clearTimeout(labelTimer);
      labelTimer = window.setTimeout(() => (labelVisible = false), 2400);
      return;
    }

    onhit(index);
  }
</script>

<div class="action-scene" bind:this={frame}>
  <img class="background" src={src("background.webp")} alt="Sunny cottage garden" draggable="false" />

  {#each scene.objects as object, index (object.id)}
    <button
      class="action-layer"
      class:target={index === currentIndex && mode === "type"}
      class:reveal={showAll || mode === "explore"}
      class:mastered={masteredIds.has(object.id)}
      style={`left:${object.layout.left}%;top:${object.layout.top}%;width:${object.layout.width}%;z-index:${object.layout.z};`}
      aria-label={object.concept}
      onclick={(event) => choose(event, object, index)}
      type="button"
    >
      <img src={src(object.asset)} alt={object.concept} draggable="false" />
    </button>
  {/each}

  {#if labelVisible}
    <div class="floating-label" style={`left:${labelX}px;top:${labelY}px`}>{label}</div>
  {/if}
</div>

<style>
  .action-scene {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 24px;
    background: #dfe7ef;
    box-shadow: 0 18px 50px rgba(15, 34, 58, 0.13);
    user-select: none;
    isolation: isolate;
  }

  .background {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  }

  .action-layer {
    position: absolute;
    display: block;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    transform-origin: 50% 80%;
    transition: transform 120ms ease, filter 120ms ease, opacity 120ms ease;
  }

  .action-layer img {
    display: block;
    width: 100%;
    height: auto;
    pointer-events: none;
    filter: drop-shadow(0 5px 4px rgba(15, 34, 30, 0.18));
  }

  .action-layer:hover,
  .action-layer:focus-visible {
    transform: translateY(-2px);
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.95));
    outline: none;
  }

  .action-layer.target {
    filter:
      drop-shadow(0 0 4px #fff7ed)
      drop-shadow(0 0 10px #ff7258)
      drop-shadow(0 0 18px rgba(255, 114, 88, 0.8));
  }

  .action-layer.reveal:not(.target) {
    filter: drop-shadow(0 0 7px rgba(64, 120, 216, 0.72));
  }

  .action-layer.mastered:not(.target) {
    opacity: 0.96;
  }

  .floating-label {
    position: absolute;
    z-index: 50;
    max-width: 250px;
    padding: 9px 12px;
    border: 1px solid rgba(20, 39, 66, 0.12);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.97);
    color: #10243e;
    font-size: 0.9rem;
    font-weight: 750;
    box-shadow: 0 10px 30px rgba(15, 34, 58, 0.18);
    pointer-events: none;
  }

  @media (max-width: 700px) {
    .action-scene {
      border-radius: 18px;
    }
  }
</style>
