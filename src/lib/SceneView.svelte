<script lang="ts">
  export let scene: any;
  export let language: string;
  export let mode: "type" | "click" | "explore";
  export let currentIndex: number;
  export let showAll = false;
  export let masteredIds: Set<string> = new Set();
  export let onhit: (index: number) => void;

  let ratio = "16 / 9";
  let label = "";
  let labelX = 16;
  let labelY = 16;
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

  $: orderedObjects = scene.objects
    .map((object: any, index: number) => ({ object, index, area: polygonArea(object.points) }))
    .sort((a: any, b: any) => b.area - a.area);

  $: imageSource = scene.image.startsWith("http")
    ? scene.image
    : `${import.meta.env.BASE_URL}${scene.image}`;

  function imageLoaded(event: Event) {
    const image = event.currentTarget as HTMLImageElement;
    if (image.naturalWidth && image.naturalHeight) {
      ratio = `${image.naturalWidth} / ${image.naturalHeight}`;
    }
  }

  function chooseObject(event: MouseEvent, object: any, index: number) {
    event.stopPropagation();

    if (mode === "explore") {
      const svg = event.currentTarget instanceof SVGElement ? event.currentTarget.ownerSVGElement : null;
      const box = svg?.getBoundingClientRect();
      const term = object.terms[language];

      label = `${term.display} · ${object.concept}`;
      labelX = box ? Math.max(12, Math.min(box.width - 190, event.clientX - box.left + 12)) : 16;
      labelY = box ? Math.max(12, event.clientY - box.top + 12) : 16;
      labelVisible = true;

      if (labelTimer) window.clearTimeout(labelTimer);
      labelTimer = window.setTimeout(() => (labelVisible = false), 2400);
      return;
    }

    onhit(index);
  }
</script>

<div class="scene-frame" style={`aspect-ratio:${ratio}`}>
  <img src={imageSource} alt={`${scene.name} vocabulary scene`} onload={imageLoaded} draggable="false" />

  <svg class="hotspots" viewBox="0 0 1 1" preserveAspectRatio="none" aria-label="Clickable vocabulary objects">
    {#each orderedObjects as item (item.object.id)}
      <polygon
        points={pointString(item.object.points)}
        class:target={mode === "type" && item.index === currentIndex}
        class:reveal={showAll || mode === "explore"}
        class:mastered={masteredIds.has(item.object.id)}
        class="hotspot"
        onclick={(event) => chooseObject(event, item.object, item.index)}
      >
        <title>{item.object.concept}</title>
      </polygon>
    {/each}
  </svg>

  {#if labelVisible}
    <div class="floating-label" style={`left:${labelX}px;top:${labelY}px`}>{label}</div>
  {/if}
</div>

<style>
  .scene-frame {
    position: relative;
    width: 100%;
    min-height: 300px;
    overflow: hidden;
    border-radius: 24px;
    background: #dfe7ef;
    box-shadow: 0 18px 50px rgba(15, 34, 58, 0.13);
    user-select: none;
  }

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }

  .hotspots {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .hotspot {
    fill: rgba(255, 255, 255, 0.001);
    stroke: transparent;
    stroke-width: 0.0035;
    vector-effect: non-scaling-stroke;
    cursor: pointer;
    transition: fill 120ms ease, stroke 120ms ease;
    pointer-events: all;
  }

  .hotspot:hover {
    fill: rgba(255, 255, 255, 0.13);
    stroke: rgba(255, 255, 255, 0.55);
  }

  .hotspot.target {
    fill: rgba(255, 116, 93, 0.24);
    stroke: #ff745d;
    stroke-width: 0.005;
  }

  .hotspot.reveal {
    fill: rgba(78, 142, 255, 0.12);
    stroke: rgba(70, 122, 210, 0.72);
  }

  .hotspot.mastered:not(.target) {
    stroke: rgba(36, 154, 105, 0.58);
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
    font-size: 0.9rem;
    font-weight: 750;
    box-shadow: 0 10px 30px rgba(15, 34, 58, 0.18);
    pointer-events: none;
  }

  @media (max-width: 700px) {
    .scene-frame {
      min-height: 220px;
      border-radius: 18px;
    }
  }
</style>
