# T-F3 · 事件流列 + 点击跳转时间线

状态：**进行中·build CC**（移交记录：A 线窗口已撤编——用户 2026-08-13 三窗整编，归属改 **build CC**，总指挥裁定）
盒：1.5h ｜ 起点：commit b922121 ｜ 前置：T-F1 打包管线可用 ｜ **优先级：次高——T-F2 完工后立即接续**

## 目标
step() 返回的 ev 流成右侧滚动列（按 type 过滤 chips），点击任一事件跳转时间线对应期。

## 可动文件白名单
- `demos/build/arena-v2-shell.html`（app 层）；重打包命令 `node demos/build/build-arena-v2.js`

## 施工要点
- 数据源：`sim.step(...)` 返回 `{ev:[{t,type,msg}]}`；type 全集=market/region/firm/fraud/media/wave/policy（engine2.js 各 ev.push 处）。
- 布局遵循 frontend-layout-spec 的"右二整列：事件流"分区（arena-v2-shell 内已有注释锚 `—— 右二整列：事件流 ——`）。

## 验收
1. 重打包后 20 期事件全量入列，chips 过滤生效，点击跳期正确。
2. `node engine/test2.js` 全绿。
