/* 复现 evidence.md E8：决策翻转因子探针（观测扰动+记忆植入） */
var E=require(__dirname+'/../engine/engine2.js'), P=require(__dirname+'/../engine/policy-tree.js');
function mb(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
var sim=new E.Sim(E.CFG.seed), a={};
for(var t=0;t<2;t++){ P.applyOps(a,P.AUTOPILOT_OPS[t]); sim.step(P.compilePolicy(a)); }
var f=sim.firms.find(function(x){return x.id==='xiaosheng';}), h=sim.history[1];
function obs(eA){ var cap=E.CFG.capexK*sim.frontier;
  return {t:2,P:h.P,Cf:sim.frontier,C:sim.frontier*f.f,margin:h.P-sim.frontier*f.f,r:h.D/h.S,
    policy:{mode:'capacity',intensity:60,audit:20},capex:cap,capSubPerGW:0.6*E.CFG.capSubShare*cap,avgMargin:h.P-sim.frontier,effA:eA}; }
var flip=-1; for(var x=0;x<=100;x++) if((E.ARCH.fraud(Object.assign({},f),obs(x),mb(7)).fake||0)>0) flip=x;
console.log('观测扰动: 实核≤'+flip+'虚报, ≥'+(flip+1)+'收手 → 翻转因子=实核'+(flip+1));
var f2=Object.assign({},f); f2.mems=(f.mems||[]).concat([{type:'audit_hit',t:1,text:'probe'}]);
var any=false; for(x=0;x<=100;x++) if((E.ARCH.fraud(f2,obs(x),mb(7)).fake||0)>0) any=true;
console.log('记忆植入: 两期内被查记忆 → 全域收手('+!any+') → 该决策主导层是记忆非观测');
