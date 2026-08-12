/* 复现 evidence.md E7：软预算约束——救助续命不改命 */
var E=require(__dirname+'/../engine/engine2.js'), P=require(__dirname+'/../engine/policy-tree.js');
function run(off){ var sim=new E.Sim(E.CFG.seed), a={}, death=null, saved=0;
  if(off) sim.provs.find(function(p){return p.id==='JX';}).rescues=2;
  for(var t=0;t<20;t++){ P.applyOps(a,P.AUTOPILOT_OPS[t]);
    sim.step(P.compilePolicy(a)).ev.forEach(function(e){
      if(e.msg.indexOf('维赛')>=0&&e.msg.indexOf('破产')>=0)death=sim.yearLabel(e.t);
      if(e.msg.indexOf('起死回生')>=0)saved++; }); }
  return {death:death,saved:saved}; }
var A=run(false), B=run(true);
console.log('有软预算约束: 救助',A.saved,'次, 破产于',A.death,'| 无救助: 破产于',B.death,'→ 买了时间没改结局');
