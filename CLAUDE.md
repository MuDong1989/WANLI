# 万历 WANLI · 政企推演场 —— Claude Code 交接总纲

**一句话**：一个多层政府—区域—企业共同塑造产业政策结果的动态推演场（GovBiz Simulator）。统一政策如何变成不同的地方现实，企业如何据此跨区配置资源，这些适应又如何反过来改变竞争格局与下一轮政策。光伏 2009–2018 是第一个吹过风洞的场景包。Tagline：**历史只跑了一次，我们让它跑一万次。**

**比赛语境**：48h 黑客松赛题三（政企互动 Agent 推演场），出题人为经济学研究团队。评审四维：实时可见变化 / 决策链可追溯 / 多分支对比 / 有人想用。

## 硬约束（违反即打回，无例外）

1. **GR 门禁**：任何引擎改动，合入前必跑 `node engine/test2.js`，九项不全绿不合入。GR 既是回归测试也是史实校准锚。
2. **确定性**：同种子逐位可重放。新增引擎逻辑不得增删既有随机数调用次数（闸门用 clamp 实现而非新增 rng 调用）；政府内阁与新增决策原型保持零随机数。时间线回看/分叉、双宇宙、研究镜头全部建立在这条纪律上。
3. **加法式默认**：新效果通道/新机制的默认值必须等于旧行为（如 `policy.x` 全字段、`localMatchK=0`）。动基线 = 触发重校准流程。
4. **重校准披露**：任何改变基线轨迹的参数调整，必须在 assumption-registry.md 登记并在 evidence.md 更新实测值（先例：8 名角扩容后 D0 5.8→6.10 三次迭代收敛，见 [E1]）。
5. **假设进注册表**：占位参数与可争议规则一律登记 specs/assumption-registry.md，不许藏在代码注释里。

## 文件地图

```
CLAUDE.md                      ← 本文件
engine/
  engine2.js                   ← 现役引擎（唯一真相源；8名角+4省内阁+政策树通道+ctrl钩子+迁址+台账，GR 9/9）
  test2.js                     ← GR1–9 黄金回归（合入门禁）
  policy-tree.js               ← 政策树 21 节点 + 编译器 + 史实自动驾驶节点化
  geodecode.js                 ← echarts 压缩坐标解码器（three.js 用真实地图的前提）
  china.json                   ← 34 省级单元地图数据（61KB，演示用；公开发布须换审图号标准地图）
specs/                         ← 全部设计文档（v3.1 为现行真相；v2.1/v3.0 历史件在 specs/history/）
experiments/                   ← 可复现实验（evidence.md 逐条对应）
demos/
  wanli-arena.html             ← app4（自题于 :866；政策树组件 PNODES/nodeState 参考实现），布局过期
  wanli-arena-v2.html          ← 现役施工现场：布局已按 frontend-layout-spec 起步，内嵌引擎仍为 v2.1-lite，待换现役 engine2
reference-manifest.md          ← P0-R 交付物：八参考仓"去哪行·偷什么"靶点清单（仓库本体在 ../references/）
grill-report.md                ← 2026-08-13 拷问报告：四桶结论 + 16h 定稿排期（附录 B/C）
```

**交接缺件（如实登记）**：v2.1 点名的 `theory-registry.md`（39 条理论锚点）与两件历史 demo（`wanli-policy-windtunnel.html`/`wanli-map-shell.html`）未随包交接、无副本；理论锚点重建迷你版已并入 C2 任务。

## 运行

```bash
node engine/test2.js            # GR 门禁（改引擎后的第一件事）
node experiments/shapley.js     # 及其余四个实验，evidence.md 每条附命令
```

## 当前状态（截至交接）

引擎侧已落地：政策树（21 节点/行动点 3/解锁三类/互斥，剧本编译与旧三元组逐位等价）；企业控制钩子 `step(policy, ctrl)`（玩家与 AI 同约束，随机流对齐）；进入选址+迁址（费 35%×K×capex/冷却 4 期/当期出货折半）；地方配套通道与承诺-兑现台账（场景开关，基线关）；8 名角（+政企绑定型/国资型）；4 名角省内阁（招商/财政/监管三席位票决执行折扣，零随机）；软预算约束救助（≤2 次）。前端以 wanli-arena-v2.html 为施工现场（app4 为组件参考）。**下一步队列见 specs/task-board.md 首屏；16h 冲刺排期与冻结令见 grill-report.md 附录 B/C。**

## 拷打指引（grill-me）

主靶 = `specs/v3.1-consolidated-design.md`（决策带推翻条件）；弹药带 = `specs/assumption-registry.md`（软肋自供）；护甲 = `specs/decision-log.md`（已审决策防重犁，推翻须给出新论据）；防御 = `specs/evidence.md`（每条主张附复现命令，先跑再打）。最深预置答辩：**"GR 既是拟合目标又是验证标准"** → 见 v3.1 §9 的 out-of-fit 反事实剂量反应论证。

## 参考仓库（P0-R 卡：克隆到**项目外**的平级目录 `../references/`，勿放进本仓库——避免污染 Claude Code 上下文与 git 嵌套）

```bash
cd .. && mkdir -p references && cd references
git clone --depth 1 https://github.com/joonspk-research/generative_agents      # 斯坦福小镇：记忆流/检索打分/反思——对照我们的 mems+retrieve 权重表
git clone --depth 1 https://github.com/google-deepmind/concordia               # Game Master 模式：叙事仲裁层，LLM 名角接入时的参考架构
git clone --depth 1 https://github.com/salesforce/ai-economist                 # 双层 RL 政策学习：中央"自动政策规则"作研究镜头场景的基线
git clone --depth 1 https://github.com/tsinghua-fib-lab/agentsociety           # 大规模 LLM 社会模拟：名角/群演分层的规模化技术
git clone --depth 1 https://github.com/tsinghua-fib-lab/ACL24-EconAgent        # LLM 宏观经济主体：决策提示词设计直接可借
git clone --depth 1 https://github.com/camel-ai/oasis                          # 百万级 agent 社媒模拟：向量化群演的极限参照
git clone --depth 1 https://github.com/jpmorganchase/abides-jpmc-public        # 市场微结构 ABM：确定性与撮合纪律的老牌范本
git clone --depth 1 https://github.com/projectmesa/mesa                        # 经典 ABM 框架：调度器/数据采集器模式
```
（八个地址已于交接当日全部验活；P0-R 已交付，靶点清单见 reference-manifest.md，后续会话按清单行号直读、勿全仓检索。）

## 技术栈定稿（细节见 v3.1 §附）

演示件栈 = 零构建单文件原生 JS + three.js r128 / ECharts 5.5（cdnjs）；产品栈 = Vite+Vue3+TS 壳 + 纯 TS 引擎三跑（主线程/Worker/node CLI）+ ECharts geo + node 薄代理跑 LLM 带 JSON 缓存。引擎永远保持零依赖、node 可测。
