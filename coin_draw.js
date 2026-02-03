let roundCoins = [];
let layer = 0;
let allCoins = [];
const coinBox = document.getElementById('coin-box');
const resultBox = document.getElementById('draw-result');
const tableBg = document.getElementById('table-bg');

// ===================== 素材配置：背景图+钱币图标图床地址（精准对应） =====================
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

// 预加载素材清单（背景图2张+所有钱币图标）
const PRELOAD_ASSETS = {
  backgrounds: [
    'https://img.cdn1.vip/i/697766f1ab102_1769432817.png',  // 初始化背景图
    'https://img.cdn1.vip/i/697766f199bc5_1769432817.png'   // 新局背景图
  ],
  coins: Object.values(COIN_IMAGE_MAP)
};

// ===================== 素材预加载函数 =====================
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

// ===================== 自定义弹窗基础功能 =====================
function initCustomAlert() {
  const overlay = document.createElement('div');
  overlay.id = 'alert-overlay';
  overlay.onclick = closeAlert;
  document.body.appendChild(overlay);

  const alertDiv = document.createElement('div');
  alertDiv.id = 'custom-alert';

  const alertHeader = document.createElement('div');
  alertHeader.className = 'alert-header';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '关闭';
  closeBtn.onclick = closeAlert;

  const alertContent = document.createElement('div');
  alertContent.id = 'alert-content';

  alertHeader.appendChild(closeBtn);
  alertDiv.appendChild(alertHeader);
  alertDiv.appendChild(alertContent);
  document.body.appendChild(alertDiv);
}

function closeAlert() {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  alertBox.style.display = 'none';
  overlay.style.display = 'none';
  // 清空弹窗内容，避免残留
  document.getElementById('alert-content').innerHTML = '';
}

function openAlert(content) {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const alertContent = document.getElementById('alert-content');
  
  alertContent.textContent = content;
  alertBox.style.display = 'block';
  overlay.style.display = 'block';
}

// ===================== 新增核心：3/5层抽币互换功能 =====================
/**
 * 检查是否到达互换层数（3/5层）
 * @returns {boolean} 是否触发互换
 */
function checkSwapLayer() {
  return layer === 3 || layer === 5;
}

/**
 * 从全局库抽取3枚本局未拥有的钱币
 * @returns {Array} 抽取的3枚外库钱币
 */
function getRandomOuterCoins() {
  // 获取本局钱币名称集合
  const roundCoinNames = new Set(roundCoins.map(c => c.name));
  // 过滤出全局库中本局没有的钱币
  const outerCoins = allCoins.filter(c => !roundCoinNames.has(c.name));
  // 随机打乱并取前3枚
  const shuffled = [...outerCoins].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/**
 * 互换弹窗：展示外库3枚钱币，选择本局1枚互换/不换
 * @param {Array} outerCoins 抽取的3枚外库钱币
 */
async function showSwapModal(outerCoins) {
  const alertContent = document.getElementById('alert-content');
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');

  // 清空弹窗并改为HTML模式
  alertContent.innerHTML = '';
  alertContent.style.lineHeight = '1.8';

  // 弹窗标题
  const title = document.createElement('h3');
  title.style.color = '#ffd700';
  title.style.margin = '0 0 15px 0';
  title.textContent = `【${layer}层专属】外库抽币互换`;
  alertContent.appendChild(title);

  // 外库钱币说明
  const tip1 = document.createElement('p');
  tip1.style.margin = '0 0 10px 0';
  tip1.innerHTML = '<b>外库抽取3枚钱币（可选1枚互换）：</b>';
  alertContent.appendChild(tip1);

  // 展示外库3枚钱币（带选择按钮）
  const outerCoinContainer = document.createElement('div');
  outerCoinContainer.style.display = 'flex';
  outerCoinContainer.style.gap = '10px';
  outerCoinContainer.style.margin = '0 0 20px 0';
  outerCoinContainer.style.flexWrap = 'wrap';
  outerCoins.forEach((coin, idx) => {
    const coinCard = document.createElement('div');
    coinCard.style.padding = '8px';
    coinCard.style.border = '1px solid #eee';
    coinCard.style.borderRadius = '6px';
    coinCard.style.textAlign = 'center';
    coinCard.style.minWidth = '120px';

    // 钱币名称
    const coinName = document.createElement('p');
    coinName.style.margin = '5px 0';
    coinName.style.fontSize = '14px';
    coinName.textContent = coin.name;

    // 选择外库钱币按钮
    const selectBtn = document.createElement('button');
    selectBtn.style.padding = '4px 8px';
    selectBtn.style.fontSize = '12px';
    selectBtn.textContent = `选择这枚`;
    selectBtn.onclick = () => selectOuterCoin(coin);

    coinCard.appendChild(coinName);
    coinCard.appendChild(selectBtn);
    outerCoinContainer.appendChild(coinCard);
  });
  alertContent.appendChild(outerCoinContainer);

  // 本局钱币说明
  const tip2 = document.createElement('p');
  tip2.style.margin = '0 0 10px 0';
  tip2.innerHTML = '<b>本局钱币（选择1枚互换，点击后完成互换）：</b>';
  alertContent.appendChild(tip2);

  // 存储选中的外库钱币
  window.selectedOuterCoin = null;

  // 展示本局钱币（带互换按钮）
  const roundCoinContainer = document.createElement('div');
  roundCoinContainer.style.display = 'flex';
  roundCoinContainer.style.gap = '10px';
  roundCoinContainer.style.margin = '0 0 20px 0';
  roundCoinContainer.style.flexWrap = 'wrap';
  roundCoins.forEach((coin, idx) => {
    const coinCard = document.createElement('div');
    coinCard.style.padding = '8px';
    coinCard.style.border = '1px solid #eee';
    coinCard.style.borderRadius = '6px';
    coinCard.style.textAlign = 'center';
    coinCard.style.minWidth = '120px';

    // 钱币名称
    const coinName = document.createElement('p');
    coinName.style.margin = '5px 0';
    coinName.style.fontSize = '14px';
    coinName.textContent = coin.name;

    // 互换按钮（默认禁用，选中外库钱币后启用）
    const swapBtn = document.createElement('button');
    swapBtn.style.padding = '4px 8px';
    swapBtn.style.fontSize = '12px';
    swapBtn.textContent = '点击互换';
    swapBtn.disabled = true;
    swapBtn.id = `swap-btn-${idx}`;
    swapBtn.onclick = () => doCoinSwap(coin, idx);

    coinCard.appendChild(coinName);
    coinCard.appendChild(swapBtn);
    roundCoinContainer.appendChild(coinCard);
  });
  alertContent.appendChild(roundCoinContainer);

  // 不换按钮
  const noSwapBtn = document.createElement('button');
  noSwapBtn.style.padding = '8px 20px';
  noSwapBtn.style.marginTop = '10px';
  noSwapBtn.textContent = '不更换，继续游戏';
  noSwapBtn.onclick = () => {
    closeAlert();
    // 不换则直接继续，无需更新渲染
  };
  alertContent.appendChild(noSwapBtn);

  // 显示弹窗
  alertBox.style.display = 'block';
  overlay.style.display = 'block';
}

/**
 * 选择外库钱币，启用本局钱币的互换按钮
 * @param {Object} outerCoin 选中的外库钱币
 */
function selectOuterCoin(outerCoin) {
  window.selectedOuterCoin = outerCoin;
  // 启用所有本局钱币的互换按钮
  document.querySelectorAll('[id^="swap-btn-"]').forEach(btn => {
    btn.disabled = false;
    btn.style.background = '#28a745';
    btn.style.color = '#fff';
  });
  // 弹窗提示
  const tip = document.createElement('p');
  tip.style.color = '#28a745';
  tip.style.margin = '5px 0 0 0';
  tip.textContent = `已选中【${outerCoin.name}】，请选择本局1枚钱币完成互换！`;
  document.getElementById('alert-content').appendChild(tip);
}

/**
 * 执行钱币互换：外库钱币 ↔ 本局钱币
 * @param {Object} roundCoin 本局选中的钱币
 * @param {number} index 本局钱币的索引
 */
function doCoinSwap(roundCoin, index) {
  const selectedOuter = window.selectedOuterCoin;
  if (!selectedOuter) return;

  // 替换本局指定索引的钱币，保留计数相关属性
  roundCoins[index] = {
    ...selectedOuter,
    count: roundCoin.count || 0,
    nextTransformPending: roundCoin.nextTransformPending || false
  };

  // 关闭弹窗并提示
  closeAlert();
  openAlert(`互换成功！\n外库【${selectedOuter.name}】↔ 本局【${roundCoin.name}】`);
  // 3秒后关闭提示弹窗，重新渲染钱币
  setTimeout(() => {
    closeAlert();
    renderCoinBox();
  }, 3000);

  // 清空选中的外库钱币
  window.selectedOuterCoin = null;
}

// ===================== 钱币数据获取 =====================
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

// ===================== 开始新局 =====================
async function startNewRound() {
  const coins = await fetchCoins();
  
  if (coins.length === 0) {
    alert('无法开始新局：未加载到钱币数据！');
    return;
  }

  let attempt = 0;
  while (attempt < 1000) {
    attempt++;
    let tempPool = coins.filter(c => c.name !== '衡-平安喜乐' && c.name !== '厉-误入奇境');
    let selected = [];

    while (selected.length < 10 && tempPool.length) {
      const idx = Math.floor(Math.random() * tempPool.length);
      const coin = JSON.parse(JSON.stringify(tempPool.splice(idx, 1)[0]));
      coin.count = 0;
      coin.nextTransformPending = false;
      selected.push(coin);
    }

    const numLi = selected.filter(c => c.name.startsWith('厉-')).length;
    const conflictCount = selected.filter(c => ['厉-守财奴', '厉-兵行险着'].includes(c.name)).length;
    
    if (numLi >= 6 && conflictCount <= 1) {
      roundCoins = selected;
      break;
    }
  }

  layer = 0;
  tableBg.style.backgroundImage = "url('https://img.cdn1.vip/i/697766f199bc5_1769432817.png')";
  renderCoinBox();
  resultBox.innerHTML = `<b>新一局开始！</b> 共抽取 ${roundCoins.length} 枚钱币。`;
}

// ===================== 渲染钱币 =====================
function renderCoinBox() {
  coinBox.innerHTML = "";
  roundCoins.forEach(coin => {
    const coinDiv = document.createElement('div');
    coinDiv.className = 'coin';
    const coinImageUrl = COIN_IMAGE_MAP[coin.name] || '';
    coinDiv.style.backgroundImage = coinImageUrl ? `url('${coinImageUrl}')` : 'none';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'coin-name';
    nameDiv.textContent = coin.name;

    coinDiv.appendChild(nameDiv);
    coinBox.appendChild(coinDiv);
  });
}

// ===================== 钱币转换 =====================
function applyNextTransform() {
  roundCoins.forEach((coin, index) => {
    if (coin.nextTransformPending) {
      const newCoin = allCoins.find(c => c.name === coin.nextTransform);
      if (newCoin) {
        Object.assign(roundCoins[index], JSON.parse(JSON.stringify(newCoin)), {
          count: coin.count,
          nextTransformPending: false
        });
      }
    }
  });
  renderCoinBox();
}

// ===================== 下一层抽取（整合互换功能） =====================
function drawThree() {
  if (roundCoins.length === 0) {
    alert("请先点击「开始新局」按钮！");
    return;
  }

  // 先执行钱币转换
  applyNextTransform();
  layer++;

  // 随机抽取3枚本局钱币
  const indices = [];
  while (indices.length < 3 && indices.length < roundCoins.length) {
    const idx = Math.floor(Math.random() * roundCoins.length);
    if (!indices.includes(idx)) indices.push(idx);
  }

  // 更新抽取钱币的计数和转换标记
  const drawnCoins = indices.map(i => roundCoins[i]);
  drawnCoins.forEach(coin => {
    coin.count = (coin.count || 0) + 1;
    if (coin.nextTransform) coin.nextTransformPending = true;
  });

  // 高亮抽取的钱币
  Array.from(coinBox.children).forEach((div, index) => {
    div.classList.remove('active');
    if (drawnCoins.includes(roundCoins[index])) {
      div.classList.add('active');
    }
  });

  // 渲染抽取结果
  resultBox.innerHTML = `<h3>第 ${layer} 层抽取结果：</h3>`;
  drawnCoins.forEach(coin => {
    const effectDiv = document.createElement('div');
    effectDiv.className = 'effect';
    let effectText = coin.effect;
    if (effectText.includes('已投出0次')) {
      effectText = effectText.replace(/已投出0次/, `已投出${coin.count}次`);
    }
    effectDiv.innerHTML = `<b>${coin.name}</b>：${effectText}`;
    resultBox.appendChild(effectDiv);
  });

  // 新增：检查是否到达3/5层，触发抽币互换
  if (checkSwapLayer()) {
    const outerCoins = getRandomOuterCoins();
    // 若外库无钱币（极端情况），提示并跳过
    if (outerCoins.length === 0) {
      openAlert(`已到${layer}层，但无外库钱币可抽取，继续游戏！`);
      setTimeout(closeAlert, 2000);
      return;
    }
    showSwapModal(outerCoins);
  }
}

// ===================== 查看所有钱币效果 =====================
async function showAllCoins() {
  const coins = await fetchCoins();

  if (!coins || coins.length === 0) {
    alert('暂无钱币数据！');
    return;
  }

  const roundCoinNames = roundCoins.map(c => c.name);
  const roundCoinsDetail = coins.filter(c => roundCoinNames.includes(c.name));
  const otherCoins = coins.filter(c => !roundCoinNames.includes(c.name));

  let effectText = '';
  if (roundCoinsDetail.length > 0) {
    effectText += '【本局抽到的钱币】\n\n';
    roundCoinsDetail.forEach(coin => {
      effectText += `【${coin.name}】：★${coin.effect || '无效果说明'}\n\n`;
    });
    effectText += '————————————————\n\n';
  }
  effectText += '【其他钱币】\n\n';
  otherCoins.forEach(coin => {
    effectText += `${coin.name}：${coin.effect || '无效果说明'}\n\n`;
  });

  openAlert(effectText);
}

// ===================== 按钮绑定+页面启动 =====================
document.getElementById('new-round').onclick = startNewRound;
document.getElementById('next-layer').onclick = drawThree;
document.getElementById('show-all').onclick = showAllCoins;

window.onload = async function() {
  await preloadAssets();
  initCustomAlert();
  tableBg.style.backgroundImage = "url('https://img.cdn1.vip/i/697766f1ab102_1769432817.png')";
};

