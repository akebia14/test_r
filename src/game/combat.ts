import { EnemyDef, PlayerState, UpgradeDef } from '../types';
import { applyUpgrades } from './utils';

export interface CombatRuntime {
  playerHp: number;
  playerShield: number;
  enemyHp: number;
  done: boolean;
  winner: 'player' | 'enemy' | null;
  damageEvent?: { value: number; crit?: boolean; target: 'player' | 'enemy' };
}

export function createCombat(player: PlayerState, enemy: EnemyDef, isBoss: boolean): CombatRuntime {
  const effects = applyUpgrades(player.upgrades);
  const startHp = Math.min(player.hp, effects.maxHp);
  let hp = startHp;

  if (hasFlag(player.upgrades, 'battleStartSelfDamage10')) hp = Math.max(1, hp - 10);

  return {
    playerHp: hp,
    playerShield: player.shield + effects.battleStartShield,
    enemyHp: enemy.maxHp,
    done: false,
    winner: null,
  };
}

export function tickCombat(
  runtime: CombatRuntime,
  player: PlayerState,
  enemy: EnemyDef,
  elapsedMs: number,
  timers: { player: number; enemy: number; hitCount: number; revengeReady: boolean },
): CombatRuntime {
  if (runtime.done) return runtime;
  const effects = applyUpgrades(player.upgrades);
  timers.player += elapsedMs;
  timers.enemy += elapsedMs;

  const playerInterval = 900 / (1 + effects.attackSpeedMult + (runtime.playerHp / effects.maxHp < 0.5 ? effects.lowHpAttackSpeedMult : 0));
  const enemyInterval = 950 / enemy.attackSpeed;

  const next = { ...runtime };

  while (!next.done && timers.player >= playerInterval) {
    timers.player -= playerInterval;
    timers.hitCount += 1;

    let damage =  Math.max(1, effects.attack * (1 + (runtime.playerHp / effects.maxHp < 0.5 ? effects.lowHpAttackMult : 0)) - enemy.defense * 0.6);
    const crit = Math.random() < effects.critChance;
    if (crit) damage *= effects.critMultiplier;
    if (timers.revengeReady) {
      damage *= 1 + effects.revengeBonus;
      timers.revengeReady = false;
    }
    if (next.playerShield > 0) damage *= 1 + effects.shieldDamageMult;
    if (enemy.isBoss) damage *= 1 + effects.bossDamageMult;
    if (enemy.isBoss && next.enemyHp / enemy.maxHp < 0.5) damage *= 0.9;
    if (timers.hitCount % 3 === 0) damage += effects.every3rdBonusDamage * (1 + effects.specialProcBonus);

    next.enemyHp -= damage;
    next.damageEvent = { value: Math.round(damage), crit, target: 'enemy' };

    if (crit && effects.critChainDamage > 0) {
      const chain = Math.round(effects.critChainDamage * (1 + effects.specialProcBonus));
      next.enemyHp -= chain;
      next.damageEvent = { value: chain, crit: false, target: 'enemy' };
    }

    if (hasFlag(player.upgrades, 'doubleShot20') && Math.random() < 0.2 + effects.specialProcBonus) {
      const shot2 = Math.round(damage * 0.7);
      next.enemyHp -= shot2;
      next.damageEvent = { value: shot2, crit: false, target: 'enemy' };
    }

    if (next.enemyHp <= 0) {
      next.enemyHp = 0;
      next.done = true;
      next.winner = 'player';
      return next;
    }
  }

  while (!next.done && timers.enemy >= enemyInterval) {
    timers.enemy -= enemyInterval;
    let damage = Math.max(1, enemy.attack - effects.defense * 0.45);
    if (enemy.isBoss && next.enemyHp / enemy.maxHp < 0.5) damage *= 1.25;
    if (enemy.isBoss && Math.random() < 0.25) damage *= 1.5;

    if (next.playerShield > 0) {
      next.playerShield -= damage;
      if (next.playerShield < 0) {
        next.playerHp += next.playerShield;
        next.playerShield = 0;
      }
    } else {
      next.playerHp -= damage;
    }

    timers.revengeReady = true;
    next.damageEvent = { value: Math.round(damage), target: 'player' };

    if (next.playerHp <= 0) {
      next.playerHp = 0;
      next.done = true;
      next.winner = 'enemy';
      return next;
    }
  }

  return next;
}

function hasFlag(upgrades: UpgradeDef[], flag: string): boolean {
  return upgrades.some((u) => u.flags?.includes(flag));
}
