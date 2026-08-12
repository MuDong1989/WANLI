# 参考仓库靶点清单（P0-R 交付物）

**克隆位置**：`../references/`（项目外平级目录，八仓全部 `--depth 1` 浅克隆，合计 1.6G）
**用途**：把八个参考仓库压缩成"去哪一行、偷什么、贴我方哪个模块"，避免后续会话通读仓库烧上下文。
**纪律**：参考实现一律**只读**。任何借鉴落到 `engine/` 必须过 `node engine/test2.js` 九项门禁（硬约束 1），且默认值等于旧行为（硬约束 3）。

路径均相对 `../references/`。行号为浅克隆当日快照，仓库更新后可能漂移，**以符号名为准**。

---

## 我方模块对照表（第四列用词表）

| 模块名 | 我方代码锚点（已逐条核实） |
|---|---|
| **mems/retrieve** | `engine/engine2.js:177` 初始化 · `:245-248` `writeMem`（12 条环形缓冲）· `:249-255` `retrieve` · `:161-167` `REL` 表 |
| **LLM 名角插槽** | `engine2.js:7` 头部契约声明（"ARCH 决策函数换 LLM，输入 obs/mems、输出 JSON 契约不变"）· `:69` `var ARCH` · `:311` `ARCH[f.arch]` 调用点 |
| **研究镜头中央规则基线** | 尚无代码实体。decision-log **D5** 限定为场景选项，不进主循环 |
| **群演向量化层** | `engine2.js:181` `this.ex`（12 个平行数组，SoA 布局）· `:277-282` 群演推进 |
| **确定性纪律** | `engine2.js:10` `mulberry32` · `:13` `seed:42` · `:170` `this.rng` |
| **调度与数据采集** | `engine2.js:257` `Sim.prototype.step` 主循环 · `:280,296` `alive().forEach` · ARCH 导出／承诺-兑现台账 |

> ⚠️ **关于 `RECALL_W`**：P0-R 卡与任务描述里反复出现的 `RECALL_W` **在本仓库中不存在**。
> 搜索范围：`engine/`、`specs/`、`experiments/` 全路径，含 `RECALL` / `recall_w` / `recallW` 变体，**零命中**。
> 实际承担"记忆相关度权重"职责的是 `engine2.js:161-167` 的 **`REL`** 表（`ctx → 记忆类型 → 相关度` 二级查表）。
> 本清单一律按 `REL` 记录。若 `RECALL_W` 是计划中要新增的符号，需先进 assumption-registry 再落代码。

---

## 主表

| 仓库 | 目标路径（可多条） | 偷什么 | 对应我方模块 |
|---|---|---|---|
| generative_agents | `reverie/backend_server/persona/cognitive_modules/retrieve.py`：`new_retrieve` L199、`gw=[0.5,3,2]` L244、`normalize_dict_floats` L70、`top_highest_x_values` L107 | 三维打分合成：recency×importance×relevance 各自 min-max 归一化后**加权求和**，取 top-30 | mems/retrieve |
| generative_agents | 同上 `extract_recency` L132 · `memory_structures/scratch.py:57-60`（`recency_w/relevance_w/importance_w=1`、`recency_decay=0.99`） | 衰减按**时序排名下标**而非绝对时间；三个权重外置可调而非硬编码 | mems/retrieve |
| generative_agents | `memory_structures/associative_memory.py`：`ConceptNode` L19、`add_event/add_thought/add_chat` L153/199/243 | 记忆节点字段集：`poignancy`(=显著度)／`last_accessed`／`expiration`／`keywords`，以及事件/思考/对话三类分流 | mems/retrieve |
| concordia | `concordia/environment/engine.py:30` `Engine` 抽象基类 | GM 主循环拆成六个抽象方法：`make_observation / next_acting / resolve / terminate / next_game_master / run_loop` | LLM 名角插槽 |
| concordia | `concordia/environment/engines/sequential.py:67`（`run_loop` L223）· 同目录 `simultaneous.py` / `asynchronous.py` | 同一 GM 接口下三种推进语义；我方半年一拍属 `simultaneous` 语义 | LLM 名角插槽 · 调度与数据采集 |
| concordia | `concordia/components/game_master/`：`event_resolution.py:40`、`next_acting.py`、`terminate.py`、`scene_tracker.py`、`payoff_matrix.py`、`make_observation.py` | component 化仲裁：把"谁行动／发生了什么／是否终局"拆成可插拔组件，而非一个巨型 GM 函数 | LLM 名角插槽 |
| ai-economist | `ai_economist/foundation/components/redistribution.py:79` `PeriodicBracketTax`（`tax_model` 四选一 L165-168、`period=100`、`n_brackets=5`、`rate_disc`） | 中央规划者的税收动作空间设计：`model_wrapper`（学出来的）／`saez`（理论最优）／`us-federal-...`（史实）／`fixed-bracket-rates` 四条基线并列可切 | 研究镜头中央规则基线 |
| ai-economist | `ai_economist/foundation/agents/planners.py:11` `BasicPlanner` · `foundation/base/base_component.py` | 双层结构：planner 与 mobile agent 共用 component 接口，观测／动作／掩码三件套 | 研究镜头中央规则基线（次：`engine/policy-tree.js` 动作点抽象） |
| ai-economist | `ai_economist/training/training_script.py:51`（warp_drive `Trainer`）· `tutorials/rllib/training_script.py` · `tutorials/optimal_taxation_theory_and_simulation.ipynb` | 双层 RL 训练入口与"最优税收理论 vs 仿真"对照实验的组织方式 | 研究镜头中央规则基线 —— **仅作场景选项，不进主循环（decision-log D5）** |
| agentsociety | `packages/agentsociety/agentsociety/agent/dispatcher.py:21` `BlockDispatcher` · `agent/block.py:30` `Block` | 名角内部再分层：LLM 选"处理块"，块自带 params／context／memory —— 名角行为可组合，而非一坨 prompt | LLM 名角插槽 |
| agentsociety | `packages/agentsociety/agentsociety/simulation/simulationengine.py:182` `SimulationEngine`（`asyncio.gather` L916/1177/1402）· `simulation/individualengine.py:40` `IndividualEngine` | 批量并发调度：同类 agent 攒批 gather，而非逐 agent 串行 | 群演向量化层 |
| agentsociety | `agent/prompt.py` `FormatPrompt` · `memory/memory.py` · `vectorstore/` | 记忆注入 prompt 的模板化与向量检索后端 | LLM 名角插槽 · mems/retrieve |
| ACL24-EconAgent | `simulate.py:23` `gpt_actions`：`problem_prompt` L46／`job_prompt` L51／`consumption_prompt` L64／`tax_prompt` L72／`price_prompt` L78 → `obs_prompt` L85 | **五段式观测拼装**：把宏观状态翻成第二人称经济处境叙述再喂 LLM。直接可移植，是本仓最高价值物 | LLM 名角插槽 |
| ACL24-EconAgent | `simulate.py:129` `reflection_prompt` · `dialog_queue` 短窗（`dialog_len=3`，L191） | 季度反思 + 固定长度对话窗 = 廉价记忆机制，无需向量库 | mems/retrieve（同属"穷人版记忆"，对照我方 12 条环形缓冲） |
| ACL24-EconAgent | `simulate_utils.py:28` `get_multiple_completion`（`num_cpus=15`）· `config.yaml` · `data/profiles.json` | 批量 LLM 调用并发封装 + 名角画像外置 JSON | LLM 名角插槽（node 薄代理的 JSON 缓存层设计） |
| oasis | `oasis/social_platform/channel.py:41` `Channel`（`asyncio.Queue` + `AsyncSafeDict` L18） | agent↔平台全异步消息通道，单点收敛便于限流与回放 | 群演向量化层 |
| oasis | `oasis/social_agent/agent_graph.py` · `agents_generator.py` · `social_platform/recsys.py` | 百万 agent 的图存储与批量生成；推荐系统作"环境算子"独立于 agent 之外 | 群演向量化层 |
| oasis | `examples/experiment/twitter_simulation_1M_agents/twitter_simulation_1m.py:71` `running`（`asyncio.gather` L162） | 百万级跑批的实际入口写法（并发上限／分批边界的经验值） | 群演向量化层 |
| abides-jpmc-public | `abides-core/abides_core/kernel.py:20` `Kernel`：`messages: PriorityQueue` L68、`runner` L275、`run` L194 | **确定性事件调度**：优先队列按 (时间, 事件) 出队，同刻事件靠 agent id 定序 —— 无浮点比较、无字典序依赖 | 确定性纪律 · 调度与数据采集 |
| abides-jpmc-public | 同上 `random_state: np.random.RandomState` L55-62、`seed` L126 · `latency_model.py` · `agent.py` | 单一 RNG 实例贯穿全仿真、种子显式注入 —— 与我方"不得增删随机数调用次数"同源纪律 | 确定性纪律 |
| mesa | `mesa/mesa/agentset.py:27` `AbstractAgentSet`：`shuffle_do` L346、`do` L341、`select` L66、`groupby` L284、`sort` L331 | 调度器的现代替身：调度 = 对 AgentSet 的顺序算子，激活顺序**显式写在调用点**而非藏在 scheduler 类里 | 调度与数据采集 |
| mesa | `mesa/mesa/model.py`：双 RNG `self.random`/`self.rng` L128-129、内部 `steps` 时钟、`agents` 属性 L187 | 双 RNG（python `random` + numpy `Generator`）分工与种子注入；模型自带步计数，不依赖调度器对象 | 确定性纪律 · 调度与数据采集 |
| mesa | `mesa/mesa/datacollection.py:47` `DataCollector`：`collect` L370、`_record_agents` L314、`_new_agenttype_reporter` L265、`add_table_row` L410、`get_*_dataframe` L430+ | 采集器模式：model／agent／agenttype 三级 reporter 注册 + 表格导出，每拍一次 `collect()` | 调度与数据采集 |

---

## ⚠️ 三处"未找到 / 名不符实"（如实记录，未编造对应物）

### 1. `RECALL_W` —— 我方代码中不存在

- **搜索过的路径**：`engine/`（全部 5 文件）、`specs/`、`experiments/`；模式含 `RECALL_W` / `RECALL` / `recall_w` / `recallW`
- **结果**：零命中
- **实际等价物**：`engine2.js:161-167` 的 `REL` 表
- 详见上文"我方模块对照表"下的说明框

### 2. mesa 的 `time.py` —— 已被上游移除

- **搜索过的路径**：`mesa/mesa/*.py` 全部列举、`find mesa/ -name 'time.py'` 全仓
- **结果**：零命中。克隆到的是 `4.0.0a0` 开发主线，调度器类（`BaseScheduler` / `RandomActivation` / `SimultaneousActivation`）在 Mesa 3.x 已被移除，`HISTORY.md:1099,1438` 记录了迁移过程
- **等价靶点**：`mesa/agentset.py` + `mesa/model.py`（已进主表）
- **对我方是好消息**：mesa 官方的结论正是"显式顺序算子优于隐式调度器类"，与我方 `alive.forEach` 的写法同向 —— 我们没走错路

### 3. agentsociety 的 `AgentGroup` —— 只存在于设计文档

- **搜索过的路径**：`packages/agentsociety/agentsociety/` 下 `grep -rn "class AgentGroup"`；另查 `import ray` / `@ray.remote`
- **结果**：`AgentGroup` 仅出现在 `DESIGN.md:19`（"a `AgentSociety` class to manage the simulation and `AgentGroup` class to do parallel execution"），**代码中无此类**；`ray` 只用在 `llm/llm.py` 与 `message/messager.py`，不是调度层
- **实际等价物**：`simulation/simulationengine.py:182` `SimulationEngine` 的 `asyncio.gather` 批量调度 + `simulation/individualengine.py:40` `IndividualEngine`
- **结论**：该仓文档已滞后于代码，**以代码为准**

### 附：ACL24-EconAgent 无独立 prompt 模板文件

提示词直接内联在 `simulate.py` 的 f-string 里（L46–L90），不存在 `prompt_template/` 之类目录。
该仓是 ai-economist 的分叉，`ai_economist/` 子树基本是上游拷贝，**真正的原创只有根目录三个文件**：
`simulate.py` / `simulate_utils.py` / `config.yaml`。读这三个就够，**不要进 `ai_economist/`**。

---

## 记忆检索：我方 vs 斯坦福（P0-R 的核心比对）

我方（`engine/engine2.js:249-255`）：

```js
s = m.sal * Math.pow(0.75, t - m.t) * (REL[ctx][m.type] || 0.3)
// 取 top-2，阈值 s > 0.08；写入端 12 条环形缓冲（L245-248）
```

斯坦福（`retrieve.py:199-246` + `scratch.py:57-60`）：

```python
score = gw[0]*recency + gw[1]*importance + gw[2]*relevance   # gw = [0.5, 3, 2]
# 三维各自 normalize 到 [0,1]；recency = recency_decay**i（i=时序排名，decay=0.99）
# importance = node.poignancy；relevance = cos_sim(embedding, focal_point)
# 取 top-30
```

三处实质差异，按"可偷价值"排序：

1. **合成方式：乘积 vs 加权和。** 我方乘积意味着任一维趋零则整条记忆出局；斯坦福加权和允许"极高重要性"补偿"低相关性"。**这正是 `gw=[0.5,3,2]` 里 importance 权重高达 3 的意义** —— 他们刻意让创伤性记忆穿透相关性过滤。对应我方场景：`REL.expand.audit_hit = 0.2`（`engine2.js:162`），意味着企业一旦进入扩张语境，"被查过"这条记忆几乎召不回来 —— 而这恰恰是骗补决策最该记住的事。**值得做成 A/B 实验。**
2. **衰减基准：排名 vs 绝对时间。** 斯坦福按记忆在链表中的时序下标衰减，等价于"最近 N 条"而非"最近 N 期"；我方按 `t-m.t` 绝对期数。我方写法更适合半年一拍的粗粒度，**不建议改** —— 但要在 assumption-registry 里明确这是有意选择而非疏忽。
3. **相关性：embedding vs 查表。** `REL[ctx][type]` 是手写查表，零依赖、确定性、可解释；斯坦福用 `cos_sim`。**保持现状** —— 硬约束 2 的确定性要求下 embedding 不可接受。这一条是我方相对参考实现的**优势**，应当写进拷打答辩。

**若要动 `retrieve`**：三处任一改动都会改变基线轨迹 → 触发硬约束 4 重校准披露，须登记 `specs/assumption-registry.md` 并在 `specs/evidence.md` 更新实测值。
建议先做成 `policy.x` 式的**加法开关**（默认值 = 当前乘积式），而非直接替换。

---

## 读取建议（控制上下文）

- **单次会话最多进两个仓库。** generative_agents 有 21 万文件（绝大多数是 `storage/` 下的仿真日志），检索时务必 `-not -path '*/storage/*'`。
- 已在主表标出行号的文件，直接 `Read` 带 offset 即可，**不要 `find` 全仓**。
- `../references/` 不进本仓库、不进 git、不进 Claude Code 工作目录。

磁盘占用实测（`du -sh`，浅克隆后）：

| 仓库 | 占用 | 仓库 | 占用 |
|---|---|---|---|
| generative_agents | **1008M** | concordia | 13M |
| agentsociety | **458M** | ai-economist | 6.7M |
| oasis | 75M | abides-jpmc-public | 4.5M |
| — | — | mesa | 3.4M |
| — | — | ACL24-EconAgent | 3.3M |
| | | **合计** | **1.6G** |

两个大户（generative_agents + agentsociety）占掉 92%。其余六仓合计仅约 106M —— 日常检索优先落在这六个，进前两个务必带路径过滤。
