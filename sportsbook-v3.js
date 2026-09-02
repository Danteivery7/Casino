'use strict';
(function sportsbookV3(){
  const N=window.NRSPORTS2;if(!N)return;
  const V3DATA={"basketball":{"label":"Basketball","icon":"🏀","teams":[["Orlando Comets","#1664d9","#e7f0ff",84,"OC","sunburst"],["Vegas Vipers","#8224bc","#f4e7ff",82,"VV","neon"],["Brooklyn Kings","#161b26","#eceff5",88,"BK","crown"],["Seattle Surge","#087a5b","#e0fff2",80,"SS","wave"],["Austin Outlaws","#d55a16","#fff0df",79,"AO","star"],["Chicago Forge","#b01828","#fff0f2",86,"CF","steel"],["Miami Waves","#00a4a8","#ffb1c4",83,"MW","wave"],["Phoenix Sol","#e88d09","#ffe3a1",81,"PS","sunburst"],["Boston Foundry","#0f4c81","#d9e8f5",85,"BF","steel"],["Atlanta Flight","#c61f3a","#f6c84c",82,"AF","wing"],["Denver Summit","#5b2c83","#dceeff",84,"DS","mountain"],["Dallas Stampede","#143d59","#d9b46d",83,"DST","star"],["Houston Orbit","#d13b2f","#f7f1e8",80,"HO","orbit"],["Detroit Voltage","#d72535","#c7e8ff",81,"DV","bolt"],["Charlotte Crown","#2d8c8c","#c8b26a",79,"CC","crown"],["San Diego Tide","#1e73be","#f3a847",82,"SDT","wave"],["Portland Pines","#1e6542","#e7efe7",78,"PP","forest"],["Nashville Notes","#512d6d","#f3cf4a",80,"NN","stripe"],["New Orleans Brass","#6a4c93","#d6b25e",81,"NOB","stripe"],["Minneapolis North","#153e75","#a7d8f0",83,"MN","ice"]]},"football":{"label":"Football","icon":"🏈","teams":[["Orlando Guardians","#1e56aa","#e8f1ff",82,"OG","shield"],["Dallas Wranglers","#17395e","#d8e9ff",87,"DW","star"],["Chicago Iron","#8d161f","#fff0f0",84,"CI","steel"],["Portland Pioneers","#146a43","#edfff3",78,"PP","forest"],["Miami Cyclones","#00a5a6","#ff7e9e",85,"MC","wave"],["Denver Peaks","#f16d25","#e7f1ff",80,"DP","mountain"],["New York Empire","#2149a0","#e23a49",88,"NYE","stripe"],["Los Angeles Gold","#5c2f85","#f6ca4c",86,"LAG","crown"],["Seattle Grizzlies","#173f5f","#1f8a70",82,"SG","forest"],["Boston Liberty","#172554","#c32032",85,"BL","stripe"],["Atlanta Firebirds","#a61b2b","#f6b642",81,"AF","wing"],["Houston Stallions","#0c4a6e","#e85d3f",84,"HS","star"],["Phoenix Scorpions","#7f1d1d","#f59e0b",79,"PSC","sunburst"],["San Francisco Redwoods","#7f1d1d","#d8ead8",86,"SFR","forest"],["Las Vegas Aces","#111827","#d6b45c",83,"LVA","neon"],["Tampa Tridents","#0b4f6c","#55c1ff",82,"TT","wave"],["Detroit Machine","#1f2937","#ef4444",80,"DM","steel"],["Cleveland Rock","#5b21b6","#f3f4f6",79,"CR","stripe"],["Kansas City Royals","#b91c1c","#f3c84b",85,"KCR","crown"],["Carolina Thunder","#0f4c81","#8bd3ff",81,"CT","bolt"]]},"soccer":{"label":"Soccer","icon":"⚽","teams":[["Orlando Cityline","#6d35ad","#efe7ff",82,"OC","stripe"],["Miami Atlantic","#ff607c","#111827",83,"MA","wave"],["New York Borough","#18284b","#f3f4f6",87,"NYB","stripe"],["Austin Verde","#0f804f","#d9ffdf",80,"AV","forest"],["Seattle Rain","#056071","#e8fbff",84,"SR","wave"],["Los Angeles Stars","#1d4db2","#f3c94d",86,"LAS","star"],["Chicago Union","#a31129","#e5edf4",81,"CU","stripe"],["Boston Harbor","#0f5e96","#d43b47",79,"BH","wave"],["Portland Rose","#6b214d","#d5efdb",82,"PR","flower"],["Atlanta Phoenix","#a11d33","#f7b845",80,"AP","wing"],["Nashville Rhythm","#f4c430","#25205e",81,"NR","stripe"],["Charlotte Crown FC","#1d7a7a","#c8a95c",79,"CCF","crown"],["Dallas Lone Star","#112f5b","#e4e7ec",84,"DLS","star"],["Houston Dynamo","#f97316","#1f2937",83,"HD","bolt"],["San Diego Surf","#168aad","#f6bd60",81,"SDS","wave"],["Phoenix Cactus","#b45309","#166534",78,"PC","sunburst"],["Denver Alpine","#3b4cca","#dbeafe",80,"DA","mountain"],["Detroit Cityworks","#7f1d1d","#d1d5db",79,"DC","steel"],["Minneapolis Aurora","#1e3a8a","#60a5fa",82,"MNA","ice"],["New Orleans Crescent","#542e71","#d4af37",80,"NOC","crown"]]},"hockey":{"label":"Hockey","icon":"🏒","teams":[["Orlando Blades","#1a57b7","#dff5ff",80,"OB","ice"],["Tampa Storm","#173a68","#e6f7ff",87,"TS","bolt"],["Detroit Motors","#b51b35","#f7f7f7",83,"DM","steel"],["Seattle Icefall","#0b6d7a","#dafaff",84,"SI","ice"],["Boston Shields","#111827","#f6c85f",86,"BS","shield"],["Vegas Neon","#b38b22","#202020",85,"VN","neon"],["Denver Frost","#8b1e2d","#dceeff",81,"DF","mountain"],["New York Towers","#0e4a8a","#e94242",82,"NYT","stripe"],["Minnesota North","#0f4c5c","#dff7ed",84,"MN","ice"],["Chicago Wolves","#991b1b","#111827",85,"CW","stripe"],["Pittsburgh Forge","#111827","#facc15",83,"PF","steel"],["Buffalo Blizzard","#1d4ed8","#ef4444",80,"BB","ice"],["Toronto Crown","#1e3a8a","#f8fafc",86,"TC","crown"],["Montreal Royals","#b91c1c","#2563eb",87,"MR","stripe"],["Vancouver Peaks","#0f766e","#1e40af",81,"VP","mountain"],["Calgary Ember","#b91c1c","#facc15",82,"CE","sunburst"],["Edmonton Rush","#1e40af","#f97316",83,"ER","stripe"],["San Jose Current","#0f766e","#111827",78,"SJC","wave"],["Los Angeles Silver","#111827","#a3a3a3",80,"LAS","crown"],["Philadelphia Foundry","#f97316","#111827",82,"PFY","steel"]]},"tennis":{"label":"Tennis","icon":"🎾","players":[["Marco Vale","#236bce",88],["Elias Stone","#d4452f",84],["Noah King","#0b7a57",82],["Leo Hart","#8b48c8",86],["Adrian Cruz","#e69024",80],["Mika Sato","#26547c",85],["Tomas Reed","#942f47",79],["Andre Bell","#4f772d",83],["Julian Frost","#0e7490",81],["Diego Mercer","#be123c",84],["Ren Navarro","#4338ca",87],["Owen Silva","#15803d",80],["Nico Grant","#a16207",82],["Matteo Lane","#7e22ce",85],["Caleb Voss","#0369a1",79],["Kenji Brooks","#b91c1c",86],["Theo Rivers","#0f766e",81],["Luca Dean","#c2410c",83],["Evan Price","#475569",78],["Rafael Moon","#6d28d9",84],["Isaiah Hartman","#166534",82],["Sami Vega","#be185d",80],["Alex Moretti","#1d4ed8",85],["Jasper Cole","#92400e",79]]},"tabletennis":{"label":"Table Tennis","icon":"🏓","players":[["Jun Park","#e53935",87],["Mateo Silva","#1e88e5",83],["Kai Chen","#6a1b9a",89],["Luca Moretti","#00897b",80],["Theo Brown","#fb8c00",82],["Ren Ito","#3949ab",86],["Nico Vega","#7cb342",81],["Alex Novak","#d81b60",84],["Min Jae","#0f766e",85],["Oskar Petrov","#991b1b",82],["Hugo Lin","#1d4ed8",88],["Felix Costa","#c2410c",79],["Andre Wu","#4338ca",83],["Tomas Park","#15803d",81],["Elias Chen","#a16207",84],["Marco Ito","#be185d",80],["Noah Kim","#0369a1",86],["Leo Zhang","#7e22ce",82],["Adrian Sato","#b91c1c",85],["Mika Novak","#0f766e",78],["Rafael Yu","#4f46e5",83],["Diego Cho","#dc2626",81],["Sami Rossi","#ea580c",80],["Victor Han","#2563eb",84]]},"boxing":{"label":"Boxing","icon":"🥊","players":[["Darius Knox","#b7222d",88],["Miguel Reyes","#2463aa",84],["Isaiah King","#6a35ad",86],["Luka Petrov","#1e7a46",81],["Andre Cole","#c76f16",83],["Trey Mason","#28303b",85],["Victor Cruz","#9b2c2c",80],["Malik Stone","#0e7490",87],["Rico James","#be123c",82],["Anton Volkov","#334155",86],["Jalen Brooks","#1d4ed8",81],["Marco Santos","#b45309",84],["Noah Price","#166534",79],["Eli Mercer","#7e22ce",83],["Damon Fox","#991b1b",85],["Kenji Hale","#0f766e",80],["Tomas Grant","#4338ca",82],["Rafael Lane","#c2410c",87],["Owen King","#475569",78],["Nico Velez","#be185d",84],["Caleb Ward","#0369a1",81],["Adrian Frost","#15803d",83],["Sami Cross","#7c2d12",80],["Diego Bell","#1e40af",85]]},"mma":{"label":"MMA","icon":"🥋","players":[["Rafael Voss","#be3030",87],["Kenji Mori","#1f64b5",84],["Marcus Hale","#7c3fb1",85],["Diego Costa","#177447",82],["Nolan Price","#d17a14",80],["Sami Rahman","#334155",86],["Tomas Velez","#a12828",83],["Evan Cho","#0a7b83",88],["Jorge Lima","#b91c1c",84],["Pavel Stone","#1e3a8a",82],["Andre Kim","#6d28d9",86],["Malik Reyes","#166534",81],["Theo Knox","#ea580c",85],["Marco Park","#0f766e",79],["Jalen Cruz","#be123c",83],["Luka King","#334155",87],["Noah Silva","#1d4ed8",80],["Isaiah Mercer","#7e22ce",84],["Rico Hale","#b45309",82],["Victor Sato","#0369a1",86],["Adrian Voss","#991b1b",81],["Damon Cho","#15803d",83],["Elias Rahman","#c2410c",80],["Mika Petrov","#4338ca",85]]}};
  Object.assign(N.DATA,V3DATA);

  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=N.ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function rawName(r){return r[0]}
  function queueKey(s){return `neonRoyaleSportsPoolV3:${s}`}
  function lastKey(s){return `neonRoyaleSportsLastV3:${s}`}

  N.comp=function(raw,solo){
    return {
      name:raw[0],color:raw[1],accent:solo?'#f4f4f4':raw[2],
      rating:solo?raw[2]:raw[3],short:raw[0].split(' ').at(-1),
      code:solo?raw[0].split(' ').map(x=>x[0]).join('').slice(0,3).toUpperCase():(raw[4]||raw[0].slice(0,3).toUpperCase()),
      pattern:solo?'solo':(raw[5]||'stripe')
    }
  };

  function takeBoard(s,count=6){
    const d=N.DATA[s],source=d.teams||d.players,names=source.map(rawName);
    let q=[];try{q=JSON.parse(localStorage.getItem(queueKey(s))||'[]')}catch{}
    q=q.filter(n=>names.includes(n));
    let last=[];try{last=JSON.parse(localStorage.getItem(lastKey(s))||'[]')}catch{}
    while(q.length<count){
      let refill=names.filter(n=>!q.includes(n)&&!last.includes(n));
      if(refill.length<count-q.length)refill=names.filter(n=>!q.includes(n));
      q.push(...shuffle(refill));
    }
    const chosen=q.splice(0,count);
    localStorage.setItem(queueKey(s),JSON.stringify(q));
    localStorage.setItem(lastKey(s),JSON.stringify(chosen));
    const byName=new Map(source.map(r=>[r[0],r]));
    return chosen.map(n=>byName.get(n));
  }

  N.eventPair=function(s,aRaw,bRaw){
    const d=N.DATA[s],solo=!d.teams,a=N.comp(aRaw,solo),b=N.comp(bRaw,solo);
    const p=N.clamp(N.logistic((a.rating-b.rating)/7.5),.2,.8);
    return {sport:s,a,b,probs:[p,1-p],dec:N.book2(p),label:d.label,icon:d.icon};
  };

  N.event=function(s){const pair=takeBoard(s,2);return N.eventPair(s,pair[0],pair[1])};

  N.stage=function(e){
    const cls=e.sport==='basketball'?'basketball-court':e.sport==='soccer'?'soccer-pitch':e.sport==='football'?'football-field':'hockey-rink';
    const count=e.sport==='basketball'?10:e.sport==='soccer'?10:e.sport==='football'?10:8;
    const homeCode=e.a.code||e.a.short.slice(0,3).toUpperCase(),awayCode=e.b.code||e.b.short.slice(0,3).toUpperCase();
    return `<div class="sport-v2-stage ${cls} venue-v3" id="sportStage" data-pattern="${e.a.pattern||'stripe'}" style="--home:${e.a.color};--homeAccent:${e.a.accent};--away:${e.b.color};--awayAccent:${e.b.accent}">
      <div class="venue-colorwash"></div><div class="surface-lines"></div>
      <div class="home-zone"><span>${homeCode}</span></div><div class="away-zone"><span>${awayCode}</span></div>
      <div class="center-brand team-center-mark"><b>${homeCode}</b><span>${e.a.name.toUpperCase()} HOME VENUE</span></div>
      ${e.sport==='basketball'?'<div class="hoop left"></div><div class="hoop right"></div>':e.sport==='soccer'?'<div class="goal left"></div><div class="goal right"></div>':e.sport==='hockey'?'<div class="net left"></div><div class="net right"></div>':''}
      ${Array.from({length:count},(_,i)=>`<div class="v2-player ${i<count/2?'team-a':'team-b'}" style="--team:${i<count/2?e.a.color:e.b.color};--accent:${i<count/2?e.a.accent:e.b.accent}"><i>${i%(count/2)+1}</i></div>`).join('')}
      <div class="v2-ball" id="gameBall">${e.sport==='basketball'?'🏀':e.sport==='football'?'🏈':e.sport==='soccer'?'⚽':'●'}</div><div class="action-word" id="actionWord"></div>
    </div>`;
  };

  N.card=function(e,i){
    return `<article class="sports-event sports-event-v3">
      <header><span>MONEYLINE</span><small>FEATURED SIM ${String(i+1).padStart(2,'0')}</small></header>
      <div class="matchup matchup-v3">
        <div class="v3-team-side">${N.swatch(e.a)}<div><b>${e.a.name}</b><small><strong>${Math.round(e.probs[0]*100)}%</strong> model chance · ${e.a.code||''}</small></div></div>
        <span class="versus">VS</span>
        <div class="v3-team-side away">${N.swatch(e.b)}<div><b>${e.b.name}</b><small><strong>${Math.round(e.probs[1]*100)}%</strong> model chance · ${e.b.code||''}</small></div></div>
      </div>
      <div class="sports-odds sports-odds-v3">
        <button class="sports-odd" data-event-v2="${i}" data-side="0"><span>BET ${e.a.short.toUpperCase()}</span><b>${N.american(e.dec[0])}</b><small>${e.dec[0].toFixed(2)}× total return</small></button>
        <button class="sports-odd" data-event-v2="${i}" data-side="1"><span>BET ${e.b.short.toUpperCase()}</span><b>${N.american(e.dec[1])}</b><small>${e.dec[1].toFixed(2)}× total return</small></button>
      </div>
    </article>`;
  };

  N.render=function(){
    const ss=['basketball','football','soccer','hockey','tennis','tabletennis','boxing','mma','horses','motorsports'];
    $('#gameMount').innerHTML=`<div class="sportsbook-v2-shell sportsbook-v3-shell">
      <div class="sportsbook-v2-top sportsbook-v3-top"><div><p class="kicker">NEON ROYALE SPORTSBOOK</p><h3>Choose a live simulation</h3><small class="v3-subhead">Expanded leagues · rotating cards · no duplicate competitors on a card</small></div>${betControls('sportsStake',100)}</div>
      <div class="sport-tabs sport-tabs-v2 sport-tabs-v3">${ss.map((s,i)=>`<button data-sport-v2="${s}" class="${i===0?'active':''}"><span class="sport-tab-icon">${s==='horses'?'🏇':s==='motorsports'?'🏎️':N.DATA[s].icon}</span><b>${s==='horses'?'Horse Racing':s==='motorsports'?'Motorsports':N.DATA[s].label}</b><small>${['basketball','football','soccer','hockey'].includes(s)?'20-team league':['tennis','tabletennis','boxing','mma'].includes(s)?'24 competitors':s==='horses'?'30-horse stable':'48 drivers'}</small></button>`).join('')}</div>
      <div id="sportsBoardV2" class="sports-board-v3"></div>
    </div>`;
    wireQuickBets($('#gameMount'));$$('[data-sport-v2]').forEach(b=>b.onclick=()=>N.select(b.dataset.sportV2));N.select('basketball');
  };

  N.select=function(s){
    $$('[data-sport-v2]').forEach(b=>b.classList.toggle('active',b.dataset.sportV2===s));
    const board=$('#sportsBoardV2');
    if(s==='horses'){
      board.innerHTML=`<div class="sports-special-card sports-special-card-v3"><div><p class="kicker">ROYAL TURF CLUB</p><h3>Horse Racing</h3><p>Rotating 30-horse stable, fractional odds, Track View and Immersive View.</p></div><button class="gold-btn" id="openHorseV2">OPEN RACEBOOK</button></div>`;
      $('#openHorseV2').onclick=()=>{window.renderHorses();const back=document.createElement('button');back.className='back-sportsbook-v2';back.textContent='← Sportsbook';back.onclick=N.render;$('#gameMount').prepend(back)};return;
    }
    if(s==='motorsports')return N.renderMotor(board);
    const raws=takeBoard(s,6),es=[0,1,2].map(i=>N.eventPair(s,raws[i*2],raws[i*2+1]));
    board.innerHTML=`<div class="sports-title-row sports-title-row-v3">
      <div><span>${N.DATA[s].icon}</span><div><p class="kicker">${N.DATA[s].label.toUpperCase()}</p><h3>Featured Moneylines</h3><small>Six unique competitors · three live simulations</small></div></div>
      <button class="glass-btn refresh-sports-card" id="refreshSportsV3">NEW MATCHUPS</button>
    </div>
    <div class="event-grid event-grid-v3">${es.map((e,i)=>N.card(e,i)).join('')}</div>
    <div id="sportsTicketV2" class="sports-ticket-empty sports-ticket-v3">Select a side to build your ticket.</div>`;
    es.forEach((e,i)=>N.wire(e,i));
    $('#refreshSportsV3').onclick=()=>N.select(s);
  };

  N.open=function(){
    currentGame='sports';document.body.dataset.room='sports';$('#lobbyView').classList.remove('active');$('#gameView').classList.add('active');
    $('#gameTitle').textContent='Neon Royale Sportsbook';$('#gameEyebrow').textContent='SPORTSBOOK';$('#gameSubtitle').textContent='Expanded leagues · event-driven simulations';
    $('#gameHelpBtn').onclick=N.help;N.render();scrollTo({top:0,behavior:'smooth'});
  };
  const entry=$('#sportsbookLobbyCard');if(entry)entry.onclick=N.open;
})();