import { MapNode, NodeType } from '../types';

const weightedPool: NodeType[] = [
  'encounter','encounter','encounter','encounter','altar','spring','merchant','monolith',
];

function pickNodeType(floor: number): NodeType {
  if (floor === 9) {
    return Math.random() > 0.5 ? 'spring' : 'altar';
  }
  return weightedPool[Math.floor(Math.random() * weightedPool.length)];
}

export function generateMap(): MapNode[] {
  const nodes: MapNode[] = [{ id: 0, floor: 0, type: 'encounter', nextIds: [1, 2] }];

  let idCursor = 1;
  for (let floor = 1; floor <= 9; floor += 1) {
    const branch = floor === 9 ? 2 : (Math.random() > 0.55 ? 3 : 2);
    const floorIds: number[] = [];
    for (let i = 0; i < branch; i += 1) {
      const type = pickNodeType(floor);
      nodes.push({ id: idCursor, floor, type, nextIds: [] });
      floorIds.push(idCursor);
      idCursor += 1;
    }

    const prev = nodes.filter((n) => n.floor === floor - 1);
    prev.forEach((p) => {
      const picks = floorIds.slice(0, Math.min(2, floorIds.length));
      p.nextIds = picks.sort(() => Math.random() - 0.5);
    });
  }

  const bossId = idCursor;
  nodes.push({ id: bossId, floor: 10, type: 'boss', nextIds: [] });
  nodes.filter((n) => n.floor === 9).forEach((n) => {
    n.nextIds = [bossId];
  });

  return nodes;
}
