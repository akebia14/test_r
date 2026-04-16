import { PlayerEffects, Tag, UpgradeDef } from '../types';

export const baseEffects: PlayerEffects = {
  maxHp: 100,
  attack: 10,
  attackSpeedMult: 0,
  defense: 0,
  critChance: 0.05,
  critMultiplier: 1.5,
  battleStartShield: 0,
  lowHpAttackMult: 0,
  lowHpAttackSpeedMult: 0,
  every3rdBonusDamage: 0,
  revengeBonus: 0,
  critChainDamage: 0,
  shieldDamageMult: 0,
  bossDamageMult: 0,
  rewardRarityBoost: 0,
  coinGainMult: 0,
  healingMult: 1,
  healingAfterFightBlocked: false,
  specialProcBonus: 0,
};

export function applyUpgrades(upgrades: UpgradeDef[]): PlayerEffects {
  const effect = structuredClone(baseEffects);
  for (const up of upgrades) {
    for (const [k, v] of Object.entries(up.effects)) {
      const key = k as keyof PlayerEffects;
      if (typeof v === 'boolean') {
        (effect[key] as boolean) = Boolean((effect[key] as boolean) || v);
      } else if (typeof v === 'number') {
        (effect[key] as number) += v;
      }
    }
  }

  const tags = countTags(upgrades);
  const extraSynergy = upgrades.some((u) => u.flags?.includes('extraTagSynergy')) ? 1.5 : 1;

  if ((tags.rapid ?? 0) >= 3) effect.attackSpeedMult += 0.1 * extraSynergy;
  if ((tags.guard ?? 0) >= 3) effect.battleStartShield += 10 * extraSynergy;
  if ((tags.burst ?? 0) >= 3) effect.critMultiplier += 0.2 * extraSynergy;
  if ((tags.risk ?? 0) >= 3) effect.lowHpAttackMult += 0.15 * extraSynergy;
  if ((tags.sync ?? 0) >= 3) effect.specialProcBonus += 0.1 * extraSynergy;

  return effect;
}

export function countTags(upgrades: UpgradeDef[]): Partial<Record<Tag, number>> {
  return upgrades.reduce<Partial<Record<Tag, number>>>((acc, up) => {
    up.tags.forEach((t) => {
      acc[t] = (acc[t] ?? 0) + 1;
    });
    return acc;
  }, {});
}

export function rarityWeight(rarity: 'common' | 'rare' | 'epic'): number {
  if (rarity === 'epic') return 1;
  if (rarity === 'rare') return 3;
  return 6;
}
