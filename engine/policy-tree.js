/* ============================================================
   万历 · 政策树 v1（光伏包）—— 21 节点 × 5 支线
   结构：节点(UI/状态机) → compile() → {mode,intensity,audit,x{...}} → 引擎
   GR 安全规则：史实自动驾驶只点亮校准三件套(装机/度电/核查)，
   其余节点为用户反事实能力；节点效果只做加法，不动基线路径。
   ============================================================ */

var BRANCHES=[
  {id:0,name:'供给 · 成本端',css:'#e8b64c'},
  {id:1,name:'需求 · 产出端',css:'#7fd6c2'},
  {id:2,name:'准入 · 秩序端',css:'#b9a8ef'},
  {id:3,name:'监督 · 问责端',css:'#ef5350'},
  {id:4,name:'贸易 · 外部端',css:'#60a5fa'}
];

/* lv 定义：lvs[k] 为第 k+1 级效果；core 写核心三元组，x 写扩展通道（可叠加） */
var PNODES=[
  /* —— 供给·成本端 —— */
  {id:'cap_sub',br:0,icon:'🏗️',name:'装机补贴（金太阳式）',mutex:'mainsub',cost:1,
   lvs:[{tag:'30%返现',core:{mode:'capacity',intensity:20}},{tag:'40%返现',core:{mode:'capacity',intensity:40}},{tag:'50%+返现',core:{mode:'capacity',intensity:60}}],
   hist:'史实：财建[2009]397号，2009 启动',desc:'按建成产能给付资本补贴。上量最快，可核性最差——付钱时点在发电之前。'},
  {id:'tax_break',br:0,icon:'🧾',name:'税收减免',cost:1,
   lvs:[{tag:'高新15%',x:{opexRelief:0.12}}],
   hist:'史实：高新技术企业所得税优惠',desc:'降低企业经常性负担，普惠不可瞄准。'},
  {id:'credit_ease',br:0,icon:'🏦',name:'政策性信贷',cost:1,
   lvs:[{tag:'授信',x:{capexMul:0.92}},{tag:'大额授信',x:{capexMul:0.85}}],
   hist:'史实：国开行等对龙头大额授信',desc:'降低扩产资金成本。注意：也同样降低了盲目扩张的门槛。'},
  {id:'rd_sub',br:0,icon:'🧪',name:'研发补助',cost:1,
   lvs:[{tag:'补30%',x:{rdCostMul:0.7}},{tag:'补50%',x:{rdCostMul:0.5}}],
   desc:'定向降低研发投入成本，推学习曲线（Wright）。'},
  {id:'land_grant',br:0,icon:'🗺️',name:'园区土地要素',cost:1,
   lvs:[{tag:'招商园区',x:{entryBonus:1}}],
   desc:'降低进入门槛，鼓励建厂——潮涌的助燃剂。'},

  /* —— 需求·产出端 —— */
  {id:'gen_sub',br:1,icon:'⚡',name:'度电补贴（标杆电价）',mutex:'mainsub',cost:1,
   lvs:[{tag:'0.1元/度级',core:{mode:'generation',intensity:15}},{tag:'0.3元/度级',core:{mode:'generation',intensity:35}},{tag:'0.5元/度级',core:{mode:'generation',intensity:55}}],
   hist:'史实：发改价格[2013]1638号',desc:'按实际发电量结算。假电站发不出电——工具设计内生了可核性。'},
  {id:'pv_poverty',br:1,icon:'🌾',name:'光伏扶贫',req:['gen_sub'],cost:1,
   lvs:[{tag:'专项工程',x:{demandBonus:0.04,opinionDrip:1,fiscalDrip:2}}],
   hist:'史实：2015 起国家专项',desc:'扶贫电站带小额稳定需求与民意，财政持续小额支出。'},
  {id:'consume_guarantee',br:1,icon:'🔌',name:'全额消纳保障',req:['gen_sub'],cost:1,
   lvs:[{tag:'保障性收购',x:{demandBonus:0.08}}],
   hist:'史实：可再生能源全额保障性收购',desc:'解决"发得出、送不走"，度电补贴的配套件。'},
  {id:'grid_parity',br:1,icon:'🌅',name:'平价上网',cost:1,
   unlock:function(sim){return sim.frontier<4.0;},
   lvs:[{tag:'市场接棒',x:{demandBonus:0.18}}],
   desc:'解锁条件：标杆成本 < 4 元/W。产业毕业典礼——需求由市场自发接棒。'},

  /* —— 准入·秩序端 —— */
  {id:'mfg_standard',br:2,icon:'📋',name:'制造行业规范条件',cost:1,
   lvs:[{tag:'白名单',x:{entryGateF:1.12,lowIntegCut:0.5}},{tag:'严标准',x:{entryGateF:1.08,entryGateK0:0.006,lowIntegCut:0.7}}],
   hist:'史实：工信部 2013 年发布（标注；史实回放未启用，见 GR 安全规则）',
   desc:'给进入者设质量与规模门槛——政策塑造物种的反向操作：挡住皮包公司。'},
  {id:'capacity_approval',br:2,icon:'🚧',name:'产能备案审批',cost:1,
   lvs:[{tag:'从严备案',x:{dKCapMul:0.7}}],
   desc:'给所有扩产踩刹车。副作用：好公司也被按住。'},
  {id:'tech_floor',br:2,icon:'📐',name:'技术门槛（补贴资格）',cost:1,
   lvs:[{tag:'效率门槛',x:{subEligF:1.1}}],
   hist:'史实：领跑者技术标准的雏形',desc:'高成本(f>1.1)企业失去补贴资格——把钱瞄准先进产能。'},
  {id:'force_exit',br:2,icon:'⛔',name:'落后产能强制退出',cost:1,
   lvs:[{tag:'关停+补偿',x:{forceExit:2}}],
   desc:'每期强制关停最高成本的 2 家长尾（含退出补偿）。行政出清，快但贵且招怨。'},
  {id:'leader_program',br:2,icon:'🏆',name:'领跑者计划',req:['gen_sub','mfg_standard'],cost:1,
   lvs:[{tag:'招标+门槛',x:{rdCostMul:0.6,subEligF:1.05,opinionDrip:1}}],
   hist:'史实：2015 能源局领跑者',desc:'招标制+先进指标：补贴与技术标杆绑定。'},

  /* —— 监督·问责端 —— */
  {id:'audit',br:3,icon:'🔍',name:'核查体系',cost:1,
   lvs:[{tag:'抽查',core:{audit:20}},{tag:'专项核查',core:{audit:55}},{tag:'全覆盖核验',core:{audit:80}}],
   hist:'史实：金太阳期抽查(20)→2013 专项(55)',desc:'中央核查力度。注意：落地要过地方执行折扣。'},
  {id:'fine_boost',br:3,icon:'⚖️',name:'处罚加码',cost:1,
   lvs:[{tag:'1.5→2.2倍',x:{fineMult:2.2}},{tag:'3倍重罚',x:{fineMult:3.0}}],
   desc:'提高骗补的期望成本。查得到才罚得到——与核查是乘法关系。'},
  {id:'info_disclose',br:3,icon:'📢',name:'补贴名单公示',cost:1,
   lvs:[{tag:'全网公示',x:{mediaProb:0.55}}],
   desc:'把名单晒在太阳下，媒体与公众成为免费的核查员。'},
  {id:'local_inspect',br:3,icon:'🚨',name:'中央巡查组',cost:2,
   lvs:[{tag:'进驻巡查',x:{discountMul:0.4}}],
   desc:'直插地方，执行折扣×0.4——委托代理问题的政策解。行政成本高（占2行动点）。'},

  /* —— 贸易·外部端 —— */
  {id:'export_rebate',br:4,icon:'🚢',name:'出口退税',cost:1,
   lvs:[{tag:'退税支持',x:{demandBonus:0.06,shockMul:0.93}}],
   desc:'放大海外需求；代价是加深出口依赖——若"双反"落地，冲击更狠(0.58→0.54)。'},
  {id:'trade_talk',br:4,icon:'🤝',name:'双反应对·价格承诺',cost:1,window:[5,7],
   lvs:[{tag:'谈判窗口',x:{shockMul:1.14}}],
   hist:'史实：2013 中欧价格承诺',desc:'仅在 2011下–2012下 窗口可启用。谈成则冲击减缓(0.58→0.66)。'},
  {id:'overseas_fab',br:4,icon:'🏭',name:'海外建厂鼓励',cost:1,
   unlock:function(sim){return sim.t>=7;},
   lvs:[{tag:'绕关税',x:{demandBonus:0.05}}],
   hist:'史实：东南亚产能布局',desc:'双反之后解锁：借第三地产能重新触达海外需求。'}
];

var AP_PER_ROUND=3; /* 政策注意力预算（Sims 理性疏忽的政府侧版本）*/

/* ---------- 编译器：活跃节点 → 引擎政策对象 ----------
   同键多节点合成语义（A25，全部 17 键强制分类，未分类键编译期报错）：
   加法类=求和；乘法类=连乘；pick 类=按"从严"取 min/max（此前为数组序后写覆盖，
   现役唯一冲突对 subEligF{技术门槛1.1,领跑者1.05} 旧序恰得从严值，逐位等价）。 */
var XK_ADD={demandBonus:1,opinionDrip:1,fiscalDrip:1,entryBonus:1,forceExit:1};
var XK_MUL={shockMul:1,capexMul:1,rdCostMul:1,discountMul:1,dKCapMul:1};
var XK_PICK={fineMult:'max',mediaProb:'max',subEligF:'min',entryGateF:'min',entryGateK0:'max',lowIntegCut:'max',opexRelief:'max'};
function compilePolicy(active){
  var pol={mode:'none',intensity:0,audit:5,x:{}};
  PNODES.forEach(function(n){
    var lv=active[n.id]||0; if(!lv) return;
    var eff=n.lvs[lv-1];
    if(eff.core){
      if(eff.core.mode){ pol.mode=eff.core.mode; pol.intensity=eff.core.intensity; }
      if(eff.core.audit!==undefined) pol.audit=eff.core.audit;
    }
    if(eff.x) Object.keys(eff.x).forEach(function(k){
      if(XK_ADD[k]) pol.x[k]=(pol.x[k]||0)+eff.x[k];
      else if(XK_MUL[k]) pol.x[k]=(pol.x[k]||1)*eff.x[k];
      else if(XK_PICK[k]) pol.x[k]=(pol.x[k]===undefined)? eff.x[k] : Math[XK_PICK[k]](pol.x[k],eff.x[k]);
      else throw new Error('compilePolicy: 未分类效果键 "'+k+'"（节点 '+n.id+'）——新键须先入 XK_* 分类表并登记 assumption-registry A25');
    });
  });
  return pol;
}

/* ---------- 节点可用性 ---------- */
function nodeState(n,active,sim,ap){
  var lv=active[n.id]||0;
  if(n.window && (sim.t<n.window[0]||sim.t>n.window[1]) && !lv) return {s:'locked',why:'时间窗 '+n.window[0]+'–'+n.window[1]+' 期'};
  if(n.unlock && !n.unlock(sim) && !lv) return {s:'locked',why:'解锁条件未达成'};
  if(n.req){ for(var i=0;i<n.req.length;i++) if(!active[n.req[i]]) return {s:'locked',why:'需先启用：'+ (PNODES.find(function(x){return x.id===n.req[i];})||{}).name}; }
  if(n.mutex && !lv){ var conflict=PNODES.find(function(x){return x.mutex===n.mutex && x.id!==n.id && active[x.id];});
    if(conflict) return {s:'blocked',why:'与「'+conflict.name+'」互斥，需先废止'}; }
  return {s: lv? 'active':'avail', why:''};
}

/* ---------- 史实剧本（节点化）：编译结果与旧三元组逐位等价 ---------- */
var AUTOPILOT_OPS={
  0:[['set','cap_sub',3],['set','audit',1]],
  8:[['set','cap_sub',0],['set','gen_sub',3],['set','audit',2]],
  18:[['set','gen_sub',1]]
};
function applyOps(active,ops){ (ops||[]).forEach(function(o){ if(o[2]>0) active[o[1]]=o[2]; else delete active[o[1]]; }); }

if(typeof module!=='undefined' && module.exports){
  module.exports={PNODES:PNODES,BRANCHES:BRANCHES,compilePolicy:compilePolicy,nodeState:nodeState,
    AUTOPILOT_OPS:AUTOPILOT_OPS,applyOps:applyOps,AP_PER_ROUND:AP_PER_ROUND};
}
