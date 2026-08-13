---
name: wanli-windtunnel
description: 驾驶「万历·政策风洞」政企博弈推演引擎——跑史实基线、构造反事实、同种子双宇宙对照、接管企业、换产业场景包、复现全部实验。当用户提到 推演/反事实/平行宇宙/风洞/悔棋/场景包/政策实验/剂量反应/双宇宙/WANLI/光伏推演 或要求修改引擎、复现某条实证主张时使用。
---

# 万历·政策风洞 驾驶手册

你在操作一台**确定性政企博弈推演仪器**（约 300 智能体：8 名角企业 × ~230 长尾 × 4 省内阁）。
它的可信度建立在纪律上——先装载纪律，再碰引擎。

## 0. 语境装载顺序（每次会话第一步）

1. 读 `CLAUDE.md` —— 五条硬约束（GR 门禁 / 确定性 / 加法式默认 / 重校准披露 / 假设入册），违反即打回。
2. 若要动引擎：先查 `grill-report.md` 附录 B 冻结令（双流拆分、effA 省级化、债务层等赛中禁动清单）。
3. 引用任何参数前查 `specs/assumption-registry.md`（A1–A26，四档：占位/方向校准/已锚/开关）。

## 1. 跑起来（可复制命令）

```bash
node engine/test2.js            # 史实基线 + 干预剧本 + GR 九项门禁（改引擎后第一件事）
node scenarios/bus.js           # 30 秒换产业：新能源客车骗补包（引擎零改动的证明）
```

六实验（对应 specs/evidence.md 各条）：
```bash
node experiments/shapley.js         # E5 政策组合 Shapley 归因（十种子）
node experiments/relocation-ab.js   # E6b 迁址期权 + 承诺-兑现台账
node experiments/bailout-ab.js      # E7 软预算约束：续命不改命
node experiments/flip-probe.js      # E8 翻转因子探针（小盛=实核55）
node experiments/project-ledger.js  # E10 项目=引擎的免费投影
node experiments/dose-response.js   # E11 核查剂量反应（树内顶格80）
```

## 2. 构造反事实（三种姿势）

**裸三元组**（政策 = {mode, intensity, audit}）：
```js
var E=require('./engine/engine2.js');
var s=new E.Sim(E.CFG.seed);
for(var t=0;t<20;t++){
  var pol = t<8 ? {mode:'generation',intensity:60,audit:70} : E.scriptPolicy(t); // 反事实段
  s.step(pol);
}
```

**政策树**（玩家真实操作面，21 节点、行动点 3/期、audit 顶格 Lv3=80）：
```js
var E=require('./engine/engine2.js'), P=require('./engine/policy-tree.js');
var s=new E.Sim(E.CFG.seed), a={};
for(var t=0;t<20;t++){
  P.applyOps(a, P.AUTOPILOT_OPS[t]);            // 史实自动驾驶
  if(t===4) P.applyOps(a,[['set','audit',3],['set','local_inspect',1]]); // 玩家干预
  s.step(P.compilePolicy(a));
}
```

**企业接管**（ctrl 钩子，与 AI 同约束、随机流对齐）：
```js
s.step(pol, {xiaosheng:{rd:false, dK:0.15, fake:0, move:0}});  // move=目标区域索引
```

**双宇宙对照铁则**：同种子两个 Sim 各自完整跑，仅差被检验的那个选择；结论前先验证
`JSON.stringify(a.history)===JSON.stringify(b.history)` 在"无差异"对照下成立。

## 3. 改引擎的仪式（缺一步不合入）

1. 改动默认值必须等于旧行为（新通道默认关、新字段只加不改）。
2. `node engine/test2.js` 全绿（GR1–9 + GR-C）。
3. 基线哈希中性验证——剥除声明过的新增字段后必须逐位复原：
```bash
node -e "var E=require('./engine/engine2.js'),c=require('crypto');var s=new E.Sim(E.CFG.seed);for(var t=0;t<20;t++)s.step(E.scriptPolicy(t));var strip=s.history.map(function(h){var o={};Object.keys(h).forEach(function(k){if(k!=='local')o[k]=h[k]});return o});console.log(c.createHash('sha256').update(JSON.stringify(strip)).digest('hex').slice(0,16))"
```
期望 `a52e1cc03acd102c`。变了 = 动基线 = 必须在 evidence.md 写重校准披露、registry 登记。
4. 不得增删既有 rng 调用次数（闸门用 clamp，不加随机数）；内阁与决策原型零随机。
5. 新政策效果键必须先入 `policy-tree.js` 的 XK_ADD/XK_MUL/XK_PICK 分类表（否则编译期报错）。

## 4. 换场景包（CFG 覆写法 + 三暗礁）

先例 `scenarios/bus.js`：require 引擎后直接覆写 `E.CFG` 字段 + 自写 policy(t) 剧本，**不建加载器、不改 Sim**。
实测暗礁（P0-6）：
- `E.FIRMS=[...]` 整体重赋值**静默失效**——必须 `Object.assign(E.FIRMS[i],{...})` 逐个改；REGIONS 同理。
- 导出面只有 `Sim,scriptPolicy,CFG,FIRMS,REGIONS,ARCH,MODE_CN,mulberry32`；PROVS/CABW 未导出。
- CFG 覆写污染模块级状态：**换包脚本与 GR 门禁必须分进程跑**。
- 引擎叙事文案是硬编码光伏措辞：换包能换参数/剧本/名册，换不掉文案（只能在打印层做术语映射）。

## 5. 话术与出处纪律（输出前自检）

引用数字三选一：①代码事实（file:line）②实跑输出（附命令）③占位自标（registry A#）。禁止编造。

禁语（说了会被自家注册表打脸）：
- ❌"核查拉满清零"——树内顶格 80 仍余 C 区尾部 [A23]，清零须巡查组；
- ❌"群演是骗补主力"（金额歧义）——群演占次数 ~96%，金额 80% 在小盛 [A20]，说"骗补面主力"；
- ❌"干预剧本财政更好"——1369 vs 960 是支出口径，且终局 Cf 2.7 劣于 2.42 [E3]；
- ❌ 流失金额单调——剂量曲线金额非单调（55 档 7.3 < 70 档 11.8），只用覆盖域口径 [E11]。

辽宁自给率被问就完整讲链条：引擎 .40 四省最低 → 2014 报表 .628 看似排错 → 2017 官方承认虚增 23% → 挤水分 .460 复位最低——**对上的是真实值不是报表值**（specs/prov-index.md §1.3）。

## 6. 文件地图速查

| 要什么 | 去哪 |
|---|---|
| 引擎唯一真相源 | `engine/engine2.js`（零依赖，node 可测） |
| 政策树 21 节点+编译器 | `engine/policy-tree.js` |
| 合入门禁 | `engine/test2.js` |
| 现行设计真相 | `specs/v3.1-consolidated-design.md` |
| 假设自供清单 | `specs/assumption-registry.md`（A1–A26） |
| 每条主张的复现命令 | `specs/evidence.md`（E1–E11） |
| 已审决策与推翻条件 | `specs/decision-log.md`（D1–D20） |
| 自我拷问报告 | `grill-report.md`（22 问 + 5 探针 + 冻结令） |
| 省级财政实测 | `specs/prov-index.md` |
| 政策文号已核原文 | `specs/theory-registry-mini.md` |
| 前端演示件 | `demos/wanli-arena-v2.html`（双击即开）+ `demos/build/` 打包管线 |
| 提交前终检 | `tickets/FINAL-CHECK.md`（四关） |
