/* ============================================================
   万历 · wanli-arena-v2.html 组装脚本（T-F1 交付资产）
   ------------------------------------------------------------
   作用：把 engine/ 下的现役源码逐字打包进单文件演示件。
   打包顺序固定为 frontend-layout-spec.md §3：
     geodecode → CHINA_GEO → engine2 → ENGINE bridge → policy-tree → app
   壳文件 arena-v2-shell.html 里的四个占位符按此序被替换：
     /*__GEODECODE__* /  /*__CHINA_GEO__* /  /*__ENGINE2__* /  /*__POLICYTREE__* /
   （ENGINE bridge 与 app 常驻壳内，不来自 engine/。）

   特征校验拒包机制：任一特征缺失即抛错终止，防止误打包旧引擎快照
   （demos/wanli-arena.html v1 的内嵌引擎即为已过期快照，是本机制的由来）。

   用法：
     node demos/build/build-arena-v2.js            # 覆写 demos/wanli-arena-v2.html
     node demos/build/build-arena-v2.js <输出路径>  # 输出到别处（用于比对，不动交付件）
   前置：只读 engine/ 五文件，绝不写入 engine/ 与 specs/。
   ============================================================ */
var fs = require('fs'), path = require('path');

var ROOT = path.resolve(__dirname, '../..');            // 仓库根
var SHELL = path.join(__dirname, 'arena-v2-shell.html');
var OUT = process.argv[2] || path.join(ROOT, 'demos/wanli-arena-v2.html');
var OUT_JS = OUT.replace(/\.html$/i, '.js');
var OUT_THREE = path.join(path.dirname(OUT), 'three-r128.min.js');

function rd(p) { return fs.readFileSync(path.join(ROOT, p), 'utf8'); }
var geo   = rd('engine/geodecode.js');
var china = rd('engine/china.json').trim();
var eng   = rd('engine/engine2.js');
var tree  = rd('engine/policy-tree.js');

/* —— 现役引擎特征校验（不过即拒包）—— */
[['engine2 D0=6.10（扩容重校准后基线）', /D0:\s*6\.10/,                 eng],
 ['engine2 8 名角（国资型 guojing）',      /guojing/,                    eng],
 ['engine2 省内阁票决',                    /cabinetTick/,                eng],
 ['engine2 企业控制钩子 step(policy,ctrl)',/step=function\(policy,ctrl\)/, eng],
 ['engine2 迁址冷却',                      /moveCoolRounds/,             eng],
 ['engine2 承诺-兑现台账',                 /ledgerAdd/,                  eng],
 ['policy-tree 史实自动驾驶节点化',        /AUTOPILOT_OPS/,              tree]
].forEach(function (c) {
  if (!c[1].test(c[2])) throw new Error('引擎特征校验失败，拒绝出包: ' + c[0]);
});

var shell = fs.readFileSync(SHELL, 'utf8');
function put(token, text) {                              // 用 indexOf/slice，避开 $& 等替换转义
  var i = shell.indexOf(token);
  if (i < 0) throw new Error('壳文件缺少占位符 ' + token);
  shell = shell.slice(0, i) + text + shell.slice(i + token.length);
}
put('/*__GEODECODE__*/',  geo);
put('/*__CHINA_GEO__*/',  'var CHINA_GEO=' + china + ';');
put('/*__ENGINE2__*/',    eng);
put('/*__POLICYTREE__*/', tree);

/* 发布件使用外部脚本。部分安全预览器会删除 <script> 标签但错误保留其文本；
   单文件内联时，这会把完整引擎源码直接排进页面。拆分后即使脚本被禁用，
   HTML 也只呈现静态界面，不会泄漏代码文本。壳仍保留内联源码，便于维护。 */
var inlineRe = /<script>\s*([\s\S]*?)<\/script>\s*<\/body>/i;
var match = shell.match(inlineRe);
if (!match) throw new Error('壳文件缺少主程序内联脚本，无法拆分发布件');
var app = match[1].replace(/^\s+|\s+$/g, '') + '\n';
shell = shell.replace(inlineRe, '<script src="./' + path.basename(OUT_JS) + '"></script>\n</body>');

fs.writeFileSync(OUT, shell);
fs.writeFileSync(OUT_JS, app);
fs.copyFileSync(path.join(ROOT, 'pitch/vendor/three-r128.min.js'), OUT_THREE);
console.log('written:', OUT, (shell.length / 1024).toFixed(0) + 'KB');
console.log('written:', OUT_JS, (app.length / 1024).toFixed(0) + 'KB');
console.log('copied:', OUT_THREE);
console.log('policy nodes packed:', (tree.match(/\{id:'/g) || []).length);
