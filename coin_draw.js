let roundCoins = [];
let layer = 0;
let allCoins = [];
const coinBox = document.getElementById('coin-box');
const resultBox = document.getElementById('draw-result');
const tableBg = document.getElementById('table-bg');

// ===================== 预加载配置（替换背景图为图床地址） =====================
const PRELOAD_ASSETS = {
  // 背景图：替换为图床地址
  backgrounds: [
    'https://img.cdn1.vip/i/697766f1ab102_1769432817.png',  // 原10012.jpg
    'https://img.cdn1.vip/i/697766f199bc5_1769432817.png'   // 原10013.png
  ],
  coins: []
};

// 预加载函数（无修改，仅加载新地址）
async function preloadAssets() {
  const loadingMask = document.getElementById('loading-mask');
  const progressBar = document.getElementById('loading-progress');
  const progressText = document.getElementById('loading-text');
  
  let loaded = 0;
  let total = 0;
  const allAssets = [];

  // 步骤1：先加载coins.json，获取所有钱币图标名称
  try {
    const res = await fetch('coins.json');
    if (!res.ok) throw new Error('coins.json加载失败');
    const coinsData = await res.json();
    PRELOAD_ASSETS.coins = coinsData.map(coin => `icons/${coin.name}.png`);
    allCoins = coinsData;
  } catch (error) {
    console.error('加载coins.json失败：', error);
    alert('钱币配置文件加载失败，部分功能可能异常！');
  }

  // 步骤2：汇总所有需要加载的素材
  allAssets.push(...PRELOAD_ASSETS.backgrounds);
  allAssets.push(...PRELOAD_ASSETS.coins);
  total = allAssets.length;

  // 步骤3：逐个加载素材
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

    // 更新加载进度
    const progress = Math.floor((loaded / total) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}% 完成 (${loaded}/${total})`;
  }

  // 步骤4：预加载完成，隐藏加载遮罩
  loadingMask.style.opacity = 0;
  setTimeout(() => {
    loadingMask.style.display = 'none';
  }, 300);
  console.log('✅ 所有素材预加载完成！');
}

// ===================== 原有功能逻辑（仅替换startNewRound中的背景图地址） =====================
// 绑定按钮事件
document.getElementById('new-round').onclick = startNewRound;
document.getElementById('next-layer').onclick = drawThree;
document.getElementById('show-all').onclick = showAllCoins;

// 初始化弹窗
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

// 关闭弹窗
function closeAlert() {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  alertBox.style.display = 'none';
  overlay.style.display = 'none';
}

// 打开弹窗
function openAlert(content) {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const alertContent = document.getElementById('alert-content');
  
  alertContent.textContent = content;
  alertBox.style.display = 'block';
  overlay.style.display = 'block';
}

// 加载钱币数据
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

// 开始新局（核心修改：替换背景图地址为图床地址）
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
  // 替换背景图地址为图床地址（原10013.png）
  tableBg.style.backgroundImage = "url('https://img.cdn1.vip/i/697766f199bc5_1769432817.png')";
  renderCoinBox();
  resultBox.innerHTML = `<b>新一局开始！</b> 共抽取 ${roundCoins.length} 枚钱币。`;
}

// 渲染钱币
function renderCoinBox() {
  coinBox.innerHTML = "";
  roundCoins.forEach(coin => {
    const coinDiv = document.createElement('div');
    coinDiv.className = 'coin';
    coinDiv.style.backgroundImage = `url('icons/${coin.name}.png')`;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'coin-name';
    nameDiv.textContent = coin.name;

    coinDiv.appendChild(nameDiv);
    coinBox.appendChild(coinDiv);
  });
}

// 应用钱币转换
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

// 下一层
function drawThree() {
  if (roundCoins.length === 0) {
    alert("请先点击「开始新局」按钮！");
    return;
  }

  applyNextTransform();
  layer++;

  const indices = [];
  while (indices.length < 3 && indices.length < roundCoins.length) {
    const idx = Math.floor(Math.random() * roundCoins.length);
    if (!indices.includes(idx)) indices.push(idx);
  }

  const drawnCoins = indices.map(i => roundCoins[i]);
  drawnCoins.forEach(coin => {
    coin.count = (coin.count || 0) + 1;
    if (coin.nextTransform) coin.nextTransformPending = true;
  });

  Array.from(coinBox.children).forEach((div, index) => {
    div.classList.remove('active');
    if (drawnCoins.includes(roundCoins[index])) {
      div.classList.add('active');
    }
  });

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
}

// 查看所有效果
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

  otherCoins.forEach(coin => {
    effectText += `${coin.name}：${coin.effect || '无效果说明'}\n\n`;
  });

  openAlert(effectText);
}

// 启动：先预加载，再初始化
window.onload = async function() {
  await preloadAssets();
  initCustomAlert();
};
