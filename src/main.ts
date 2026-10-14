import { Game, stages, upgrades } from "./game.ts";
const game = new Game();
const app = document.querySelector<HTMLElement>("#app")!;
const format = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 1 });
app.innerHTML = `
<header><span class="label">THE STUDENT LIFE SIMULATOR</span><h1>ASSIGNMENT<br><em>GRIND.</em></h1><p>Start with a pencil. Build your study empire.</p></header>
<section class="dashboard"><div class="workstation"><div class="paper"><img src="${
  new URL("./assets/tile.svg", import.meta.url).href
}" alt="Teal study emblem" width="40" height="40"><span>YOUR NEXT ASSIGNMENT</span><h2>Small steps.<br>Big progress.</h2><p id="click-effect"></p><button id="homework">DO HOMEWORK <span>↗</span></button><p class="hint">Click or focus the button and press Space.</p></div></div><div class="summary"><span class="label">STUDY REPORT</span><h2 id="balance"></h2><p>study credits available</p><div class="metrics"><div><strong id="total"></strong><span>HOMEWORK COMPLETED</span></div><div><strong id="rate"></strong><span>AUTOMATIC / SECOND</span></div></div><div class="stage"><span class="label">EDUCATION JOURNEY</span><h3 id="stage"></h3><progress id="progress" max="1"></progress><p id="next"></p></div><p id="notice" role="status" aria-live="polite">Your first assignment starts here.</p></div></section>
<section class="shop"><div class="section-heading"><h2>Your study setup</h2><p>Spend credits to work smarter.</p></div><div class="columns"><div><h3>01 / Writing tools</h3><p>Permanent upgrades to homework per click.</p><div id="tools"></div></div><div><h3>02 / Learning resources</h3><p>Stack resources. Each purchase increases its next price.</p><div id="resources"></div></div></div></section><footer>ASSIGNMENT GRIND / No real homework was harmed.<span>Progress lasts for this session.</span></footer>`;
const element = (id: string) => document.getElementById(id)!;
for (const u of upgrades) {
  const card = document.createElement("article");
  card.className = "upgrade";
  card.innerHTML = `<div><h4>${u.name}</h4><p>${
    u.kind === "tool"
      ? `${u.effect} homework / click`
      : `+${u.effect} homework / second`
  }</p><small id="owned-${u.id}"></small></div><button id="buy-${u.id}" aria-label="Buy ${u.name}"></button>`;
  element(u.kind === "tool" ? "tools" : "resources").append(card);
  element(`buy-${u.id}`).addEventListener("click", () => {
    if (game.buy(u)) {
      element("notice").textContent =
        `${u.name} purchased. Your study setup is growing.`;
    }
    render();
  });
}
function render(): void {
  element("balance").textContent = format(game.balance);
  element("total").textContent = format(game.total);
  element("rate").textContent = format(game.perSecond);
  element("click-effect").textContent = `+${game.perClick} homework per click`;
  element("stage").textContent = stages[game.stage].name;
  const next = stages[game.stage + 1];
  const current = stages[game.stage];
  (element("progress") as HTMLProgressElement).value = next
    ? (game.total - current.at) / (next.at - current.at)
    : 1;
  element("next").textContent = next
    ? `${format(next.at - game.total)} homework until ${next.name}`
    : "You've mastered the assignment grind.";
  for (const u of upgrades) {
    const button = element(`buy-${u.id}`) as HTMLButtonElement;
    const count = game.owned[u.id] ?? 0;
    button.disabled = !game.canBuy(u);
    button.textContent = game.total < u.unlock
      ? `Unlock at ${format(u.unlock)}`
      : u.kind === "tool" && count
      ? "Owned ✓"
      : `${format(game.price(u))} credits`;
    element(`owned-${u.id}`).textContent = u.kind === "tool"
      ? count ? "In your pencil case" : "Not owned"
      : `${count} owned · ${format(count * u.effect)} / sec`;
  }
}
element("homework").addEventListener("click", () => {
  game.earn(game.perClick);
  render();
});
let last = performance.now();
function frame(now: number): void {
  game.tick((now - last) / 1000);
  last = now;
  render();
  requestAnimationFrame(frame);
}
render();
requestAnimationFrame(frame);
