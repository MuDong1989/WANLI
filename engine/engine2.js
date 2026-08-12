/* ============================================================
   万历 · Ceteris 引擎 v2.1-lite —— 光伏 2009-2018
   纯逻辑层，零渲染依赖。v1 三轮校准内核 + 三大新层：
   ① 区域制度层：有效核查 = 中央核查×(1-地方执行折扣)，换届事件，选址函数
   ② 群演长尾：~200家规则驱动小厂（幂律规模、政策塑形的进入、破产潮）
   ③ 名角记忆流 + 五段决策卡 basis + 激进者粘性计划（组织惯性）
   完整版：ARCH 决策函数换 LLM，输入 obs/mems、输出 JSON 契约不变。
   ============================================================ */

function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

var CFG = {
  seed: 42,
  rounds: 20,
  D0: 6.10,               // 初始需求(GW/半年)。含群演供给后重校准
  demandGrowth: 0.14, growthDecay: 0.976,
  shockRound: 7, shockFactor: 0.58,
  C0: 12.0,
  frontierDrift: 0.022, frontierRnD: 0.10,
  priceA: 0.50, priceB: 0.72, priceExp: 1.25, rMax: 1.6,
  capexK: 2.5,
  capSubShare: 0.6, genSubK: 8,
  demandBoostGen: 0.5, demandBoostCap: 0.15,
  fakeCostShare: 0.15, fineMult: 1.5, catchK: 0.85, mediaProb: 0.30,
  rdCost: 4, rdGain: 0.94, fMin: 0.72,
  opexBase: 1.5, opexPerGW: 1.2,
  dKMax: 0.9, cashUse: 0.6, weightExp: 1.3,
  divThresh: 120, divRate: 0.24,
  scale: 10,
  // —— 群演长尾 ——
  exN0: 200, exKmin: 0.0018, exAlpha: 1.15, exKcap: 0.04,
  exOpexBase: 0.08, exOpexPerGW: 1.2,
  entryCap: 6, entryPerMargin: 3, entryMarginFloor: 0.8,
  // —— 换届 ——
  turnoverRound: 5, turnoverRegion: 2, turnoverCred: 0.22
};

/* 三个风格化区域：沿海 / 中部 / 东北 */
CFG.localMatchK=0; CFG.moveCostK=0.35; CFG.moveCoolRounds=4; CFG.moveDownMul=0.5;
var REGIONS = [
  {id:'A', name:'沿海', incentive:0.12, cred:0.85, disc:0.10, cost:0.15, css:'#4dd0c4'},
  {id:'B', name:'中部', incentive:0.20, cred:0.70, disc:0.25, cost:0.08, css:'#d4b45a'},
  {id:'C', name:'东北', incentive:0.30, cred:0.45, disc:0.45, cost:0.05, css:'#7f96c4'}
];
var PROVS=[
  {id:'JS',name:'江苏',band:0,selfFin:0.90},
  {id:'JX',name:'江西',band:1,selfFin:0.45},
  {id:'HB',name:'河北',band:1,selfFin:0.50},
  {id:'LN',name:'辽宁',band:2,selfFin:0.40}
];
var CABW={JS:{zs:0.6,cz:0.5,jg:1.0}, JX:{zs:1.2,cz:0.6,jg:0.6}, HB:{zs:1.0,cz:0.6,jg:0.7}, LN:{zs:1.3,cz:0.8,jg:0.8}};

var FIRMS = [
  {id:'longsheng', name:'隆盛科技', emoji:'🔬', arch:'tech',   K:1.1,  cash:70, f:0.93, lev:0.9, home:1, css:'#2dd4a7', color:0x2dd4a7, desc:'技术长期主义者。不追产能排名，只追每瓦成本。（原型：隆基）'},
  {id:'tianyang',  name:'天阳能源', emoji:'🏗️', arch:'aggr',   K:1.4,  cash:60, f:1.00, lev:2.2, home:0, prov:'JS', css:'#f59e0b', color:0xf59e0b, desc:'激进扩张者。产能就是话语权，敢加杠杆。（原型：尚德）'},
  {id:'hanguang',  name:'汉光集团', emoji:'🎤', arch:'story',  K:0.8,  cash:62, f:1.10, lev:1.6, home:0, css:'#60a5fa', color:0x60a5fa, desc:'资本故事家。产能规划即市值管理。'},
  {id:'kuajie',    name:'跨界新能', emoji:'🪂', arch:'chaser', K:0.0,  cash:35, f:1.08, lev:1.2, home:1, css:'#e879a0', color:0xe879a0, desc:'跨界追风口者。别人赚钱它眼红，行情一冷跑最快。'},
  {id:'xiaosheng', name:'小盛作坊', emoji:'🎭', arch:'fraud',  K:0.25, cash:15, f:1.20, lev:1.0, home:2, prov:'LN', css:'#ef5350', color:0xef5350, desc:'骗补投机者。选址在监管最松的地方，研究政策文件比研究技术上心。'},
  {id:'daigong',   name:'稳达代工', emoji:'📦', arch:'oem',    K:0.6,  cash:45, f:1.02, lev:0.8, home:1, css:'#94a3b8', color:0x94a3b8, desc:'观望代工厂。现金为王，永远慢半拍，也因此摔得轻。'},
  {id:'weisai',    name:'维赛新能', emoji:'🧲', arch:'bound',  K:0.22, cash:9,  f:1.06, lev:1.9, home:1, prov:'JX', css:'#b45309', color:0xb45309, desc:'政企绑定的地方明星。省里的名片工程，大到不能倒——至少省里这么认为。（原型：赛维）'},
  {id:'guojing',   name:'国晶新能', emoji:'🏢', arch:'soe',    K:0.20, cash:24, f:1.03, lev:0.9, home:0, css:'#7c8ee8', color:0x7c8ee8, desc:'国资背景稳健派。融资便宜、使命在肩，行业越冷越要顶上。（原型：中环）'}
];

function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }
var MODE_CN={capacity:'装机补贴',generation:'度电补贴',none:'停止补贴'};

/* ---------- skill 卡：六种决策逻辑（完整版换 LLM，契约不变） ----------
   输出 {dK, rd, fake, note 独白, rule 依据}。fraud 的核查观测用本地有效核查 effA。 */
var ARCH = {
  tech: function(f,o,rng){
    var d={rd:f.cash>15, dK:0, fake:0};
    if(o.margin>0.3 && o.r>0.8 && f.cash>o.capex*0.3) d.dK=0.18*Math.max(f.K,0.6);
    if(d.dK>0){ d.rule='人设:研发优先,顺周期小步扩产'; d.note=pick(rng,['补贴会退坡，成本不会说谎——扩一点，研发不停。','单晶降本曲线还在陡峭段，加码研发。']); }
    else if(o.margin<0){ d.rule='性格招式:margin<0 仍研发不停(rnd=0.9)'; d.note=pick(rng,['价格已击穿同行成本线。我们的任务是活到黎明。','行业出清正是拉开身位的时候，研发照旧。']); }
    else { d.rule='人设:不追排名,守成本曲线'; d.note='不追产能排名，只追每瓦成本。'; }
    return d;
  },
  aggr: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    if(f.lossStreak>=4 || f.cash<o.capex*0.4){ d.rule='紧急刹车:弹尽粮绝(现金<0.4×capex)'; d.note=pick(rng,['弹尽粮绝，停止一切扩张……银行开始抽贷了。','当初是不是冲得太快了。']); return d; }
    if(f.lossStreak>=2){ d.dK=0.15*f.K; d.rule='性格招式:逆势加码(risk=0.9,连亏≥2)'; d.note=pick(rng,['行业越冷越要扩，把对手熬死，剩者为王！','现在收缩就前功尽弃，逆势抄底加码！']); return d; }
    var juiced = o.policy.mode==='capacity' && o.policy.intensity>30;
    d.dK = (juiced?0.42 : o.margin>0.5?0.28 : 0.12) * Math.max(f.K,0.8);
    var grief=f.mems&&f.mems.some(function(m){return m.type==='peer_bankrupt'&&o.t-m.t<=1;});
    if(grief){ d.dK*=0.65; }
    if(juiced){ d.rule='人设:补贴返现→扩产ROI跳升(expand=0.95)'; d.note=pick(rng,['补贴覆盖三成资本开支，此时不上产能更待何时？贷款，扩！','各地政府排着队送地送厂房，产能干到全球第一再说。']); }
    else { d.rule='人设:顺周期扩张'; d.note=o.margin>0.5?'需求还在涨，继续加码。':'市况一般，小步扩张占个位。'; }
    if(grief){ d.rule+=' ×记忆:同行刚倒下→减速(兔死狐悲)'; d.note='刚看着同行倒下，这一单，缓一缓。'; }
    return d;
  },
  story: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    if(o.policy.mode!=='none' && f.cash>o.capex*0.3 && f.lossStreak<2){
      d.dK=0.28*Math.max(f.K,0.7); d.rule='人设:产能即市值(herd=0.8)';
      d.note=pick(rng,['产能规划就是市值管理，发布会先开起来。','讲一个千亿营收的故事，资本市场会买单的。']);
    } else { d.rule='人设:故事失灵则收缩'; d.note='故事讲不动了，先收一收。'; }
    return d;
  },
  chaser: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    if(!f.entered){
      if(o.avgMargin>1.6 && o.policy.mode!=='none'){ f.entered=true; d.dK=0.35; d.rule='性格招式:入场(herd=0.95,行业毛利>1.6)';
        d.note='隔壁做服装的都杀进光伏了，我们不能踏空这波风口！'; }
      else { d.rule='人设:场外观望'; d.note='再看看，风口还没起来。'; }
      return d;
    }
    if(o.margin>0.8 && f.cash>o.capex*0.3){ d.dK=0.25*Math.max(f.K,0.3); d.rule='人设:追风加码'; d.note='风口正劲，追加投入。'; }
    else { d.rule='人设:风口冷却,焦虑观望'; d.note=pick(rng,['利润没想象中好，有点慌……','早知道不凑这个热闹了。']); }
    return d;
  },
  bound: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    var subOn = o.policy.mode!=='none' && o.policy.intensity>=30;
    if(subOn && f.cash>o.capex*0.25){
      d.dK=Math.min(0.32, 0.16+0.14*o.policy.intensity/100);
      d.rule='政企绑定:政策风口+隐性担保→产能即政绩';
      d.note='省里要的是全国前十的名片，银行的授信函就在抽屉里——扩！';
    } else if(o.margin>0.6 && f.cash>o.capex*0.3){
      d.dK=0.20; d.rule='政企绑定:有毛利即扩,预算约束是软的';
      d.note='亏了有人兜，赚了是政绩，这买卖怎么算都该做大。';
    } else { d.rule='政企绑定:现金见底,等省里协调'; d.note='账上快没钱了……该给园区管委会打电话了。'; }
    return d;
  },
  soe: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    if(o.r<0.85 && f.cash>o.capex*0.6){
      d.dK=0.18; d.rule='国资使命:逆周期托底(供需比'+o.r.toFixed(2)+')';
      d.note='民企在撤，行业不能垮——这个时候进场，既是使命也是便宜。';
    } else if(o.margin>1.2 && f.cash>o.capex*0.5){
      d.dK=0.16; d.rd=f.cash>40; d.rule='国资稳健:顺周期跟进+技改';
      d.note='不抢头名，跟住大盘，把技改做扎实。';
    } else { d.rd=f.cash>50; d.rule='国资稳健:守仓观望'; d.note='等一等，看清楚再动。'; }
    return d;
  },
  fraud: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    var burned=f.mems&&f.mems.some(function(m){return m.type==='audit_hit'&&o.t-m.t<=2;});
    if(o.policy.mode==='capacity'){
      if(burned){ d.rule='记忆:两期内有被查处记录→蛰伏(一朝被蛇咬)'; d.note='上次的罚单还热着，这阵子收手，等风头过去。'; }
      else if(o.effA<55){
        d.fake = 0.25 + 0.30*(55-o.effA)/55; d.rule='人设:装机付钱+本地实核'+o.effA.toFixed(0)+'<55→造假EV为正(integrity=0.05)';
        d.note = pick(rng,['装机就给钱，验收的人又不会上屋顶数板子。','板子朝哪边不重要，验收单好看就行。','这地方管得松，再立几个"电站"，补贴到账比卖电快多了。']);
      } else { d.rule='性格招式:蛰伏(本地实核'+o.effA.toFixed(0)+'≥55)'; d.note='风声太紧，先蛰伏，等核查松了再干。'; }
    } else if(o.policy.mode==='generation'){
      d.rule='机制:度电结算→假电站发不出电,造假EV≤0';
      d.note='按发电量结算？假电站发不出一度电，这生意没法做了。';
      if(o.margin>1 && f.cash>o.capex*0.2){ d.dK=0.1; d.note+='要不……真干点？'; }
    } else { d.rule='人设:无利可图'; d.note='没补贴，收摊观望。'; }
    return d;
  },
  oem: function(f,o,rng){
    var d={rd:false,dK:0,fake:0};
    if(o.margin>1.2 && o.r>0.95 && f.cash>o.capex*0.25){ d.dK=0.15*f.K; d.rule='人设:订单确定才扩(patience=0.9)'; d.note='订单排满了，谨慎加一条产线。'; }
    else if(o.margin<0.3 && f.cash>25){ d.rd=true; d.rule='人设:利润受压→设备升级求生'; d.note='利润薄得像纸，升级设备降本求生。'; }
    else { d.rule='人设:现金为王,观望'; d.note=pick(rng,['现金为王，等价格企稳再说。','看天阳他们冲，我们跟在后面捡稳单。']); }
    return d;
  }
};

/* 记忆检索的情境相关矩阵（斯坦福小镇三要素的极简版：显著性×时近×相关） */
var REL = {
  expand: {policy_change:0.9, windfall:0.7, peer_bankrupt:0.5, loss:0.6, audit_hit:0.2, media:0.2},
  fraud:  {policy_change:0.8, windfall:0.2, peer_bankrupt:0.3, loss:0.4, audit_hit:1.0, media:0.9},
  bound:  {policy_change:0.9, windfall:0.3, peer_bankrupt:0.5, loss:0.7, audit_hit:0.4, media:0.5, bailout:1.0},
  soe:    {policy_change:0.7, windfall:0.2, peer_bankrupt:0.6, loss:0.5, audit_hit:0.3, media:0.3},
  survive:{policy_change:0.6, windfall:0.2, peer_bankrupt:1.0, loss:0.9, audit_hit:0.3, media:0.3}
};

function Sim(seed){
  var rng = this.rng = mulberry32(seed);
  this.t=0; this.frontier=CFG.C0; this.opinion=80; this.opinionCrisis=false;
  this.fiscal={cap:0, gen:0, waste:0, fines:0};
  this.regions = REGIONS.map(function(r){ return {id:r.id,name:r.name,incentive:r.incentive,cred:r.cred,disc:r.disc,cost:r.cost,css:r.css}; });
  this.provs = PROVS.map(function(p){ var b=REGIONS[p.band];
    return {id:p.id,name:p.name,band:p.band,selfFin:p.selfFin,disc:b.disc,rescues:0,lastCard:null}; });
  this.firms = FIRMS.map(function(f){ return Object.assign({}, f, {
    pending:0, fakeStock:0, lossStreak:0, monologues:[], mems:[], alive:true, dead:null,
    entered: f.arch!=='chaser', didRd:false, pnl:0, sell:0, plan:null, lastCard:null
  });});
  /* —— 群演长尾初始化（幂律规模 + trait-lite）—— */
  var ex = this.ex = {K:[],f:[],cash:[],integ:[],herd:[],expand:[],region:[],alive:[],pend:[],fakeNow:[],bornAt:[],deadAt:[]};
  for(var i=0;i<CFG.exN0;i++){
    var u=rng(), K=Math.min(CFG.exKcap, CFG.exKmin*Math.pow(1-u,-1/CFG.exAlpha));
    var lowInteg = rng()<0.12;
    ex.K.push(K);
    ex.f.push(rng()<0.10? 0.96+rng()*0.05 : 1.02+rng()*0.18);
    ex.cash.push(0.5 + K*50*(0.6+rng()));
    ex.integ.push(lowInteg? 0.05+rng()*0.2 : 0.45+rng()*0.55);
    ex.herd.push(rng());
    ex.expand.push(0.3+0.6*rng());
    var rr=rng(); ex.region.push(rr<0.45?0:rr<0.8?1:2);
    ex.alive.push(true); ex.pend.push(0); ex.fakeNow.push(0); ex.bornAt.push(0); ex.deadAt.push(-1);
  }
  this.exDeadCum=0;
  this.history=[]; this._lastPol=null;
}
Sim.prototype.yearLabel=function(t){ if(t===undefined)t=this.t; return (2009+Math.floor(t/2))+'年'+(t%2?'下':'上')+'半年'; };
Sim.prototype.alive=function(){ return this.firms.filter(function(f){return f.alive;}); };
Sim.prototype.cabinetTick=function(policy, ev){
  var self=this, t=this.t;
  if(!this._share0){ var s0=[0,0,0];
    this.firms.forEach(function(f){ s0[f.home]+=f.K; });
    for(var i=0;i<this.ex.K.length;i++) s0[this.ex.region[i]]+=this.ex.K[i];
    var tt=s0[0]+s0[1]+s0[2]||1; this._share0=[s0[0]/tt,s0[1]/tt,s0[2]/tt]; }
  var hPrev=this.history[this.history.length-1]||null;
  this.provs.forEach(function(pv){
    var b=self.regions[pv.band];
    var fr=0; for(var k=Math.max(0,self.history.length-2);k<self.history.length;k++) fr+=self.history[k].fraudRegion[pv.band];
    var subHot=policy.mode!=='none'&&policy.intensity>=40;
    var shareNow=hPrev?hPrev.shares[pv.band]:null;
    var zs=(subHot?1:0)+(shareNow!==null&&shareNow<self._share0[pv.band]*0.92?1:0);
    var cz=(pv.selfFin<0.55?-1:0)+(subHot&&pv.selfFin>=0.7?1:0);
    var jg=Math.max(0,(policy.audit>=45?2:0)+(fr>=3?1:0)-(policy.audit<30?1:0));
    var W=CABW[pv.id], score=W.zs*zs+W.cz*cz-W.jg*jg;
    var act, old=pv.disc;
    if(score<=-1.5){ pv.disc=Math.max(b.disc*0.5,pv.disc-0.10); act='加严执行（折扣'+old.toFixed(2)+'→'+pv.disc.toFixed(2)+'）'; }
    else if(score>=2){ pv.disc=Math.min(b.disc*1.15,pv.disc+0.04); act='放松执行（招商优先）'; }
    else act='维持现状（折扣'+pv.disc.toFixed(2)+'）';
    pv.lastCard={t:t,
      observed:['中央核查'+policy.audit,'两期辖区虚报'+fr+'起','产业份额'+(shareNow!==null?(shareNow*100).toFixed(0)+'%':'—'),'财政自给率'+(pv.selfFin*100).toFixed(0)+'%'],
      seats:[{s:'招商席',v:zs},{s:'财政席',v:cz},{s:'监管席',v:-jg}],
      rule:'票决 '+(W.zs*zs).toFixed(1)+'+'+(W.cz*cz).toFixed(1)+'−'+(W.jg*jg).toFixed(1)+'='+score.toFixed(1), act:act};
    if(act.indexOf('加严')===0) ev.push({t:t,type:'region',msg:pv.name+'省'+act+'——监管席在票决中压过招商席'});
  });
};
Sim.prototype.ledgerAdd=function(j,prom,paid){
  if(!this.credLedger) this.credLedger=[{prom:0,paid:0},{prom:0,paid:0},{prom:0,paid:0}];
  this.credLedger[j].prom+=prom; this.credLedger[j].paid+=paid;
};
Sim.prototype.effA=function(regionIdx, policy, provId){
  var dm=(policy.x&&policy.x.discountMul!==undefined)?policy.x.discountMul:1;
  var disc=this.regions[regionIdx].disc;
  if(provId&&this.provs){ for(var q=0;q<this.provs.length;q++) if(this.provs[q].id===provId){ disc=this.provs[q].disc; break; } }
  return policy.audit*(1-disc*dm);
};
Sim.prototype.demand=function(policy){
  if(!this._Dbase){ this._Dbase=[CFG.D0]; var g=CFG.demandGrowth;
    for(var k=1;k<=CFG.rounds;k++){ this._Dbase.push(this._Dbase[k-1]*(1+g)); g*=CFG.growthDecay; } }
  var PX=policy.x||{};
  var d=this._Dbase[this.t];
  if(this.t>=CFG.shockRound) d*=CFG.shockFactor*(PX.shockMul||1);
  var b = policy.mode==='generation'?CFG.demandBoostGen : policy.mode==='capacity'?CFG.demandBoostCap : 0;
  return d*(1+policy.intensity/100*b+(PX.demandBonus||0));
};
Sim.prototype.writeMem=function(f,type,text,sal){
  f.mems.push({t:this.t,type:type,text:text,sal:sal});
  if(f.mems.length>12) f.mems.shift();
};
Sim.prototype.retrieve=function(f,ctx){
  var t=this.t, rel=REL[ctx]||REL.expand;
  return f.mems.map(function(m){
    return {m:m, s: m.sal*Math.pow(0.75,t-m.t)*(rel[m.type]||0.3)};
  }).sort(function(a,b){return b.s-a.s;}).slice(0,2).filter(function(x){return x.s>0.08;})
    .map(function(x){ return {t:x.m.t, text:x.m.text}; });
};

Sim.prototype.step=function(policy,ctrl){
  var rng=this.rng, ev=[], flows=[], t=this.t, self=this;
  var PX=policy.x||{};
  var FINE=PX.fineMult||CFG.fineMult, MEDIA=(PX.mediaProb!==undefined?PX.mediaProb:CFG.mediaProb);
  var SUBF=PX.subEligF||99, CAPM=PX.capexMul||1, RDM=PX.rdCostMul||1, OPR=1-(PX.opexRelief||0);
  if(t===CFG.shockRound) ev.push({t:t,type:'market',msg:'欧美"双反"关税落地，海外需求接近腰斩'});
  if(t===CFG.turnoverRound){
    this.regions[CFG.turnoverRegion].cred=CFG.turnoverCred;
    ev.push({t:t,type:'region',msg:'辽宁省换届："新官不理旧账"，多家企业的奖补承诺被搁置——兑现信誉跌至冰点'});
  }
  this.cabinetTick(policy, ev);
  /* 政策变更写入名角记忆 */
  if(this._lastPol && (this._lastPol.mode!==policy.mode||this._lastPol.intensity!==policy.intensity||this._lastPol.audit!==policy.audit)){
    var pd=MODE_CN[policy.mode]+'·强度'+policy.intensity+'·核查'+policy.audit;
    this.alive().forEach(function(f){ self.writeMem(f,'policy_change','政策转向:'+pd,0.7); });
  }
  this._lastPol={mode:policy.mode,intensity:policy.intensity,audit:policy.audit};

  /* 0. 在建产能投产（半年时滞） */
  this.firms.forEach(function(f){ if(f.alive){ f.K+=f.pending; f.pending=0; } });
  var ex=this.ex, N=ex.K.length;
  for(var i=0;i<N;i++) if(ex.alive[i]){ ex.K[i]+=ex.pend[i]; ex.pend[i]=0; }

  var alive=this.alive();
  var castK=alive.reduce(function(s,f){return s+f.K;},0);
  var exK=0; for(i=0;i<N;i++) if(ex.alive[i]) exK+=ex.K[i];
  var S=castK+exK;
  var D=this.demand(policy);
  var r=Math.min(S>0.01? D/S : CFG.rMax, CFG.rMax);
  var P=this.frontier*(CFG.priceA+CFG.priceB*Math.pow(r,CFG.priceExp));
  var capex=CFG.capexK*this.frontier;
  var capexEff=capex*CAPM;
  var capSubPerGW = policy.mode==='capacity'? policy.intensity/100*CFG.capSubShare*capex : 0;
  var genSubPerGW = policy.mode==='generation'? policy.intensity/100*CFG.genSubK : 0;
  var avgMargin=P-this.frontier;
  var fraudThisRound=false;
  var fraudRegion=[0,0,0];

  /* 1. 名角决策（记忆检索 → 决策 → 五段卡 basis） */
  alive.forEach(function(f){
    if(f.moveCd===undefined) f.moveCd=0;
    if(f.moveCd>0) f.moveCd--;
    f.movedNow=false;
    var C=self.frontier*f.f, effA=self.effA(f.home,policy,f.prov);
    var obs={t:t,P:P,Cf:self.frontier,C:C,margin:P-C,r:r,policy:policy,capex:capex,capSubPerGW:capSubPerGW,avgMargin:avgMargin,effA:effA};
    var ctx = f.arch==='fraud'?'fraud' : (obs.margin<0||f.lossStreak>=1)?'survive' : 'expand';
    var recalled = self.retrieve(f,ctx);
    var d;
    /* 粘性计划：激进者的组织惯性（Calvo 交错调整 / 结构惯性） */
    if(f.arch==='aggr' && f.plan && f.plan.left>0 && f.cash>=capex*0.4){
      d={rd:false,dK:f.plan.dK,fake:0,rule:'组织惯性:执行既定扩张计划(董事会已批,剩'+f.plan.left+'期)',
         note:'计划已经上会批了，中途停下来损失更大——按原计划推进。'};
      f.plan.left--;
    } else {
      d=ARCH[f.arch](f,obs,rng); f.plan=null;
      if(f.arch==='aggr' && (d.dK||0)>0.05) f.plan={dK:d.dK,left:1};
    }
    if(ctrl && ctrl[f.id]){
      var pd0=ctrl[f.id];
      d={rd:!!pd0.rd, dK:pd0.dK||0, fake:pd0.fake||0, rule:'玩家指令', note:pd0.note||null};
      f.plan=null;
      if(pd0.move!==undefined && pd0.move!==f.home){
        if(f.moveCd>0){ ev.push({t:t,type:'firm',msg:f.name+'：迁址冷却中（还需'+f.moveCd+'期）'}); }
        else {
          var mc=CFG.moveCostK*f.K*capex;
          if(f.cash>mc*1.05){
            f.cash-=mc; var oldH=f.home; f.home=pd0.move; f.moveCd=CFG.moveCoolRounds; f.movedNow=true;
            if(f.prov!==undefined) delete f.prov; /* 省级绑定不随厂迁移:迁出即解除,effA 回退制度带折扣,救助脐带断(A22/Q4) */
            self.writeMem(f,'move','从'+self.regions[oldH].name+'迁往'+self.regions[pd0.move].name+',一次性成本'+mc.toFixed(1)+'亿',0.9);
            ev.push({t:t,type:'firm',msg:f.name+'整体迁址：'+self.regions[oldH].name+'→'+self.regions[pd0.move].name+'（迁址费'+mc.toFixed(1)+'亿，本期出货受损）'});
          } else ev.push({t:t,type:'firm',msg:f.name+'：现金不足以支付迁址费'+mc.toFixed(1)+'亿，迁址取消'});
        }
      }
    }
    if(d.note){ f.monologues.push({t:t,note:d.note}); if(f.monologues.length>6)f.monologues.shift(); }
    f.didRd=false;
    var rdC=CFG.rdCost*RDM;
    if(d.rd && f.cash>rdC){ f.cash-=rdC; f.f=Math.max(CFG.fMin,f.f*CFG.rdGain); f.didRd=true; }
    var dK=Math.min(Math.max(0,d.dK||0), CFG.dKMax*(PX.dKCapMul||1));
    if(dK*capexEff>f.cash*CFG.cashUse) dK=Math.max(0,f.cash*CFG.cashUse/capexEff);
    if(dK>0.01){
      f.cash-=dK*capexEff;
      var sub=(f.f<=SUBF? dK*capSubPerGW : 0);
      if(sub>0.01){ f.cash+=sub; self.fiscal.cap+=sub; flows.push({id:f.id,amt:sub,kind:'sub'});
        if(CFG.localMatchK>0){ var lp=CFG.localMatchK*self.regions[f.home].incentive*sub, lg=lp*self.regions[f.home].cred;
          f.cash+=lg; self.fiscal.local=(self.fiscal.local||0)+lg; self.ledgerAdd(f.home,lp,lg); } }
      f.pending+=dK;
    } else dK=0;
    var fake = policy.mode==='capacity'? Math.max(0,d.fake||0) : 0;
    if(fake*capex*CFG.fakeCostShare>f.cash*0.8) fake=Math.max(0,f.cash*0.8/(capex*CFG.fakeCostShare));
    if(fake>0.01){
      fraudThisRound=true; fraudRegion[f.home]++;
      var fsub=fake*capSubPerGW;
      f.cash-=fake*capex*CFG.fakeCostShare;
      f.cash+=fsub; self.fiscal.cap+=fsub;
      flows.push({id:f.id,amt:fsub,kind:'sub'});
      if(rng()<self.effA(f.home,policy,f.prov)/100*CFG.catchK){
        var fine=fsub*FINE;
        f.cash-=fine; self.fiscal.fines+=fine;
        self.opinion=Math.max(0,self.opinion-4);
        flows.push({id:f.id,amt:fine,kind:'fine'});
        self.writeMem(f,'audit_hit','虚报被本地核查查实,罚'+fine.toFixed(1)+'亿',1.0);
        ev.push({t:t,type:'fraud',msg:'核查查实：'+f.name+'虚报'+fake.toFixed(2)+'GW装机，追缴并处罚'+fine.toFixed(1)+'亿'});
      } else {
        f.fakeStock+=fake; self.fiscal.waste+=fsub;
        if(rng()<MEDIA){
          if(policy.audit>=45){ /* 中央媒体曝光→中央直查,绕过地方 */
            var back=fsub; f.cash-=back; self.fiscal.fines+=back; self.fiscal.waste-=fsub;
            f.fakeStock-=fake;
            self.opinion=Math.max(0,self.opinion-6);
            flows.push({id:f.id,amt:back,kind:'fine'});
            self.writeMem(f,'audit_hit','被媒体曝光后中央直查追缴',1.0);
            ev.push({t:t,type:'media',msg:'媒体曝光'+f.name+'"晒不到太阳的电站"，中央直查追缴'+back.toFixed(1)+'亿'});
          } else {
            self.opinion=Math.max(0,self.opinion-10);
            self.writeMem(f,'media','被媒体点名但不了了之',0.8);
            ev.push({t:t,type:'media',msg:'媒体曝光：'+f.name+'的"电站"从未并网——本地核查不了了之，舆情恶化'});
          }
        }
      }
    }
    /* 五段决策卡 */
    var acts=[]; if(f.didRd)acts.push('研发投入'+CFG.rdCost+'亿'); if(dK>0)acts.push('扩产+'+dK.toFixed(2)+'GW');
    if(fake>0.01)acts.push('虚报'+fake.toFixed(2)+'GW'); if(!acts.length)acts.push('按兵不动');
    f.lastCard={t:t,
      observed:['供需比 r='+r.toFixed(2)+'（'+(r<0.8?'过剩':r>1.1?'偏紧':'均衡')+'）','自身毛利 '+(P-C).toFixed(1)+' 元/W',
        MODE_CN[policy.mode]+'·强度'+policy.intensity+'·中央核查'+policy.audit+'（本地实际 '+effA.toFixed(0)+'）'],
      recalled:recalled, rule:d.rule||'—', act:acts.join(' · '), note:d.note||''};
  });

  /* 2. 群演决策与执行（向量化规则；进入分布被政策塑形的物种） */
  var boom=Math.max(0,r-0.85);
  var exSubReg=[0,0,0];
  for(i=0;i<N;i++){
    if(!ex.alive[i]) continue;
    var eC=this.frontier*ex.f[i], eM=P-eC, reg=ex.region[i];
    var edK = (eM>0.4 && ex.cash[i]>0.3)? Math.min(0.02, ex.expand[i]*(0.12+0.5*ex.herd[i]*boom)*ex.K[i]) : 0;
    if(edK*capexEff>ex.cash[i]*0.5) edK=ex.cash[i]*0.5/capexEff;
    if(edK>0.0005){
      ex.cash[i]-=edK*capexEff;
      var esub=edK*capSubPerGW;
      if(esub>0){ ex.cash[i]+=esub; this.fiscal.cap+=esub; exSubReg[reg]+=esub;
        if(CFG.localMatchK>0){ var elp=CFG.localMatchK*this.regions[reg].incentive*esub, elg=elp*this.regions[reg].cred;
          ex.cash[i]+=elg; this.fiscal.local=(this.fiscal.local||0)+elg; this.ledgerAdd(reg,elp,elg); } }
      ex.pend[i]+=edK;
    }
    ex.fakeNow[i]=0;
    if(policy.mode==='capacity' && ex.integ[i]<0.3 && this.effA(reg,policy)<45){
      var efake=(0.003+0.4*ex.K[i])*(0.5+rng());
      var ecost=efake*capex*CFG.fakeCostShare;
      if(ecost<ex.cash[i]*0.7){
        fraudThisRound=true; fraudRegion[reg]++;
        var efsub=efake*capSubPerGW;
        ex.cash[i]+=efsub-ecost; this.fiscal.cap+=efsub; exSubReg[reg]+=efsub;
        if(rng()<this.effA(reg,policy)/100*CFG.catchK){
          ex.cash[i]-=efsub*FINE; this.fiscal.fines+=efsub*FINE;
        } else { this.fiscal.waste+=efsub; ex.fakeNow[i]=efake; }
      }
    }
  }

  for(var rj=0;rj<3;rj++) if(exSubReg[rj]>0.4) flows.push({region:rj,amt:exSubReg[rj],kind:'sub',ex:true});
  /* 3. 销售与经营结算（名角+群演同一供给池，按成本优势分配） */
  var wSum=0;
  alive.forEach(function(f){ wSum+=f.K*Math.pow(f.f,-CFG.weightExp); });
  for(i=0;i<N;i++) if(ex.alive[i]) wSum+=ex.K[i]*Math.pow(ex.f[i],-CFG.weightExp);
  alive.forEach(function(f){
    var w=f.K*Math.pow(f.f,-CFG.weightExp);
    var sell=wSum>0? Math.min(f.K, D*w/wSum) : 0;
    if(f.movedNow) sell*=CFG.moveDownMul;
    var gsub=(f.f<=SUBF? genSubPerGW*sell : 0);
    if(gsub>0.01){ self.fiscal.gen+=gsub; if(gsub>0.8) flows.push({id:f.id,amt:gsub,kind:'gen'});
      if(CFG.localMatchK>0){ var lp2=CFG.localMatchK*self.regions[f.home].incentive*gsub, lg2=lp2*self.regions[f.home].cred;
        f.cash+=lg2; self.fiscal.local=(self.fiscal.local||0)+lg2; self.ledgerAdd(f.home,lp2,lg2); } }
    var pnl=(P-self.frontier*f.f)*sell*CFG.scale + gsub - (CFG.opexBase+CFG.opexPerGW*f.K*(f.lev||1))*OPR;
    f.cash+=pnl; f.pnl=pnl; f.sell=sell;
    if(f.cash>CFG.divThresh) f.cash-=(f.cash-CFG.divThresh)*CFG.divRate;
    var was=f.lossStreak;
    f.lossStreak = pnl<-0.5? f.lossStreak+1 : 0;
    if(f.lossStreak===2 && was===1) self.writeMem(f,'loss','已连续两期亏损,现金'+f.cash.toFixed(0)+'亿',0.6);
    if(pnl>30) self.writeMem(f,'windfall','本期大赚'+pnl.toFixed(0)+'亿',0.4);
  });
  var exDeaths=0;
  for(i=0;i<N;i++){
    if(!ex.alive[i]) continue;
    var ew=ex.K[i]*Math.pow(ex.f[i],-CFG.weightExp);
    var esell=wSum>0? Math.min(ex.K[i], D*ew/wSum) : 0;
    var egsub=genSubPerGW*esell; this.fiscal.gen+=egsub;
    if(CFG.localMatchK>0&&egsub>0){ var elp2=CFG.localMatchK*this.regions[ex.region[i]].incentive*egsub, elg2=elp2*this.regions[ex.region[i]].cred;
      ex.cash[i]+=elg2; this.fiscal.local=(this.fiscal.local||0)+elg2; this.ledgerAdd(ex.region[i],elp2,elg2); }
    ex.cash[i]+=(P-this.frontier*ex.f[i])*esell*CFG.scale + egsub - (CFG.exOpexBase+CFG.exOpexPerGW*ex.K[i])*OPR;
    if(ex.cash[i]<0){ ex.alive[i]=false; ex.deadAt[i]=t; exDeaths++; }
  }
  var fe=PX.forceExit||0;
  if(fe>0){ var worst=[];
    for(i=0;i<N;i++) if(ex.alive[i]) worst.push([ex.f[i],i]);
    worst.sort(function(a,b){return b[0]-a[0];});
    for(var w=0;w<Math.min(fe,worst.length);w++){ var wi=worst[w][1];
      ex.alive[wi]=false; ex.deadAt[wi]=t; exDeaths++; this.fiscal.gen+=0.3; }
    if(fe>0&&worst.length) ev.push({t:t,type:'policy',msg:'落后产能强制退出：'+Math.min(fe,worst.length)+'家高成本厂商关停（含退出补偿）'});
  }
  this.exDeadCum+=exDeaths;
  if(exDeaths>=2) ev.push({t:t,type:'wave',msg:'长尾出清：本期 '+exDeaths+' 家中小厂商倒闭（累计 '+this.exDeadCum+' 家）'});

  /* 4. 名角退出与破产 + 法拍收购 */
  var deadK=0;
  alive.forEach(function(f){
    if(!f.alive) return;
    if(f.cash<0 && f.arch==='bound' && f.prov){
      var pvB=null; for(var q2=0;q2<self.provs.length;q2++) if(self.provs[q2].id===f.prov) pvB=self.provs[q2];
      if(pvB && pvB.rescues<2){
        var need=10-f.cash;
        f.cash+=need; pvB.rescues++; self.fiscal.local=(self.fiscal.local||0)+need;
        if(pvB.lastCard) pvB.lastCard.act+=' · 协调银团救助'+f.name+' '+need.toFixed(0)+'亿';
        self.writeMem(f,'bailout','省里协调银团+担保注入'+need.toFixed(0)+'亿',1.0);
        ev.push({t:t,type:'region',msg:pvB.name+'省出手：银团贷款+政府担保'+need.toFixed(0)+'亿，'+f.name+'起死回生——"大到不能倒"'});
        return;
      }
    }
    if(f.cash<0){ f.alive=false; f.dead='bankrupt'; f.deadT=t; deadK+=f.K;
      ev.push({t:t,type:'firm',msg:f.name+'资金链断裂，破产退出'});
      self.alive().forEach(function(g){ self.writeMem(g,'peer_bankrupt','同行'+f.name+'倒下了',0.9); });
    } else if(f.arch==='chaser' && f.entered && f.lossStreak>=2){
      f.alive=false; f.dead='exit'; f.deadT=t; deadK+=f.K;
      ev.push({t:t,type:'firm',msg:f.name+'连亏两期，割肉离场："这波风口，是别人的。"'});
    }
  });
  if(deadK>0.05){
    var buyers=this.alive().filter(function(f){return f.cash>25;});
    var cashSum=buyers.reduce(function(s,f){return s+f.cash;},0);
    if(cashSum>0){
      var pool=deadK*0.45, bought=0;
      buyers.forEach(function(f){
        var share=pool*f.cash/cashSum;
        var price=share*capex*0.25;
        if(price>f.cash*0.5){ share=f.cash*0.5/(capex*0.25); price=f.cash*0.5; }
        f.cash-=price; f.K+=share; bought+=share;
      });
      if(bought>0.05) ev.push({t:t,type:'firm',msg:'倒下者的产线被同行低价收购，'+bought.toFixed(1)+'GW产能易主续命'});
    }
  }

  /* 5. 群演进入（潮涌 + 政策塑造物种 + 选址函数：优惠×信誉 + 集聚 − 成本 + 监管洼地虹吸） */
  var nEntry=Math.min(CFG.entryCap+(PX.entryBonus||0), Math.round(1+CFG.entryPerMargin*Math.max(0,avgMargin-CFG.entryMarginFloor))+(PX.entryBonus||0));
  if(policy.mode==='none') nEntry=Math.min(nEntry,1);
  if(nEntry>0 && N<340){
    var regK=[0,0,0];
    alive.forEach(function(f){ regK[f.home]+=f.K; });
    for(i=0;i<N;i++) if(ex.alive[i]) regK[ex.region[i]]+=ex.K[i];
    var totK=regK[0]+regK[1]+regK[2]||1;
    for(var e=0;e<nEntry;e++){
      var lowI = rng() < (0.12 + (policy.mode==='capacity'? 0.15*policy.intensity/100 : 0))*(1-(PX.lowIntegCut||0));
      var integ = lowI? 0.05+rng()*0.2 : 0.45+rng()*0.55;
      var bestJ=0,bestU=-9;
      for(var j=0;j<3;j++){
        var rj=this.regions[j];
        var U=2.2*rj.incentive*rj.cred + 1.4*regK[j]/totK - rj.cost + 0.25*rng();
        if(integ<0.3) U += Math.max(0,(45-this.effA(j,policy)))/100*1.2; /* 监管洼地虹吸投机者 */
        if(U>bestU){bestU=U;bestJ=j;}
      }
      var K0=Math.max(PX.entryGateK0||0, 0.003+rng()*0.009);
      var ef0=1.02+rng()*0.18; if(PX.entryGateF) ef0=Math.min(ef0,PX.entryGateF);
      ex.K.push(K0); ex.f.push(ef0); ex.cash.push(0.45+K0*35);
      ex.integ.push(integ); ex.herd.push(0.5+0.5*rng()); ex.expand.push(0.3+0.6*rng());
      ex.region.push(bestJ); ex.alive.push(true); ex.pend.push(0); ex.fakeNow.push(0);
      ex.bornAt.push(t); ex.deadAt.push(-1);
    }
    if(nEntry>=5) ev.push({t:t,type:'wave',msg:'潮涌：本期 '+nEntry+' 家新厂商跨界入场'});
    N=ex.K.length;
  }

  /* 6. 学习曲线 / 舆情 */
  var left=this.alive();
  var S2=left.reduce(function(s,f){return s+f.K;},0);
  var rdShare=S2>0? left.filter(function(f){return f.didRd;}).reduce(function(s,f){return s+f.K;},0)/S2 : 0;
  this.frontier*=1-(CFG.frontierDrift+CFG.frontierRnD*rdShare);
  left.forEach(function(f){ if(!f.didRd) f.f=Math.min(1.35,f.f*1.005); });
  if(!fraudThisRound) this.opinion=Math.min(85,this.opinion+2);
  if(PX.opinionDrip) this.opinion=Math.min(85,this.opinion+PX.opinionDrip);
  if(PX.fiscalDrip) this.fiscal.gen+=PX.fiscalDrip;
  if(this.opinion<40 && !this.opinionCrisis){
    this.opinionCrisis=true;
    ev.push({t:t,type:'media',msg:'舆情跌破临界：全国性问责启动——现实中，此刻政策将被迫全面收紧'});
  }

  /* 7. 快照 */
  var exAlive=0; exK=0; var shares=[0,0,0];
  for(i=0;i<ex.K.length;i++) if(ex.alive[i]){ exAlive++; exK+=ex.K[i]; shares[ex.region[i]]+=ex.K[i]; }
  left.forEach(function(f){ shares[f.home]+=f.K; });
  var totS=shares[0]+shares[1]+shares[2]||1;
  this.history.push({t:t,P:P,Cf:this.frontier,D:D,S:S,alive:left.length,
    exAlive:exAlive, exDeaths:exDeaths, exDeadCum:this.exDeadCum, exK:exK, castK:castK,
    fiscalTotal:this.fiscal.cap+this.fiscal.gen-this.fiscal.fines,
    waste:this.fiscal.waste, opinion:this.opinion, local:this.fiscal.local||0,
    shares:[shares[0]/totS,shares[1]/totS,shares[2]/totS], fraudRegion:fraudRegion});
  this.t++;
  return {ev:ev, flows:flows, exDeaths:exDeaths};
};

function scriptPolicy(t){
  if(t<8)  return {mode:'capacity',   intensity:60, audit:20};
  if(t<18) return {mode:'generation', intensity:55, audit:55};
  return        {mode:'generation', intensity:15, audit:55};
}

if(typeof module!=='undefined' && module.exports){
  module.exports={Sim:Sim, scriptPolicy:scriptPolicy, CFG:CFG, FIRMS:FIRMS, REGIONS:REGIONS, ARCH:ARCH, MODE_CN:MODE_CN, mulberry32:mulberry32};
}
