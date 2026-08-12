var E=require('./engine2.js');

function run(name, policyFn, quiet){
  if(!quiet) console.log('==== '+name+' ====');
  var s=new E.Sim(E.CFG.seed);
  while(s.t<E.CFG.rounds){
    var res=s.step(policyFn(s.t));
    if(!quiet){
      res.ev.forEach(function(e){ console.log('   » ['+s.yearLabel(e.t)+'] '+e.msg); });
      var h=s.history[s.history.length-1];
      console.log('t'+String(h.t).padStart(2)+' '+s.yearLabel(h.t)+
        ' P='+h.P.toFixed(1)+' Cf='+h.Cf.toFixed(1)+
        ' D='+h.D.toFixed(1)+' S='+h.S.toFixed(1)+' r='+(h.D/h.S).toFixed(2)+
        ' 名角='+h.alive+' 长尾='+h.exAlive+'(-'+h.exDeaths+')'+
        ' 财政='+h.fiscalTotal.toFixed(0)+' 流失='+h.waste.toFixed(0)+
        ' 份额A/B/C='+h.shares.map(function(x){return (x*100).toFixed(0);}).join('/'));
    }
  }
  if(!quiet) s.firms.forEach(function(f){
    console.log('   '+f.name+': '+(f.alive?'存活':(f.dead==='exit'?'退出':'破产'))+
      ' K='+f.K.toFixed(2)+' cash='+f.cash.toFixed(0)+' f='+f.f.toFixed(2)+' 区='+E.REGIONS[f.home].name);
  });
  return s;
}

var base=run('史实基线', E.scriptPolicy);
console.log('');
var itv=run('干预剧本(度电60+核查70,2009起)', function(t){
  if(t<18) return {mode:'generation',intensity:60,audit:70};
  return {mode:'generation',intensity:15,audit:70};
});

/* ---- 黄金回归 GR1-GR9 ---- */
console.log('\n==== 黄金回归 ====');
function deathRound(sim,id){ var f=sim.firms.find(function(x){return x.id===id;});
  return f.deadT!==undefined? f.deadT : -1; }
var ty=deathRound(base,'tianyang');
var hg=deathRound(base,'hanguang');
var hb=base.history, he=itv.history;
var last=hb[hb.length-1], lastI=he[he.length-1];
function gr(id,pass,detail){ console.log((pass?'✓':'✗')+' '+id+' '+detail); return pass?0:1; }
var fails=0;
fails+=gr('GR1 天阳破产∈[t7,t9]', ty>=7&&ty<=9, '实际 t'+ty+' ('+base.yearLabel(ty)+')');
fails+=gr('GR2 汉光破产∈[t5,t9]', hg>=5&&hg<=9, '实际 t'+hg);
var fraudEarlyN=hb.filter(function(h){return h.t<8;}).reduce(function(a,h){return a+h.fraudRegion.reduce(function(x,y){return x+y;},0);},0);
var fraudLateN=hb.filter(function(h){return h.t>=8;}).reduce(function(a,h){return a+h.fraudRegion.reduce(function(x,y){return x+y;},0);},0);
fails+=gr('GR3 骗补双侧:装机期>0且度电期=0', fraudEarlyN>0&&fraudLateN===0, '装机期'+fraudEarlyN+'起/度电期'+fraudLateN+'起');
fails+=gr('GR4 终局Cf∈[1.8,3.2]', last.Cf>=1.8&&last.Cf<=3.2, 'Cf='+last.Cf.toFixed(2));
var crash=hb.some(function(h){return h.t>=7&&h.t<=10&&h.P<h.Cf;});
fails+=gr('GR5 崩盘期存在P<Cf', crash, '');
var rLate=hb.filter(function(h){return h.t>=12;}).map(function(h){return h.D/h.S;});
var rAvg=rLate.reduce(function(a,b){return a+b;},0)/rLate.length;
fails+=gr('GR6 复苏期r均值∈[0.85,1.25]', rAvg>=0.85&&rAvg<=1.25, 'r̄='+rAvg.toFixed(2));
fails+=gr('GR7 干预:流失≈0且财政>基线', lastI.waste<3 && lastI.fiscalTotal>last.fiscalTotal,
  '流失'+lastI.waste.toFixed(0)+' 财政'+lastI.fiscalTotal.toFixed(0)+' vs 基线'+last.fiscalTotal.toFixed(0));
var waveDeaths=hb.filter(function(h){return h.t>=6&&h.t<=11;}).reduce(function(a,h){return a+h.exDeaths;},0);
var peak=Math.max.apply(null,hb.map(function(h){return h.exDeaths;}));
fails+=gr('GR8 长尾死亡潮:t6-11累计≥50且峰值≥10', waveDeaths>=50&&peak>=10, '累计'+waveDeaths+' 峰值'+peak);
var s1=new E.Sim(E.CFG.seed), s2=new E.Sim(E.CFG.seed);
while(s1.t<E.CFG.rounds){ s1.step(E.scriptPolicy(s1.t)); s2.step(E.scriptPolicy(s2.t)); }
var same=JSON.stringify(s1.history)===JSON.stringify(s2.history)
      && JSON.stringify(s1.firms)===JSON.stringify(s2.firms);
fails+=gr('GR9 双宇宙同政策逐位一致(全史+全主体深比对)', same, '');
/* 编译器深断言(E2/A25):史实剧本节点化编译 = 裸三元组,逐期逐字段;x 通道须为空 */
var P=require('./policy-tree.js'), aC={}, okC=true, whyC='';
for(var tc=0;tc<E.CFG.rounds;tc++){
  P.applyOps(aC,P.AUTOPILOT_OPS[tc]);
  var pc=P.compilePolicy(aC), ps=E.scriptPolicy(tc);
  if(pc.mode!==ps.mode||pc.intensity!==ps.intensity||pc.audit!==ps.audit||Object.keys(pc.x).length!==0){
    okC=false; whyC='t'+tc+' 编译'+JSON.stringify(pc)+' ≠ 剧本'+JSON.stringify(ps); break; }
}
fails+=gr('GR-C compilePolicy深断言(剧本逐期等价+x空)', okC, whyC);
/* 委托代理演示(标签修正):装机补贴期核查提至70(其余照史实)→骗补应仅剩执行折扣最深的C区
   (旧版此行误用干预剧本[度电全程,骗补无从发生=0/0/0]配"期望集中于C"标签,标签与臂错配) */
var pa=run('', function(t){ return t<8? {mode:'capacity',intensity:60,audit:70} : E.scriptPolicy(t); }, true);
var paF=[0,0,0];
pa.history.forEach(function(h){ if(h.t<8) for(var j=0;j<3;j++) paF[j]+=h.fraudRegion[j]; });
console.log('· 委托代理演示(装机期核查70) 骗补 A/B/C = '+paF.join('/')+' (期望集中于C='+(paF[0]===0&&paF[1]===0&&paF[2]>0?'✓':'✗')+')');
console.log(fails===0? '\n全部通过' : '\n未通过 '+fails+' 项');
