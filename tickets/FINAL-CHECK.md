# FINAL-CHECK · 提交前终检（守门窗口退役交接品）

状态：**待认领**（提交前 90 分钟启动） ｜ 盒：1h ｜ 任何窗口可执行

> 退役声明：引擎/specs 守门窗口的职责自此完全文件化——冻结令=grill-report.md 附录 B，
> 门禁=`node engine/test2.js`，基线哈希验证=本文件第二关，增补规范=assumption-registry.md 文末维护规则。
> 执行本工单不需要任何会话记忆。

## 第一关 · 引擎体检

```bash
node engine/test2.js
```
验收：GR1-GR9 + GR-C 全绿，末行"全部通过"。随后六实验逐条跑（命令在 specs/evidence.md 各条目下）：
`node experiments/shapley.js`（E5）· `node experiments/relocation-ab.js`（E6b，确认"迁址t2生效=✓"）·
`node experiments/bailout-ab.js`（E7）· `node experiments/flip-probe.js`（E8）·
`node experiments/project-ledger.js`（E10）· `node experiments/dose-response.js`（E11）。

## 第二关 · 基线哈希中性验证（本命令首次落档，此前只在守门会话内）

```bash
node -e "var E=require('./engine/engine2.js'),c=require('crypto');var s=new E.Sim(E.CFG.seed);for(var t=0;t<20;t++)s.step(E.scriptPolicy(t));var strip=s.history.map(function(h){var o={};Object.keys(h).forEach(function(k){if(k!=='local')o[k]=h[k]});return o});console.log(c.createHash('sha256').update(JSON.stringify(strip)).digest('hex').slice(0,16))"
```
期望输出：`a52e1cc03acd102c`（与 evidence.md E1 的 T0 披露一致；剥除 `local` 字段是因为该字段为 T0 加法式新增）。
若不一致：引擎在 b922121 之后被动过且改变了基线轨迹——必须能在 evidence.md 找到对应重校准披露，否则**拒绝提交**，回滚到最近全绿 commit。

## 第三关 · demo 数字与话术核对

禁语清单（评审面前说了就被自己的注册表打脸）：
- ❌"核查拉满清零"——树内顶格 80 仍余 C 区尾部 [A23/E11]；改说"A/B 清零、C 残留，清零须巡查组"。
- ❌"群演是骗补主力"（金额歧义）——群演占次数 ~96%，金额 80% 在小盛 [A20]；改说"骗补面主力"。
- ❌"干预剧本财政更好"——1369 vs 960 是支出口径，且干预臂 Cf 2.7 劣于基线 2.42 [E3 口径注记]。
- ❌ 流失金额的单调性——剂量曲线金额非单调（55 档 7.3 < 70 档 11.8），话术只用覆盖域口径 [E11]。

王牌台词核对（现场引擎实跑，命令在 evidence.md E4 尾部）：江西财政席二十期全程 −1、救助 t4/t6 两次照发——"软预算约束的政治经济学，一张决策卡讲完"。

## 第四关 · 打包与兜底

```bash
node demos/build/build-arena-v2.js
```
验收：特征校验通过、出包成功；浏览器开 demos/wanli-arena-v2.html 自动驾驶 20 期不报错。
然后：完整 demo 录屏一遍存双备份（本机+手机/云）；`git tag submission && git log --oneline -1` 打提交锚点。

## 验收栏（执行窗口填写）

- 第一关输出：
- 第二关哈希：
- 第三关核对人：
- 第四关出包+录屏+tag：
