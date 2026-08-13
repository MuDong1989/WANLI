/* ============================================================
   万历 · 场景包②：新能源客车骗补（2013–2017）
   ------------------------------------------------------------
   本文件是"换产业不改引擎"的最小证明（工单 P0-6）。

   ★ 引擎零改动：本包只做两件事——① 覆写 CFG 字段；② 自带剧本函数 busPolicy(t)。
     没有新建加载器、没有改 Sim 构造器、没有加任何新机制、没有动 engine/ 一个字节。
     覆写法先例见 experiments/relocation-ab.js:5（`E.CFG.localMatchK=1.0`）。
     验证：跑完本文件后另起进程跑 `node engine/test2.js`，GR 仍须全绿。

   ★★ 数字全部为占位 ★★
     本包所有 CFG 数值（市场规模、车价、补贴强度、核查力度、罚金倍率）均为**拍的**，
     只为让三拍叙事跑得出来，**不承担任何定量结论**。它们没有进 assumption-registry，
     因为它们不是引擎参数、不影响光伏基线——是场景包的自带配置。
     正式标定路径 = **财政部 2016-09-08《新能源汽车推广应用补助资金专项检查通报》**
       （五家典型公开点名：苏州吉姆西、金龙联合汽车工业(苏州)、深圳五洲龙、
         奇瑞万达贵州客车、河南少林客车；涉 3457 辆、逾 10 亿元；
         专项检查覆盖 90 家企业、2013–2015 年 40.1 万辆、抽查 13.3 万辆运营状态）
       —— 该通报的可得性与局限已在 `specs/prov-index.md §3.1` 逐条核过（本包与 P0-8 互证）：
       它**只公开点名 5 家**，没有全量名单、没有省域分布，所以只能定"骗补是什么样子"，
       定不了"每个省有多少"。本包据此只做叙事对齐，不做数量标定。

   ── 三个暗礁（开工前实测过，写下来给下一个人）──
   1. `E.FIRMS = [...]` 整体重赋值会**静默失效**：Sim 闭包引用的是模块内部变量，
      重赋值只换掉了导出对象的指针。实测：重赋值后 `new Sim().firms` 仍是原来 8 家。
      必须用 `Object.assign(E.FIRMS[i], {...})` **原地改**。REGIONS 同理。
   2. `PROVS` / `CABW` **未导出**（导出面只有 Sim/scriptPolicy/CFG/FIRMS/REGIONS/ARCH/MODE_CN/mulberry32），
      省内阁层换不了。也不必换：通报五家里吉姆西、金龙都在**江苏**，
      而江苏正是引擎现有的四名角省之一——**制度层是场景无关层，原样保留即命中史实**。
   3. 骗补只在 `mode:'capacity'` 下发生（engine2.js:345 的门：
      `var fake = policy.mode==='capacity' ? ... : 0`）。所以 busPolicy 全程必须 capacity，
      治理只能靠拉 audit 与 fineMult——**这恰是本场景与光伏包的机制差异**，见下。

   ── 为什么这个场景值得单独跑（不只是换皮）──
   光伏包的治理拐点是**换工具**：装机补贴(capacity) → 度电补贴(generation)，
   工具本身内生了可核性，骗补通道被结构性关掉（GR3）。
   客车包全程是购置补贴(capacity)——**工具没换，只加大执法**。
   同一个引擎，两条不同的治理路径，正好构成对照：
     "把钱给对时点" vs "把人查得更狠"——哪个更管用，推演里见。

   ── 施工中撞出来的两条结构性发现（不是本包的 bug，是引擎的性质）──
   ① **补贴退坡对需求的作用被外生基线增长压过**。
      政策进需求只有一条通道 `demandBoostCap = 0.15×intensity/100`：
      intensity 从 72 砍到 30，需求只降约 6%，而外生基线还在按 demandGrowth 复利上涨。
      所以"退坡→行业急冻"在本引擎里**打不出来**，除非把外生基线本身调平
      （本包正是这么做的：growthDecay 0.78 让基线在 t8 前走平）。
      这与 A11「需求模型=外生基线」的披露一致，但**光伏包的 531 退坡同样靠 shockFactor 外生给**——
      两个包一起看，这条限制才显形。建议登记为 A11 的补充观测。
   ② **提高核查会让骗补者"蛰伏"而不是"被抓"**。
      fraud 原型在 effA≥55 时直接停手（engine2.js:143），而查处需要 effA 高到能抓、
      又低到骗补仍在发生——两个条件互斥。一步把 audit 从 26 拉到 78，
      结果是骗补熄火但**一起查处都没有**，事件流里只剩沉默。
      本包因此把 2016 拆成两拍：t6 audit=54（查得到、还没吓住 → 中央直查追缴）、
      t7 audit=78（全面威慑 → 骗补归零）。
      **这不是为了好看凑出来的，是威慑与查处在机制上本就需要不同剂量**——
      现实里也正是先查处、后通报、再威慑的顺序。

   ── 已知边界（必须明说，否则演示会穿帮）──
   引擎里的**叙事文案是硬编码的光伏措辞**（ARCH 独白"上屋顶数板子"、
   事件 msg"虚报 X GW 装机"、"'电站'从未并网"）。ARCH 虽然导出，但替换决策函数
   属于改行为逻辑、不属于参数覆写，本包**不碰**。
   本文件只在**打印层**做术语映射（GW→万辆、装机→上牌、电站→车辆），
   引擎内部字符串一个未动。
   **结论：换包能换掉参数、剧本、主体名册；换不掉硬编码文案。**
   这是"30 秒换包"的真实边界，不是引擎能力，路演时不要说过头。

   另：事件流里"江苏省加严执行（折扣0.05→0.05）"会连刷数期——折扣已到带基准×0.5 地板
   被 clamp 住、文案仍报"加严"。同 T-F2 记录的既有引擎观感缺陷（rulings.md R7 裁定
   非演示阻断级，维持引擎冻结），本包原样透出、不在打印层掩盖。

   用法：node scenarios/bus.js
   ============================================================ */

var E = require(__dirname + '/../engine/engine2.js');

/* ---------- ① CFG 覆写（全部占位，见头注）---------- */
/* 口径：D/S=万辆·半年⁻¹，P/Cf=万元·辆⁻¹，财政与流失=亿元 */
E.CFG.rounds        = 10;      // 2013上 – 2017下，半年一拍
E.CFG.scale         = 1;       // ★量纲闩：1 万元/辆 × 1 万辆 = 1 亿元，故 scale=1（光伏包是 元/W×GW，scale=10）
E.CFG.D0            = 0.55;    // 2013上 新能源客车需求（万辆/半年）
E.CFG.demandGrowth  = 0.62;    // 补贴驱动的爆发式放量
E.CFG.growthDecay   = 0.78;    // 放量逐年衰减（调至 t8 前基本走平——理由见头注"外生需求的边界"）
E.CFG.shockRound    = 99;      // ★关掉外生冲击：客车包不借外部事件，2016下的急冻必须由"严查"内生打出来
E.CFG.C0            = 108;     // 12米纯电动客车初始成本前沿（万元/辆）
E.CFG.capexK        = 0.28;    // 单位产能扩张成本 → capex≈30 亿元/(万辆·半年⁻¹)
E.CFG.frontierDrift = 0.030;   // 电池降本比光伏组件慢一点
E.CFG.frontierRnD   = 0.085;
E.CFG.capSubShare   = 0.55;    // 购置补贴的有效覆盖比例
E.CFG.fakeCostShare = 0.10;    // 造一辆"闲置车"的成本占比低于假电站——本场景骗补更烈的机制原因
E.CFG.fineMult      = 1.5;     // 基线罚金倍率（剧本在严查段用 policy.x 提高）
E.CFG.mediaProb     = 0.42;    // 客车骗补的媒体关注度高于光伏
E.CFG.opexBase      = 0.35;    // 亿元/期（整车厂固定开支，量纲随 scale 一起重定）
E.CFG.opexPerGW     = 3.0;
E.CFG.exOpexBase    = 0.02;
E.CFG.exOpexPerGW   = 3.0;
E.CFG.rdCost        = 0.8;
E.CFG.divThresh     = 30;      // 分红门槛随现金量纲下调
E.CFG.exN0          = 90;      // 客车厂商数量级远小于光伏长尾（实测初始长尾产能 0.096 万辆/半年）
E.CFG.exKmin        = 0.00035;
E.CFG.exKcap        = 0.010;
E.CFG.entryCap      = 4;       // 整车资质是硬门槛，进入没有光伏那么自由
E.CFG.turnoverRound = 4;

/* 自带年表：引擎 yearLabel 固定 2009 起（engine2.js:197），是光伏包的时间原点。
   本包 2013 起，故在显示层自备——不动引擎。 */
function busYear(t){ return (2013 + Math.floor(t/2)) + '年' + (t%2 ? '下' : '上') + '半年'; }

/* ---------- ② 八席换皮（Object.assign 原地改，暗礁 1）---------- */
/* 命名纪律：公司名一律虚构；只有财政部通报**已公开点名**的两家才标原型，
   其余原型位留空——不给未被官方点名的企业扣帽子。 */
var CAST = [
  {id:'longsheng', name:'远科客车', emoji:'🔋', K:0.090, cash:18,
   desc:'技术长期主义者。押电池能量密度与整车能耗，不追销量排名。'},
  {id:'tianyang',  name:'金鹏客车', emoji:'🚌', K:0.120, cash:16,
   desc:'激进扩张者。补贴目录一出就压产能，敢加杠杆抢份额。'
        + '（原型：金龙联合汽车工业(苏州)——财政部 2016-09-08 通报公开点名，'
        + '追回 2015 年度违规上牌车辆的中央补助预拨资金并按问题金额 50% 罚款）'},
  {id:'hanguang',  name:'华驰新能', emoji:'🎤', K:0.060, cash:15,
   desc:'资本故事家。产能规划即市值管理，PPT 里的订单比车间里的多。'},
  {id:'kuajie',    name:'跨界智行', emoji:'🪂', K:0.000, cash:9,
   desc:'跨界追风口者。看别人拿补贴眼红，行情一冷跑最快。'},
  {id:'xiaosheng', name:'骏程客车', emoji:'🎭', home:0, prov:'JS', K:0.020, cash:4,
   desc:'骗补投机者。研究补贴细则比研究整车上心，车造出来就停在场里等上牌。'
        + '（原型：苏州吉姆西——同一通报点名，恶意骗补情节最严重：'
        + '取消中央财政补贴资格、2015 年全部车辆不予补助、追回全部预拨资金、'
        + '工信部取消整车生产资质。注册地江苏，故本包把它放回 JS 省）'},
  {id:'daigong',   name:'稳通客车', emoji:'📦', K:0.055, cash:12,
   desc:'观望代工厂。现金为王，永远慢半拍，也因此摔得轻。'},
  {id:'weisai',    name:'赣新客车', emoji:'🧲', K:0.020, cash:2.5,
   desc:'政企绑定的地方明星。市里的名片工程，大到不能倒——至少市里这么认为。'},
  {id:'guojing',   name:'国运客车', emoji:'🏛️', K:0.085, cash:14,
   desc:'国资型。公交集团的关联供应商，订单稳、动作慢。'}
];
CAST.forEach(function(c){
  var f = E.FIRMS.filter(function(x){ return x.id === c.id; })[0];
  if (!f) throw new Error('名册对不上：引擎里没有 id=' + c.id + '（引擎侧名册变过？）');
  Object.assign(f, c);                    // ← 原地改，不可写成 E.FIRMS = [...]
});

/* ---------- ③ 剧本函数（照 engine2.js:556-559 scriptPolicy 的三段式写法，扩为四段）---------- */
/* 四段而非三段：光伏是"补贴期→换工具期→退坡期"三段；
   客车全程同一工具，多出一段"专项检查"，故为 补贴→上量→严查→退坡。 */
function busPolicy(t){
  if (t < 3)  return {mode:'capacity', intensity:72, audit:15};                        // 2013–2014上 目录补贴，核查形同虚设
  if (t < 6)  return {mode:'capacity', intensity:72, audit:26};                        // 2014下–2015 爆发放量，核查略紧
  if (t < 7)  return {mode:'capacity', intensity:58, audit:54, x:{fineMult:3.0}};       // 2016上 专项检查启动：查得到，但还没吓住
  if (t < 8)  return {mode:'capacity', intensity:58, audit:78, x:{fineMult:3.0, mediaProb:0.62}};  // 2016下 通报公开点名：全面威慑
  return        {mode:'capacity', intensity:30, audit:66, x:{fineMult:2.2}};           // 2017 补贴退坡 + 常态监管
}
var ACT = ['补贴期','放量期','查处期','威慑期','退坡期'];
function actOf(t){ return t < 3 ? ACT[0] : t < 6 ? ACT[1] : t < 7 ? ACT[2] : t < 8 ? ACT[3] : ACT[4]; }

/* ---------- ④ 打印层术语映射（不动引擎字符串，见头注"已知边界"）---------- */
function busify(s){
  return String(s)
    /* 整句级：光伏的两句成语式文案在客车语境下逐字替换会失义，整句换掉 */
    .replace(/"晒不到太阳的电站"/g, '"停在场里从不跑的车"')
    .replace(/的"电站"从未并网/g, '的"新能源客车"从未交付运营')
    /* 词级 */
    .replace(/GW装机/g, '万辆上牌').replace(/GW产能/g, '万辆产能').replace(/GW/g, '万辆')
    .replace(/虚报上牌/g, '虚报上牌').replace(/装机/g, '上牌')
    .replace(/电站/g, '车辆').replace(/并网/g, '交付运营').replace(/发电/g, '运营');
}

/* ---------- ⑤ 跑 ---------- */
var 查处 = [];   /* 收集查处/追缴事件，供三拍核对第 4 条 */
function run(label, verbose){
  var sim = new E.Sim(E.CFG.seed), lines = [];
  for (var t = 0; t < E.CFG.rounds; t++){
    var res = sim.step(busPolicy(t));
    var h   = sim.history[sim.history.length - 1];
    var nf  = h.fraudRegion[0] + h.fraudRegion[1] + h.fraudRegion[2];
    lines.push({t:t, P:h.P, D:h.D, S:h.S, nf:nf, waste:h.waste, alive:h.alive,
                ex:h.exAlive, fiscal:h.fiscalTotal, op:h.opinion});
    if (verbose){
      console.log('t' + String(t).padStart(2) + ' ' + busYear(t) +
        ' [' + actOf(t) + ']' +
        '  车价 ' + h.P.toFixed(1) + ' 万元/辆（成本前沿 ' + h.Cf.toFixed(1) + '）' +
        '  需求 ' + h.D.toFixed(2) + ' / 产能 ' + h.S.toFixed(2) + ' 万辆' +
        '  骗补 ' + nf + ' 起' +
        '  累计流失 ' + h.waste.toFixed(1) + ' 亿' +
        '  在营 ' + h.alive + '席/' + h.exAlive + '家' +
        '  舆情 ' + h.opinion.toFixed(0));
      res.ev.forEach(function(e){
        var m = busify(e.msg);
        if (/追缴|查实|处罚/.test(m)) 查处.push('t' + t + ' ' + m.slice(0, 30));
        console.log('     » [' + e.type + '] ' + m);
      });
    }
  }
  return {sim:sim, lines:lines};
}

console.log('══════════════════════════════════════════════════════════════');
console.log(' 万历 · 场景包② 新能源客车骗补 2013–2017');
console.log(' 引擎零改动：仅 CFG 覆写 + 剧本函数 busPolicy(t)，engine/ 未动一字节');
console.log(' 数字全部占位；正式标定路径=财政部 2016-09-08 骗补专项检查通报');
console.log(' （通报只公开点名 5 家、无全量名单与省域分布，局限见 specs/prov-index.md §3.1）');
console.log(' 剧本：补贴期(t0-2) → 放量期(t3-5) → 查处期(t6) → 威慑期(t7) → 退坡期(t8-9)');
console.log('══════════════════════════════════════════════════════════════\n');

var A = run('主跑', true);

/* ---------- ⑥ 三拍叙事核对 ---------- */
function sumFraud(lo, hi){ var n = 0; for (var i = lo; i <= hi; i++) n += A.lines[i].nf; return n; }
var f补贴 = sumFraud(0, 2), f放量 = sumFraud(3, 5), f严查 = sumFraud(6, 7), f退坡 = sumFraud(8, 9);
var w严查前 = A.lines[5].waste, w终局 = A.lines[9].waste;

console.log('\n──────── 三拍叙事核对 ────────');
console.log(' 骗补起数：补贴期 ' + f补贴 + ' | 放量期 ' + f放量 + ' | 查处+威慑期 ' + f严查 + ' | 退坡期 ' + f退坡);
console.log(' 累计流失：严查前(t5) ' + w严查前.toFixed(1) + ' 亿 → 终局(t9) ' + w终局.toFixed(1) + ' 亿');
console.log(' 拍1 补贴期骗补已发生            : ' + (f补贴 > 0 ? '✓' : '✗'));
console.log(' 拍2 放量期骗补规模不低于补贴期  : ' + (f放量 >= f补贴 ? '✓' : '✗'));
console.log(' 拍3 查处后骗补被压下去          : ' + (f严查 < f放量 ? '✓' : '✗（本场景未复现）'));
console.log(' 拍4 出现查处/追缴事件           : ' + (查处.length ? '✓ ' + 查处.join('；') : '✗（只有威慑没有查处，需下调查处期 audit 开出捕获窗）'));
console.log(' 全程同一工具(capacity)，治理只靠执法：' +
  [0,3,6,8].map(function(t){ return 't'+t+'='+busPolicy(t).mode; }).join(' '));

/* ---------- ⑦ 确定性自检（同种子双跑逐位一致）---------- */
var B = run('复跑', false);
var same = JSON.stringify(A.lines) === JSON.stringify(B.lines);
console.log('\n──────── 确定性自检 ────────');
console.log(' 同种子双跑逐位一致：' + (same ? '✓' : '✗ 确定性被破坏——立即排查'));
if (!same) process.exitCode = 1;

console.log('\n本包到此为止。GR 门禁请另起进程跑：node engine/test2.js');
console.log('（本文件覆写了模块级 CFG，同进程再 require test2 会读到被污染的配置。）');
