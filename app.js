const groups = [
  {id:'temperature',name:'近海气温',subtitle:'近地表年平均气温',period:'2026—2045',figures:[1,2]},
  {id:'carbon',name:'海洋碳汇',subtitle:'年累计碳汇量',period:'2026—2045',figures:[4,5]},
  {id:'ph',name:'海水 pH',subtitle:'年平均pH值',period:'2026—2045',figures:[6,7]},
  {id:'land-temperature',name:'陆地气温',subtitle:'浙江省平均气温 · 十年滑动均值',period:'2025—2045',figures:[8,9]},
  {id:'land-precipitation',name:'陆地降水',subtitle:'浙江省降水量 · 十年滑动均值',period:'2025—2045',figures:[10,11]},
  {id:'co2',name:'CO₂浓度',subtitle:'年平均大气CO₂浓度',period:'2015—2100',figures:[3]}
];
const figures = [
  {id:1,region:'浙江近海',title:'浙江近海近地表年平均气温未来变化趋势预估',width:750,height:384},
  {id:2,region:'华东近海',title:'华东近海近地表年平均气温未来变化趋势预估',width:750,height:384},
  {id:3,region:'华东近海',title:'华东近海年平均大气CO₂浓度未来变化趋势预估',width:749,height:385},
  {id:4,region:'浙江近海',title:'浙江近海年累计碳汇量未来变化趋势预估',width:750,height:384},
  {id:5,region:'华东近海',title:'华东近海年累计碳汇量未来变化趋势预估',width:750,height:392},
  {id:6,region:'浙江近海',title:'浙江近海年平均pH值未来变化趋势预估',width:750,height:384},
  {id:7,region:'华东近海',title:'华东近海年平均pH值未来变化趋势预估',width:750,height:385},
  {id:8,region:'浙江省 · SSP245',title:'SSP245情景下浙江省平均气温十年滑动均值变化趋势预估',width:1200,height:565},
  {id:9,region:'浙江省 · SSP585',title:'SSP585情景下浙江省平均气温十年滑动均值变化趋势预估',width:1118,height:559},
  {id:10,region:'浙江省 · SSP245',title:'SSP245情景下浙江省降水量十年滑动均值变化趋势预估',width:1259,height:641},
  {id:11,region:'浙江省 · SSP585',title:'SSP585情景下浙江省降水量十年滑动均值变化趋势预估',width:1220,height:634}
];
const $ = id => document.getElementById(id);
const dark = document.body.dataset.version === 'dark';
const imageSource = id => dark ? `assets/dark/figure-${id}.svg` : `assets/figure-${id}.jpg`;
const viewer = $('viewer');
let zoom = 1;
let previousFocus;

$('topics').innerHTML = groups.map((group,index) => `<section class="topic panel" id="${group.id}" aria-labelledby="title-${group.id}"><header class="topic-heading"><div><span class="topic-number">${String(index+1).padStart(2,'0')}</span><h2 id="title-${group.id}">${group.name}</h2><span class="topic-subtitle">${group.subtitle}</span></div><span class="topic-period">${group.period}年</span></header><div class="topic-figures ${group.figures.length===1?'single':''}">${group.figures.map(id=>{const figure=figures.find(item=>item.id===id);return `<figure class="figure-card" data-figure="${id}"><figcaption><span class="figure-number">图${String(id).padStart(2,'0')}</span><h3>${figure.region}</h3><span class="figure-period">${group.period}年</span></figcaption><button class="figure-open" data-open="${id}" aria-label="放大查看：${figure.title}"><img src="${imageSource(id)}" alt="${figure.title}" width="${figure.width}" height="${figure.height}" loading="eager"><span class="enlarge-label">放大查看 ↗</span></button></figure>`;}).join('')}</div></section>`).join('');

function updateZoom() {
  $('viewer-image').style.width = `${zoom*100}%`;
  $('viewer-image').style.height = `${zoom*100}%`;
  $('zoom-reset').textContent = zoom===1?'适应窗口':`${Math.round(zoom*100)}% · 还原`;
  $('zoom-out').disabled = zoom<=1;
  $('zoom-in').disabled = zoom>=3;
}
function openFigure(id) {
  const figure=figures.find(item=>item.id===id);
  if(!figure) return;
  const group=groups.find(item=>item.figures.includes(id));
  previousFocus=$('topics').querySelector(`[data-open="${id}"]`);
  $('viewer-image').src=imageSource(id);
  $('viewer-image').alt=figure.title;
  $('viewer-title').textContent=figure.title;
  $('viewer-index').textContent=`图${String(id).padStart(2,'0')} · ${dark?'暗色视觉复刻':'原始图件'}`;
  $('viewer-caption').textContent=`${figure.region}　｜　${group.period}年`;
  $('download-image').href=imageSource(id);
  $('download-image').download=`图${id}-${figure.title}${dark?'-暗色复刻.svg':'.jpg'}`;
  if(dark) $('compare-original').href=`assets/figure-${id}.jpg`;
  zoom=1;
  updateZoom();
  if(!viewer.open) viewer.showModal();
  $('viewer-close').focus();
}
$('topics').addEventListener('click',event=>{
  const button=event.target.closest('[data-open]');
  if(button) openFigure(Number(button.dataset.open));
});
$('viewer-close').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>previousFocus?.focus({preventScroll:true}));
viewer.addEventListener('click',event=>{
  const rect=viewer.getBoundingClientRect();
  if(event.target===viewer&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)) viewer.close();
});
$('zoom-in').addEventListener('click',()=>{zoom=Math.min(3,+(zoom+.25).toFixed(2));updateZoom();});
$('zoom-out').addEventListener('click',()=>{zoom=Math.max(1,+(zoom-.25).toFixed(2));updateZoom();});
$('zoom-reset').addEventListener('click',()=>{zoom=1;updateZoom();});
function applyAddressState() {
  const match=location.hash.match(/^#figure-(\d+)$/);
  if(match && figures.some(item=>item.id===Number(match[1]))) openFigure(Number(match[1]));
  else if(viewer.open) viewer.close();
}
function updateClock() {$('system-time').textContent=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());}
updateClock();
setInterval(updateClock,1000);
applyAddressState();
window.addEventListener('hashchange',applyAddressState);
