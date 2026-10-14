import { Game } from "./game.ts";
import { stages, upgrades } from "./content.ts";
const game = new Game();
const app = document.querySelector<HTMLElement>("#app")!;
const atlas = new URL("./assets/study-pixel-atlas.png", import.meta.url).href;
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
function sprite(id: string, extra = ""): string {
  const i = icons[id] ?? 0;
  const x = (3 + i % 3) / 5 * 100;
  const y = Math.floor(i / 3) / 3 * 100;
  return `<span class="sprite ${extra}" aria-hidden="true" style="background-image:url('${atlas}');background-position:${x}% ${y}%"></span>`;
}
app.innerHTML =
  `<div class="notebook"><header><div class="title"><span class="stamp">STUDENT NO. 001</span><h1>ASSIGNMENT GRIND</h1></div><div class="header-note">HOMEWORK CLUB<br><span>one page at a time</span></div></header><div class="game-layout"><section class="player-page"><div class="page-heading"><h2>MY STUDY CORNER</h2><span id="stage"></span></div><div class="stats"><div><small>STUDY CREDITS</small><strong id="balance">0</strong></div><div><small>DONE SO FAR</small><strong id="total">0</strong></div><div><small>AUTO / SEC</small><strong id="rate">0</strong></div></div><button id="homework" class="scene-button" aria-label="Do homework"><span class="scene" role="img" aria-label="Pixel art of a child writing homework at a desk" style="background-image:url('${atlas}')"></span><span class="scene-label">CLICK TO WRITE <span id="click-effect"></span></span><span id="spark" aria-hidden="true"></span></button><div class="journey"><span id="next"></span><progress id="progress" max="1" aria-label="Education stage progress"></progress></div><div class="inventory-heading"><h3>MY PENCIL CASE & STUDY KIT</h3><span>YOUR COLLECTION</span></div><div id="inventory" class="inventory"></div><div class="message-strip"><span class="writing-dot"></span><p id="notice" role="status" aria-live="polite">Click the desk to finish your first homework!</p></div></section><section class="shop-page"><div class="page-heading"><h2>CAMPUS SHOP</h2><span class="shop-stamp">OPEN!</span></div><div class="store"><h3>✎ THE PENCIL SHOP <span>permanent tools</span></h3><div id="tools" class="tool-grid"></div></div><div class="store resource-store"><h3>▣ THE STUDY SHOP <span>automatic helpers</span></h3><div id="resources" class="resource-grid"></div></div><p class="shop-hint">Tools boost clicks. Helpers stack. Locked items open as you graduate.</p></section></div><footer><span>SPACE / ENTER TO WRITE · SESSION PROGRESS</span><details><summary>ART CREDITS</summary><p>Pixel artwork adapted with OpenAI imagegen from <a href="https://openmoji.org/library/emoji-1F466/">OpenMoji boy</a> and <a href="https://openmoji.org/library/emoji-23F0/">alarm clock</a>. OpenMoji contributors; adapted artwork licensed <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.</p></details><span>PAGE 01 / ∞</span></footer></div>`;
const element = (id: string) => document.getElementById(id)!;
function setText(id: string, value: string): void {
  const el = element(id);
  if (el.textContent !== value) el.textContent = value;
}
for (const u of upgrades) {
  const card = document.createElement("article");
  card.className = `upgrade ${u.kind}`;
  card.id = `card-${u.id}`;
  card.innerHTML = `${
    sprite(u.id)
  }<div class="item-info"><h4>${u.name}</h4><p>${
    u.kind === "tool" ? `${u.effect} / click` : `+${u.effect} / sec`
  }</p><small id="owned-${u.id}"></small></div><button id="buy-${u.id}" aria-label="Buy ${u.name}"></button>`;
  element(u.kind === "tool" ? "tools" : "resources").append(card);
  element(`buy-${u.id}`).addEventListener("click", () => {
    if (game.buy(u)) {
      setText("notice", `${u.name} added to your kit!`);
      renderInventory();
    }
    render();
  });
}
function renderInventory(): void {
  const tools = upgrades.filter((u) => u.kind === "tool" && game.owned[u.id]);
  const currentTool = tools.sort((a, b) => b.effect - a.effect)[0];
  const toolId = currentTool?.id ?? "pencil";
  let html = `<div class="inventory-slot equipped">${sprite(toolId)}<span>${
    currentTool?.name ?? "Pencil"
  }</span><small>EQUIPPED</small></div>`;
  for (
    const u of upgrades.filter((u) => u.kind === "resource" && game.owned[u.id])
  ) {
    html += `<div class="inventory-slot">${
      sprite(u.id)
    }<span>${u.name}</span><small>×${game.owned[u.id]}</small></div>`;
  }
  if (!upgrades.some((u) => u.kind === "resource" && game.owned[u.id])) {
    html += `<div class="empty-slot">Your first helper<br>belongs here.</div>`;
  }
  element("inventory").innerHTML = html;
}
function render(): void {
  setText("balance", format(game.balance));
  setText("total", format(game.total));
  setText("rate", format(game.perSecond));
  setText("click-effect", `+${game.perClick} HOMEWORK`);
  setText("stage", stages[game.stage].name);
  const next = stages[game.stage + 1];
  const current = stages[game.stage];
  (element("progress") as HTMLProgressElement).value = next
    ? (game.total - current.at) / (next.at - current.at)
    : 1;
  setText(
    "next",
    next
      ? `${format(next.at - game.total)} to ${next.name}`
      : "Academic Weapon! Keep your study empire growing.",
  );
  for (const u of upgrades) {
    const button = element(`buy-${u.id}`) as HTMLButtonElement;
    const count = game.owned[u.id] ?? 0;
    const locked = game.total < u.unlock;
    button.disabled = !game.canBuy(u);
    element(`card-${u.id}`).classList.toggle("locked", locked);
    setText(
      `buy-${u.id}`,
      locked
        ? `⌑ ${format(u.unlock)}`
        : u.kind === "tool" && count
        ? "OWNED ✓"
        : `${format(game.price(u))} CR`,
    );
    button.title = locked
      ? `Complete ${format(u.unlock)} lifetime homework to unlock`
      : `Buy ${u.name} for ${game.price(u)} credits`;
    setText(
      `owned-${u.id}`,
      u.kind === "tool"
        ? count ? "In your case" : "One-time"
        : `Owned ${count}`,
    );
  }
}
let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
element("homework").addEventListener("click", () => {
  game.earn(game.perClick);
  setText("spark", `+${game.perClick}`);
  element("homework").classList.remove("writing");
  void element("homework").offsetWidth;
  element("homework").classList.add("writing");
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(
    () => element("homework").classList.remove("writing"),
    400,
  );
  render();
});
let last = performance.now();
let lastRender = last;
function frame(now: number): void {
  game.tick((now - last) / 1000);
  last = now;
  if (now - lastRender >= 100) {
    render();
    lastRender = now;
  }
  requestAnimationFrame(frame);
}
renderInventory();
render();
requestAnimationFrame(frame);
