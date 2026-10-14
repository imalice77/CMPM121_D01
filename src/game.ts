import { stages, type Upgrade, upgrades } from "./content.ts";

export class Game {
  balance = 0;
  total = 0;
  owned: Record<string, number> = {};
  get perClick(): number {
    return Math.max(
      1,
      ...upgrades.filter((u) => u.kind === "tool" && this.owned[u.id]).map((
        u,
      ) => u.effect),
    );
  }
  get perSecond(): number {
    return upgrades.filter((u) => u.kind === "resource").reduce(
      (n, u) => n + (this.owned[u.id] ?? 0) * u.effect,
      0,
    );
  }
  get stage(): number {
    return stages.reduce((index, s, i) => this.total >= s.at ? i : index, 0);
  }
  earn(amount: number): void {
    this.balance += amount;
    this.total += amount;
  }
  tick(seconds: number): void {
    if (Number.isFinite(seconds) && seconds > 0) {
      this.earn(seconds * this.perSecond);
    }
  }
  price(u: Upgrade): number {
    return Math.ceil(u.cost * 1.18 ** (this.owned[u.id] ?? 0));
  }
  canBuy(u: Upgrade): boolean {
    return this.total >= u.unlock && this.balance >= this.price(u) &&
      !(u.kind === "tool" && this.owned[u.id]);
  }
  buy(u: Upgrade): boolean {
    if (!this.canBuy(u)) return false;
    this.balance -= this.price(u);
    this.owned[u.id] = (this.owned[u.id] ?? 0) + 1;
    return true;
  }
}
