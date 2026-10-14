import { Game } from "./game.ts";
import { stages, upgrades } from "./content.ts";
const game = new Game();
const app = document.querySelector<HTMLElement>("#app")!;
const items = new URL("./assets/desk-items.png", import.meta.url).href;
const layers = new URL("./assets/student-layers.png", import.meta.url).href;
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
  `<div class="notebook"><header><h1>ASSIGNMENT GRIND</h1><span class="page-number">01 / ∞</span></header><div class="game-layout"><section class="player"><div class="wallet"><span class="coin" aria-hidden="true">✦</span><div><small>CREDITS</small><strong id="balance"></strong></div><span id="rate" title="Automatic homework per second"></span></div><div id="scene" class="scene" role="img" aria-label="Student writing homework; purchased supplies appear in the room"><div class="room atlas-layer" style="background-image:url('${layers}')"></div><div id="actor" class="actor atlas-layer" style="background-image:url('${layers}')"></div><div id="equipment"></div><div id="writing-hand" class="writing-hand atlas-layer" style="background-image:url('${layers}')"></div><div id="held-tool"></div><span id="spark" aria-hidden="true"></span></div><button id="homework" class="write-button" aria-label="Do homework"><span>✎ WRITE!</span><span id="click-effect"></span></button><div class="journey"><div><span id="stage"></span><strong id="percent"></strong></div><progress id="progress" max="1" aria-label="Education stage progress"></progress></div><p id="notice" class="sr-only" role="status" aria-live="polite"></p></section><section class="shops" aria-label="Upgrade shops"><div class="house pen-house"><div class="roof"><span>✎</span></div><div class="facade"><div id="tools" class="tools" aria-label="Writing tools"></div><div class="house-base"><i></i><span>✎</span><i></i></div></div></div><div class="house study-house"><div class="flat-roof"><span>▤</span><i></i><i></i></div><div class="facade"><div id="resources" class="resources" aria-label="Learning resources"></div><div class="house-base"><i></i><span>▣</span><i></i></div></div></div></section></div><footer><span>SPACE / ENTER</span><details><summary>ⓘ</summary><div>Progress lasts for this session. Hover or focus a shop item for details.<p>Pixel art adapted with OpenAI imagegen from OpenMoji references. <a href="https://openmoji.org/">OpenMoji contributors</a>, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p></div></details></footer></div>`;
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
  const current =
    upgrades.filter((u) => u.kind === "tool" && game.owned[u.id]).sort((a, b) =>
      b.effect - a.effect
    )[0];
  element("held-tool").innerHTML = current ? item(current.id, "held-pen") : "";
  element("equipment").innerHTML = upgrades.filter((u) =>
    u.kind === "resource" && game.owned[u.id]
  ).map((u) =>
    `<div class="prop prop-${u.id}" title="${u.name}: ${
      game.owned[u.id]
    }" role="img" aria-label="${u.name}, ${game.owned[u.id]} owned">${
      item(u.id)
    }<span class="quantity">${
      game.owned[u.id] > 1 ? `×${game.owned[u.id]}` : ""
    }</span></div>`
  ).join("");
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
    shownStage = game.stage;
    element("actor").dataset.stage = String(game.stage);
    const i = [1, 2, 3, 4, 4, 5, 6, 6][game.stage];
    element("actor").style.backgroundPosition = `${i % 4 / 3 * 100}% ${
      Math.floor(i / 4) * 100
    }%`;
    element("actor").classList.toggle("master", game.stage === 7);
    element("actor").setAttribute(
      "aria-label",
      `${stages[game.stage].name} student`,
    );
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
  game.earn(game.perClick);
  writeAnimation(performance.now(), true);
  render();
});
let last = performance.now();
let lastRender = last;
let lastAutomaticStroke = last;
function frame(now: number): void {
  game.tick((now - last) / 1000);
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
