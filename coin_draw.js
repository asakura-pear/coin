let roundCoins = [];
let layer = 0;
let allCoins = [];
const coinBox = document.getElementById('coin-box');
const resultBox = document.getElementById('draw-result');
const tableBg = document.getElementById('table-bg');

// ===================== 素材配置：背景图+钱币图标图床地址 =====================
// 钱币图标映射表：key=钱币名称，value=你提供的图床地址（精准对应）
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

// 预加载素材清单（背景图+所有钱币图标，自动提取）
const PRELOAD_ASSETS = {
  backgrounds: [
    'https://img.cdn1.vip/i/697766f1ab102_1769432817.png',  // 原10012.jpg
    'https://img.cdn1.vip/i/697766f199bc5_1769432817.png'   // 原10013.png
  ],
  coins: Object.values(COIN_IMAGE_MAP)  // 自动获取所有钱币图床地址，无需手动写
};

// ===================== 素材预加载函数（提前加载所有图床资源，解决加载慢） =====================
async function preloadAssets() {
  const loadingMask = document.getElementById('loading-mask');
  const progressBar = document.getElementById('loading-progress');
  const progressText = document.getElementById('loading-text');
  
  let loaded = 0;
  let total = 0;
  const allAssets = [];

  // 步骤1：加载coins.json获取钱币逻辑数据（图标用图床，此文件仅存业务数据）
  try {
    const res = await fetch('coins.json');
    if (!res.ok) throw new Error('coins.json加载失败');
    const coinsData = await res.json();
    allCoins = coinsData;
  } catch (error) {
    console.error('加载coins.json失败：', error);
    alert('钱币配置文件加载失败，部分功能可能异常！');
  }

  // 步骤2：汇总所有需要预加载的素材
  allAssets.push(...PRELOAD_ASSETS.backgrounds);
  allAssets.push(...PRELOAD_ASSETS.coins);
  total = allAssets.length;

  // 步骤3：逐个加载素材，更新进度
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
      loaded++; // 单个素材失败不卡住，继续加载其他
    }

    // 实时更新加载进度条和文字
    const progress = Math.floor((loaded / total) * 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}% 完成 (${loaded}/${total})`;
  }

  // 步骤4：预加载完成，平滑隐藏加载遮罩
  loadingMask.style.opacity = 0;
  setTimeout(() => {
    loadingMask.style.display = 'none';
  }, 300);
  console.log('✅ 所有图床素材预加载完成！');
}

// ===================== 弹窗初始化（无修改，保留原有功能） =====================
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

// 打开弹窗（无自动选中文本，保留原有优化）
function openAlert(content) {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const alertContent = document.getElementById('alert-content');
  
  alertContent.textContent = content;
  alertBox.style.display = 'block';
  overlay.style.display = 'block';
}

// ===================== 钱币数据获取（复用预加载数据，避免重复请求） =====================
async function fetchCoins() {
  if (allCoins.length > 0) return allCoins;
  
  // 兜底：预加载失败时重新请求
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

// ===================== 开始新局（保留原有抽奖逻辑，背景图用图床） =====================
async function startNewRound() {
  const coins = await fetchCoins();
  
  if (coins.length === 0) {
    alert('无法开始新局：未加载到钱币数据！');
    return;
  }

  let attempt = 0;
  while (attempt < 1000) {
    attempt++;
    // 过滤掉指定钱币
    let tempPool = coins.filter(c => c.name !== '衡-平安喜乐' && c.name !== '厉-误入奇境');
    let selected = [];

    // 随机抽取10枚钱币
    while (selected.length < 10 && tempPool.length) {
      const idx = Math.floor(Math.random() * tempPool.length);
      const coin = JSON.parse(JSON.stringify(tempPool.splice(idx, 1)[0]));
      coin.count = 0;
      coin.nextTransformPending = false;
      selected.push(coin);
    }

    // 校验抽取规则：厉系≥6枚，且不同时包含守财奴+兵行险着
    const numLi = selected.filter(c => c.name.startsWith('厉-')).length;
    const conflictCount = selected.filter(c => ['厉-守财奴', '厉-兵行险着'].includes(c.name)).length;
    
    if (numLi >= 6 && conflictCount <= 1) {
      roundCoins = selected;
      break;
    }
  }

  layer = 0;
  // 背景图使用图床地址（原10013.png）
  tableBg.style.backgroundImage = "url('https://img.cdn1.vip/i/697766f199bc5_1769432817.png')";
  renderCoinBox();
  resultBox.innerHTML = `<b>新一局开始！</b> 共抽取 ${roundCoins.length} 枚钱币。`;
}

// ===================== 渲染钱币（核心：从映射表取图床地址，贴合贴图高亮） =====================
function renderCoinBox() {
  coinBox.innerHTML = "";
  roundCoins.forEach(coin => {
    const coinDiv = document.createElement('div');
    coinDiv.className = 'coin';
    // 从COIN_IMAGE_MAP获取对应钱币的图床地址，无匹配时提示（防漏配）
    const coinImageUrl = COIN_IMAGE_MAP[coin.name] || '';
    coinDiv.style.backgroundImage = coinImageUrl ? `url('${coinImageUrl}')` : 'none';

    // 钱币名称（保留醒目样式：金黄色+加粗+阴影，无重叠）
    const nameDiv = document.createElement('div');
    nameDiv.className = 'coin-name';
    nameDiv.textContent = coin.name;

    coinDiv.appendChild(nameDiv);
    coinBox.appendChild(coinDiv);
  });
}

// ===================== 钱币转换（转换后重新渲染，自动使用新钱币图床地址） =====================
function applyNextTransform() {
  roundCoins.forEach((coin, index) => {
    if (coin.nextTransformPending) {
      const newCoin = allCoins.find(c => c.name === coin.nextTransform);
      if (newCoin) {
        // 保留原计数，替换为新钱币数据
        Object.assign(roundCoins[index], JSON.parse(JSON.stringify(newCoin)), {
          count: coin.count,
          nextTransformPending: false
        });
      }
    }
  });
  renderCoinBox(); // 重新渲染，自动加载新钱币的图床图标
}

// ===================== 下一层抽取（保留原有逻辑，高亮效果贴合图床图标） =====================
function drawThree() {
  if (roundCoins.length === 0) {
    alert("请先点击「开始新局」按钮！");
    return;
  }

  // 先执行钱币转换，再抽取
  applyNextTransform();
  layer++;

  // 随机抽取3枚不同的钱币
  const indices = [];
  while (indices.length < 3 && indices.length < roundCoins.length) {
    const idx = Math.floor(Math.random() * roundCoins.length);
    if (!indices.includes(idx)) indices.push(idx);
  }

  // 标记抽取的钱币，更新计数
  const drawnCoins = indices.map(i => roundCoins[i]);
  drawnCoins.forEach(coin => {
    coin.count = (coin.count || 0) + 1;
    if (coin.nextTransform) coin.nextTransformPending = true;
  });

  // 给抽取的钱币添加active类（触发贴合贴图的金色光晕高亮）
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
    // 替换计数文本
    if (effectText.includes('已投出0次')) {
      effectText = effectText.replace(/已投出0次/, `已投出${coin.count}次`);
    }
    effectDiv.innerHTML = `<b>${coin.name}</b>：${effectText}`;
    resultBox.appendChild(effectDiv);
  });
}

// ===================== 查看所有钱币效果（保留原有功能） =====================
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
  // 先显示本局抽到的钱币
  if (roundCoinsDetail.length > 0) {
    effectText += '【本局抽到的钱币】\n\n';
    roundCoinsDetail.forEach(coin => {
      effectText += `【${coin.name}】：★${coin.effect || '无效果说明'}\n\n`;
    });
    effectText += '————————————————\n\n';
  }
  // 再显示其他钱币
  effectText += '【其他钱币】\n\n';
  otherCoins.forEach(coin => {
    effectText += `${coin.name}：${coin.effect || '无效果说明'}\n\n`;
  });

  openAlert(effectText);
}

// ===================== 按钮绑定+页面启动（先预加载，再初始化所有功能） =====================
// 绑定按钮点击事件
document.getElementById('new-round').onclick = startNewRound;
document.getElementById('next-layer').onclick = drawThree;
document.getElementById('show-all').onclick = showAllCoins;

// 页面加载完成后，先预加载所有图床素材，再初始化弹窗
window.onload = async function() {
  await preloadAssets();
  initCustomAlert();
};

