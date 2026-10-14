import { Game } from "./game.ts";
import { upgrades } from "./content.ts";
function assert(condition: boolean): void {
  if (!condition) throw new Error("Game rule failed");
}
Deno.test("purchases are conditioned, deduct credits and scale prices", () => {
  const g = new Game();
  const timer = upgrades.find((u) => u.id === "timer")!;
  assert(!g.buy(timer));
  g.earn(20);
  assert(g.buy(timer));
  assert(g.balance === 10 && g.total === 20);
  assert(g.price(timer) === 12);
  assert(!g.buy(timer));
});
Deno.test("elapsed time is independent of frame count and composes with clicks", () => {
  const timer = upgrades.find((u) => u.id === "timer")!;
  const a = new Game();
  const b = new Game();
  for (const g of [a, b]) {
    g.earn(10);
    g.buy(timer);
  }
  a.tick(10);
  for (let i = 0; i < 100; i++) b.tick(0.1);
  assert(Math.abs(a.balance - b.balance) < 1e-9);
  a.earn(a.perClick);
  assert(a.balance === 2);
});
Deno.test("tools never downgrade clicks and progression uses lifetime work", () => {
  const g = new Game();
  g.earn(2000);
  const premium = upgrades.find((u) => u.id === "premium")!;
  const pen = upgrades.find((u) => u.id === "pen")!;
  assert(g.buy(premium) && g.buy(pen));
  assert(g.perClick === 15 && !g.buy(premium));
  assert(g.stage === 3);
  const ai = upgrades.find((u) => u.id === "ai")!;
  assert(!g.canBuy(ai));
});
