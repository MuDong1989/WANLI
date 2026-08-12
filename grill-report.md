# WANLI 拷问报告（grill-me · 2026-08-13）

> **会话概况**：3 轮拷问 21 问 + 5 枚只读探针。规则遵守情况：全程只读（本报告是唯一写入物）；攻击已审决策前先查 decision-log 推翻条件；质疑实证主张前先跑 evidence.md 附带命令（GR 门禁 `node engine/test2.js` 9/9 绿，五个实验命令全部实跑，其中 E6 被查出失效，见桶③）。
> **numbering**：Q1–Q19 为第 1 轮，Q20（=Q6 专题）、Q21（=Q7 专题）为第 2-3 轮，Q22（砍单排期）末轮结案——**22 问全部结案，frontier 清空，拷问闭幕**。定稿排期见附录 C。
> **探针可复现**：附录 A 内嵌全部五枚探针源码与实测输出，引擎确定性保证逐位复跑。

---

## 桶① 答不上来 / 被推翻的点

按主题归并，每条附证据。除注明外均已在会话中裁决"按建议方案"处置（处置去向见括号）。

### 1. 骗补故事的金额口径与现实主张自相矛盾（Q6→Q20，最重的一击）
- **实测**：流失 40.8 亿中小盛一家 32.8 亿 = **80%**；骗补 213 次中群演约 96%（探针 D）。
- **矛盾**：你方现实主张"骗补企业难以从上市公司折射，骗补主力在群演"（论点本身成立，见桶④）——但引擎现状是**次数像现实、金额不像**：金额 80% 挂在一个具名名角身上。
- **处置（丙案）**：甲 · D7 论据改写（群演=骗补**面**主力/死亡潮承重；金额集中于名角骗补席=戏剧化代表）+ A12 补采样偏差注记 + demo 台词禁说金额歧义句——立即做；乙 · 金额再平衡（下调小盛 fake 系数 :141、上调群演 efake :404，以审计通报金额分布为标）——动基线，入 C 卡走重校准闸。

### 2. 救助绕开内阁票决，财政席立场是装饰（Q7→Q21）
- **实测**：江西财政席 t0–t19 **二十期全部 −1**（探针 E）；救助 11 亿 ×2 照发；代码 :464-474 条件清单（cash<0 ∧ bound ∧ prov ∧ rescues<2）**无 score 项**；两次救助恰落在"招商席主导、票面为维持"的卡上。
- **处置（a+b）**：A22 登记"救助绕开票决=政治逻辑压倒财政逻辑（赛维史实锚：省市两级主导协调银团，财政系统异议无效）"+ D14 补注；backlog 卡"救助过财政门槛"（selfFin 低于阈值→额度打折或需中央转移支付配合，可长成新政策节点）。
- **demo 红利**："财政席二十期全程反对，救助照发两次——软预算约束的政治经济学，一张决策卡讲完。"

### 3. E6 迁址实验整个是空操作（evidence 层最硬伤）
- **实测**（探针 A）：小盛在迁址指令期 t8 前已死（约 t4），move 指令从未构造，A/B 两宇宙 history[19] **逐位相同**——E6 的"迁址臂"与基线是同一次模拟，其结论作废。
- **处置**：E6 作废注记 + 重做（迁址提前至 t2-t3 或改用存活主角），入 T0。

### 4. 剂量反应有天花板盲区（§9 反事实论证的软肋）
- **实测**（探针 B）：audit 20→101/64/48（流失 40.8 亿）；70→0/0/46（11.8 亿）；80→0/0/45（10.4 亿）；100→0/0/0（0 亿）。政策树 audit 节点顶格 Lv3=80 → **树内玩家永远清不掉 C 省骗补**，"核查拉满清零"只在裸三元组世界成立。
- **处置**：E11 固化剂量反应实验（探针 B 成品化进 experiments/）+ 文档措辞限定；audit=100 不可达性登记注册表。

### 5. 内阁票决的物质作用面比宣传的窄
- **实测**（探针 C）：辽宁执行折扣 0.45→0.05 的铁腕反事实，流失 40.8→28.1 亿（仅通过被查抽签概率通道），骗补**次数几乎不动**（105/64/46）。原因：群演 effA 调用不传 provId（:403,410），省内阁无论怎么票决都触不到本省群演的造假决策；小盛决策闸 effA<55 在 audit=20 时代恒成立。
- **处置**：effA 省级化（Q5a）为正解但动基线——**冻结入 backlog**；先做口径修正（Q5b）：文档明示内阁折扣现版只影响查处概率与名角闸门。

### 6. GR 与判据层的缺口（Q1-Q3 群）
- GR3 单侧断言（只测装机期有骗补，未测度电期无骗补）→ 双侧化，入 T0。
- GR7 判据"财政>基线"过粗——**你方主动补刀：财政支出多不等于好，需转化成对应收益**（此修正被采纳为 GR7 新判据方向：支出↔成本下降/装机产出的转化效率）。
- GR9 比对深度不足（浅层字段）→ 深比对，入 T0。
- test2 演示行输出 bug → 修复，入 T0。

### 7. 措辞过度宣称群（v3.1 文档层）
- §9①"结构复现"→ 降格为"机制内置+时点复现"。
- E4 标题过度宣称 → 限定为实际测得范围。
- compilePolicy 缺深断言、min/max 语义含糊（Q12）→ 补断言+定语义，入 T0。

### 8. 工程债群（承认并分级处置）
- 双流拆分（Q9）、Sim opts 实例化去全局单例（Q10）、债务层缺失（Q14）、N<340 触顶语义（Q16，先用"触顶事件"低配顶上）——**全部冻结入 backlog，赛中禁动**（每件都是动基线手术）。
- 迁址后 prov 不随迁（Q4）→ 修复（基线无迁址事件，基线中性），入 T0。
- fiscal.local 不进 history → 补入，入 T0。
- deadT 字段 → 补入，入 T0。

### 9. 文档漂移群（Q17，部分成立）
- CLAUDE.md"3 个历史演示件"实存 1 件（`wanli-policy-windtunnel.html`、`wanli-map-shell.html` 丢失，v2.1 头注/v3.0 §4 点名"已交付"）。
- **theory-registry.md（39 条理论锚点）不在仓库**——P0-5、T-E3、theory_ref 体系全部悬空（是否有包外副本=Q22 待答事实③）。
- 注册表无出生信息头注 → 补"产出于 2026-08-12 v3.1 交接会话"。
- （本条两项子攻击被推翻/降级，见桶④。）

### 10. 未终裁的开关（Q19）
- D12 游说通道开关无终裁 → **终裁"维持关"**，登记开关，demo 话术升级。

---

## 桶② 需要升档的假设（按优先级排序）

| 序 | 假设 | 现状 | 升档动作 | 为什么排这里 |
|---|---|---|---|---|
| 1 | **A10** 政策树 21 节点效果系数 | 占位（注册表自称"最大面积软肋"） | C2 最小版：仅标定 demo 主线节点（核查/巡查/规范/度电）挂政策文件量化条款出处 | 反事实量值全部悬在它上面；评审必问 |
| 2 | **A12** 群演 integrity 分布 + 骗补金额口径 | 占位 + 新查出金额口径矛盾（桶①1） | 立即：补采样偏差注记（上市公司样本折射不到骗补企业）；C 卡：审计通报金额分布→再平衡 | demo 主线故事的地基 |
| 3 | **A7** 财政自给率四省 | 占位（JX 0.45 无外部出处） | P0-8 财政部决算公开数（一般公共预算收入/支出） | 软预算叙事+财政席立场全押在它上 |
| 4 | **A22（新增）** 救助绕开票决 | 未登记 | 立即登记 + D14 补注 + backlog"财政门槛"卡 | 评审一问一个准 |
| 5 | **A23（新增）** audit 树内顶格 80、100 不可达 | 未登记 | 登记 + E11 固化 | 反事实天花板的诚实披露 |
| 6 | **A24（新增）** 群演 effA 无省份维度 | 未登记 | 登记 + Q5b 口径修正；Q5a 省级化冻结 backlog | 内阁作用面的诚实披露 |
| 7 | **A20-A30 批量** 本次拷问暴露的其余未登记规则（N<340 触顶、迁址 prov、min/max 语义、lobby 开关等） | 藏在代码里 | 批量入册（T0 文档件） | 硬约束 5 的欠账 |

---

## 桶③ 需要补做的实验

1. **E6 重做**（迁址 A/B）：现版作废（探针 A 证明两臂逐位相同）。重做方案：迁址指令提前至 t2-t3（小盛存活期），或改用存活主角（如汉光/稳达）。原 E6 加作废注记留档。
2. **E11 新增**（剂量反应固化）：探针 B 成品化 → `experiments/dose-response.js`，输出 audit∈{20,70,80,100} 四档骗补/流失表，注明树内可达域 [0,80]。这是 v3.1 §9 out-of-fit 论证的实测支撑。
3. **金额再平衡敏感性**（C 卡，随 Q20 乙案）：调小盛 fake 系数与群演 efake 后重跑 GR3/GR8 + 探针 D 复测，目标金额占比对齐审计通报分布，走重校准披露。
4. **P0-8 三指数管线**：城投利差/审计通报省域密度/财政自给率 → A7/A12/兑现信誉标定，一页出处。
5. **客车包最小移植**（P0-6）：2h 盒 + 录屏兜底，验证"换产业不改引擎"主张。
6. **（可选）探针 C/D/E 固化为 demo 素材脚本**：waste-split（骗补金额切分）、jx-seats（财政席二十期实录）本身就是现成的演示弹药。

---

## 桶④ 防御成功的攻防实录

### ④-1 「v2.1/v3.0 历史件不存在」——攻击被推翻（完胜）
> **攻方（我，Q17②）**：CLAUDE.md 称 v2.1/v3.0 是历史件，但 specs/ 下并无此二文件——文档撒谎。
> **守方（实地复核）**：两份文件在 `specs/history/` 子目录好好躺着，各带"【历史件】已被 v3.1 取代"头注。我首轮 Glob 未递归，**打错了，撤回**。CLAUDE.md 该行描述准确。

### ④-2 「app4/head4 施工底子丢失，T-F1 被阻塞」——攻击被降级（大部胜）
> **攻方（我，Q17③）**：frontend-layout-spec 以 app4/head4 为底子，但全盘搜索无此二文件——T-F1 排期建立在不存在的底子上。
> **守方（实地复核）**：wanli-arena.html:866 自题"万历 · 政企推演场 app4"，内含 PNODES/nodeState/compilePolicy 完整政策树组件（18 处命中）——**app4 就是 arena，T-F1 未被阻塞**，4h 盒基本可信。残余成立部分：head4 独立文件确实无踪（组件语义应已被 app4 吸收），交接文档应写明"app4=demos/wanli-arena.html"。

### ④-3 「骗补主力在群演」的现实论点——论点成立并被采纳（半胜）
> **守方（用户，Q6 原文）**："因为骗补的企业很难通过上市公司进行反应和折射，所以大部分的骗补主力是在群演上。"
> **裁定**：作为**现实主张与校准方法论**成立——A 股聚类天然折射不到骗补企业，integrity 分布必须走审计通报口径。该论点被采纳写入 A12 标定路径（采样偏差注记）。但它同时反向定罪了引擎现状的金额分布（见桶①1）——论点赢了，引擎输了。

### ④-4 数据出处质询——质询纪律得到验证（守方程序胜）
> **守方（用户，Q7/Q21 原文）**："你这里提到的数据，现在是采用什么方法得到的……凭空捏造的，还是基于一些可靠事实？"／"你提到的我们的注册表，这个注册表的来源是哪里？"
> **攻方（我）逐条交底**：selfFin=0.45 = engine2.js:47 = 注册表 A7 自标占位（数值无外部出处，注册表是自供清单不是证据来源）；"财政席常年 −1" = 公式 :212 + 探针 E 二十期实录；救助 11 亿 ×2 = 实跑输出；"不过票决" = :464-474 代码事实。注册表本体 = 2026-08-12 晚 22:07–22:38 一次工作过程产出的交接包组成部分（时间戳物证），CLAUDE.md 硬约束 5 的制度产物。
> **裁定**：我方数字非捏造，全部可溯源——但守方的质询程序正确且值得保持：**对拷问者也要拷问出处**。

---

## 附录 A · 五枚探针（源码内嵌，逐位可复现）

运行方式：将代码块存为 .js 后 `node <文件>`（或直接从本报告复制）。引擎确定性保证输出逐位一致。

### 探针 A（E6 迁址臂空操作复核）→ 结论：两臂同一次模拟
```js
/* 探针A：复核 E6 迁址臂是否为空操作（逐期追踪小盛，完全复刻 relocation-ab.js 的 ctrl 构造） */
var E=require('c:/Users/hawke/Desktop/hackathon/WANLI/engine/engine2.js');
var P=require('c:/Users/hawke/Desktop/hackathon/WANLI/engine/policy-tree.js');
E.CFG.localMatchK=1.0;
function play(mv){
  var sim=new E.Sim(E.CFG.seed), a={}, log=[], moveInstrIssued=false, ctrlRounds=0, moveEv=null;
  for(var t=0;t<20;t++){
    P.applyOps(a,P.AUTOPILOT_OPS[t]);
    var f=sim.firms.find(function(x){return x.id==='xiaosheng';}), c=null;
    var aliveBefore=f.alive;
    if(f&&f.alive){
      var hh=sim.history[sim.history.length-1], mg=hh?hh.P-sim.frontier*f.f:1;
      c={xiaosheng:{rd:f.cash>25&&mg>0.5, dK:(mg>0.8&&f.cash>15)?0.15:0, fake:0}};
      if(mv&&t===8){ c.xiaosheng.move=0; moveInstrIssued=true; }
      ctrlRounds++;
    }
    var res=sim.step(P.compilePolicy(a),c);
    res.ev.forEach(function(e){ if(/迁址/.test(e.msg)) moveEv='t'+t+' '+e.msg; });
    log.push('t'+String(t).padStart(2)+' 期初alive='+(aliveBefore?'是':'否')+' → 期末alive='+(f.alive?'是':'否')+' cash='+f.cash.toFixed(2)+' home='+f.home+(c?' [ctrl已发]':' [无ctrl]'));
  }
  return {sim:sim, log:log, moveInstrIssued:moveInstrIssued, ctrlRounds:ctrlRounds, moveEv:moveEv};
}
var A=play(false), B=play(true);
console.log('=== B 宇宙（迁址臂）小盛逐期 ===');
B.log.forEach(function(l){console.log(l);});
console.log('迁址指令是否曾被构造(t8时小盛尚活):', B.moveInstrIssued?'是':'否');
console.log('迁址事件是否出现:', B.moveEv||'从未出现');
console.log('ctrl 构造期数 A/B:', A.ctrlRounds+'/'+B.ctrlRounds);
var fa=A.sim.firms.find(function(x){return x.id==='xiaosheng';});
var fb=B.sim.firms.find(function(x){return x.id==='xiaosheng';});
console.log('A 终局 cash='+fa.cash.toFixed(2)+' home='+fa.home+' | B 终局 cash='+fb.cash.toFixed(2)+' home='+fb.home+' | 差值='+(fb.cash-fa.cash).toFixed(2));
console.log('两宇宙 history[19] 逐位相同:', JSON.stringify(A.sim.history[19])===JSON.stringify(B.sim.history[19])?'是（即两臂是同一次模拟）':'否');
```
实测关键输出：`迁址指令是否曾被构造: 否`／`迁址事件: 从未出现`／`差值=0.00`／`两宇宙 history[19] 逐位相同: 是`。

### 探针 B（剂量反应扫描）→ E11 的种子
```js
/* 探针B：v3.1 §9② 剂量反应主张的可复现检验（装机时代核查力度扫描，t≥8 按史实剧本走） */
var E=require('c:/Users/hawke/Desktop/hackathon/WANLI/engine/engine2.js');
[20,70,80,100].forEach(function(A){
  var s=new E.Sim(E.CFG.seed);
  for(var t=0;t<20;t++){
    var pol = t<8 ? {mode:'capacity',intensity:60,audit:A} : E.scriptPolicy(t);
    s.step(pol);
  }
  var fr=[0,0,0];
  s.history.forEach(function(h){ for(var j=0;j<3;j++) fr[j]+=h.fraudRegion[j]; });
  console.log('audit='+String(A).padStart(3)+' → 骗补次数 A/B/C = '+fr.join('/')+' | 流失 '+s.fiscal.waste.toFixed(1)+' 亿');
});
console.log('(注: 政策树 audit 节点顶格 Lv3=80, audit=100 仅裸三元组可达, 树内玩家不可达)');
```
实测输出：`20→101/64/48｜40.8亿`；`70→0/0/46｜11.8亿`；`80→0/0/45｜10.4亿`；`100→0/0/0｜0.0亿`。

### 探针 C（辽宁铁腕反事实）→ 内阁物质作用面
```js
/* 探针C：内阁折扣的物质作用面——辽宁铁腕反事实（disc 0.45→0.05）对骗补格局的影响 */
var E=require('c:/Users/hawke/Desktop/hackathon/WANLI/engine/engine2.js');
function run(tighten){
  var s=new E.Sim(E.CFG.seed);
  if(tighten) s.provs[3].disc=0.05; /* 辽宁上来就铁腕 */
  var caught=0;
  for(var t=0;t<20;t++){
    s.step(E.scriptPolicy(t)).ev.forEach(function(e){ if(/核查查实：小盛/.test(e.msg)) caught++; });
  }
  var fr=[0,0,0];
  s.history.forEach(function(h){ for(var j=0;j<3;j++) fr[j]+=h.fraudRegion[j]; });
  var xs=s.firms.find(function(f){return f.id==='xiaosheng';});
  return {fr:fr, waste:s.fiscal.waste, caught:caught, xsDead:!xs.alive, xsCash:xs.cash};
}
var b=run(false), m=run(true);
console.log('基线(辽宁disc=0.45):     骗补 A/B/C='+b.fr.join('/')+' 流失='+b.waste.toFixed(1)+'亿 小盛被查实'+b.caught+'次');
console.log('反事实(辽宁disc=0.05):   骗补 A/B/C='+m.fr.join('/')+' 流失='+m.waste.toFixed(1)+'亿 小盛被查实'+m.caught+'次');
```
实测输出：基线 `101/64/48｜40.8亿`；反事实 `105/64/46｜28.1亿`（次数几乎不动，金额通道来自被查抽签概率；群演 effA 不传 provId，engine2.js:403,410）。

### 探针 D（流失金额切分）→ 80%/4% 结构
```js
/* 探针D：流失金额在小盛与群演之间的精确切分（小盛强制诚实 A/B） */
var E=require('c:/Users/hawke/Desktop/hackathon/WANLI/engine/engine2.js');
function run(honest){
  var s=new E.Sim(E.CFG.seed);
  for(var t=0;t<20;t++){
    var c=null, f=s.firms.find(function(x){return x.id==='xiaosheng';});
    if(honest && f && f.alive) c={xiaosheng:{rd:false,dK:0,fake:0}};
    s.step(E.scriptPolicy(t), c);
  }
  var fr=[0,0,0]; s.history.forEach(function(h){for(var j=0;j<3;j++)fr[j]+=h.fraudRegion[j];});
  return {waste:s.fiscal.waste, fr:fr};
}
var A=run(false), B=run(true);
console.log('基线: 流失='+A.waste.toFixed(1)+' 次数='+A.fr.join('/'));
console.log('小盛强制诚实: 流失='+B.waste.toFixed(1)+' 次数='+B.fr.join('/'));
console.log('→ 小盛金额贡献 '+(A.waste-B.waste).toFixed(1)+'亿 = '+(100*(A.waste-B.waste)/A.waste).toFixed(0)+'%');
```
实测输出：`40.8 → 8.0`，小盛金额贡献 **32.8 亿 = 80%**；次数 213 起中群演约 96%（B 臂含共流位移伪影，小幅波动非机制效应）。

### 探针 E（江西内阁二十期实录）→ 软预算叙事弹药
```js
/* 探针E：江西内阁三席位逐期立场实录（验证"财政席常年-1"的出处） */
var E=require('c:/Users/hawke/Desktop/hackathon/WANLI/engine/engine2.js');
var s=new E.Sim(E.CFG.seed);
for(var t=0;t<20;t++){
  s.step(E.scriptPolicy(t));
  var c=s.provs[1].lastCard; /* provs 顺序 JS,JX,HB,LN → [1]=江西 */
  console.log('t'+String(t).padStart(2)+' '+c.seats.map(function(x){return x.s+(x.v>=0?'+':'')+x.v;}).join(' ')+' | '+c.rule+' → '+c.act);
}
```
实测关键输出：财政席 t0–t19 全部 −1；t4、t6 两次"协调银团救助维赛新能 11亿"均落在招商席主导、票面"维持现状"的卡上；t18 起转"加严执行"（折扣 0.25→0.15→0.13）。

---

## 附录 B · T0 拷问修复包（已裁决执行，两批次）

**文档件（~2h，零风险）**：CLAUDE.md 漂移修正（demos 实存清单、app4=arena 指认、theory-registry 下落注记）；v3.1 三处措辞（§9①、E4 标题、D7 论据）；注册表批量入册（A20-A30 + A22/A23/A24）+ 出生信息头注；决策日志（D12 终裁"维持关"、D14 补注）；E6 作废注记。

**引擎件（~3h，打包一次过 GR + 一次重校准披露）**：GR3 双侧、GR9 深比对、test2 演示行修复、E11 固化、E6 重做、deadT、fiscal.local 进 history、迁址 prov 随迁修复、compilePolicy 深断言 + min/max 语义。

**冻结令（赛中禁动，全部入 backlog 卡）**：双流拆分（Q9）、Sim opts 实例化（Q10）、effA 省级化（Q5a）、债务层（Q14）、N<340 语义改（Q16，触顶事件低配顶）、金额再平衡（Q20 乙）。

---

## 附录 C · 定稿排期（Q22 已结案：距提交 16h · A/B 两人 · theory-registry 无副本）

**约束**：16h 墙钟 × 2 人，扣除休整实际可用约 12-13h/人（≈25 人时）。theory-registry.md 无副本 → P0-5 全量核对**死刑**，改为"重建 demo 主线迷你注册表 8-10 条锚点"，并入 B 的 C2 时段（同为挂出处工作）。

**A 线（引擎+前端，≈11.5h 工作量）**
1. T0 引擎件一批打包（3h）：GR3 双侧、GR9 深比对、test2 演示行、E11 固化、E6 重做、deadT、fiscal.local、prov 随迁、compilePolicy 断言——**一次过 GR、一次重校准披露，此后引擎冻结**（除演示阻断级 bug 外禁动）。
2. T1 demo 主干（8.5h）：T-F1 布局重构+现役引擎重打包+CITY 补两城（app4/arena 为底，4-5h）→ T-F2 省内阁卡+省域分化（2h）→ T-F3 事件流列+跳转（1.5h）。

**B 线（数据+内容，≈10.5h 工作量）**
1. T0 文档件（2h，可交 Claude Code 代工）：CLAUDE.md 漂移修正、v3.1 三处措辞、注册表 A20-A30+A22/A23/A24 入册+头注、D12/D14 入日志、E6 作废注记。
2. C2 最小版 + 迷你 theory-registry 重建（3.5h）：核查/巡查/规范/度电四节点系数挂政策文件出处 + demo 主线 8-10 条理论锚点。
3. P0-8 三指数一页（3h）：城投利差/审计通报省域密度/财政自给率，喂 A7/A12。
4. P0-6 客车包 2h 盒（超时即录屏兜底，不恋战）。

**合流（最后 3h，双人）**：五分钟剧本走排 ×2（含换包桥段与"财政席二十期反对"新台词，2h）+ **完整 demo 录屏一遍作保底**（30min）+ 提交缓冲。

**处决名单（本轮确认）**：P0-1 全量 QMT→手工 10 家（B 线弹性，1h，有余才做）；P0-5 全量（→迷你重建）；P0-R 精读**全砍**（16h 内读参考仓是死刑动作）；C1、C3、T-F6、T-F7 赛后。**T3 弹性件仅剩 T-F5**（翻转因子第六段，探针 API 已有实验版）——仅当 A 线 T-F3 提前完工才动。

**纪律重申**：T0 引擎批之后引擎冻结；冻结令清单（附录 B）赛中禁动；每次合入跑 GR 9/9。
