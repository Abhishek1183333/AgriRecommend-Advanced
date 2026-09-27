const crops = [
  {name:"Rice", icon:"🌾", seasons:["Kharif","Whole Year"], soils:["Clay","Alluvial"], temp:[20,38], humidity:[60,100], rain:[1000,3000], ph:[5.0,7.5], npk:[90,40,40], yield:"3.5–5.0 t/ha", cycle:"110–150 days"},
  {name:"Wheat", icon:"🌾", seasons:["Rabi"], soils:["Loamy","Alluvial"], temp:[10,26], humidity:[40,70], rain:[400,1000], ph:[6.0,7.5], npk:[80,40,35], yield:"3.0–4.5 t/ha", cycle:"120–140 days"},
  {name:"Maize", icon:"🌽", seasons:["Kharif","Rabi","Whole Year"], soils:["Loamy","Alluvial","Red/Sandy"], temp:[18,35], humidity:[45,80], rain:[500,1200], ph:[5.5,7.5], npk:[90,45,40], yield:"4.0–6.0 t/ha", cycle:"90–120 days"},
  {name:"Cotton", icon:"🧶", seasons:["Kharif"], soils:["Black","Alluvial"], temp:[21,35], humidity:[50,80], rain:[500,1100], ph:[5.5,8.0], npk:[70,35,40], yield:"1.8–2.5 t/ha", cycle:"150–180 days"},
  {name:"Sugarcane", icon:"🎋", seasons:["Kharif","Whole Year"], soils:["Alluvial","Loamy","Black"], temp:[20,38], humidity:[55,90], rain:[1100,2500], ph:[6.0,7.5], npk:[120,50,60], yield:"60–80 t/ha", cycle:"300–360 days"},
  {name:"Chickpea", icon:"🫘", seasons:["Rabi"], soils:["Loamy","Red/Sandy","Black"], temp:[12,28], humidity:[30,65], rain:[350,700], ph:[6.0,8.0], npk:[35,45,30], yield:"1.2–2.0 t/ha", cycle:"90–110 days"},
  {name:"Watermelon", icon:"🍉", seasons:["Zaid"], soils:["Red/Sandy","Loamy"], temp:[24,42], humidity:[30,65], rain:[300,600], ph:[5.5,7.0], npk:[80,40,50], yield:"25–40 t/ha", cycle:"80–100 days"},
  {name:"Groundnut", icon:"🥜", seasons:["Kharif","Zaid"], soils:["Red/Sandy","Loamy"], temp:[20,34], humidity:[40,75], rain:[450,900], ph:[5.5,7.0], npk:[35,45,45], yield:"1.5–2.5 t/ha", cycle:"105–125 days"},
  {name:"Soybean", icon:"🫛", seasons:["Kharif"], soils:["Black","Loamy"], temp:[20,32], humidity:[50,80], rain:[600,1100], ph:[6.0,7.5], npk:[55,45,40], yield:"1.5–2.5 t/ha", cycle:"90–120 days"},
  {name:"Mustard", icon:"🌼", seasons:["Rabi"], soils:["Loamy","Alluvial"], temp:[10,25], humidity:[35,65], rain:[350,650], ph:[6.0,7.5], npk:[50,35,25], yield:"1.0–1.8 t/ha", cycle:"110–140 days"}
];

let season = "Kharif";
let chart;

const $ = id => document.getElementById(id);
const num = id => Number($(id).value) || 0;

document.querySelectorAll(".season-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".season-btn").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    season = btn.dataset.season;
    analyze();
  });
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const p = {
      monsoon:["Kharif","Alluvial",100,45,55,6.8,29,82,1850],
      dry:["Zaid","Red/Sandy",45,40,55,6.5,36,35,350],
      winter:["Rabi","Loamy",80,45,40,7.0,18,55,650],
      balanced:["Kharif","Loamy",80,45,50,6.8,26,65,900]
    }[btn.dataset.preset];

    season = p[0];
    document.querySelectorAll(".season-btn").forEach(x => x.classList.toggle("active", x.dataset.season === season));
    ["soil","nitrogen","phosphorus","potassium","ph","temperature","humidity","rainfall"].forEach((id,i) => $(id).value=p[i+1]);
    analyze();
    toast("Preset applied");
  });
});

$("analyzeBtn").addEventListener("click", analyze);
$("themeBtn").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  $("themeBtn").innerHTML = `<i data-lucide="${document.documentElement.classList.contains("dark") ? "sun" : "moon"}"></i>`;
  lucide.createIcons();
  analyzeChart();
});
$("guideBtn").addEventListener("click", () => $("guideModal").classList.remove("hidden"));
$("closeGuide").addEventListener("click", () => $("guideModal").classList.add("hidden"));
$("exportBtn").addEventListener("click", exportReport);

function rangeScore(value, range) {
  if (value >= range[0] && value <= range[1]) return 1;
  const distance = value < range[0] ? range[0] - value : value - range[1];
  const width = range[1] - range[0] || 1;
  return Math.max(0, 1 - distance / width);
}

function nutrientScore(value, ideal) {
  const difference = Math.abs(value - ideal);
  return Math.max(0, 1 - difference / Math.max(ideal, 1));
}

function scoreCrop(c) {
  const soil = $("soil").value, temp=num("temperature"), hum=num("humidity"), rain=num("rainfall"), ph=num("ph");
  const n=num("nitrogen"), p=num("phosphorus"), k=num("potassium");

  const seasonScore = c.seasons.includes(season) || c.seasons.includes("Whole Year") ? 1 : .15;
  const soilScore = c.soils.includes(soil) ? 1 : .25;
  const climate = (rangeScore(temp,c.temp)+rangeScore(hum,c.humidity)+rangeScore(rain,c.rain))/3;
  const phScore = rangeScore(ph,c.ph);
  const nutrient = (nutrientScore(n,c.npk[0])+nutrientScore(p,c.npk[1])+nutrientScore(k,c.npk[2]))/3;

  const total = seasonScore*.20 + soilScore*.20 + climate*.28 + phScore*.12 + nutrient*.20;
  return Math.round(Math.max(0, Math.min(100,total*100)));
}

function analyze() {
  const results = crops.map(c => ({...c, score:scoreCrop(c)})).sort((a,b)=>b.score-a.score);
  const top=results[0];
  $("topCrop").textContent=top.name;
  $("confidence").textContent=top.score+"%";
  const risk = calculateRisk();
  $("riskLevel").textContent=risk.level;

  renderRecommendations(results);
  renderHealth();
  renderExplanation(top);
  renderRisks(risk.items);
  drawChart(results);
}

function renderRecommendations(results) {
  $("recommendations").innerHTML = results.map((c,i)=>`
    <div class="recommend-card">
      <div class="flex items-center gap-3">
        <div class="rank">${i+1}</div>
        <div class="text-2xl">${c.icon}</div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-extrabold">${c.name}</h4>
            <span class="text-sm font-black ${c.score>=70?'text-emerald-600':c.score>=50?'text-amber-600':'text-rose-500'}">${c.score}%</span>
          </div>
          <p class="mt-1 text-[11px] text-slate-500">${c.yield} · ${c.cycle}</p>
          <div class="score-bar mt-2"><div class="score-fill" style="width:${c.score}%"></div></div>
        </div>
      </div>
    </div>`).join("");
}

function renderHealth() {
  const values = [
    ["Nitrogen", Math.min(100,num("nitrogen")/1.5)],
    ["Phosphorus", Math.min(100,num("phosphorus")/1)],
    ["Potassium", Math.min(100,num("potassium")/1.2)],
    ["pH Balance", Math.max(0,100-Math.abs(num("ph")-6.8)*18)],
    ["Climate", (rangeScore(num("temperature"),[18,34])+rangeScore(num("humidity"),[40,80])+rangeScore(num("rainfall"),[400,1600]))/3*100]
  ];
  $("healthBars").innerHTML=values.map(([name,val])=>`
    <div class="health-row"><span>${name}</span><div class="health-bar"><div class="health-fill" style="width:${Math.round(val)}%"></div></div><b>${Math.round(val)}%</b></div>`).join("");
}

function renderExplanation(c) {
  const factors = [
    ["Season", c.seasons.includes(season) || c.seasons.includes("Whole Year"), `${season} compatibility`],
    ["Soil", c.soils.includes($("soil").value), `${$("soil").value} soil`],
    ["Temperature", rangeScore(num("temperature"),c.temp)>.75, `${num("temperature")}°C vs ${c.temp[0]}–${c.temp[1]}°C`],
    ["Rainfall", rangeScore(num("rainfall"),c.rain)>.75, `${num("rainfall")} mm vs ${c.rain[0]}–${c.rain[1]} mm`],
    ["pH", rangeScore(num("ph"),c.ph)>.75, `pH ${num("ph")} vs ${c.ph[0]}–${c.ph[1]}`]
  ];
  $("explanation").innerHTML=factors.map(([a,ok,b])=>`
    <div class="reason flex items-center justify-between gap-3">
      <div><b>${a}</b><p class="mt-1 text-[10px] text-slate-500">${b}</p></div>
      <span class="${ok?'text-emerald-600':'text-rose-500'} font-black">${ok?'✓ Match':'! Check'}</span>
    </div>`).join("");
}

function calculateRisk() {
  const items=[];
  const temp=num("temperature"), rain=num("rainfall"), ph=num("ph"), hum=num("humidity");
  if(temp>38) items.push("High temperature may create heat stress.");
  if(temp<10) items.push("Low temperature may slow crop development.");
  if(rain>2500) items.push("Very high rainfall can increase waterlogging risk.");
  if(rain<300) items.push("Low rainfall may increase irrigation dependency.");
  if(ph<5.5 || ph>8) items.push("Soil pH is outside the common crop range.");
  if(hum>90) items.push("Very high humidity can increase disease pressure.");
  if(!items.length) items.push("No major rule-based climate or soil alert detected.");
  return {level:items.length>=3?"High":items.length===2?"Moderate":"Low",items};
}

function renderRisks(items) {
  $("risks").innerHTML=items.map(x=>`<div class="risk"><i data-lucide="alert-triangle" class="h-4 w-4 shrink-0"></i><span>${x}</span></div>`).join("");
  lucide.createIcons();
}

function initChart() {
  chart = new Chart($("cropChart"), {
    type:"bar",
    data:{labels:[],datasets:[{data:[],backgroundColor:"#10b981",borderRadius:8}]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        y:{beginAtZero:true,max:100,ticks:{callback:v=>v+"%"},grid:{color:"rgba(148,163,184,.15)"}},
        x:{grid:{display:false},ticks:{font:{size:10}}}
      }
    }
  });
}

function drawChart(results) {
  if(!chart) initChart();
  chart.data.labels=results.map(x=>x.name);
  chart.data.datasets[0].data=results.map(x=>x.score);
  chart.data.datasets[0].backgroundColor=results.map((x,i)=>i===0?"#059669":i<3?"#34d399":"#a7f3d0");
  chart.update();
}

function analyzeChart(){ if(chart){chart.options.scales.y.grid.color="rgba(148,163,184,.15)"; chart.update();} }

function exportReport() {
  const results=crops.map(c=>({...c,score:scoreCrop(c)})).sort((a,b)=>b.score-a.score);
  const text=[
    "AGRISENSE AI FARM REPORT","========================",
    `Season: ${season}`,`Soil: ${$("soil").value}`,
    `NPK: ${num("nitrogen")}/${num("phosphorus")}/${num("potassium")}`,
    `pH: ${num("ph")}`,`Temperature: ${num("temperature")} C`,
    `Humidity: ${num("humidity")}%`,`Rainfall: ${num("rainfall")} mm`,
    "", "RECOMMENDATIONS:", ...results.map((r,i)=>`${i+1}. ${r.name} - ${r.score}%`)
  ].join("\n");
  const blob=new Blob([text],{type:"text/plain"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="agrisense-farm-report.txt"; a.click();
  URL.revokeObjectURL(a.href); toast("Report exported");
}

function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200);}

lucide.createIcons();
initChart();
analyze();
