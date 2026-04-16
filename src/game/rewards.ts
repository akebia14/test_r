import { curseBlessings, relicUpgrades, runeUpgrades } from '../data/upgrades';
import { UpgradeCategory, UpgradeDef } from '../types';
import { rarityWeight } from './utils';

function pickByRarity(pool: UpgradeDef[], rarityBoost = 0): UpgradeDef {
  const adjusted = pool.map((u) => ({
    u,
    w: Math.max(1, rarityWeight(u.rarity) - rarityBoost * (u.rarity === 'common' ? 2 : 0)),
  }));
  const sum = adjusted.reduce((s, v) => s + v.w, 0);
  let roll = Math.random() * sum;
  for (const a of adjusted) {
    roll -= a.w;
    if (roll <= 0) return a.u;
  }
  return adjusted[0].u;
}

export function buildRewardChoices(category: UpgradeCategory, count: number, rarityBoost = 0): UpgradeDef[] {
  const pool = category === 'rune' ? runeUpgrades : category === 'relic' ? relicUpgrades : curseBlessings;
  const picks: UpgradeDef[] = [];
  while (picks.length < count) {
    const p = pickByRarity(pool, rarityBoost);
    if (!picks.some((x) => x.id === p.id)) picks.push(p);
  }
  return picks;
}
