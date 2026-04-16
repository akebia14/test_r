import { useEffect, useMemo, useRef, useState } from 'react';
import { bossEnemy, normalEnemies } from './data/enemies';
import { generateMap } from './data/map';
import { permanentUpgrades } from './data/upgrades';
import { createCombat, tickCombat, type CombatRuntime } from './game/combat';
import { buildRewardChoices } from './game/rewards';
import { defaultProgress, loadProgress, saveProgress } from './game/storage';
import { applyUpgrades, countTags } from './game/utils';
import type { DamageNumber, EnemyDef, NodeType, PermanentProgress, PlayerState, RunState, UpgradeDef } from './types';
import './styles.css';

type Screen = 'title' | 'map' | 'combat' | 'reward' | 'shop' | 'monolith' | 'permanent' | 'result';

const nodeLabel: Record<NodeType, string> = {
  encounter: '遭遇', altar: '祭壇', spring: '泉', merchant: '行商人', monolith: '石碑', boss: '守護者の間'
};

function makeInitialPlayer(progress: PermanentProgress): PlayerState {
  const bonusAttack = (progress.upgrades.perm_attack ?? 0);
  return {
    hp: 100 + (progress.upgrades.perm_hp ?? 0) * 8,
    shield: 0,
    coins: (progress.upgrades.perm_coin ?? 0) * 4,
    upgrades: bonusAttack > 0 ? [{
      id: 'starter_attack',
      name: '鍛錬の刻印',
      description: `恒久強化: 攻撃 +${bonusAttack}`,
      category: 'rune',
      tags: ['burst'],
      rarity: 'common',
      effects: { attack: bonusAttack },
    }] : [],
    rerolls: progress.upgrades.perm_reroll ?? 0,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [progress, setProgress] = useState<PermanentProgress>(defaultProgress);
  const [run, setRun] = useState<RunState | null>(null);
  const [combat, setCombat] = useState<CombatRuntime | null>(null);
  const [combatEnemy, setCombatEnemy] = useState<EnemyDef | null>(null);
  const [damageTexts, setDamageTexts] = useState<DamageNumber[]>([]);
  const [rewardChoices, setRewardChoices] = useState<UpgradeDef[]>([]);
  const [result, setResult] = useState<{ win: boolean; shards: number; floor: number } | null>(null);
  const [monolithText, setMonolithText] = useState('');
  const [rewardBoostOnce, setRewardBoostOnce] = useState(0);

  const timerRef = useRef({ player: 0, enemy: 0, hitCount: 0, revengeReady: false });
  const lastTsRef = useRef(0);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
  }, []);

  const effects = useMemo(() => (run ? applyUpgrades(run.player.upgrades) : null), [run]);

  function startRun() {
    const map = generateMap();
    setRun({ map, currentNodeId: 0, visited: [0], floorReached: 0, player: makeInitialPlayer(progress) });
    setResult(null);
    setScreen('map');
  }

  function currentNode(): ReturnType<typeof runNode> {
    if (!run) return null;
    return runNode(run, run.currentNodeId);
  }

  function selectNode(nextId: number) {
    if (!run) return;
    const node = runNode(run, nextId);
    if (!node) return;
    setRun({ ...run, currentNodeId: nextId, visited: [...run.visited, nextId], floorReached: Math.max(run.floorReached, node.floor) });
    enterNode(node.type);
  }

  function enterNode(type: NodeType) {
    if (!run) return;
    if (type === 'encounter' || type === 'boss') {
      const enemy = type === 'boss' ? bossEnemy : normalEnemies[Math.floor(Math.random() * normalEnemies.length)];
      setCombatEnemy(enemy);
      timerRef.current = { player: 0, enemy: 0, hitCount: 0, revengeReady: false };
      setCombat(createCombat(run.player, enemy, type === 'boss'));
      setScreen('combat');
      return;
    }
    if (type === 'spring') {
      const add = Math.round((24 + (progress.upgrades.perm_spring ?? 0) * 5) * (effects?.healingMult ?? 1));
      setRun({ ...run, player: { ...run.player, hp: Math.min((effects?.maxHp ?? 100), run.player.hp + add) } });
      setScreen('map');
      return;
    }
    if (type === 'altar') {
      setRewardChoices(buildRewardChoices('rune', 3, Math.max(0, (effects?.rewardRarityBoost ?? 0) + rewardBoostOnce)));
      setRewardBoostOnce(0);
      setScreen('reward');
      return;
    }
    if (type === 'merchant') {
      setScreen('shop');
      return;
    }
    if (type === 'monolith') {
      triggerMonolith();
      setScreen('monolith');
    }
  }

  useEffect(() => {
    if (screen !== 'combat' || !run || !combat || !combatEnemy) return;
    let raf = 0;
    const loop = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const next = tickCombat(combat, run.player, combatEnemy, dt, timerRef.current);
      setCombat(next);
      if (next.damageEvent) {
        const id = Date.now() + Math.random();
        const ev = { id, ...next.damageEvent };
        setDamageTexts((p) => [...p, ev]);
        setTimeout(() => setDamageTexts((p) => p.filter((d) => d.id !== id)), 500);
      }
      if (next.done) {
        finishCombat(next.winner === 'player');
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lastTsRef.current = 0;
    };
  }, [screen, combat, run, combatEnemy]);

  function finishCombat(win: boolean) {
    if (!run || !combatEnemy || !combat) return;
    if (!win) {
      endRun(false, run.floorReached);
      return;
    }

    const wonBoss = combatEnemy.isBoss;
    const coins = Math.round((wonBoss ? 35 : 12) * (1 + (effects?.coinGainMult ?? 0)));
    let hp = combat.playerHp;
    if (!(effects?.healingAfterFightBlocked)) hp = Math.min((effects?.maxHp ?? 100), hp + 7);
    const nextRun = {
      ...run,
      player: { ...run.player, hp, shield: combat.playerShield, coins: run.player.coins + coins },
    };
    setRun(nextRun);

    if (wonBoss) {
      setRewardChoices(buildRewardChoices('relic', 3, 1));
      setScreen('reward');
    } else {
      setRewardChoices(buildRewardChoices('rune', 3, Math.max(0, (effects?.rewardRarityBoost ?? 0) + rewardBoostOnce)));
      setRewardBoostOnce(0);
      setScreen('reward');
    }
  }

  function chooseReward(up: UpgradeDef) {
    if (!run) return;
    let nextUpgrades = [...run.player.upgrades, up];
    if (up.flags?.includes('removeCurse')) {
      const idx = nextUpgrades.findIndex((u) => u.name.includes('呪い'));
      if (idx >= 0) nextUpgrades.splice(idx, 1);
    }
    if (up.flags?.includes('oneTimeRarityBoost')) setRewardBoostOnce((v) => v + 1);

    const nextRun = { ...run, player: { ...run.player, upgrades: nextUpgrades } };
    setRun(nextRun);

    if (combatEnemy?.isBoss) {
      endRun(true, run.floorReached);
    } else {
      setScreen('map');
    }
  }

  function rerollReward() {
    if (!run || run.player.rerolls <= 0) return;
    setRun({ ...run, player: { ...run.player, rerolls: run.player.rerolls - 1 } });
    setRewardChoices(buildRewardChoices(combatEnemy?.isBoss ? 'relic' : 'rune', 3, 1));
  }

  function endRun(win: boolean, floor: number) {
    const shards = Math.max(5, floor * 3 + (win ? 12 : 0));
    const nextProgress = { ...progress, runeShards: progress.runeShards + shards, firstLaunchDone: true };
    setProgress(nextProgress);
    saveProgress(nextProgress);
    setResult({ win, shards, floor });
    setScreen('result');
  }

  function buyPermanent(id: string) {
    const def = permanentUpgrades.find((p) => p.id === id);
    if (!def) return;
    const lv = progress.upgrades[id] ?? 0;
    if (lv >= def.maxLevel) return;
    const cost = def.baseCost + lv * 8;
    if (progress.runeShards < cost) return;
    const next: PermanentProgress = {
      ...progress,
      runeShards: progress.runeShards - cost,
      upgrades: { ...progress.upgrades, [id]: lv + 1 },
      firstLaunchDone: true,
    };
    setProgress(next);
    saveProgress(next);
  }

  function triggerMonolith() {
    if (!run) return;
    const eventType = Math.floor(Math.random() * 4);
    if (eventType === 0) {
      const relic = buildRewardChoices('relic', 1, 2)[0];
      setRun({ ...run, player: { ...run.player, hp: Math.max(1, run.player.hp - 15), upgrades: [...run.player.upgrades, relic] } });
      setMonolithText(`血の献上を行い、遺物「${relic.name}」を得た。`);
    } else if (eventType === 1) {
      if (run.player.coins >= 20) {
        setRun({ ...run, player: { ...run.player, coins: run.player.coins - 20, upgrades: [...run.player.upgrades, buildRewardChoices('rune', 1, 1)[0]] } });
        setMonolithText('20コインを捧げ、新たな刻印を再抽選した。');
      } else {
        setMonolithText('石碑は沈黙した。コインが足りない。');
      }
    } else if (eventType === 2) {
      const curse = buildRewardChoices('curseBlessing', 1, 0)[0];
      const blessing = buildRewardChoices('curseBlessing', 1, 2)[0];
      setRun({ ...run, player: { ...run.player, upgrades: [...run.player.upgrades, curse, blessing] } });
      setMonolithText(`呪い「${curse.name}」と引き換えに「${blessing.name}」を得た。`);
    } else {
      const idx = run.player.upgrades.findIndex((u) => u.category === 'rune');
      if (idx >= 0) {
        const next = [...run.player.upgrades];
        next.splice(idx, 1);
        next.push(buildRewardChoices('rune', 1, 2)[0]);
        setRun({ ...run, player: { ...run.player, upgrades: next } });
        setMonolithText('古い刻印を砕き、より強い刻印を得た。');
      } else {
        setMonolithText('捧げる刻印がなく、石碑は崩れた砂を吐いた。');
      }
    }
  }

  function shopItems() {
    if (!run) return [];
    const discount = 1 - (progress.upgrades.perm_shop ?? 0) * 0.04;
    return [
      { id: 'heal', name: 'HP回復', price: Math.round(18 * discount), onBuy: () => setRun({ ...run, player: { ...run.player, hp: Math.min((effects?.maxHp ?? 100), run.player.hp + 30) } }) },
      { id: 'rune', name: 'ルーン購入', price: Math.round(22 * discount), onBuy: () => setRewardChoices(buildRewardChoices('rune', 3, 1)) },
      { id: 'relic', name: 'レア遺物', price: Math.round(36 * discount), onBuy: () => setRewardChoices(buildRewardChoices('relic', 3, 1)) },
      { id: 'cleanse', name: '呪い除去', price: Math.round(20 * discount), onBuy: () => setRun({ ...run, player: { ...run.player, upgrades: run.player.upgrades.filter((u) => !u.name.includes('呪い')) } }) },
    ];
  }

  function buyShop(item: { price: number; onBuy: () => void }) {
    if (!run || run.player.coins < item.price) return;
    setRun({ ...run, player: { ...run.player, coins: run.player.coins - item.price } });
    item.onBuy();
    if (rewardChoices.length === 0) setScreen('map');
    else setScreen('reward');
  }

  const nowNode = currentNode();
  const nextNodes = run?.map.filter((n) => nowNode?.nextIds.includes(n.id));
  const tagCounts = run ? countTags(run.player.upgrades) : {};

  return (
    <div className="app">
      <div className="panel">
        {screen === 'title' && (
          <>
            <h1>Rune Ruins</h1>
            <p className="sub">古代遺跡でルーンを積み上げ、守護者の間を突破せよ。</p>
            <div className="stat">所持ルーン片: {progress.runeShards}</div>
            <button onClick={startRun}>探索開始</button>
            <button onClick={() => setScreen('permanent')}>恒久強化</button>
          </>
        )}

        {screen === 'permanent' && (
          <>
            <h2>恒久強化</h2>
            <div className="stat">所持ルーン片: {progress.runeShards}</div>
            {permanentUpgrades.map((u) => {
              const lv = progress.upgrades[u.id] ?? 0;
              const cost = u.baseCost + lv * 8;
              return <div key={u.id} className="card"><b>{u.name}</b><div>{u.description}</div><div>Lv {lv}/{u.maxLevel} | コスト: {cost}</div><button onClick={() => buyPermanent(u.id)}>購入</button></div>;
            })}
            <button onClick={() => setScreen('title')}>戻る</button>
          </>
        )}

        {screen === 'map' && run && nowNode && (
          <>
            <h2>遺跡マップ</h2>
            <div className="stat">階層: {run.floorReached}/10 | HP: {Math.round(run.player.hp)} | コイン: {run.player.coins}</div>
            <div className="small">タグ: rapid {tagCounts.rapid ?? 0} / guard {tagCounts.guard ?? 0} / burst {tagCounts.burst ?? 0} / risk {tagCounts.risk ?? 0} / sync {tagCounts.sync ?? 0}</div>
            <div className="card">現在地: {nodeLabel[nowNode.type]} (F{nowNode.floor})</div>
            <h3>次のマス</h3>
            {nextNodes?.map((n) => <button key={n.id} onClick={() => selectNode(n.id)}>{nodeLabel[n.type]} (F{n.floor})</button>)}
          </>
        )}

        {screen === 'combat' && run && combat && combatEnemy && (
          <>
            <h2>戦闘: {combatEnemy.name}</h2>
            <div className="combatBox enemy">敵HP {Math.max(0, Math.round(combat.enemyHp))}/{combatEnemy.maxHp}<div className="bar"><span style={{ width: `${(combat.enemyHp / combatEnemy.maxHp) * 100}%` }} /></div></div>
            <div className="projectile" />
            <div className="combatBox player">HP {Math.max(0, Math.round(combat.playerHp))}/{Math.round(effects?.maxHp ?? 100)} / Shield {Math.round(combat.playerShield)}<div className="bar"><span style={{ width: `${(combat.playerHp / (effects?.maxHp ?? 100)) * 100}%` }} /></div></div>
            {damageTexts.map((d) => <div key={d.id} className={`float ${d.target} ${d.crit ? 'crit' : ''}`}>-{d.value}</div>)}
            <p className="small">戦闘は自動進行中...</p>
          </>
        )}

        {screen === 'reward' && (
          <>
            <h2>報酬を選択</h2>
            {run && run.player.rerolls > 0 && <button onClick={rerollReward}>再抽選 ({run.player.rerolls})</button>}
            {rewardChoices.map((r) => <div className="card" key={r.id}><b>{r.name}</b><div>{r.description}</div><div className="small">{r.category} / {r.rarity} / {r.tags.join(',')}</div><button onClick={() => chooseReward(r)}>獲得</button></div>)}
            {screen === 'reward' && rewardChoices.length === 0 && <button onClick={() => setScreen('map')}>続行</button>}
          </>
        )}

        {screen === 'shop' && run && (
          <>
            <h2>行商人</h2>
            <div className="stat">コイン: {run.player.coins}</div>
            {shopItems().map((item) => <div className="card" key={item.id}><b>{item.name}</b><div>価格: {item.price}</div><button onClick={() => buyShop(item)}>購入</button></div>)}
            <button onClick={() => setScreen('map')}>スキップ</button>
          </>
        )}

        {screen === 'monolith' && (
          <>
            <h2>石碑</h2>
            <div className="card">{monolithText}</div>
            <button onClick={() => setScreen('map')}>進む</button>
          </>
        )}

        {screen === 'result' && result && (
          <>
            <h2>{result.win ? '遺跡制覇' : '探索失敗'}</h2>
            <div className="card">到達階層: {result.floor} / 獲得ルーン片: {result.shards}</div>
            <div className="card">主なビルド: {run?.player.upgrades.slice(0, 6).map((u) => u.name).join(' / ') || 'なし'}</div>
            <button onClick={startRun}>もう一度探索</button>
            <button onClick={() => setScreen('title')}>タイトルへ</button>
          </>
        )}
      </div>
    </div>
  );
}

function runNode(run: RunState, id: number) {
  return run.map.find((n) => n.id === id) ?? null;
}
