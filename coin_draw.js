let roundCoins = [];
let layer = 0;
let allCoins = [];
const coinBox = document.getElementById('coin-box');
const resultBox = document.getElementById('draw-result');
const tableBg = document.getElementById('table-bg');

// 绑定按钮事件
document.getElementById('new-round').onclick = startNewRound;
document.getElementById('next-layer').onclick = drawThree;
document.getElementById('show-all').onclick = showAllCoins;

// 初始化：创建自定义弹窗+遮罩（支持点击外关闭+固定关闭按钮）
function initCustomAlert() {
  // 1. 创建遮罩层（点击遮罩关闭弹窗）
  const overlay = document.createElement('div');
  overlay.id = 'alert-overlay';
  overlay.onclick = closeAlert; // 点击遮罩关闭
  document.body.appendChild(overlay);

  // 2. 创建弹窗容器
  const alertDiv = document.createElement('div');
  alertDiv.id = 'custom-alert';

  // 3. 弹窗头部（固定在顶部）
  const alertHeader = document.createElement('div');
  alertHeader.className = 'alert-header';

  // 4. 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.textContent = '关闭';
  closeBtn.onclick = closeAlert; // 点击按钮关闭

  // 5. 弹窗内容区（独立滚动）
  const alertContent = document.createElement('div');
  alertContent.id = 'alert-content';

  // 组装弹窗
  alertHeader.appendChild(closeBtn);
  alertDiv.appendChild(alertHeader);
  alertDiv.appendChild(alertContent);
  document.body.appendChild(alertDiv);
}

// 关闭弹窗的统一函数
function closeAlert() {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  alertBox.style.display = 'none';
  overlay.style.display = 'none';
}

// 打开弹窗的统一函数（删除自动选中文本逻辑）
function openAlert(content) {
  const alertBox = document.getElementById('custom-alert');
  const overlay = document.getElementById('alert-overlay');
  const alertContent = document.getElementById('alert-content');
  
  alertContent.textContent = content;
  alertBox.style.display = 'block';
  overlay.style.display = 'block';

  // 👇 核心删除：以下自动选中文本的代码全部移除
  // alertContent.focus();
  // const range = document.createRange();
  // range.selectNodeContents(alertContent);
  // const selection = window.getSelection();
  // selection.removeAllRanges();
  // selection.addRange(range);
}

// 页面加载完成后初始化
window.onload = initCustomAlert;

// 加载钱币数据（移除缓存，强制加载最新数据，增加错误处理）
async function fetchCoins() {
  try {
    const res = await fetch('coins.json');
    // 检查请求是否成功
    if (!res.ok) {
      throw new Error(`请求失败，状态码：${res.status}`);
    }
    allCoins = await res.json();
    console.log('✅ 成功加载钱币数据，总数：', allCoins.length);
    return allCoins;
  } catch (error) {
    console.error('❌ 加载coins.json失败：', error.message);
    allCoins = [];
    return allCoins;
  }
}

// 开始新局逻辑
async function startNewRound() {
  const coins = await fetchCoins();
  
  // 无数据时提示
  if (coins.length === 0) {
    alert('无法开始新局：未加载到钱币数据，请检查coins.json文件是否存在且格式正确！');
    return;
  }

  let attempt = 0;
  // 最多尝试1000次，确保选到符合条件的钱币组合
  while (attempt < 1000) {
    attempt++;
    // 过滤掉指定钱币
    let tempPool = coins.filter(c => c.name !== '衡-平安喜乐' && c.name !== '厉-误入奇境');
    let selected = [];

    // 随机选10枚钱币
    while (selected.length < 10 && tempPool.length) {
      const idx = Math.floor(Math.random() * tempPool.length);
      const coin = JSON.parse(JSON.stringify(tempPool.splice(idx, 1)[0]));
      coin.count = 0;
      coin.nextTransformPending = false;
      selected.push(coin);
    }

    // 校验条件：厉开头的钱币≥6个，冲突钱币≤1个
    const numLi = selected.filter(c => c.name.startsWith('厉-')).length;
    const conflictCount = selected.filter(c => ['厉-守财奴', '厉-兵行险着'].includes(c.name)).length;
    
    if (numLi >= 6 && conflictCount <= 1) {
      roundCoins = selected;
      break;
    }
  }

  // 重置层数，更新背景，渲染钱币，提示新局开始
  layer = 0;
  tableBg.style.backgroundImage = "url('10013.png')";
  renderCoinBox();
  resultBox.innerHTML = `<b>新一局开始！</b> 共抽取 ${roundCoins.length} 枚钱币。`;
}

// 渲染钱币容器
function renderCoinBox() {
  coinBox.innerHTML = "";
  roundCoins.forEach(coin => {
    const coinDiv = document.createElement('div');
    coinDiv.className = 'coin';
    coinDiv.style.backgroundImage = `url('icons/${coin.name}.png')`;

    // 钱币名称标签
    const nameDiv = document.createElement('div');
    nameDiv.className = 'coin-name';
    nameDiv.textContent = coin.name;

    coinDiv.appendChild(nameDiv);
    coinBox.appendChild(coinDiv);
  });
}

// 应用钱币转换逻辑
function applyNextTransform() {
  roundCoins.forEach((coin, index) => {
    if (coin.nextTransformPending) {
      const newCoin = allCoins.find(c => c.name === coin.nextTransform);
      if (newCoin) {
        // 替换钱币数据，保留计数和状态
        Object.assign(roundCoins[index], JSON.parse(JSON.stringify(newCoin)), {
          count: coin.count,
          nextTransformPending: false
        });
      }
    }
  });
  renderCoinBox();
}

// 下一层（抽取3枚钱币）
function drawThree() {
  // 未开始新局时提示
  if (roundCoins.length === 0) {
    alert("请先点击「开始新局」按钮！");
    return;
  }

  // 先应用钱币转换
  applyNextTransform();
  layer++;

  // 随机选3个不同的索引
  const indices = [];
  while (indices.length < 3 && indices.length < roundCoins.length) {
    const idx = Math.floor(Math.random() * roundCoins.length);
    if (!indices.includes(idx)) indices.push(idx);
  }

  // 获取选中的钱币，更新计数和转换状态
  const drawnCoins = indices.map(i => roundCoins[i]);
  drawnCoins.forEach(coin => {
    coin.count = (coin.count || 0) + 1;
    if (coin.nextTransform) coin.nextTransformPending = true;
  });

  // 高亮选中的钱币
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
    // 替换投出次数文本
    if (effectText.includes('已投出0次')) {
      effectText = effectText.replace(/已投出0次/, `已投出${coin.count}次`);
    }
    effectDiv.innerHTML = `<b>${coin.name}</b>：${effectText}`;
    resultBox.appendChild(effectDiv);
  });
}

// 查看所有钱币效果（本局钱币置顶+高亮，无标题，删除自动选中文本）
async function showAllCoins() {
  const coins = await fetchCoins();

  // 无数据提示
  if (!coins || coins.length === 0) {
    alert('暂无钱币数据，请检查coins.json文件是否存在且格式正确！');
    return;
  }

  // 1. 分离本局抽到的钱币和其他钱币
  const roundCoinNames = roundCoins.map(c => c.name); // 本局钱币名称列表
  const roundCoinsDetail = coins.filter(c => roundCoinNames.includes(c.name)); // 本局钱币完整数据
  const otherCoins = coins.filter(c => !roundCoinNames.includes(c.name)); // 其他钱币

  // 2. 拼接文本：本局钱币（高亮）置顶 + 其他钱币
  let effectText = '';

  // 拼接本局钱币（高亮：用【】包裹名称，加醒目提示）
  if (roundCoinsDetail.length > 0) {
    effectText += '【本局抽到的钱币】\n\n';
    roundCoinsDetail.forEach(coin => {
      // 高亮样式：名称用【】包裹，效果前加★，增强视觉区分
      effectText += `【${coin.name}】：★${coin.effect || '无效果说明'}\n\n`;
    });
    // 分隔线区分本局和其他
    effectText += '————————————————\n\n';
  }

  // 拼接其他钱币（普通格式）
  otherCoins.forEach(coin => {
    effectText += `${coin.name}：${coin.effect || '无效果说明'}\n\n`;
  });

  // 3. 打开弹窗展示内容（不再自动选中文本）
  openAlert(effectText);
}