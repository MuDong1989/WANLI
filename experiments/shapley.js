/* 复现 evidence.md E5：政策组合的 Shapley 因素归因（t0 叠加于史实） */
var E=require(__dirname+'/../engine/engine2.js'), P=require(__dirname+'/../engine/policy-tree.js');
var OPS={S:['set','mfg_standard',2],F:['set','fine_boost',2],I:['set','local_inspect',1]}, keys=['S','F','I'];
var SEEDS=[42,7,101,2024,555,88,13,999,321,64];
function run(sub,seed){ var sim=new E.Sim(seed), a={};
  for(var t=0;t<20;t++){ if(P.AUTOPILOT_OPS[t])P.applyOps(a,P.AUTOPILOT_OPS[t]);
    if(t===0)sub.forEach(function(k){P.applyOps(a,[OPS[k]]);}); sim.step(P.compilePolicy(a)); }
  return sim.history[19]; }
var W={0:1/3,1:1/6,2:1/3}, phiSum={S:0,F:0,I:0}, totSum=0;
SEEDS.forEach(function(seed){
  var R={}; for(var m=0;m<8;m++){ var s=keys.filter(function(k,i){return m&(1<<i);}); R[s.slice().sort().join('')]=run(s,seed); }
  function v(a){return R[''].waste-R[a.slice().sort().join('')].waste;}
  keys.forEach(function(i){ var s=0;
    [[],['S'],['F'],['I'],['S','F'],['S','I'],['F','I']].forEach(function(S){
      if(S.indexOf(i)>=0)return; s+=W[S.length]*(v(S.concat([i]))-v(S)); }); phiSum[i]+=s; });
  totSum+=v(keys);
});
var n=SEEDS.length;
console.log('十种子平均 | 流失削减',(totSum/n).toFixed(1),'亿 | Shapley: 规范',(phiSum.S/n).toFixed(2),'处罚',(phiSum.F/n).toFixed(2),'巡查组',(phiSum.I/n).toFixed(2));
console.log('单种子归因可翻符号(种子42上规范=-5.0)——种子层敏感性不是可选项');
console.log('教训: 归因必须先指定反事实语义(叠加/分叉冻结/时点)——同一组合三种定义三个答案');
