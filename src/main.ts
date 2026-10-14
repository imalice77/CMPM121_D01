import { Game } from "./game.ts";
import { stages, upgrades } from "./content.ts";
const game = new Game();
const app = document.querySelector<HTMLElement>("#app")!;
const items = new URL("./assets/desk-items.png", import.meta.url).href;
const scenes = new URL("./assets/girl-life-scenes.png", import.meta.url).href;
const props = new URL("./assets/perspective-props.png", import.meta.url).href;
const typingScenes =
  new URL("./assets/girl-typing-scenes.png", import.meta.url).href;
const idleFaces = new URL("./assets/girl-idle-faces.png", import.meta.url).href;
const format = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const icons: Record<string, number> = {
  pencil: 0,
  pen: 1,
  mechanical: 2,
  fountain: 3,
  premium: 4,
  timer: 5,
  desk: 6,
  group: 7,
  search: 8,
  ai: 9,
  mentor: 10,
  lab: 11,
  network: 8,
};
function item(id: string, extra = ""): string {
  const i = icons[id] ?? 0;
  return `<span class="item ${extra}" aria-hidden="true" style="background-image:url('${items}');background-position:${
    i % 4 / 3 * 100
  }% ${Math.floor(i / 4) / 2 * 100}%"></span>`;
}
app.innerHTML =
  `<div class="notebook"><header><h1>ASSIGNMENT GRIND</h1><span class="page-number">01 / ∞</span></header><div class="game-layout"><section class="player"><div class="wallet"><span class="coin" aria-hidden="true">✦</span><div><small>CREDITS</small><strong id="balance"></strong></div><span id="rate" title="Automatic homework per second"></span></div><div id="scene" class="scene" style="--scene-art:url('${scenes}')" role="img" aria-label="Brown-haired ponytail girl writing homework"><div id="stage-frame" class="stage-frame" style="--scene-art:url('${scenes}')"><div class="stage-art"></div><div id="companions"></div><div class="foreground-occluder"></div><div id="equipment"></div><div id="writing-hand" class="hand-overlay"></div><div id="held-tool"></div><div class="idle-face" style="background-image:url('${idleFaces}')"></div><span id="spark" aria-hidden="true"></span></div><div id="level-banner" class="level-banner" role="status"></div></div><button id="homework" class="write-button" aria-label="Do homework"><span id="action-label">✎ WRITE!</span><span id="click-effect"></span></button><div class="journey"><div><span id="stage"></span><strong id="percent"></strong></div><progress id="progress" max="1" aria-label="Education stage progress"></progress></div><p id="notice" class="sr-only" role="status" aria-live="polite"></p></section><section class="shops" aria-label="Upgrade shops"><div class="house pen-house"><div class="roof"><span>✎</span></div><div class="facade"><div id="tools" class="tools" aria-label="Writing tools"></div><div class="house-base"><i></i><span>✎</span><i></i></div></div></div><div class="house study-house"><div class="flat-roof"><span>▤</span><i></i><i></i></div><div class="facade"><div id="resources" class="resources" aria-label="Learning resources"></div><div class="house-base"><i></i><span>▣</span><i></i></div></div></div></section></div><footer><span>SPACE / ENTER</span><details><summary>ⓘ</summary><div>Progress lasts for this session. Hover or focus a shop item for details.<p>Pixel art adapted with OpenAI imagegen from OpenMoji references. <a href="https://openmoji.org/">OpenMoji contributors</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p></div></details></footer></div>`;
const element = (id: string) => document.getElementById(id)!;
function setText(id: string, value: string): void {
  const el = element(id);
  if (el.textContent !== value) el.textContent = value;
}
for (const u of upgrades) {
  const card = document.createElement("button");
  card.className = "shelf";
  card.id = `buy-${u.id}`;
  card.setAttribute("aria-label", `Buy ${u.name}`);
  card.innerHTML = `${item(u.id)}<span class="effect">${
    u.kind === "tool" ? `${u.effect}/tap` : `+${u.effect}/s`
  }</span><span id="price-${u.id}" class="price"></span>`;
  element(u.kind === "tool" ? "tools" : "resources").append(card);
  card.addEventListener("click", () => {
    if (game.buy(u)) {
      setText("notice", `${u.name} purchased and added to your room.`);
      decorateRoom();
      element("scene").classList.add("delivery");
      setTimeout(() => element("scene").classList.remove("delivery"), 650);
    }
    render();
  });
}
function decorateRoom(): void {
  const computer = Boolean(game.owned.search);
  element("scene").classList.toggle("computer-mode", computer);
  const art = `url('${computer ? typingScenes : scenes}')`;
  element("scene").style.setProperty("--scene-art", art);
  element("stage-frame").style.setProperty("--scene-art", art);
  setText("action-label", computer ? "⌨ TYPE!" : "✎ WRITE!");
  const current =
    upgrades.filter((u) => u.kind === "tool" && game.owned[u.id]).sort((a, b) =>
      b.effect - a.effect
    )[0];
  element("held-tool").innerHTML = item(current?.id ?? "pencil", "held-pen");
  element("held-tool").dataset.pen = current?.id ?? "pencil";
  element("held-tool").setAttribute("aria-label", current?.name ?? "Pencil");
  const companions = new Set(["group", "mentor", "ai"]);
  const owned = upgrades.filter((u) =>
    u.kind === "resource" && game.owned[u.id]
  );
  const markup = (u: (typeof upgrades)[number]) =>
    `<div class="prop prop-${u.id}" title="${u.name}: ${
      game.owned[u.id]
    }" role="img" aria-label="${u.name}, ${game.owned[u.id]} owned">${
      propSprite(u.id)
    }<span class="quantity">${
      game.owned[u.id] > 1 ? `×${game.owned[u.id]}` : ""
    }</span></div>`;
  element("companions").innerHTML = owned.filter((u) => companions.has(u.id))
    .map(markup).join("");
  element("equipment").innerHTML = owned.filter((u) =>
    !companions.has(u.id) && u.id !== "search"
  ).map(markup).join("");
}
const propIndices: Record<string, number> = {
  timer: 0,
  desk: 1,
  search: 2,
  ai: 3,
  group: 4,
  mentor: 5,
  lab: 6,
  network: 7,
};
function propSprite(id: string): string {
  const i = propIndices[id];
  return `<span class="prop-sprite" aria-hidden="true" style="background-image:url('${props}');background-position:${
    i % 4 / 3 * 100
  }% ${Math.floor(i / 4) * 100}%"></span>`;
}
let audio: AudioContext | undefined;
function activateSound(): void {
  try {
    audio ??= new AudioContext();
    void audio.resume();
  } catch {
    return;
  }
}
function levelSound(): void {
  if (!audio || audio.state !== "running") return;
  const voice = audio.createOscillator();
  const volume = audio.createGain();
  const now = audio.currentTime;
  voice.type = "sine";
  voice.frequency.setValueAtTime(880, now);
  voice.frequency.setValueAtTime(1320, now + 0.1);
  volume.gain.setValueAtTime(0.035, now);
  volume.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  voice.connect(volume);
  volume.connect(audio.destination);
  voice.start(now);
  voice.stop(now + 0.3);
}
let levelTimer: ReturnType<typeof setTimeout> | undefined;
function celebrateStage(): void {
  element("scene").classList.remove("level-up");
  void element("scene").offsetWidth;
  element("scene").classList.add("level-up");
  setText("level-banner", `★ ${stages[game.stage].name} ★`);
  levelSound();
  clearTimeout(levelTimer);
  levelTimer = setTimeout(
    () => element("scene").classList.remove("level-up"),
    1600,
  );
}
let shownStage = -1;
function render(): void {
  setText("balance", format(game.balance));
  setText("rate", `+${format(game.perSecond)}/s`);
  setText("click-effect", `+${game.perClick}`);
  setText("stage", stages[game.stage].name);
  const current = stages[game.stage];
  const next = stages[game.stage + 1];
  const fraction = next
    ? (game.total - current.at) / (next.at - current.at)
    : 1;
  const progress = element("progress") as HTMLProgressElement;
  progress.value = fraction;
  progress.title = `${format(game.total)} completed${
    next ? `; next stage at ${format(next.at)}` : ""
  }`;
  setText("percent", `${Math.floor(fraction * 100)}%`);
  if (shownStage !== game.stage) {
    const changed = shownStage >= 0;
    shownStage = game.stage;
    const i = game.stage;
    element("scene").style.setProperty(
      "--scene-position",
      `${i % 4 / 3 * 100}% ${Math.floor(i / 4) * 100}%`,
    );
    element("scene").dataset.stage = String(i);
    element("scene").setAttribute(
      "aria-label",
      `Brown-haired ponytail girl: ${stages[i].name}`,
    );
    if (changed) celebrateStage();
  }
  for (const u of upgrades) {
    const button = element(`buy-${u.id}`) as HTMLButtonElement;
    const count = game.owned[u.id] ?? 0;
    const locked = game.total < u.unlock;
    const owned = u.kind === "tool" && count > 0;
    button.disabled = !game.canBuy(u);
    button.classList.toggle("locked", locked);
    button.classList.toggle("owned", owned);
    setText(
      `price-${u.id}`,
      locked ? "🔒" : owned ? "✓" : format(game.price(u)),
    );
    button.title = `${u.name} · ${
      u.kind === "tool"
        ? `${u.effect} homework per click`
        : `+${u.effect} homework per second`
    } · ${
      locked
        ? `Unlock at ${format(u.unlock)} total homework`
        : owned
        ? "Purchased"
        : `${format(game.price(u))} credits`
    } · ${count} owned`;
  }
}
let writingUntil = 0;
function writeAnimation(now: number, reward = false): void {
  writingUntil = now + 440;
  element("scene").classList.remove("writing");
  void element("scene").offsetWidth;
  element("scene").classList.add("writing");
  element("spark").classList.toggle("visible", reward);
  if (reward) setText("spark", `+${game.perClick}`);
}
element("homework").addEventListener("click", () => {
  activateSound();
  game.earn(game.perClick);
  writeAnimation(performance.now(), true);
  render();
});
let last = performance.now();
let lastRender = last;
let lastAutomaticStroke = last;
let nextIdle = last + 3000;
let idleUntil = 0;
function frame(now: number): void {
  game.tick((now - last) / 1000);
  if (now >= nextIdle) {
    element("scene").classList.add("idle-blink");
    idleUntil = now + 190;
    nextIdle = now + 3500 + Math.random() * 2500;
  }
  if (now >= idleUntil) element("scene").classList.remove("idle-blink");
  last = now;
  if (
    game.perSecond > 0 && now - lastAutomaticStroke >= 1000 &&
    now >= writingUntil
  ) {
    writeAnimation(now);
    lastAutomaticStroke = now;
  }
  if (now >= writingUntil) element("scene").classList.remove("writing");
  if (now - lastRender >= 100) {
    render();
    lastRender = now;
  }
  requestAnimationFrame(frame);
}
decorateRoom();
render();
requestAnimationFrame(frame);
