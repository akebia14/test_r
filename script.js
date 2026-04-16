(() => {
  const data = window.GAME_DATA;
  if (!data) return;

  const ui = {
    floor: document.getElementById("floor"),
    hp: document.getElementById("hp"),
    atk: document.getElementById("atk"),
    def: document.getElementById("def"),
    gold: document.getElementById("gold"),
    enemyName: document.getElementById("enemy-name"),
    enemyDesc: document.getElementById("enemy-desc"),
    enemyHp: document.getElementById("enemy-hp"),
    enemyHpText: document.getElementById("enemy-hp-text"),
    logList: document.getElementById("log-list"),
    attackBtn: document.getElementById("attack-btn"),
    skillBtn: document.getElementById("skill-btn"),
    healBtn: document.getElementById("heal-btn"),
  };

  const state = {
    floor: 1,
    player: {
      ...data.playerBase,
      hp: data.playerBase.maxHp,
    },
    enemy: null,
    gameOver: false,
  };

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function log(text, isAlert = false) {
    const li = document.createElement("li");
    li.textContent = text;
    if (isAlert) li.classList.add("alert");
    ui.logList.prepend(li);
    while (ui.logList.children.length > 12) {
      ui.logList.removeChild(ui.logList.lastChild);
    }
  }

  function scaleEnemy(template) {
    const factor = 1 + (state.floor - 1) * 0.16;
    return {
      name: template.name,
      desc: template.desc,
      maxHp: Math.floor(template.hp * factor),
      hp: Math.floor(template.hp * factor),
      atk: Math.floor(template.atk * factor),
      reward: Math.floor(template.reward * factor),
    };
  }

  function spawnEnemy() {
    const template = data.enemies[(state.floor - 1) % data.enemies.length];
    state.enemy = scaleEnemy(template);
    log(`階層${state.floor}: ${state.enemy.name} が現れた！`);
    render();
  }

  function render() {
    ui.floor.textContent = String(state.floor);
    ui.hp.textContent = `${state.player.hp} / ${state.player.maxHp}`;
    ui.atk.textContent = String(state.player.atk);
    ui.def.textContent = String(state.player.def);
    ui.gold.textContent = String(state.player.gold);

    ui.enemyName.textContent = state.enemy.name;
    ui.enemyDesc.textContent = state.enemy.desc;
    ui.enemyHp.max = state.enemy.maxHp;
    ui.enemyHp.value = Math.max(0, state.enemy.hp);
    ui.enemyHpText.textContent = `${Math.max(0, state.enemy.hp)} / ${state.enemy.maxHp}`;

    const disabled = state.gameOver;
    ui.attackBtn.disabled = disabled;
    ui.skillBtn.disabled = disabled;
    ui.healBtn.disabled = disabled;
  }

  function enemyTurn() {
    if (state.enemy.hp <= 0 || state.gameOver) return;
    const damage = Math.max(1, state.enemy.atk - state.player.def + rand(-1, 1));
    state.player.hp = Math.max(0, state.player.hp - damage);
    log(`${state.enemy.name}の攻撃！ ${damage} ダメージ。`, true);

    if (state.player.hp <= 0) {
      state.gameOver = true;
      log("あなたは倒れた… リロードで再挑戦。", true);
    }
  }

  function onEnemyDefeated() {
    state.player.gold += state.enemy.reward;
    log(`${state.enemy.name}撃破！ ${state.enemy.reward}G を獲得。`);

    if (state.floor % 3 === 0) {
      state.player.maxHp += 3;
      state.player.atk += 1;
      state.player.def += 1;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 5);
      log("遺跡の祝福で能力アップ！");
    }

    state.floor += 1;
    spawnEnemy();
  }

  function doAttack() {
    if (state.gameOver) return;
    const damage = Math.max(1, state.player.atk + rand(-1, 3));
    state.enemy.hp -= damage;
    log(`あなたの攻撃！ ${state.enemy.name}に ${damage} ダメージ。`);
    if (state.enemy.hp <= 0) {
      onEnemyDefeated();
      return;
    }
    enemyTurn();
    render();
  }

  function doSkill() {
    if (state.gameOver || state.player.gold < 3) {
      log("ゴールド不足でスキルは使えない。", true);
      return;
    }
    state.player.gold -= 3;
    const damage = Math.max(5, state.player.atk * 2 + rand(0, 4));
    state.enemy.hp -= damage;
    log(`ルーンバースト！ ${damage} ダメージ。`);
    if (state.enemy.hp <= 0) {
      onEnemyDefeated();
      return;
    }
    enemyTurn();
    render();
  }

  function doHeal() {
    if (state.gameOver || state.player.gold < 5) {
      log("ゴールド不足で回復できない。", true);
      return;
    }
    state.player.gold -= 5;
    const healed = rand(8, 12);
    const before = state.player.hp;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + healed);
    log(`回復薬を使用。HPが ${state.player.hp - before} 回復。`);
    enemyTurn();
    render();
  }

  ui.attackBtn.addEventListener("click", doAttack);
  ui.skillBtn.addEventListener("click", doSkill);
  ui.healBtn.addEventListener("click", doHeal);

  spawnEnemy();
  render();
})();
