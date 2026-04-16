import { PermanentUpgradeDef, UpgradeDef } from '../types';

export const runeUpgrades: UpgradeDef[] = [
  { id: 'rune_rapid_mark', name: '速射の刻印', description: '攻撃速度 +15%', category: 'rune', tags: ['rapid'], rarity: 'common', effects: { attackSpeedMult: 0.15 } },
  { id: 'rune_sharp_stone', name: '鋭石の刻印', description: '攻撃力 +20%', category: 'rune', tags: ['burst'], rarity: 'common', effects: { attack: 0.2 } },
  { id: 'rune_guard_mark', name: '守りの刻印', description: '防御 +6', category: 'rune', tags: ['guard'], rarity: 'common', effects: { defense: 6 } },
  { id: 'rune_lifeline', name: '命脈の刻印', description: '最大HP +25', category: 'rune', tags: ['guard'], rarity: 'common', effects: { maxHp: 25 } },
  { id: 'rune_aim', name: '狙いの刻印', description: 'クリティカル率 +10%', category: 'rune', tags: ['burst'], rarity: 'common', effects: { critChance: 0.1 } },
  { id: 'rune_resonance', name: '共鳴の刻印', description: '3回攻撃ごとに追加ダメージ', category: 'rune', tags: ['sync'], rarity: 'rare', effects: { every3rdBonusDamage: 10 } },
  { id: 'rune_blood_pact', name: '血契の刻印', description: 'HP50%未満の間、攻撃力 +35%', category: 'rune', tags: ['risk'], rarity: 'rare', effects: { lowHpAttackMult: 0.35 } },
  { id: 'rune_counter', name: '反攻の刻印', description: '被弾後、次の1撃の与ダメージ +25%', category: 'rune', tags: ['guard', 'burst'], rarity: 'rare', effects: { revengeBonus: 0.25 } },
  { id: 'rune_chain', name: '連鎖の刻印', description: '会心発生時、追加で小ダメージ', category: 'rune', tags: ['rapid', 'sync'], rarity: 'rare', effects: { critChainDamage: 6 } },
  { id: 'rune_curse_power', name: '呪力の刻印', description: '最大HP -15、攻撃力 +30%', category: 'rune', tags: ['risk', 'burst'], rarity: 'epic', effects: { maxHp: -15, attack: 0.3 } },
];

export const relicUpgrades: UpgradeDef[] = [
  { id: 'relic_twin_ring', name: '双刻の石環', description: '通常攻撃が20%の確率で2連射', category: 'relic', tags: ['rapid'], rarity: 'rare', effects: {}, flags: ['doubleShot20'] },
  { id: 'relic_guard_shell', name: '守護者の殻', description: '戦闘開始時にシールド20付与', category: 'relic', tags: ['guard'], rarity: 'rare', effects: { battleStartShield: 20 } },
  { id: 'relic_deep_fang', name: '深層の牙', description: 'クリティカル時ダメージ倍率 +50%', category: 'relic', tags: ['burst'], rarity: 'rare', effects: { critMultiplier: 0.5 } },
  { id: 'relic_blood_mask', name: '血祀りの仮面', description: 'HP50%未満の間、攻撃速度 +40%', category: 'relic', tags: ['risk', 'rapid'], rarity: 'epic', effects: { lowHpAttackSpeedMult: 0.4 } },
  { id: 'relic_altar_shard', name: '祭壇の欠片', description: '同じタグを3個以上持つと追加ボーナス', category: 'relic', tags: ['sync'], rarity: 'epic', effects: {}, flags: ['extraTagSynergy'] },
  { id: 'relic_unbroken_text', name: '崩れぬ碑文', description: 'シールドがある間、与ダメージ +20%', category: 'relic', tags: ['guard', 'sync'], rarity: 'epic', effects: { shieldDamageMult: 0.2 } },
  { id: 'relic_tower_eye', name: '古塔の目', description: 'ボス戦で与ダメージ +30%', category: 'relic', tags: ['burst'], rarity: 'rare', effects: { bossDamageMult: 0.3 } },
  { id: 'relic_curse_cup', name: '呪詛の杯', description: '戦闘勝利後の回復を失う代わりに報酬が強化', category: 'relic', tags: ['risk'], rarity: 'epic', effects: { healingAfterFightBlocked: true, rewardRarityBoost: 1 } },
];

export const curseBlessings: UpgradeDef[] = [
  { id: 'bless_ancient', name: '古代の祝福', description: '次に得る報酬のレア度上昇', category: 'curseBlessing', tags: ['sync'], rarity: 'rare', effects: { rewardRarityBoost: 1 }, flags: ['oneTimeRarityBoost'] },
  { id: 'curse_erosion', name: '侵食の呪い', description: '最大HP -20、攻撃速度 +25%', category: 'curseBlessing', tags: ['risk'], rarity: 'rare', effects: { maxHp: -20, attackSpeedMult: 0.25 } },
  { id: 'curse_contract', name: '深層契約', description: '回復量半減、ボス戦で与ダメージ +40%', category: 'curseBlessing', tags: ['risk', 'burst'], rarity: 'epic', effects: { healingMult: -0.5, bossDamageMult: 0.4 } },
  { id: 'bless_harvest', name: '豊穣の祝福', description: 'コイン獲得量 +50%', category: 'curseBlessing', tags: ['sync'], rarity: 'rare', effects: { coinGainMult: 0.5 } },
  { id: 'curse_laceration', name: '裂傷の呪い', description: '毎戦闘開始時にHP -10、攻撃力 +35%', category: 'curseBlessing', tags: ['risk', 'burst'], rarity: 'epic', effects: { attack: 0.35 }, flags: ['battleStartSelfDamage10'] },
  { id: 'bless_purify', name: '浄化の祝福', description: '所持中の呪いを1つ除去', category: 'curseBlessing', tags: ['guard'], rarity: 'rare', effects: {}, flags: ['removeCurse'] },
];

export const permanentUpgrades: PermanentUpgradeDef[] = [
  { id: 'perm_hp', name: '初期HP増加', description: 'ラン開始時のHP +8', baseCost: 20, maxLevel: 10 },
  { id: 'perm_attack', name: '初期攻撃力増加', description: 'ラン開始時の攻撃 +1', baseCost: 20, maxLevel: 10 },
  { id: 'perm_coin', name: '初期コイン増加', description: 'ラン開始時コイン +4', baseCost: 18, maxLevel: 8 },
  { id: 'perm_spring', name: '泉の回復量増加', description: '泉の回復 +5', baseCost: 16, maxLevel: 8 },
  { id: 'perm_shop', name: 'ショップ価格割引', description: 'ショップ価格 -4%', baseCost: 24, maxLevel: 5 },
  { id: 'perm_reroll', name: '報酬再抽選回数 +1', description: '報酬再抽選の回数 +1', baseCost: 30, maxLevel: 4 },
];
