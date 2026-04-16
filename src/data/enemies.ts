import { EnemyDef } from '../types';

export const normalEnemies: EnemyDef[] = [
  { id: 'sentinel', name: '遺跡の小機兵', maxHp: 55, attack: 9, attackSpeed: 1, defense: 1 },
  { id: 'sand_beast', name: '砂走りの獣', maxHp: 42, attack: 8, attackSpeed: 1.45, defense: 0 },
  { id: 'stone_guard', name: '石殻の守人', maxHp: 78, attack: 11, attackSpeed: 0.78, defense: 5 },
];

export const bossEnemy: EnemyDef = {
  id: 'deep_guardian',
  name: '深層の守護者',
  maxHp: 260,
  attack: 16,
  attackSpeed: 0.95,
  defense: 5,
  isBoss: true,
};
