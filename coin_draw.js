let roundCoins = [];
let layer = 0;
let allCoins = [];
let currentSwapOuterCoins = [];
let isSwapCompleted = false;
let currentLayerActiveIndices = [];
const coinBox = document.getElementById('coin-box');
const resultBox = document.getElementById('draw-result');
const tableBg = document.getElementById('table-bg');

// 钱币图标映射
const COIN_IMAGE_MAP = {
  "衡-尝五味": "https://img.cdn1.vip/i/697767fbc59b7_1769433083.webp",
  "衡-六艺备": "https://img.cdn1.vip/i/697767ff946a5_1769433087.webp",
  "花-柒叁柒": "https://img.cdn1.vip/i/697767ff96c66_1769433087.webp",
  "衡-美人相": "https://img.cdn1.vip/i/697767ffa3584_1769433087.webp",
  "花-吉事成双": "https://img.cdn1.vip/i/697767ffa733e_1769433087.webp",
  "花-扭乾坤": "https://img.cdn1.vip/i/697767ffa84e6_1769433087.webp",
  "花-兼得": "https://img.cdn1.vip/i/697767ffac662_1769433087.webp",
  "衡-启齿难": "https://img.cdn1.vip/i/697767ffaca4d_1769433087.webp",
  "衡-平安喜乐": "https://img.cdn1.vip/i/697767ffc6406_1769433087.webp",
  "衡-礼为先": "https://img.cdn1.vip/i/697767ffdb2ef_1769433087.webp",
  "花-三夺魁": "https://img.cdn1.vip/i/697767ffeeea9_1769433087.webp",
  "厉-兵行险着": "https://img.cdn1.vip/i/697768031771e_1769433091.webp",
  "厉-权衡利弊": "https://img.cdn1.vip/i/6977680317d3d_1769433091.webp",
  "花-有朋自远": "https://img.cdn1.vip/i/697768031aa2a_1769433091.webp",
  "厉-平分贵贱": "https://img.cdn1.vip/i/697768031dd02_1769433091.webp",
  "花-新岁将至": "https://img.cdn1.vip/i/69776803271de_1769433091.webp",
  "厉-祸不单行": "https://img.cdn1.vip/i/69776803354d0_1769433091.webp",
  "花-转生死": "https://img.cdn1.vip/i/697768033c668_1769433091.webp",
  "厉-哈基米": "https://img.cdn1.vip/i/6977680360adc_1769433091.webp",
  "厉-精打细算": "https://img.cdn1.vip/i/6977680390b59_1769433091.webp",
  "厉-领头羊": "https://img.cdn1.vip/i/69776804da0aa_1769433092.webp",
  "厉-人财空": "https://img.cdn1.vip/i/697768059899e_1769433093.webp",
  "厉-退避三舍": "https://img.cdn1.vip/i/697768059d987_1769433093.webp",
  "厉-误入奇境": "https://img.cdn1.vip/i/697768059e598_1769433093.webp",
  "厉-宴席散": "https://img.cdn1.vip/i/69776805a57e2_1769433093.webp",
  "厉-休生息": "https://img.cdn1.vip/i/69776805a69f9_1769433093.webp",
  "厉-天命难违": "https://img.cdn1.vip/i/69776805a9f63_1769433093.webp",
  "厉-守财奴": "https://img.cdn1.vip/i/69776805aec75_1769433093.webp",
  "厉-薪火传": "https://img.cdn1.vip/i/69776805b1667_1769433093.webp",
  "厉-神人至": "https://img.cdn1.vip/i/69776805b3538_1769433093.webp",
  "厉-人云亦云": "https://img.cdn1.vip/i/69776805b3656_1769433093.webp"
};

// 预加载素材清单
const PRELOAD_ASSETS = {
  backgrounds: [
    'https://img.cdn1.vip/i/697766f1ab102_1769432817.png',
    'https://img.cdn1.vip/i/697766f199bc5_1769432817.png'
  ],
  coins: Object.values(COIN_IMAGE_MAP)
};

// 素材预加载
async function preloadAssets() {
  const loadingMask = document.getElementById('loading-mask');
  const progressBar = document.getElementById('loading-progress');
  const progressText = document.getElementById('loading-text');
  
  let loaded = 0;
  let total = 0;
  const allAssets = [];

  try {
    const res = await fetch('coins.json');
    if (!res.ok) throw new Error('coins.json加载失败');
    const coinsData = await res.json();
    allCoins = coinsData;
  } catch (error) {
    console.error('加载coins.json失败：', error);
    alert('钱币配置文件加载失败，部分功能可能异常！');
  }

  allAssets.push(...PRELOAD_ASSETS.backgrounds);
  allAssets.push(...PRELOAD_ASSETS.coins);
  total = allAssets.length;

  for (const asset of allAssets) {
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = asset;
        img.onload = resolve;
        img.onerror = () => reject(new Error(`加载失败：${asset}`));
      });
      loaded++;
    } catch (error) {
      console.warn(error.message);
      loaded++;
    }

    const progress = Math.floor((loaded / total) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}% 完成 (${loaded}/${total})`;
  }

  loadingMask.style.opacity = 0;
  setTimeout(() => {
    loadingMask.style.display = 'none';
  }, 300);
  console.log('✅ 所有图床素材预加载完成！');
}

// 自定义弹窗初始化
function initCustomAlert() {
  const swapBtn = document.createElement('button');
  swapBtn.id = 'coin-swap-btn';
  swapBtn.textContent = '开启钱币互换';
  swapBtn.style.position = 'absolute';
  swapBtn.style.top = '80px';
  swapBtn.style.left = '50%';
  swapBtn.style.transform = 'translateX(-50%)';
  swapBtn.style.zIndex = '998';
  swapBtn.style.display = 'none';
  document.body.appendChild(swapBtn);

  swapBtn.onclick = () => {
    if (checkSwapLayer() && !isSwapCompleted && hasSwapTarget()) {
      showSwapModal(currentSwapOuterCoins);
    } else if (!hasSwapTarget()) {
      openAlert(`❌ 无可用互换目标<br><br>本局或外库无可用钱币，无法进行互换！`);
    }
  };

  const overlay = document.createElement('div');
  overlay.id = 'alert-overlay';
  overlay.onclick = closeAlertTemporary;
  document.body.appendChild(overlay);

  const alertDiv = document.createElement('div');
  alertDiv.id = 'custom-alert';
  alertDiv.style.display = 'flex';
  alertDiv.style.flexDirection = 'column';
  alertDiv.style.height = '100%';
  alertDiv.style.whiteSpace = 'normal';
  alertDiv.style.wordBreak = 'break-all';
  alertDiv.style.padding = '10px 0';
  document.body.appendChild(alertDiv);

  const alertHeader = document.createElement('div');
  alertHeader.className = 'alert-header';
  alertHeader.style.padding = '0 20px 10px';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '暂时关闭';
  closeBtn.style.padding = '4px 12px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = closeAlertTemporary;
  alertHeader.appendChild(closeBtn);
  alertDiv.appendChild(alertHeader);

  const alertContent = document.createElement('div');
  alertContent.id = 'alert-content';
  alertContent.style.lineHeight = '2';
  alertContent.style.padding = '0 20px';
  alertContent.style.flex = '1';
  alertContent.style.overflowY = 'auto';
  alertDiv.appendChild(alertContent);

  const alertFooter = document.createElement('div');
  alertFooter.id = 'alert-footer';
  alertFooter.style.padding = '10px 20px';
  alertDiv.appendChild(alertFooter);
}

// 关闭弹窗（临时）
function closeAlertTemporary() {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const swapBtn = document.getElementById('coin-swap-btn');
  alertBox.style.display = 'none';
  overlay.style.display = 'none';
  if (checkSwapLayer() && !isSwapCompleted && hasSwapTarget()) {
    swapBtn.style.display = 'block';
  }
}

// 关闭弹窗（永久，互换完成）
function closeAlertAndClear() {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const alertContent = document.getElementById('alert-content');
  const alertFooter = document.getElementById('alert-footer');
  const swapBtn = document.getElementById('coin-swap-btn');
  alertBox.style.display = 'none';
  overlay.style.display = 'none';
  swapBtn.style.display = 'none';
  alertContent.innerHTML = '';
  alertFooter.innerHTML = '';
  window.selectedOuterCoin = null;
  window.selectedRoundCoinIndex = undefined;
  currentSwapOuterCoins = [];
  isSwapCompleted = true;
  checkPeaceCoinReplace();
}

// 弹窗渲染（innerHTML实现真实换行）
function openAlert(content) {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const alertContent = document.getElementById('alert-content');
  const alertFooter = document.getElementById('alert-footer');
  alertFooter.innerHTML = '';
  alertContent.innerHTML = content;
  alertBox.style.display = 'flex';
  overlay.style.display = 'block';
  clearTimeout(window.alertTimer);
}

// 3/5层互换核心方法 - 适配吉事成双本局外库删币逻辑
window.selectedOuterCoin = null;
window.selectedRoundCoinIndex = undefined;
window.jishiDeleteOuterLi = new Set(); // 吉事成双本局删除的外库厉币集合
function checkSwapLayer() { return layer === 3 || layer === 5; }
function hasSwapTarget() {
  if (roundCoins.length === 0 || !Array.isArray(roundCoins)) return false;
  const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
  const outerCoins = allCoins.filter(c => 
    c?.name && !roundCoinNames.has(c.name) && 
    c.name !== '衡-平安喜乐' && 
    !window.jishiDeleteOuterLi.has(c.name) // 排除吉事成双本局删除的外库厉币
  );
  return outerCoins.length > 0;
}
function getRandomOuterCoins() {
  if (roundCoins.length === 0 || !Array.isArray(roundCoins)) return [];
  const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
  const outerCoins = allCoins.filter(c => 
    c?.name && !roundCoinNames.has(c.name) && 
    c.name !== '衡-平安喜乐' && 
    !window.jishiDeleteOuterLi.has(c.name) // 排除吉事成双本局删除的外库厉币
  );
  if (outerCoins.length === 0) return [];
  const shuffled = [...outerCoins].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// 互换弹窗
async function showSwapModal(outerCoins) {
  if (!checkSwapLayer() || isSwapCompleted || !hasSwapTarget() || outerCoins.length === 0 || !Array.isArray(outerCoins)) {
    openAlert(`❌ 无可用互换目标<br><br>本局或外库无可用钱币，无法进行互换！`);
    return;
  }
  if (roundCoins.length === 0 || !Array.isArray(roundCoins) || roundCoins.every(c => !c?.name)) {
    openAlert(`❌ 本局无有效钱币<br><br>无法选择互换目标，退出互换！`);
    return;
  }

  const alertContent = document.getElementById('alert-content');
  const alertFooter = document.getElementById('alert-footer');
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const swapBtn = document.getElementById('coin-swap-btn');
  
  swapBtn.style.display = 'none';
  alertContent.innerHTML = '';
  alertFooter.innerHTML = '';
  window.selectedOuterCoin = null;
  window.selectedRoundCoinIndex = undefined;

  alertContent.style.lineHeight = '1.8';
  alertBox.style.display = 'flex';
  overlay.style.display = 'block';

  // 标题
  const title = document.createElement('h3');
  title.style.color = '#d14949';
  title.style.margin = '0 0 20px 0';
  title.style.fontSize = '22px';
  title.textContent = `【${layer}层专属】外库抽币互换`;
  alertContent.appendChild(title);

  // 外库钱币区域
  const tip1 = document.createElement('p');
  tip1.style.margin = '0 0 15px 0';
  tip1.style.fontSize = '16px';
  tip1.innerHTML = '<b>选择外库1枚钱币进行互换：</b>';
  alertContent.appendChild(tip1);

  const outerCoinContainer = document.createElement('div');
  outerCoinContainer.className = 'coin-grid';
  outerCoinContainer.style.display = 'flex';
  outerCoinContainer.style.flexWrap = 'wrap';
  outerCoinContainer.style.gap = '15px';
  outerCoinContainer.style.marginBottom = '20px';
  outerCoins.forEach((coin, idx) => {
    if (!coin?.name) return;
    const coinCard = document.createElement('div');
    coinCard.className = 'coin-card';
    coinCard.id = `outer-coin-card-${idx}`;
    coinCard.style.padding = '10px';
    coinCard.style.border = '2px solid #eee';
    coinCard.style.borderRadius = '8px';
    coinCard.style.minWidth = '200px';
    coinCard.style.background = '#f8f9fa';

    const coinName = document.createElement('div');
    coinName.style.fontWeight = 'bold';
    coinName.style.marginBottom = '8px';
    coinName.textContent = coin.name;
    coinCard.appendChild(coinName);

    const coinEffect = document.createElement('div');
    coinEffect.style.fontSize = '14px';
    coinEffect.style.marginBottom = '10px';
    coinEffect.style.color = '#666';
    coinEffect.textContent = coin.effect || '无特殊效果';
    coinCard.appendChild(coinEffect);

    const selectBtn = document.createElement('button');
    selectBtn.style.padding = '4px 12px';
    selectBtn.style.cursor = 'pointer';
    selectBtn.style.border = 'none';
    selectBtn.style.borderRadius = '4px';
    selectBtn.style.background = '#28a745';
    selectBtn.style.color = '#fff';
    selectBtn.textContent = `选择此币`;
    selectBtn.onclick = () => selectOuterCoin(coin, idx);
    coinCard.appendChild(selectBtn);

    outerCoinContainer.appendChild(coinCard);
  });
  alertContent.appendChild(outerCoinContainer);

  // 本局钱币区域
  const tip2 = document.createElement('p');
  tip2.style.margin = '0 0 15px 0';
  tip2.style.fontSize = '16px';
  tip2.innerHTML = '<b>选择本局1枚钱币作为互换目标：</b>';
  alertContent.appendChild(tip2);

  const roundCoinContainer = document.createElement('div');
  roundCoinContainer.className = 'coin-grid';
  roundCoinContainer.style.display = 'flex';
  roundCoinContainer.style.flexWrap = 'wrap';
  roundCoinContainer.style.gap = '15px';
  const validRoundCoins = roundCoins.filter(c => c?.name);
  if (validRoundCoins.length === 0) {
    const emptyTip = document.createElement('div');
    emptyTip.style.padding = '20px';
    emptyTip.style.textAlign = 'center';
    emptyTip.style.color = '#999';
    emptyTip.textContent = '本局暂无有效钱币可选择';
    roundCoinContainer.appendChild(emptyTip);
  } else {
    validRoundCoins.forEach((coin, idx) => {
      if (!coin?.name) return;
      const coinCard = document.createElement('div');
      coinCard.className = 'coin-card';
      coinCard.id = `round-coin-card-${idx}`;
      coinCard.style.padding = '10px';
      coinCard.style.border = '2px solid #eee';
      coinCard.style.borderRadius = '8px';
      coinCard.style.minWidth = '200px';
      coinCard.style.background = '#f8f9fa';

      const coinName = document.createElement('div');
      coinName.style.fontWeight = 'bold';
      coinName.style.marginBottom = '8px';
      coinName.textContent = coin.name;
      coinCard.appendChild(coinName);

      const coinEffect = document.createElement('div');
      coinEffect.style.fontSize = '14px';
      coinEffect.style.marginBottom = '8px';
      coinEffect.style.color = '#666';
      coinEffect.textContent = coin.effect || '无特殊效果';
      coinCard.appendChild(coinEffect);

      const coinCount = document.createElement('div');
      coinCount.style.fontSize = '12px';
      coinCount.style.marginBottom = '10px';
      coinCount.style.color = '#999';
      coinCount.textContent = `已投出：${coin.count || 0} 次`;
      coinCard.appendChild(coinCount);

      const selectBtn = document.createElement('button');
      selectBtn.id = `round-select-btn-${idx}`;
      selectBtn.style.padding = '4px 12px';
      selectBtn.style.cursor = 'not-allowed';
      selectBtn.style.border = 'none';
      selectBtn.style.borderRadius = '4px';
      selectBtn.style.background = '#ccc';
      selectBtn.style.color = '#fff';
      selectBtn.textContent = `选择此币`;
      selectBtn.disabled = true;
      selectBtn.onclick = () => selectRoundCoin(idx);
      coinCard.appendChild(selectBtn);

      roundCoinContainer.appendChild(coinCard);
    });
  }
  alertContent.appendChild(roundCoinContainer);

  // 底部按钮
  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '15px';
  btnContainer.style.marginTop = '30px';
  btnContainer.style.justifyContent = 'center';

  const confirmBtn = document.createElement('button');
  confirmBtn.id = 'swap-confirm-btn';
  confirmBtn.textContent = '确定互换';
  confirmBtn.style.padding = '8px 24px';
  confirmBtn.style.fontSize = '16px';
  confirmBtn.style.cursor = 'not-allowed';
  confirmBtn.style.border = 'none';
  confirmBtn.style.borderRadius = '8px';
  confirmBtn.style.background = '#ccc';
  confirmBtn.style.color = '#fff';
  confirmBtn.disabled = true;
  confirmBtn.onclick = doCoinSwap;

  const noSwapBtn = document.createElement('button');
  noSwapBtn.textContent = '不更换，继续游戏';
  noSwapBtn.style.padding = '8px 24px';
  noSwapBtn.style.fontSize = '16px';
  noSwapBtn.style.cursor = 'pointer';
  noSwapBtn.style.border = 'none';
  noSwapBtn.style.borderRadius = '8px';
  noSwapBtn.style.background = '#17a2b8';
  noSwapBtn.style.color = '#fff';
  noSwapBtn.onclick = () => {
    closeAlertAndClear();
    openAlert(`已放弃${layer}层替换机会`);
  };

  btnContainer.appendChild(confirmBtn);
  btnContainer.appendChild(noSwapBtn);
  alertFooter.appendChild(btnContainer);
}

// 选择外库钱币
function selectOuterCoin(outerCoin, cardIndex) {
  if (!outerCoin?.name) return;
  window.selectedOuterCoin = outerCoin;
  document.querySelectorAll('.coin-card').forEach(card => {
    card.style.border = '2px solid #eee';
    card.style.background = '#f8f9fa';
  });
  const targetCard = document.getElementById(`outer-coin-card-${cardIndex}`);
  if (targetCard) {
    targetCard.style.border = '2px solid #28a745';
    targetCard.style.background = '#e8f5e9';
  }
  document.querySelectorAll('[id^="round-select-btn-"]').forEach(btn => {
    btn.disabled = false;
    btn.style.background = '#28a745';
    btn.style.cursor = 'pointer';
  });
  window.selectedRoundCoinIndex = undefined;
  const confirmBtn = document.getElementById('swap-confirm-btn');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.style.background = '#ccc';
    confirmBtn.style.cursor = 'not-allowed';
  }
}

// 选择本局钱币
function selectRoundCoin(idx) {
  window.selectedRoundCoinIndex = idx;
  document.querySelectorAll('[id^="round-coin-card-"]').forEach(card => {
    card.style.border = '2px solid #eee';
    card.style.background = '#f8f9fa';
  });
  const targetCard = document.getElementById(`round-coin-card-${idx}`);
  if (targetCard) {
    targetCard.style.border = '2px solid #ff7f50';
    targetCard.style.background = '#fff3e0';
  }
  const confirmBtn = document.getElementById('swap-confirm-btn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.style.background = '#28a745';
    confirmBtn.style.cursor = 'pointer';
  }
}

// 执行互换
function doCoinSwap() {
  const selectedOuter = window.selectedOuterCoin;
  const selectedRoundIndex = window.selectedRoundCoinIndex;
  if (!selectedOuter?.name || selectedRoundIndex === undefined || isNaN(selectedRoundIndex) || !roundCoins[selectedRoundIndex]?.name) {
    openAlert(`❌ 互换失败<br><br>未选择有效互换目标，请重新操作！`);
    return;
  }

  const selectedRoundCoin = roundCoins[selectedRoundIndex];
  roundCoins[selectedRoundIndex] = {
    ...selectedOuter,
    count: selectedRoundCoin.count || 0,
    nextTransformPending: selectedRoundCoin.nextTransformPending || false,
    delayPeaceTransform: selectedRoundCoin.delayPeaceTransform || false
  };

  closeAlertAndClear();
  renderCoinBox();
  openAlert(`替换成功！<br><br>【${selectedOuter.name}】→ 【${selectedRoundCoin.name}】`);
  window.selectedRoundCoinIndex = undefined;
}

// 基础功能：获取钱币数据
async function fetchCoins() {
  if (allCoins.length > 0) return allCoins;
  try {
    const res = await fetch('coins.json');
    if (!res.ok) throw new Error(`请求失败：${res.status}`);
    allCoins = await res.json();
    return allCoins;
  } catch (error) {
    console.error('加载coins.json失败：', error);
    allCoins = [];
    return allCoins;
  }
}

// 开始新局 - 开局无衡-平安喜乐（仅修改末尾，其余代码不变）
async function startNewRound() {
  // 原有代码全部保留 ↓
  const coins = await fetchCoins();
  if (coins.length === 0) {
    alert('无法开始新局：未加载到钱币数据！');
    return;
  }

  let attempt = 0;
  while (attempt < 1000) {
    attempt++;
    // 过滤衡-平安喜乐，开局绝对抽不到
    let tempPool = coins.filter(c => c?.name && c.name !== '衡-平安喜乐');
    let selected = [];
    while (selected.length < 10 && tempPool.length) {
      const idx = Math.floor(Math.random() * tempPool.length);
      const coin = JSON.parse(JSON.stringify(tempPool.splice(idx, 1)[0]));
      coin.count = 0;
      coin.nextTransformPending = false;
      coin.delayPeaceTransform = false;
      selected.push(coin);
    }
    const numLi = selected.filter(c => c?.name && c.name.startsWith('厉-')).length;
    const conflictCount = selected.filter(c => ['厉-守财奴', '厉-兵行险着'].includes(c?.name || '')).length;
    if (numLi >= 6 && conflictCount <= 1) {
      roundCoins = selected;
      break;
    }
  }

  layer = 0;
  isSwapCompleted = false;
  currentSwapOuterCoins = [];
  currentLayerActiveIndices = [];
  document.getElementById('coin-swap-btn').style.display = 'none';
  tableBg.style.backgroundImage = "url('https://img.cdn1.vip/i/697766f199bc5_1769432817.png')";
  renderCoinBox();
  resultBox.innerHTML = `<b>新一局开始！</b> 共抽取 ${roundCoins.length} 枚钱币。`;
    window.jishiDeleteOuterLi.clear(); // 新局重置吉事成双本局删除的外库厉币标记
  checkPeaceCoinReplace();
}

// 渲染钱币 - 核心：第一行7枚、第二行3枚固定排布
function renderCoinBox() {
  coinBox.innerHTML = "";
  // 设置钱币容器为纵向弹性布局，手动分两行
  coinBox.style.display = 'flex';
  coinBox.style.flexDirection = 'column';
  coinBox.style.alignItems = 'center';
  coinBox.style.gap = '25px'; // 适配大钱币，增大行间距
  coinBox.style.padding = '20px 0'; // 增加容器上下内边距，防止溢出

  if (roundCoins.length === 0 || !Array.isArray(roundCoins)) return;

  // 强制分两组：第一行0-6（7枚）、第二行7-9（3枚）
  const firstRowCoins = roundCoins.slice(0, 7);
  const secondRowCoins = roundCoins.slice(7, 10);

  // 创建第一行容器（横向排列7枚）
  const firstRow = document.createElement('div');
  firstRow.style.display = 'flex';
  firstRow.style.gap = '20px'; // 适配大钱币，增大钱币横向间距
  firstRowCoins.forEach((coin, index) => {
    if (!coin?.name) return;
    const coinDiv = createCoinElement(coin, 0 + index);
    firstRow.appendChild(coinDiv);
  });
  coinBox.appendChild(firstRow);

  // 创建第二行容器（横向排列3枚）
  const secondRow = document.createElement('div');
  secondRow.style.display = 'flex';
  secondRow.style.gap = '20px'; // 适配大钱币，增大钱币横向间距
  secondRowCoins.forEach((coin, index) => {
    if (!coin?.name) return;
    const coinDiv = createCoinElement(coin, 7 + index);
    secondRow.appendChild(coinDiv);
  });
  coinBox.appendChild(secondRow);
}

// 封装钱币元素创建方法 - 核心：放大图标+名称（100px尺寸+14px加粗名称）
function createCoinElement(coin, index) {
  const coinDiv = document.createElement('div');
  coinDiv.className = 'coin';
  // 投出高亮样式 + 延迟变换厉币的橙红色阴影
  if (currentLayerActiveIndices.includes(index)) {
    coinDiv.classList.add('active');
  }
  if (coin.delayPeaceTransform) {
    coinDiv.style.boxShadow = '0 0 25px #ff4500'; // 适配大钱币，放大阴影
  }
  // 钱币核心样式 - 放大至100px（原80px），加粗边框
  coinDiv.style.width = '100px';
  coinDiv.style.height = '100px';
  coinDiv.style.borderRadius = '50%';
  coinDiv.style.display = 'inline-flex';
  coinDiv.style.alignItems = 'center';
  coinDiv.style.justifyContent = 'center';
  coinDiv.style.border = '3px solid #333'; // 加粗边框，适配大钱币
  coinDiv.style.color = '#fff';
  coinDiv.style.fontWeight = 'bold';
  coinDiv.style.textShadow = '2px 2px 3px #000'; // 加深文字阴影，更清晰
  coinDiv.style.transition = 'all 0.3s ease';
  coinDiv.style.cursor = 'pointer'; // 增加鼠标悬浮指针，提升交互

  // 加载钱币背景图 - 保证图片铺满整个大钱币
  const coinImageUrl = COIN_IMAGE_MAP[coin.name] || '';
  if (coinImageUrl) {
    coinDiv.style.backgroundImage = `url('${coinImageUrl}')`;
    coinDiv.style.backgroundSize = '100% 100%'; // 精准铺满100px容器
    coinDiv.style.backgroundPosition = 'center';
    coinDiv.style.backgroundRepeat = 'no-repeat';
  }

  // 钱币名称 - 放大至14px+加粗（原12px），适配大钱币
  const nameDiv = document.createElement('div');
  nameDiv.className = 'coin-name';
  nameDiv.style.fontSize = '14px'; // 放大字体
  nameDiv.style.fontWeight = '900'; // 加粗，更醒目
  nameDiv.style.textAlign = 'center';
  nameDiv.style.lineHeight = '1.2'; // 紧凑行高，防止名称换行溢出
  nameDiv.style.padding = '0 5px'; // 增加左右内边距，防止文字贴边
  nameDiv.textContent = coin.name;
  coinDiv.appendChild(nameDiv);

  return coinDiv;
}

// 钱币变换 - 兼容延迟变换为平安喜乐的规则
function applyNextTransform() {
  if (roundCoins.length === 0 || !Array.isArray(roundCoins)) return;
  roundCoins.forEach((coin, index) => {
    if (!coin?.name || !coin.nextTransformPending) return;

    // 延迟变换：仅清除标记，本次不变换（祸不单行新厉币专用）
    if (coin.delayPeaceTransform) {
      coin.delayPeaceTransform = false;
      coin.nextTransformPending = false;
      renderCoinBox();
      return;
    }

    // 正常变换逻辑（含吉事成双的平安喜乐变换）
    const newCoin = allCoins.find(c => c?.name === coin.nextTransform);
    if (newCoin) {
      Object.assign(roundCoins[index], JSON.parse(JSON.stringify(newCoin)), {
        count: coin.count,
        nextTransformPending: false,
        delayPeaceTransform: false
      });
    }
  });
  renderCoinBox();
}

// 抽层逻辑 - 触发厉-祸不单行、花-吉事成双效果
function drawThree() {
  if (roundCoins.length === 0 || !Array.isArray(roundCoins)) {
    alert("请先点击「开始新局」按钮！");
    return;
  }

  applyNextTransform();
  layer++;

  const currentLayerDrawnIndices = [];
  const validIndices = roundCoins.map((c, i) => c?.name ? i : -1).filter(i => i !== -1);
  while (currentLayerDrawnIndices.length < 3 && currentLayerDrawnIndices.length < validIndices.length) {
    const randomIdx = Math.floor(Math.random() * validIndices.length);
    const idx = validIndices[randomIdx];
    if (!currentLayerDrawnIndices.includes(idx)) currentLayerDrawnIndices.push(idx);
  }

  currentLayerActiveIndices = currentLayerDrawnIndices;
  const drawnCoins = currentLayerDrawnIndices.map(i => roundCoins[i]);
  // 标记效果是否触发，避免重复弹窗
  let isHuodandanxingTriggered = false;
  let isJishichengshuangTriggered = false;
  
  drawnCoins.forEach((coin, i) => {
    if (coin?.name) {
      coin.count = (coin.count || 0) + 1;
      if (coin?.nextTransform) coin.nextTransformPending = true;
      // 触发厉-祸不单行效果
      if (coin.name === '厉-祸不单行' && !isHuodandanxingTriggered) {
        isHuodandanxingTriggered = true;
        triggerHuodandanxing(currentLayerDrawnIndices[i]);
      }
      // 触发花-吉事成双效果（仅本局生效）
      if (coin.name === '花-吉事成双' && !isJishichengshuangTriggered) {
        isJishichengshuangTriggered = true;
        triggerJishichengshuang();
      }
    }
  });

  renderCoinBox();
  resultBox.innerHTML = `<h3>第 ${layer} 层抽取结果：</h3>`;
  drawnCoins.forEach(coin => {
    if (!coin?.name) return;
    const effectDiv = document.createElement('div');
    effectDiv.className = 'effect';
    let effectText = coin.effect || '无特殊效果';
    if (effectText.includes('已投出')) {
      effectText = effectText.replace(/已投出\d+次/, `已投出${coin.count}次`);
    }
    // 祸不单行效果说明
    if (coin.name === '厉-祸不单行') {
      effectText += '<br><span style="color:#d14949;"></span>';
    }
    // 吉事成双效果说明（仅本局）
    if (coin.name === '花-吉事成双') {
      effectText += '<br><span style="color:#28a745;"></span>';
    }
    effectDiv.innerHTML = `<b>${coin.name}</b>：${effectText}`;
    resultBox.appendChild(effectDiv);
  });

  checkPeaceCoinReplace();

  // 互换按钮显隐控制
  const swapBtn = document.getElementById('coin-swap-btn');
  swapBtn.style.display = 'none';
  if (checkSwapLayer() && !isSwapCompleted && hasSwapTarget()) {
    const outerCoins = getRandomOuterCoins();
    if (outerCoins.length > 0) {
      currentSwapOuterCoins = outerCoins;
      swapBtn.style.display = 'block';
    } else {
      openAlert(`❌ ${layer}层无可用外库钱币<br><br>无法进行钱币互换，继续游戏！`);
      isSwapCompleted = true;
    }
  } else if (checkSwapLayer() && !isSwapCompleted && !hasSwapTarget()) {
    openAlert(`❌ ${layer}层无可用互换目标<br><br>本局或外库无可用钱币，无法互换！`);
    isSwapCompleted = true;
  } else {
    isSwapCompleted = false;
    currentSwapOuterCoins = [];
  }
}

// 厉-祸不单行 专属效果核心实现
function triggerHuodandanxing(huoIndex) {
  if (!roundCoins[huoIndex] || roundCoins[huoIndex].name !== '厉-祸不单行') return;

  // 筛选本局非厉系钱币
  const nonLiCoinIndices = roundCoins.reduce((acc, coin, idx) => {
    if (coin?.name && !coin.name.startsWith('厉-') && idx !== huoIndex) {
      acc.push(idx);
    }
    return acc;
  }, []);

  // 兜底：无可用非厉币
  if (nonLiCoinIndices.length === 0) {
    const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
    const newLiCandidates = allCoins.filter(c => 
      c?.name && c.name.startsWith('厉-') && 
      !roundCoinNames.has(c.name) && 
      c.name !== '厉-祸不单行' &&
      c.name !== '衡-平安喜乐'
    );
    if (newLiCandidates.length === 0) {
      openAlert(`❌ 厉-祸不单行效果触发失败<br><br>外库无可用新厉系钱币，效果作废！`);
      return;
    }
    const randomNewLiCoin = shuffleArray([...newLiCandidates])[0];
    roundCoins[huoIndex] = {
      ...randomNewLiCoin,
      count: roundCoins[huoIndex].count || 0,
      nextTransformPending: false,
      delayPeaceTransform: true
    };
    renderCoinBox();
    openAlert(`厉-祸不单行效果触发<br><br>厉-祸不单行→${randomNewLiCoin.name}<br><br>`);
    return;
  }

  // 随机选1枚非厉币
  const randomNonLiIndex = shuffleArray([...nonLiCoinIndices])[0];
  const randomNonLiCoin = roundCoins[randomNonLiIndex];

  // 筛选新厉币候选池
  const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
  const newLiCandidates = allCoins.filter(c => 
    c?.name && c.name.startsWith('厉-') && 
    !roundCoinNames.has(c.name) && 
    c.name !== '厉-祸不单行' &&
    c.name !== randomNonLiCoin.name &&
    c.name !== '衡-平安喜乐'
  );

  const replaceNum = Math.min(2, newLiCandidates.length);
  if (replaceNum === 0) {
    openAlert(`❌ 厉-祸不单行效果触发失败<br><br>外库无可用新厉系钱币，效果作废！`);
    return;
  }
  const randomNewLiCoins = shuffleArray([...newLiCandidates]).slice(0, replaceNum);

  // 执行替换
  let replaceTip = `厉-祸不单行效果触发！<br><br>`;
  // 替换本币
  roundCoins[huoIndex] = {
    ...randomNewLiCoins[0],
    count: roundCoins[huoIndex].count || 0,
    nextTransformPending: false,
    delayPeaceTransform: true
  };
  replaceTip += `厉-祸不单行→${randomNewLiCoins[0].name}<br>`;

  // 替换非厉币（若有）
  if (replaceNum >= 2) {
    roundCoins[randomNonLiIndex] = {
      ...randomNewLiCoins[1],
      count: randomNonLiCoin.count || 0,
      nextTransformPending: false,
      delayPeaceTransform: true
    };
    replaceTip += `${randomNonLiCoin.name}→${randomNewLiCoins[1].name}<br>`;
  }

  // 补充提示
  replaceTip += `<br>`;
  if (replaceNum === 1) {
    replaceTip += `<br><br>⚠️ 外库仅1枚可用新厉币，未替换非厉币！`;
  }
  renderCoinBox();
  openAlert(replaceTip);
}

// 花-吉事成双 专属效果实现（核心：本局钱盒+钱库各删1枚厉币，仅本局生效）
function triggerJishichengshuang() {
  // 1. 筛选本局钱盒内的厉币
  const localLiCoinIndices = roundCoins.reduce((acc, coin, idx) => {
    if (coin?.name && coin.name.startsWith('厉-')) acc.push(idx);
    return acc;
  }, []);
  // 2. 筛选本局钱库（外库）的厉币（仅本局排除，新局重置，不影响全局）
  const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
  const outerLiCoins = allCoins.filter(c => 
    c?.name && c.name.startsWith('厉-') && !roundCoinNames.has(c.name)
  );

  // 兜底：钱盒/钱库任意一方无厉币，效果直接作废
  if (localLiCoinIndices.length === 0 || outerLiCoins.length === 0) {
    const tip = localLiCoinIndices.length === 0 
      ? '本局钱盒无厉币可销毁' 
      : '本局钱库（外库）无厉币可销毁';
    openAlert(`❌ 花-吉事成双效果触发失败<br><br>${tip}，效果作废！`);
    return;
  }

  // 随机选钱盒1枚厉币标记为下次替换平安喜乐（视觉删除，延迟生效）
  const randomLocalLiIndex = shuffleArray([...localLiCoinIndices])[0];
  const destroyLocalLiName = roundCoins[randomLocalLiIndex].name;
  roundCoins[randomLocalLiIndex] = {
    name: destroyLocalLiName,
    count: roundCoins[randomLocalLiIndex].count || 0,
    nextTransformPending: true,
    delayPeaceTransform: false,
    nextTransform: '衡-平安喜乐'
  };

  // 随机选钱库1枚厉币（仅本局屏蔽，新局恢复，实现本局删除效果）
  const randomOuterLiCoin = shuffleArray([...outerLiCoins])[0];
  const destroyOuterLiName = randomOuterLiCoin.name;


  // 标记该厉币：下次投币自动变换为衡-平安喜乐（延迟生效）
  roundCoins[randomLocalLiIndex] = {
    name: destroyLocalLiName, // 临时保留原名称，视觉无感知
    count: roundCoins[randomLocalLiIndex].count || 0, // 保留投出次数
    nextTransformPending: true, // 标记下次投币执行变换
    delayPeaceTransform: false, // 不使用祸不单行的延迟标记
    nextTransform: '衡-平安喜乐' // 强制变换为平安喜乐
  };


  // 核心：本局内屏蔽该外库厉币（修改hasSwapTarget/getRandomOuterCoins的筛选逻辑，仅本局生效）
  window.jishiDeleteOuterLi = window.jishiDeleteOuterLi || new Set();
  window.jishiDeleteOuterLi.add(destroyOuterLiName);

  // 弹窗提示（仅本局操作）
  const effectTip = `花-吉事成双效果触发！<br><br>
  本局钱盒销毁厉币：<b>${destroyLocalLiName}</b><br>
  本局钱库销毁厉币：<b>${destroyOuterLiName}</b>`;

  renderCoinBox();
  openAlert(effectTip);
}

// 查看所有钱币（含吉事成双待替换标记）
async function showAllCoins() {
  const coins = await fetchCoins();
  if (coins.length === 0) {
    openAlert('暂无钱币数据！');
    return;
  }
  if (roundCoins.length === 0 || !Array.isArray(roundCoins)) {
    openAlert('本局暂无钱币！<br><br>请先开始新局抽取钱币！');
    return;
  }
  const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
  const roundCoinsDetail = roundCoins.filter(c => c?.name).map(rc => coins.find(c => c?.name === rc.name)).filter(Boolean);
  const otherCoins = allCoins.filter(c => c?.name && !roundCoinNames.has(c.name)).sort((a, b) => a.name.localeCompare(b.name));

  let effectHtml = '';
  effectHtml += '<strong>【本局抽到的钱币】</strong><br>';
  if (roundCoinsDetail.length > 0) {
    roundCoinsDetail.forEach((coin, idx) => {
      const currentCoin = roundCoins.find(rc => rc?.name === coin.name);
      const count = currentCoin?.count || 0;
      const delayTip = currentCoin?.delayPeaceTransform ? '<span style="color:#ff4500;">【下次投币后变成衡-平安喜乐】</span>' : '';
      // 吉事成双待替换标记
      const jishiTip = (currentCoin?.nextTransform === '衡-平安喜乐' && currentCoin?.nextTransformPending) ? '<span style="color:#28a745;">【吉事成双待替换为平安喜乐】</span>' : '';
      effectHtml += `【${coin.name}】：★${coin.effect || '无特殊效果'}（已投出${count}次）${delayTip}${jishiTip}<br><br>`;
    });
  } else {
    effectHtml += '本局暂无有效钱币<br><br>';
  }

  effectHtml += '————————————————<br><br>';
  effectHtml += '<strong>【其他钱币（外库）】</strong><br>';
  if (otherCoins.length > 0) {
    otherCoins.forEach(coin => {
      effectHtml += `${coin.name}：${coin.effect || '无特殊效果'}<br><br>`;
    });
  } else {
    effectHtml += '外库暂无可用钱币<br><br>';
  }

  openAlert(effectHtml);
}

// 衡-平安喜乐自动替换（≥3枚时触发，逐条展示替换信息）
function checkPeaceCoinReplace() {
  if (roundCoins.length === 0 || !Array.isArray(roundCoins) || allCoins.length === 0) return;

  const peaceCoinInfo = roundCoins.reduce((acc, coin, idx) => {
    if (coin?.name === '衡-平安喜乐') {
      acc.count++;
      acc.indices.push(idx);
    }
    return acc;
  }, { count: 0, indices: [] });

  if (peaceCoinInfo.count < 3) return;

  const roundCoinNames = new Set(roundCoins.map(c => c?.name || ''));
  const replaceCandidates = allCoins.filter(c => c?.name && !roundCoinNames.has(c.name) && c.name !== '衡-平安喜乐');
  
  const replaceNum = Math.min(3, replaceCandidates.length, peaceCoinInfo.indices.length);
  if (replaceNum === 0) {
    openAlert(`⚠️ 衡-平安喜乐达${peaceCoinInfo.count}枚，但外库无可用替换钱币<br><br>保留所有平安喜乐！`);
    return;
  }

  const randomPeaceIndices = shuffleArray([...peaceCoinInfo.indices]).slice(0, replaceNum);
  const randomReplaceCoins = shuffleArray([...replaceCandidates]).slice(0, replaceNum);

  // 逐条拼接替换信息
  let replaceTip = `衡-平安喜乐替换<br><br>`;
  randomReplaceCoins.forEach(coin => {
    replaceTip += `衡-平安喜乐→${coin.name}<br>`;
  });
  const remainPeaceNum = peaceCoinInfo.count - replaceNum;
  replaceTip += `<br>替换后剩余${remainPeaceNum}枚衡-平安喜乐`;

  // 执行替换
  randomPeaceIndices.forEach((peaceIdx, i) => {
    const originalCoin = roundCoins[peaceIdx];
    roundCoins[peaceIdx] = {
      ...randomReplaceCoins[i],
      count: originalCoin.count || 0,
      nextTransformPending: originalCoin.nextTransformPending || false,
      delayPeaceTransform: originalCoin.delayPeaceTransform || false
    };
  });

  renderCoinBox();
  openAlert(replaceTip);
}

// 数组随机打乱（Fisher-Yates洗牌算法，保证随机性）
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// 页面初始化
window.onload = async function() {
  await preloadAssets();
  initCustomAlert();
  tableBg.style.backgroundImage = "url('https://img.cdn1.vip/i/697766f1ab102_1769432817.png')";
  document.getElementById('coin-swap-btn').style.display = 'none';
  document.getElementById('custom-alert').style.display = 'none';
  currentLayerActiveIndices = [];
  window.jishiDeleteOuterLi = new Set();

  // 【可选】页面右下角显示版本号（视觉化查看，不影响布局）
  const versionTag = document.createElement('div');
  versionTag.style.position = 'fixed';
  versionTag.style.bottom = '10px';
  versionTag.style.right = '10px';
  versionTag.style.padding = '4px 8px';
  versionTag.style.fontSize = '12px';
  versionTag.style.color = '#fff';
  versionTag.style.background = 'rgba(0,0,0,0.7)';
  versionTag.style.borderRadius = '4px';
  versionTag.style.zIndex = '9999'; // 置顶显示，不被遮挡
  versionTag.textContent = `版本：${CODE_VERSION}`;
  document.body.appendChild(versionTag);

  // 原有样式兜底代码...
  if (!document.querySelector('.coin-grid-style')) {
    const style = document.createElement('style');
    style.className = 'coin-grid-style';
    style.textContent = `
      .coin.active { border-color: #ff7f50; box-shadow: 0 0 20px #ff7f50; }
      #alert-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 997; display: none; }
      #custom-alert { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-height: 80vh; background: #fff; border-radius: 12px; z-index: 998; display: none; flex-direction: column; }
      .coin-card { box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s ease; }
      .coin-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
      #alert-content::-webkit-scrollbar { width: 6px; }
      #alert-content::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
      #alert-content::-webkit-scrollbar-thumb:hover { background: #999; }
    `;
    document.head.appendChild(style);
  }
};
