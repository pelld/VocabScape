const LANGUAGES = window.VOCABSCAPE_LANGUAGES;
const SCENES = window.VOCABSCAPE_SCENES;
const KEY = "vocabscape-progress-v1";

let memory = {};
try { memory = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) { memory = {}; }

let language = localStorage.getItem("vocabscape-language") || "fr";
if (!LANGUAGES[language]) language = Object.keys(LANGUAGES)[0];

let sceneIndex = 0;
let currentIndex = 0;
let mode = "type";
let sessionCorrect = 0;
let sessionAttempts = 0;
let countedCurrent = false;

const NS = "http://www.w3.org/2000/svg";

function norm(value) {
  return value.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'").replace(/\s+/g, " ");
}

function scene() { return SCENES[sceneIndex]; }
function object() { return scene().objects[currentIndex]; }
function term(o = object()) { return o.terms[language]; }
function memoryKey(o) { return `${language}:${o.id}`; }

function wordState(o) {
  const key = memoryKey(o);
  if (!memory[key]) memory[key] = { correct: 0, wrong: 0, mastered: false };
  return memory[key];
}

function save() { localStorage.setItem(KEY, JSON.stringify(memory)); }

function makeSvg(name, attrs = {}) {
  const el = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, String(v)));
  return el;
}

function pointsString(points) { return points.map(p => p[0] + "," + p[1]).join(" "); }

function configureLanguagePicker() {
  const select = document.getElementById("languageSelect");
  select.innerHTML = "";
  Object.entries(LANGUAGES).forEach(([code, cfg]) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = cfg.nativeName;
    select.appendChild(option);
  });
  select.value = language;
}

function configureStrictMode() {
  const cfg = LANGUAGES[language];
  const row = document.getElementById("strictSetting");
  const checkbox = document.getElementById("strictMode");
  if (!cfg.strictLabel) {
    row.hidden = true;
    checkbox.checked = false;
  } else {
    row.hidden = false;
    document.getElementById("strictLabel").textContent = cfg.strictLabel;
    if (checkbox.dataset.language !== language) {
      checkbox.checked = cfg.strictDefault;
      checkbox.dataset.language = language;
    }
  }
}

function renderPicker() {
  const holder = document.getElementById("scenePicker");
  holder.querySelectorAll(".scene-button").forEach(x => x.remove());
  SCENES.forEach((s,i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "scene-button" + (i === sceneIndex ? " active" : "");
    b.innerHTML = `<strong>${s.name}</strong><span>${s.objects.length} objects</span>`;
    b.addEventListener("click", () => switchScene(i));
    holder.appendChild(b);
  });
}

function setSceneAspect() {
  const img = document.getElementById("sceneImage");
  const box = document.getElementById("sceneBox");
  if (img.naturalWidth && img.naturalHeight) {
    box.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
  }
}

function renderScene() {
  const s = scene();
  const img = document.getElementById("sceneImage");
  img.onload = setSceneAspect;
  img.src = s.image;
  img.alt = `${s.name} vocabulary scene`;
  if (img.complete) setSceneAspect();

  document.getElementById("sceneTitle").textContent = s.name;
  document.getElementById("sceneCount").textContent = `${s.objects.length} objects · ${LANGUAGES[language].nativeName}`;
  document.getElementById("credit").textContent = s.credit || "";

  renderOverlay();
  renderPrompt();
  updateStats();
}

function renderOverlay() {
  const svg = document.getElementById("overlay");
  svg.innerHTML = "";
  const showAll = document.getElementById("showAll").checked;

  scene().objects.forEach((o,i) => {
    const classes = ["poly"];
    if (mode === "type" && i === currentIndex) classes.push("target");
    if (showAll || mode === "explore") classes.push("reveal");
    if (wordState(o).mastered) classes.push("mastered");

    svg.appendChild(makeSvg("polygon", {
      points: pointsString(o.points),
      class: classes.join(" ")
    }));
  });
}

function pointInPolygon(point, polygon) {
  const [x,y] = point;
  let inside = false;
  for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [xi,yi] = polygon[i], [xj,yj] = polygon[j];
    const crosses = ((yi > y) !== (yj > y)) &&
      (x < (xj-xi)*(y-yi)/((yj-yi)||1e-12)+xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

function polygonArea(points) {
  let area = 0;
  for (let i=0,j=points.length-1;i<points.length;j=i++) {
    area += points[j][0]*points[i][1] - points[i][0]*points[j][1];
  }
  return Math.abs(area)/2;
}

function eventToPoint(event) {
  const box = document.getElementById("sceneBox").getBoundingClientRect();
  return [
    Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),
    Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))
  ];
}

function hitsAt(point) {
  return scene().objects
    .map((o,i) => ({ object:o, index:i, area:polygonArea(o.points) }))
    .filter(x => pointInPolygon(point,x.object.points))
    .sort((a,b) => a.area-b.area);
}

function setFloatingLabel(o,event) {
  const label = document.getElementById("floatLabel");
  const box = document.getElementById("sceneBox").getBoundingClientRect();
  label.textContent = `${o.terms[language].display} — ${o.concept}`;
  label.style.left = Math.max(8,Math.min(box.width-190,event.clientX-box.left+10)) + "px";
  label.style.top = Math.max(8,event.clientY-box.top+10) + "px";
  label.hidden = false;
  clearTimeout(setFloatingLabel.timer);
  setFloatingLabel.timer = setTimeout(() => label.hidden = true, 2200);
}

function handleSceneClick(event) {
  const hits = hitsAt(eventToPoint(event));
  if (!hits.length) return;

  if (mode === "click") {
    const targetHit = hits.some(x => x.index === currentIndex);
    sessionAttempts++;
    const fb = document.getElementById("feedback");

    if (targetHit) {
      const s = wordState(object());
      s.correct++;
      s.mastered = true;
      sessionCorrect++;
      save();
      fb.textContent = `✓ Correct — ${term().display}`;
      fb.className = "feedback good";
      updateStats();
      setTimeout(nextQuestion,650);
    } else {
      wordState(object()).wrong++;
      save();
      fb.textContent = "Not that one — try again.";
      fb.className = "feedback bad";
      updateStats();
    }
    return;
  }

  const chosen = hits[0];

  if (mode === "type") {
    currentIndex = chosen.index;
    countedCurrent = false;
    clearFeedback();
    document.getElementById("answerInput").value = "";
    renderScene();
    focusInput();
  } else {
    setFloatingLabel(chosen.object,event);
  }
}

function acceptedAnswers() {
  const t = term();
  return (document.getElementById("strictMode").checked ? t.strictAnswers : t.looseAnswers).map(norm);
}

function checkTyped() {
  if (mode !== "type") return;
  const input = document.getElementById("answerInput").value;
  if (!input.trim()) return;

  const fb = document.getElementById("feedback");
  const ok = acceptedAnswers().includes(norm(input));
  sessionAttempts++;

  if (ok) {
    if (!countedCurrent) {
      const s = wordState(object());
      s.correct++;
      s.mastered = true;
      sessionCorrect++;
      countedCurrent = true;
      save();
    }
    fb.textContent = `✓ Correct — ${term().display}`;
    fb.className = "feedback good";
    updateStats();
    setTimeout(nextQuestion,650);
  } else {
    wordState(object()).wrong++;
    save();
    const cfg = LANGUAGES[language];
    fb.textContent = document.getElementById("strictMode").checked && cfg.strictHint
      ? `Not quite. ${cfg.strictHint}`
      : "Not quite. Try again.";
    fb.className = "feedback bad";
    updateStats();
  }
}

function renderPrompt() {
  const t = term();
  document.getElementById("typeControls").style.display = mode === "type" ? "block" : "none";
  document.getElementById("showAnswer").style.display = mode === "explore" ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display = mode === "explore" ? "none" : "inline-block";
  document.getElementById("clickInstruction").textContent = "";

  if (mode === "type") {
    document.getElementById("promptSmall").textContent = `What is the highlighted object in ${LANGUAGES[language].name}?`;
    document.getElementById("prompt").textContent = object().concept;
  } else if (mode === "click") {
    document.getElementById("promptSmall").textContent = "Click the matching object in the picture.";
    document.getElementById("prompt").textContent = t.display;
    document.getElementById("clickInstruction").textContent = `Find: ${object().concept}`;
  } else {
    document.getElementById("promptSmall").textContent = "Explore the scene.";
    document.getElementById("prompt").textContent = `Click any outlined object to reveal its ${LANGUAGES[language].name} name.`;
  }

  document.getElementById("answerInput").value = "";
}

function nextQuestion() {
  const ranked = scene().objects
    .map((o,i) => {
      const s = wordState(o);
      return { i, score:s.correct*2-s.wrong*2+(s.mastered?4:0) };
    })
    .filter(x => x.i !== currentIndex);

  ranked.sort((a,b) => a.score-b.score || Math.random()-.5);
  const pool = ranked.slice(0,Math.max(3,Math.ceil(ranked.length/2)));
  currentIndex = pool[Math.floor(Math.random()*pool.length)].i;

  countedCurrent = false;
  clearFeedback();
  renderScene();
  focusInput();
}

function switchScene(i) {
  sceneIndex = i;
  currentIndex = 0;
  countedCurrent = false;
  clearFeedback();
  renderPicker();
  renderScene();
  focusInput();
}

function switchMode(nextMode) {
  mode = nextMode;
  countedCurrent = false;
  clearFeedback();
  document.querySelectorAll(".mode-tabs button").forEach(b => b.classList.remove("active"));
  document.getElementById(`${nextMode}Mode`).classList.add("active");
  renderScene();
  focusInput();
}

function switchLanguage(code) {
  language = code;
  localStorage.setItem("vocabscape-language", language);
  currentIndex = 0;
  countedCurrent = false;
  sessionCorrect = 0;
  sessionAttempts = 0;
  clearFeedback();
  configureStrictMode();
  renderScene();
  focusInput();
}

function showAnswer() {
  const fb = document.getElementById("feedback");
  fb.textContent = term().display;
  fb.className = "feedback";
}

function clearFeedback() {
  const fb = document.getElementById("feedback");
  fb.textContent = "";
  fb.className = "feedback";
}

function focusInput() {
  if (mode === "type") setTimeout(() => document.getElementById("answerInput").focus(),0);
}

function updateStats() {
  const objects = scene().objects;
  const mastered = objects.filter(o => wordState(o).mastered).length;
  const allObjects = SCENES.flatMap(s => s.objects);
  const uniqueKeys = [...new Set(allObjects.map(o => memoryKey(o)))];
  const globalMastered = uniqueKeys.filter(k => memory[k]?.mastered).length;

  document.getElementById("progressFill").style.width = `${mastered/Math.max(1,objects.length)*100}%`;
  document.getElementById("masteredLabel").textContent = `${mastered}/${objects.length} learned`;
  document.getElementById("sessionLabel").textContent = `${sessionCorrect}/${sessionAttempts} correct`;
  document.getElementById("sceneProgress").textContent = `${mastered}/${objects.length}`;
  document.getElementById("globalProgress").textContent = `${globalMastered}/${uniqueKeys.length}`;
}

document.getElementById("sceneBox").addEventListener("click",handleSceneClick);
document.getElementById("checkBtn").addEventListener("click",checkTyped);
document.getElementById("nextBtn").addEventListener("click",nextQuestion);
document.getElementById("showAnswer").addEventListener("click",showAnswer);
document.getElementById("showAll").addEventListener("change",renderOverlay);
document.getElementById("strictMode").addEventListener("change",renderPrompt);
document.getElementById("answerInput").addEventListener("keydown",e => { if (e.key === "Enter") checkTyped(); });
document.getElementById("typeMode").addEventListener("click",() => switchMode("type"));
document.getElementById("clickMode").addEventListener("click",() => switchMode("click"));
document.getElementById("exploreMode").addEventListener("click",() => switchMode("explore"));
document.getElementById("languageSelect").addEventListener("change",e => switchLanguage(e.target.value));

configureLanguagePicker();
configureStrictMode();
renderPicker();
renderScene();
focusInput();
