# T-F2 · 省内阁五段卡 + 省域分化

状态：**待认领**（移交记录：A 线窗口已撤编——用户 2026-08-13 三窗整编为守门/顾问/build CC，归属改 **build CC**，总指挥裁定）
盒：2h ｜ 起点：commit b922121 ｜ 前置：T-F1 打包管线可用（demos/build/build-arena-v2.js）｜ **优先级：最高——demo 主干，即认领即开工**

## 目标
四名角省的内阁决策卡进入 UI（观测/席位立场/票决式/行动四栏），省域按执行折扣分化着色。

## 可动文件白名单
- `demos/build/arena-v2-shell.html`（app 层）；重打包命令 `node demos/build/build-arena-v2.js`

## 施工要点
- 数据源：`sim.provs[i].lastCard`，字段 `{t, observed[4], seats[{s,v}×3], rule, act}`（engine2.js:219-222）；provs 序=JS/JX/HB/LN。
- 王牌素材：江西财政席二十期全程 −1 而救助两次照发（台词见 grill-report 桶①2；一行复现命令在 evidence.md E4 尾部）。
- 着色键：`prov.disc`（动态票决值，不是 REGIONS 静态值）。

## 验收
1. 重打包后浏览器跑 20 期，四省卡逐期刷新，救助文案出现在 t4/t6 江西卡尾。
2. `node engine/test2.js` 全绿（壳层改动不触引擎）。
