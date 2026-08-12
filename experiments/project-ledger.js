/* 复现 evidence.md E10：项目生命周期台账=引擎状态流的免费投影(引擎无Project类) */
var E=require(__dirname+'/../engine/engine2.js'), P=require(__dirname+'/../engine/policy-tree.js');
var sim=new E.Sim(E.CFG.seed), a={}, projs=[], ghosts={caught:0,free:0}, building={}, entries=0, exits=0, d0=0;
for(var t=0;t<20;t++){
  if(P.AUTOPILOT_OPS[t])P.applyOps(a,P.AUTOPILOT_OPS[t]);
  var n0=sim.ex.K.length, res=sim.step(P.compilePolicy(a));
  Object.keys(building).forEach(function(id){ var f=sim.firms.find(function(x){return x.id===id;});
    var p=building[id]; p.t2=t; p.status=f.alive?'投产':'投产即出局'; projs.push(p); delete building[id]; });
  sim.firms.forEach(function(f){
    if(f.alive&&f.pending>0.15) building[f.id]={firm:f.name,size:f.pending.toFixed(2),region:sim.regions[f.home].name,t1:t};
    if(f.alive&&f.lastCard&&f.lastCard.t===t&&/虚报/.test(f.lastCard.act)){
      ghosts[res.ev.some(function(e){return e.type==='fraud'&&e.msg.indexOf(f.name)>=0;})?'caught':'free']++; } });
  entries+=sim.ex.K.length-n0; exits+=sim.exDeadCum-d0; d0=sim.exDeadCum;
}
console.log('实体项目',projs.length,'| 幽灵项目',ghosts.caught+ghosts.free,'(查实',ghosts.caught,') | 新设',entries,'| 出清',exits);
projs.slice(0,3).forEach(function(p){console.log(' ',p.firm,sim.yearLabel(p.t1),'立项',p.size+'GW@'+p.region,'→',sim.yearLabel(p.t2),p.status);});
