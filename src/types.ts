export type Tag = 'rapid' | 'guard' | 'burst' | 'risk' | 'sync';

export type UpgradeCategory = 'rune' | 'relic' | 'curseBlessing';

export type Rarity = 'common' | 'rare' | 'epic';

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  tags: Tag[];
  rarity: Rarity;
  price?: number;
  effects: Partial<PlayerEffects>;
  flags?: string[];
}

export interface EnemyDef {
  id: string;
  name: string;
  maxHp: number;
  attack: number;
  attackSpeed: number;
  defense: number;
  isBoss?: boolean;
}

export type NodeType = 'encounter' | 'altar' | 'spring' | 'merchant' | 'monolith' | 'boss';

export interface MapNode {
  id: number;
  floor: number;
  type: NodeType;
  nextIds: number[];
}

export interface PermanentUpgradeDef {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
}

export interface PermanentProgress {
  runeShards: number;
  upgrades: Record<string, number>;
  firstLaunchDone: boolean;
}

export interface PlayerEffects {
  maxHp: number;
  attack: number;
  attackSpeedMult: number;
  defense: number;
  critChance: number;
  critMultiplier: number;
  battleStartShield: number;
  lowHpAttackMult: number;
  lowHpAttackSpeedMult: number;
  every3rdBonusDamage: number;
  revengeBonus: number;
  critChainDamage: number;
  shieldDamageMult: number;
  bossDamageMult: number;
  rewardRarityBoost: number;
  coinGainMult: number;
  healingMult: number;
  healingAfterFightBlocked: boolean;
  specialProcBonus: number;
}

export interface PlayerState {
  hp: number;
  shield: number;
  coins: number;
  upgrades: UpgradeDef[];
  rerolls: number;
}

export interface RunState {
  map: MapNode[];
  currentNodeId: number;
  visited: number[];
  floorReached: number;
  player: PlayerState;
}

export interface DamageNumber {
  id: number;
  value: number;
  crit?: boolean;
  target: 'player' | 'enemy';
}
