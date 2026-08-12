/* 复现 evidence.md E11：核查力度剂量反应（out-of-fit 反事实的实测支撑, v3.1 §9②）
   装机时代(t<8)核查力度扫描, t≥8 按史实剧本走; 其余一切同基线, 种子=CFG.seed。
   树内可达域注记: 政策树 audit 节点顶格 Lv3=80(A23), audit=100 仅裸三元组可达。 */
var E=require(__dirname+'/../engine/engine2.js');
console.log('audit  骗补A/B/C      流失(亿)  备注');
[20,45,55,70,80,100].forEach(function(A){
  var s=new E.Sim(E.CFG.seed);
  for(var t=0;t<20;t++){
    var pol = t<8 ? {mode:'capacity',intensity:60,audit:A} : E.scriptPolicy(t);
    s.step(pol);
  }
  var fr=[0,0,0];
  s.history.forEach(function(h){ for(var j=0;j<3;j++) fr[j]+=h.fraudRegion[j]; });
  var note = A===20?'史实基线值' : A===80?'政策树顶格(Lv3)' : A===100?'仅裸三元组可达,树内玩家不可达' : '';
  console.log(String(A).padStart(5)+'  '+fr.join('/').padEnd(12)+'  '+s.fiscal.waste.toFixed(1).padStart(7)+'  '+note);
});
console.log('\n结论: 骗补覆盖域单调收缩(核查升高→A、B、C依次清零), 树内顶格80仍余C区尾部(清零须巡查组discountMul通道);');
console.log('注意: 流失金额非单调(55档7.3亿<70档11.8亿——共流位移+查获罚没交互), 演示话术用"覆盖域"口径, 勿用金额口径。见 A23/E11。');
