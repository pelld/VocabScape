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

  const polygonArea = (points: number[][]) => {
    let area = 0;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      area += points[j][0] * points[i][1] - points[i][0] * points[j][1];
    }
    return Math.abs(area) / 2;
  };

  const pointString = (points: number[][]) => points.map(([x, y]) => `${x},${y}`).join(" ");

  $: imageSource = scene.image.startsWith("http")
    ? scene.image
    : `${import.meta.env.BASE_URL}${scene.image}`;

  // Larger regions render first; small objects render last and therefore win hit-testing
  // where shapes overlap (for example, bench over lawn).
  $: orderedObjects = scene.objects
    .map((object: any, index: number) => ({ object, index, area: polygonArea(object.points) }))
    .sort((a: any, b: any) => b.area - a.area);

  function choose(event: MouseEvent, object: any, index: number) {
    event.stopPropagation();

    if (mode === "explore") {
      const box = frame.getBoundingClientRect();
      const term = object.terms[language];

      label = `${term.display} · ${object.concept}`;
      labelX = Math.max(12, Math.min(box.width - 205, event.clientX - box.left + 12));
      labelY = Math.max(12, Math.min(box.height - 50, event.clientY - box.top + 12));
      labelVisible = true;

      if (labelTimer) window.clearTimeout(labelTimer);
      labelTimer = window.setTimeout(() => (labelVisible = false), 2200);
      return;
    }

    onhit(index);
  }

  function keyboardChoose(event: KeyboardEvent, object: any, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      if (mode === "explore") {
        label = `${object.terms[language].display} · ${object.concept}`;
        labelX = 18;
        labelY = 18;
        labelVisible = true;
        if (labelTimer) window.clearTimeout(labelTimer);
        labelTimer = window.setTimeout(() => (labelVisible = false), 2200);
      } else {
        onhit(index);
      }
    }
  }
</script>

<div class="photo-scene" bind:this={frame}>
  <svg viewBox="0 0 1 1" preserveAspectRatio="none" role="img" aria-label="Garden vocabulary scene">
    <defs>
      {#each orderedObjects as item (item.object.id)}
        <clipPath id={`garden-clip-${item.object.id}`} clipPathUnits="userSpaceOnUse">
          <polygon points={pointString(item.object.points)} />
        </clipPath>
      {/each}
    </defs>

    <!-- The untouched original image. It never intercepts clicks. -->
    <image
      href={imageSource}
      x="0"
      y="0"
      width="1"
      height="1"
      preserveAspectRatio="none"
      class="base-photo"
    />

    <!-- Each object is the original photograph clipped to the user's exact polygon. -->
    {#each orderedObjects as item (item.object.id)}
      <g
        class="photo-object"
        class:target={mode === "type" && item.index === currentIndex}
        class:reveal={showAll}
        class:mastered={masteredIds.has(item.object.id)}
        role="button"
        tabindex="0"
        aria-label={item.object.concept}
        onclick={(event) => choose(event, item.object, item.index)}
        onkeydown={(event) => keyboardChoose(event, item.object, item.index)}
      >
        <image
          href={imageSource}
          x="0"
          y="0"
          width="1"
          height="1"
          preserveAspectRatio="none"
          clip-path={`url(#garden-clip-${item.object.id})`}
          class="object-photo"
        />

        <polygon
          points={pointString(item.object.points)}
          class="object-outline"
          vector-effect="non-scaling-stroke"
        />

        <title>{item.object.concept}</title>
      </g>
    {/each}
  </svg>

  {#if labelVisible}
    <div class="floating-label" style={`left:${labelX}px;top:${labelY}px`}>{label}</div>
  {/if}
</div>

<style>
  .photo-scene {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border-radius: 24px;
    background: #dfe7ef;
    box-shadow: 0 18px 50px rgba(15, 34, 58, 0.13);
    user-select: none;
  }

  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .base-photo {
    pointer-events: none;
  }

  .photo-object {
    cursor: pointer;
    outline: none;
  }

  .object-photo {
    pointer-events: visiblePainted;
    transition: filter 110ms ease;
  }

  .object-outline {
    fill: none;
    stroke: transparent;
    stroke-width: 2.5px;
    pointer-events: none;
    transition: stroke 110ms ease, stroke-width 110ms ease;
  }

  .photo-object:hover .object-photo,
  .photo-object:focus-visible .object-photo {
    filter: brightness(1.07) saturate(1.06);
  }

  .photo-object:hover .object-outline,
  .photo-object:focus-visible .object-outline {
    stroke: rgba(255, 255, 255, 0.92);
    stroke-width: 2px;
  }

  .photo-object.target .object-photo {
    filter: brightness(1.09) saturate(1.08);
  }

  .photo-object.target .object-outline {
    stroke: #ff7258;
    stroke-width: 3px;
  }

  .photo-object.reveal:not(.target) .object-outline {
    stroke: rgba(64, 120, 216, 0.7);
    stroke-width: 1.5px;
  }

  .photo-object.mastered:not(.target) .object-outline {
    stroke: rgba(36, 154, 105, 0.46);
  }

  .floating-label {
    position: absolute;
    z-index: 4;
    max-width: 240px;
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
    .photo-scene {
      border-radius: 18px;
    }
  }
</style>
