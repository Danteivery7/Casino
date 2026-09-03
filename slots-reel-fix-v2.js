'use strict';

/* Neon Royale Slots stability pass
   - Measures the rendered reel-cell height instead of assuming 68px.
   - Uses finite Web Animations API spins with a timeout/fallback.
   - The final visible detent is authoritative and is scored after the reel stops.
*/
(function slotsReelFixV2(){
  const U32=0x100000000;
  function u32(){if(window.crypto?.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0]}return Math.floor(Math.random()*U32)}
  function ri(n){n=Math.floor(n);const limit=U32-(U32%n);let x;do{x=u32()}while(x>=limit);return x%n}
  function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  const SYMBOLS=[
    {key:'blank',display:'•',label:'Blank',count:24,pct:48},
    {key:'cherry',display:'🍒',label:'Cherry',count:10,pct:20},
    {key:'lemon',display:'🍋',label:'Lemon',count:6,pct:12},
    {key:'bell',display:'🔔',label:'Bell',count:4,pct:8},
    {key:'bar',display:'BAR',label:'BAR',count:3,pct:6},
    {key:'seven',display:'7',label:'Seven',count:2,pct:4},
    {key:'diamond',display:'◆',label:'Diamond',count:1,pct:2}
  ];
  const BY=Object.fromEntries(SYMBOLS.map(s=>[s.key,s]));
  const POOL=SYMBOLS.flatMap(s=>Array(s.count).fill(s.key));
  const THREE={cherry:25,lemon:35,bell:60,bar:125,seven:250,diamond:1000};
  const FIVE={
    cherry:{3:55,4:110,5:275},lemon:{3:85,4:215,5:535},bell:{3:135,4:375,5:1070},
    bar:{3:215,4:800,5:2675},seven:{3:430,4:1600,5:6400},diamond:{3:960,4:4800,5:24000}
  };
  const LINES=[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1]];
  const COPIES=7,BASE_COPY=2;
  const sym=k=>`<span class="slot-symbol ${k==='blank'?'slot-blank':''}">${BY[k].display}</span>`;
  const visible=(strip,stop)=>{const n=strip.length;return [strip[(stop-1+n)%n],strip[stop%n],strip[(stop+1)%n]]};

  function score3(matrix){
    const [a,b,c]=matrix.map(x=>x[1]);let mult=0,label='No winning combination',count=0;
    if(a===b&&b===c&&a!=='blank'){mult=THREE[a]||0;label=`Three ${BY[a].label}s`;count=3}
    else if(a==='cherry'&&b==='cherry'){mult=8;label='Cherry · Cherry · Any';count=2}
    else if(a==='cherry'){mult=2;label='Cherry · Any · Any';count=1}
    const cells=new Set();for(let i=0;i<count;i++)cells.add(`${i}-1`);return{mult,label,cells};
  }
  function score5(matrix,stake){
    const lineBet=stake/LINES.length,wins=[],cells=new Set();let totalReturn=0;
    LINES.forEach((rows,line)=>{const keys=rows.map((row,reel)=>matrix[reel][row]),first=keys[0];if(first==='blank')return;let count=1;while(count<keys.length&&keys[count]===first)count++;if(count<3)return;const mult=FIVE[first]?.[count]||0;if(!mult)return;const ret=lineBet*mult;totalReturn+=ret;for(let r=0;r<count;r++)cells.add(`${r}-${rows[r]}`);wins.push({line:line+1,key:first,count,mult,lineReturn:ret})});
    return{totalReturn,wins,cells};
  }
  function paytable(mode){
    if(mode===3)return `<p class="kicker">ROYAL REELS</p><h2>Classic 3-Reel Paytable</h2><div class="slot-paytable-grid slot-paytable-classic"><span>◆ ◆ ◆</span><b>1000×</b><span>7 · 7 · 7</span><b>250×</b><span>BAR · BAR · BAR</span><b>125×</b><span>🔔 🔔 🔔</span><b>60×</b><span>🍋 🍋 🍋</span><b>35×</b><span>🍒 🍒 🍒</span><b>25×</b><span>🍒 🍒 ANY</span><b>8×</b><span>🍒 ANY ANY</span><b>2×</b></div><div class="modal-card"><b>Theoretical RTP 91.82%</b></div>`;
    return `<p class="kicker">ROYAL REELS</p><h2>Modern 5-Reel Paytable</h2><p>9 paylines. Matching symbols must begin on reel 1 and continue left-to-right.</p><div class="slot-paytable-scroll"><table class="slot-paytable-table"><thead><tr><th>Symbol</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody>${SYMBOLS.filter(s=>s.key!=='blank').map(s=>`<tr><td>${s.display} ${s.label}</td><td>${FIVE[s.key][3]}×</td><td>${FIVE[s.key][4]}×</td><td>${FIVE[s.key][5]}×</td></tr>`).join('')}</tbody></table></div><div class="modal-card"><b>Theoretical RTP 93.87%</b></div>`;
  }

  window.renderSlots=function renderSlotsStable(){
    let mode=5,spinning=false,strips=[],stops=[];
    const rebuild=()=>{strips=Array.from({length:mode},()=>shuffle(POOL));stops=Array.from({length:mode},()=>ri(POOL.length))};
    rebuild();
    $('#gameMount').innerHTML=`<div class="casino-room room-slots slot-v2 slot-integrity slot-stable"><div class="room-topline"><span class="rules-badge" id="slotRulesBadge">MODERN 5-REEL · PHYSICAL DETENT STOPS</span>${betControls('slotBet',25)}</div><div class="slot-mode-row"><div class="slot-mode-switch"><button data-slot-mode="3">CLASSIC 3-REEL</button><button data-slot-mode="5" class="active">MODERN 5-REEL</button></div><div class="slot-help-actions"><button class="glass-btn slot-small-btn" id="slotPaytableBtn">VIEW PAYTABLE</button><button class="glass-btn slot-small-btn" id="slotHowBtn">HOW IT WORKS</button></div></div><div class="slot-cabinet modern-five" id="slotCabinet"><div class="slot-lights"></div><div class="slot-marquee"><small>NEON ROYALE</small> ROYAL REELS</div><div class="slot-machine-subtitle" id="slotSubtitle">5 REELS · 3 ROWS · 9 ACTIVE PAYLINES</div><div class="integrity-reel-bank five" id="slotReelBank"></div><div class="slot-display" id="slotDisplay">PRESS SPIN · THE REELS DECIDE</div><div class="slot-return-info" id="slotReturnInfo"><span>THEORETICAL RTP</span><b>93.87%</b><span>9 PAYLINES</span></div><div class="game-actions"><button class="primary-btn slot-spin-button" id="slotSpin">SPIN</button></div><div class="slot-frequency-panel"><div><b>FIXED REEL STRIP FREQUENCY</b><small>Every reel has 50 fixed stops. The symbols physically resting in the window are scored.</small></div><div class="slot-frequency-list">${SYMBOLS.map(s=>`<span><i>${s.display}</i>${s.label} <b>${s.pct}%</b></span>`).join('')}</div></div></div></div>`;
    wireQuickBets($('#gameMount'));
    const bank=$('#slotReelBank'),display=$('#slotDisplay'),cab=$('#slotCabinet'),spin=$('#slotSpin');

    function reelCells(strip){return Array.from({length:COPIES},()=>strip).flat().map(k=>`<div class="integrity-reel-cell">${sym(k)}</div>`).join('')}
    function measureCell(track){const cell=track.querySelector('.integrity-reel-cell');return cell?.getBoundingClientRect().height||68}
    function yFor(stop,cellH){return (BASE_COPY*POOL.length+stop-1)*cellH}
    function normalizeReel(i){const track=bank.querySelector(`[data-reel="${i}"] .integrity-reel-track`);if(!track)return;const h=measureCell(track);track.getAnimations?.().forEach(a=>a.cancel());track.style.transition='none';track.style.transform=`translate3d(0,-${yFor(stops[i],h)}px,0)`}
    function paint(){bank.className=`integrity-reel-bank ${mode===3?'three':'five'}`;bank.innerHTML=strips.map((strip,i)=>`<div class="integrity-reel-window" data-reel="${i}"><div class="integrity-reel-track">${reelCells(strip)}</div></div>`).join('');requestAnimationFrame(()=>stops.forEach((_,i)=>normalizeReel(i)))}
    function matrix(){return strips.map((s,i)=>visible(s,stops[i]))}
    function clearHighlights(){$$('.integrity-reel-cell',bank).forEach(x=>x.classList.remove('slot-winning-cell'))}
    function highlight(cells){cells.forEach(tok=>{const [reel,row]=tok.split('-').map(Number),track=bank.querySelector(`[data-reel="${reel}"] .integrity-reel-track`);if(!track)return;const index=BASE_COPY*POOL.length+stops[reel]-1+row;track.children[index]?.classList.add('slot-winning-cell')})}

    async function animateOne(i){
      const track=bank.querySelector(`[data-reel="${i}"] .integrity-reel-track`);if(!track)return;
      const h=measureCell(track),startStop=stops[i],delta=ri(POOL.length),loops=2+ri(2),travel=loops*POOL.length+delta;
      const startY=yFor(startStop,h),endY=startY+travel*h,duration=(mode===3?1250:1400)+i*210+ri(180);
      track.getAnimations?.().forEach(a=>a.cancel());track.style.transition='none';track.style.transform=`translate3d(0,-${startY}px,0)`;
      await new Promise(requestAnimationFrame);
      let anim=null;
      try{
        if(typeof track.animate==='function')anim=track.animate([{transform:`translate3d(0,-${startY}px,0)`},{transform:`translate3d(0,-${endY}px,0)`}],{duration,easing:'cubic-bezier(.12,.72,.12,1)',fill:'forwards'});
        if(anim)await Promise.race([anim.finished.catch(()=>{}),new Promise(r=>setTimeout(r,duration+250))]);
        else await new Promise(resolve=>{track.style.transition=`transform ${duration}ms cubic-bezier(.12,.72,.12,1)`;requestAnimationFrame(()=>track.style.transform=`translate3d(0,-${endY}px,0)`);setTimeout(resolve,duration+100)});
      }finally{
        stops[i]=(startStop+delta)%POOL.length;
        anim?.cancel();normalizeReel(i);if(typeof pulse==='function')pulse(bank.querySelector(`[data-reel="${i}"]`),'reel-window-stop');
      }
    }
    async function spinReels(){clearHighlights();await Promise.all(strips.map((_,i)=>animateOne(i)))}

    function setMode(next){if(spinning||next===mode)return;mode=next;rebuild();$$('[data-slot-mode]').forEach(b=>b.classList.toggle('active',+b.dataset.slotMode===mode));cab.classList.toggle('classic-three',mode===3);cab.classList.toggle('modern-five',mode===5);$('#slotRulesBadge').textContent=mode===3?'CLASSIC 3-REEL · PHYSICAL DETENT STOPS':'MODERN 5-REEL · PHYSICAL DETENT STOPS';$('#slotSubtitle').textContent=mode===3?'3 REELS · CENTER ROW PAYS':'5 REELS · 3 ROWS · 9 ACTIVE PAYLINES';$('#slotReturnInfo').innerHTML=mode===3?'<span>THEORETICAL RTP</span><b>91.82%</b><span>1 PAYLINE</span>':'<span>THEORETICAL RTP</span><b>93.87%</b><span>9 PAYLINES</span>';display.textContent='PRESS SPIN · THE REELS DECIDE';paint()}
    $$('[data-slot-mode]').forEach(b=>b.onclick=()=>setMode(+b.dataset.slotMode));
    $('#slotPaytableBtn').onclick=()=>showModal(paytable(mode));
    $('#slotHowBtn').onclick=()=>showModal(`<p class="kicker">ROYAL REELS</p><h2>The visible stop is the result</h2><p>The reels use fixed 50-stop strips. A spin moves each strip a random whole number of physical detents, the reel visibly settles, and only then are the resting symbols scored. The animation measures the actual cell height, so it works consistently on desktop and mobile.</p>${paytable(mode)}`);

    spin.onclick=async()=>{
      if(spinning)return;const stake=getBet('slotBet');if(!stake)return;spinning=true;spin.disabled=true;adjust(-stake,{wager:true});recordGame('slots');cab.classList.add('machine-live');display.textContent='REELS IN MOTION…';
      try{
        await spinReels();const m=matrix();
        if(mode===3){const r=score3(m),ret=stake*r.mult;if(ret)adjust(ret,{win:true});highlight(r.cells);display.textContent=ret?`${r.label.toUpperCase()} · RETURN ${money(ret)}`:`NO WIN · -${money(stake)}`;if(ret>=stake*50)confetti()}
        else{const r=score5(m,stake),ret=r.totalReturn;if(ret)adjust(ret,{win:true});highlight(r.cells);display.textContent=ret?`${r.wins.length} PAYLINE${r.wins.length===1?'':'S'} · RETURN ${money(ret)}`:`NO WINNING PAYLINE · -${money(stake)}`;if(ret>=stake*50)confetti()}
      }catch(err){console.error('Slot spin recovery',err);display.textContent='SPIN RECOVERED · PRESS SPIN AGAIN';stops.forEach((_,i)=>normalizeReel(i));}
      finally{cab.classList.remove('machine-live');spinning=false;spin.disabled=false}
    };
    paint();
  };
})();