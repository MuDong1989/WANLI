# 前端布局规格 v2 —— 按定稿草图重建 arena

> 依据：用户手绘定稿（左策略树 / 中上 three.js / 中下 Agent 决策链 / 右二事件流独立列 / 最右数据图表 / 通宽时间线）。参考实现 demos/wanli-arena.html 的**布局与内嵌引擎均已过期**：布局是旧版（事件流还是页签、决策区是窄条），引擎快照缺 ctrl/迁址/台账/8 名角/省内阁。重建时引擎必须重新打包现役 engine/engine2.js。

## 0. 分区图与尺寸

```
┌────────┬──────────────────────────────┬──────────┬─────────┐
│        │        three.js 主视口        │          │         │
│ 策略树  │     （真实中国地图·三维）      │  事件流   │ 数据图表 │
│        ├──────────────────────────────┤ （整列）  │ （整列）  │
│ (整列)  │     Agent 与决策链（大面板）    │          │         │
├────────┴──────────────────────────────┴──────────┴─────────┤
│                时间线 · 可随意点击切换（通宽）                  │
└─────────────────────────────────────────────────────────────┘
```
CSS 变量建议：`--treeW:272px --evtW:236px --chartW:236px --tlH:38px --topH:48px`；中列上下切分 **54% / 46%**（决策链面板是这版的主角，给足高度）；时间线**通宽满幅**（含策略树下方）。顶栏沿用：品牌/时钟/纪元徽章/播放·单步·重置/行动点三珠/速度。所有比例可调，分区拓扑不可调。

## 1. 各区契约

### 1.1 策略树（左整列）
继承 head4 组件语义：五支线分组、21 节点、状态类 locked/blocked/avail/active、等级珠、▲▼ 操作、行动点校验、tooltip（描述/等级/史实标注/锁因）。数据源 `PNODES/BRANCHES/nodeState/compilePolicy`；自动驾驶点亮 + 首次用户操作即接管（hint 文案切换）。新增：回看模式下渲染 scrub 时点的树状态（重放 ops 得 activeNodes 快照）。

### 1.2 three.js 主视口（中上）
真实地图：`decodeGeo(CHINA_GEO)` → 投影 `[(lon−105)×0.60, −(lat−36)×0.75]` → 省域 ExtrudeGeometry（环抽稀 ceil(len/220)，材质[顶,侧]，顶环 LineLoop）。省面亮度 = 该地实际核查——**名角省用 `sim.effA(band, pol, provId)` 的省级折扣**（内阁票决后江苏/辽宁应肉眼可辨地分化，这是新版视觉的机制卖点）。八名角楼 @ 原型城市，**CITY 表须补两城**：维赛@新余 `[114.93,27.82]`、国晶@天津 `[117.20,39.08]`。群演 InstancedMesh（exInfo 确定性省内散布）、北京中央柱+辉光、资金流贝塞尔粒子、骗补红闪。相机 orbit + 开场 dolly + 闲置微摆。点击：名角楼→选中（决策链面板联动）；**省域→省内阁五段卡**（新增，见 1.3）；群演→轻提示。24 具名配角（新卡）：从群演挑 24 家挂名字标签与驻地，引擎零改动。

### 1.3 Agent 与决策链（中下，本版主角）
三层结构：
- **决策卡流**（顶带）：每回合一组，8 名角迷你卡（emoji/名字/行动/规则截断），横向滚动，继承 .rgroup/.acard。
- **决策链胶片**（中带）：选中主体后渲染 20 格连环画——每格 = 规则图标 + 行动缩写 + 后果色（盈利绿/亏损红/被查红闪/蛰伏灰/救助金）。**引擎前置**：f.cards 全史（现仅 lastCard，加法改动，engine 任务卡 T-E1）。
- **五段卡详情**（底带或右滑抽屉）：观测/调取记忆/决策依据/行动/独白 + **第六段翻转因子 ⚡**（探针 API，engine 任务卡 T-E2；文案如"若本地实核≥55 本期不会虚报"/"记忆主导：任何核查水平下都会蛰伏"）。
- **省内阁卡**共用此面板：观测四项 + 三席位立场杠杆条（招商金/财政蓝/监管红，正负偏移）+ 票决算式 + 行动；数据源 `sim.provs[].lastCard`。
- 剧场四拍与显著度调度：第二梯队 spec 到位后接入；本版预留 hook（decision-viz-spec，未产）。

### 1.4 事件流（右二整列）
从页签升格为独立列。类型着色沿用（policy 金/fraud 红/region 紫/firm 青/market 灰/media 粉/sys 青）；顶部类型过滤 chips；**点击事件跳转时间线该回合**（scrub 到 e.t，回看态）；容量 200 条滚动。

### 1.5 数据图表（最右整列）
继承 head4：五 KPI（价格·成本/财政±基线/流失±基线/名角·长尾存活±基线/舆情）+ 四 sparkline（P·Cf、D·S、长尾存活、财政累计，实线=你的宇宙、虚线=基线）+ 三制度带行（份额条+实核）+ 图例。产品栈迁移后换 ECharts。

### 1.6 时间线（通宽）
20 格 + 年份刻度；played/cur/scrub 三态；点击已推演格 → **回看**（同种子重演 roundRecs[0..k]，逐位一致，E1/GR9 保证）→ 横幅 [⑂ 从此分叉 | 回到最新]；分叉 = truncate roundRecs + 接管 + 基线重建。回看态禁播放/单步/树操作。语义与 app4 实现一致，可整段移植。

## 2. 数据绑定表（面板 → 引擎 API）

| 面板 | 字段 |
|---|---|
| 策略树 | PNODES/BRANCHES/AP_PER_ROUND/nodeState(n,active,sim,ap)/compilePolicy(active)/AUTOPILOT_OPS |
| 地图 | sim.firms[].{K,cash,alive,home,prov,color}/sim.ex.{K,alive,region,fakeNow}/res.flows/sim.effA(j,pol,provId) |
| 决策链 | firms[].lastCard→cards[]（T-E1）/monologues/探针（T-E2）/provs[].lastCard |
| 事件流 | res.ev{t,type,msg} |
| 图表 | sim.history[] 与 baseSim.history[]（{P,Cf,D,S,alive,exAlive,fiscalTotal,waste,opinion,shares,fraudRegion}）/credLedger（台账面板，企业镜头开 localMatchK 时） |
| 时间线 | roundRecs[{ops,policy}]/new Sim(seed) 重演 |

## 3. 交互契约（不可破坏项）

自动驾驶↔接管单向；分叉后基线宇宙仍走史实供对照；玩家树操作过行动点校验；回看=只读；企业镜头预留 `step(policy, ctrl)` 通道（本版可不开 UI，接口勿封死）。**引擎重新打包顺序**：geodecode → CHINA_GEO → engine2 → ENGINE bridge → policy-tree → app（见 demos/wanli-arena.html 的组装结构，替换引擎段即可）。

## 4. 实现顺序建议（Claude Code）

① 以 app4/head4 为底子改布局拓扑（事件流拆列、决策区扩容、时间线通宽）+ 重打包现役引擎 + CITY 补两城 → 可跑基线；② 省内阁卡 + 省域省级亮度分化；③ f.cards 全史 + 胶片；④ 翻转因子第六段；⑤ 24 配角标签；⑥ 剧场四拍（等 decision-viz-spec）。每步跑一遍 `node engine/test2.js`（③④动引擎）+ 手测回看分叉。
