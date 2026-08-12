/* 复现 evidence.md E6b：迁址期权定价(企业镜头, 地方配套=1.0场景开关) + 承诺-兑现台账
   E6b 重做注记(2026-08-13): 原版迁址指令在 t8 发出, 但诚实小盛 t8 前已破产, move 从未生效,
   两臂逐位相同(E6 作废注记/grill-report 探针A)。重做: 迁址提前至 t2(小盛存活期)。 */
var E=require(__dirname+'/../engine/engine2.js'), P=require(__dirname+'/../engine/policy-tree.js');
E.CFG.localMatchK=1.0;
function play(mv){ var sim=new E.Sim(E.CFG.seed), a={}, moved=false;
  for(var t=0;t<20;t++){ P.applyOps(a,P.AUTOPILOT_OPS[t]);
    var f=sim.firms.find(function(x){return x.id==='xiaosheng';}), c=null;
    if(f&&f.alive){ var hh=sim.history[sim.history.length-1], mg=hh?hh.P-sim.frontier*f.f:1;
      c={xiaosheng:{rd:f.cash>25&&mg>0.5, dK:(mg>0.8&&f.cash>15)?0.15:0, fake:0}}; if(mv&&t===2)c.xiaosheng.move=0; }
    sim.step(P.compilePolicy(a),c).ev.forEach(function(e){ if(/迁址：/.test(e.msg)&&e.msg.indexOf('小盛')>=0) moved=true; }); }
  sim._moved=moved; return sim; }
var S=play(false), M=play(true);
function w(s){return s.firms.find(function(x){return x.id==='xiaosheng';});}
console.log('E6b(迁址t2生效='+(M._moved?'✓':'✗ 未生效,结果无意义')+')');
console.log('诚实小盛: 留守终局现金',w(S).cash.toFixed(1),'(存活='+w(S).alive+')','| 迁沿海终局现金',w(M).cash.toFixed(1),'(存活='+w(M).alive+')','| 差值',(w(M).cash-w(S).cash).toFixed(1),'亿');
S.credLedger.forEach(function(L,j){console.log(' ',['沿海','中部','东北'][j],'承诺',L.prom.toFixed(1),'实付',L.paid.toFixed(1),'兑现率',(100*L.paid/L.prom).toFixed(0)+'%');});
/* 机制自检: 稳达 t2 强制迁址(中部→沿海) */
var sim2=new E.Sim(E.CFG.seed), a2={}, evt=null;
for(var t=0;t<4;t++){ P.applyOps(a2,P.AUTOPILOT_OPS[t]);
  var c2=(t===2)?{daigong:{rd:false,dK:0,fake:0,move:0}}:null;
  sim2.step(P.compilePolicy(a2),c2).ev.forEach(function(e){ if(e.msg.indexOf('迁址')>=0)evt=e.msg; });
}
var fd=sim2.firms.find(function(x){return x.id==='daigong';});
console.log('机制自检:', evt?('✓ '+evt):'✗ 未触发', '| 现厂址', sim2.regions[fd.home].name);
