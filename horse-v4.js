'use strict';

/* Neon Royale Horse Racing v4
   - 30-horse rotating stable; six unique runners per card.
   - Every new race regenerates the field, favorite assignment, probability curve and posted odds.
   - Track View keeps the full oval. Immersive View follows the live leader/front pack with no finish line visible.
*/
(function horseRacingV4(){
  const U32=0x100000000;
  const TAKE=0.90;
  const HORSE_NAMES=[
    'Midnight Ace','Golden Circuit','Velvet Thunder','Lucky Comet','Royal Static','Emerald Rush',
    'Copper Crown','Blue Monarch','Solar Flare','Night Parade','Silver Ledger','Crimson Echo',
    'Desert Ghost','Harbor Lights','Kingmaker Run','Neon Phantom','Crown Jewel','Rapid Fortune',
    'Wild Horizon','Ivory Rocket','Storm Lantern','Velvet Arrow','Golden Harbor','Moonlit Rebel',
    'Scarlet Signal','Northern Rhythm','Electric Prince','Diamond Current','Grand Mirage','Lasting Glory'
  ];
  const SILKS=['#a53c45','#326aa3','#c79b2b','#7354a6','#258264','#d06e31','#a32974','#21686f','#7c4b22','#4356a9','#84342e','#4c7a2f'];
  const STORAGE_QUEUE='neonRoyaleHorseNameQueueV4';
  const STORAGE_RACE_NO='neonRoyaleHorseRaceNoV4';
  const STORAGE_VIEW='neonRoyaleHorseViewV4';

  function u32(){if(window.crypto?.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0]}return Math.floor(Math.random()*U32)}
  function rand(){return u32()/U32}
  function randInt(n){n=Math.floor(n);if(n<=0)return 0;const limit=U32-(U32%n);let x;do{x=u32()}while(x>=limit);return x%n}
  function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=randInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function gcd(a,b){while(b){[a,b]=[b,a%b]}return Math.abs(a)||1}
  function frac(decimal){const profit=Math.max(.02,decimal-1);if(Math.abs(profit-1)<.06)return'EVS';const dens=profit<1?[4,5,8]:profit<2?[2,4]:profit<5?[1,2]:[1];let best={err:Infinity,n:1,d:1};for(const d of dens){const n=Math.max(1,Math.round(profit*d)),err=Math.abs(n/d-profit);if(err<best.err)best={err,n,d}}const g=gcd(best.n,best.d);return`${best.n/g}/${best.d/g}`}
  function ordinal(n){return n===1?'1ST':n===2?'2ND':n===3?'3RD':`${n}TH`}

  function nextRaceNumber(){const n=(Number(localStorage.getItem(STORAGE_RACE_NO))||0)+1;localStorage.setItem(STORAGE_RACE_NO,String(n));return n}
  function nextFieldNames(){
    let q=[];try{q=JSON.parse(localStorage.getItem(STORAGE_QUEUE)||'[]')}catch{}
    q=q.filter(x=>HORSE_NAMES.includes(x));
    if(q.length<6){
      const recent=new Set(q);
      const fresh=shuffle(HORSE_NAMES.filter(n=>!recent.has(n)));
      q=[...q,...fresh];
    }
    const field=q.splice(0,6);
    localStorage.setItem(STORAGE_QUEUE,JSON.stringify(q));
    return field;
  }

  function makeProbabilities(){
    /* Start from six distinct market tiers, then normalize and shuffle them among the runners.
       This guarantees a recognizable favorite/contender/mid-price/longshot shape without assigning
       a permanent tier to any horse name. The longshot can naturally land around 25/1–60/1+. */
    let p=[
      0.34+(rand()-.5)*.075,
      0.21+(rand()-.5)*.050,
      0.15+(rand()-.5)*.040,
      0.105+(rand()-.5)*.030,
      0.067+(rand()-.5)*.022,
      0.021+(rand()-.5)*.016
    ].map(x=>Math.max(.009,x));
    const sum=p.reduce((a,b)=>a+b,0);p=p.map(x=>x/sum);
    return shuffle(p);
  }
  function weightedIndex(probs){let x=rand(),s=0;for(let i=0;i<probs.length;i++){s+=probs[i];if(x<s)return i}return probs.length-1}
  function progressToXY(progress,lane=0){const theta=(progress%1)*Math.PI*2-Math.PI/2,rx=42-lane*.72,ry=34-lane*.48;return{x:50+Math.cos(theta)*rx,y:50+Math.sin(theta)*ry}}
  function raceProfiles(probs,winner){return probs.map((p,i)=>({
    base:.87+p*.42+(rand()-.5)*.09,
    break:.78+rand()*.48,
    backstretch:.84+rand()*.34,
    turn:.82+rand()*.32,
    kick:.80+rand()*.44,
    phase:rand()*Math.PI*2,
    phase2:rand()*Math.PI*2,
    winner:i===winner
  }))}
  function speedAt(h,t){
    let section=t<.16?h.break:t<.58?h.backstretch:t<.79?h.turn:h.kick;
    const rhythm=1+Math.sin(t*23+h.phase)*.026+Math.sin(t*51+h.phase2)*.012;
    const close=h.winner&&t>.86?1+((t-.86)/.14)*.105:1;
    return Math.max(.50,h.base*section*rhythm*close);
  }
  function marketSummary(probs,decimals){
    const order=probs.map((p,i)=>({p,i})).sort((a,b)=>b.p-a.p);
    const fav=order[0],long=order.at(-1);
    return{favorite:fav.i,longshot:long.i,favOdds:frac(decimals[fav.i]),longOdds:frac(decimals[long.i])};
  }
  function backToSportsbook(){goLobby();setTimeout(()=>document.getElementById('sportsbookLobbyCard')?.click(),0)}

  window.renderHorses=function renderHorsesV4(){
    const raceNo=nextRaceNumber();
    const names=nextFieldNames();
    const silks=shuffle(SILKS).slice(0,6);
    const probs=makeProbabilities();
    const decimals=probs.map(p=>TAKE/p);
    const fracs=decimals.map(frac);
    const market=marketSummary(probs,decimals);
    state.horseBet=null;
    let racing=false,viewMode=localStorage.getItem(STORAGE_VIEW)==='immersive'?'immersive':'track';

    $('#gameMount').innerHTML=`
      <div class="casino-room room-horses horse-v4">
        <div class="horse-v4-nav"><button class="back-sportsbook-v4" id="horseBackSports">← Sportsbook</button><div><small>RACE ${String(raceNo).padStart(2,'0')}</small><b>ROYAL TURF CLUB</b></div></div>
        <div class="room-topline"><span class="rules-badge">WIN MARKET · 10% SIMULATED TRACK TAKE · NEW FIELD EVERY RACE</span>${betControls('horseStake',100)}</div>
        <div class="horse-view-settings">
          <div><small>RACE CAMERA</small><b>Choose how you watch after the gates open.</b></div>
          <div class="horse-view-tabs"><button class="${viewMode==='track'?'active':''}" data-horse-view="track">TRACK VIEW</button><button class="${viewMode==='immersive'?'active':''}" data-horse-view="immersive">IMMERSIVE VIEW</button></div>
        </div>
        <div class="racebook betting-only">
          <div class="race-call" id="raceCall">SELECT A RUNNER</div>
          <div class="horse-market-note"><span>FAVORITE <b>#${market.favorite+1} ${names[market.favorite]} · ${market.favOdds}</b></span><span>LONGSHOT <b>#${market.longshot+1} ${names[market.longshot]} · ${market.longOdds}</b></span></div>
          <div class="odds-board horse-v3-board"><div class="odds-head"><span>NO.</span><span>RUNNER</span><span>FRACTIONAL</span><span>DECIMAL</span><span>MODEL CHANCE</span></div>${names.map((n,i)=>`<div class="horse-line" data-horse="${i}"><span class="horse-silk" style="background:${silks[i]}">${i+1}</span><span class="horse-name"><b>${n}</b><small>${i===market.favorite?'FAVOURITE':i===market.longshot?'LONGSHOT':'Runner '+(i+1)}</small></span><span class="fractional-price">${fracs[i]}</span><span class="odds-price">${decimals[i].toFixed(2)}×</span><span class="chance">${(probs[i]*100).toFixed(1)}%</span></div>`).join('')}</div>
          <div class="horse-ticket-summary" id="horseTicket">Choose a horse. Every new race regenerates the six-runner field and the complete odds curve.</div>
          <div class="game-actions"><button class="primary-btn" id="runRace">PLACE BET &amp; GO TO TRACK</button><button class="secondary-btn" id="refreshRace">NEW RACE CARD</button></div>
        </div>
        <div id="raceExperience" class="race-experience" aria-hidden="true"></div>
      </div>`;

    wireQuickBets($('#gameMount'));
    $('#horseBackSports').onclick=backToSportsbook;
    $$('[data-horse-view]').forEach(b=>b.onclick=()=>{if(racing)return;viewMode=b.dataset.horseView;localStorage.setItem(STORAGE_VIEW,viewMode);$$('[data-horse-view]').forEach(x=>x.classList.toggle('active',x===b));pulse(b,'action-pulse')});
    $('#refreshRace').onclick=()=>{if(!racing)window.renderHorses()};
    $$('.horse-line').forEach(x=>x.onclick=()=>{if(racing)return;$$('.horse-line').forEach(y=>y.classList.remove('active'));x.classList.add('active');pulse(x,'chip-drop');state.horseBet=+x.dataset.horse;$('#raceCall').textContent=`TICKET · #${state.horseBet+1} ${names[state.horseBet]}`;$('#horseTicket').innerHTML=`<b>#${state.horseBet+1} ${names[state.horseBet]}</b><span>${fracs[state.horseBet]} · ${decimals[state.horseBet].toFixed(2)}× total return · ${(probs[state.horseBet]*100).toFixed(1)}% model chance · ${viewMode==='immersive'?'Immersive':'Track'} camera</span>`});

    $('#runRace').onclick=async()=>{
      if(racing)return;if(state.horseBet==null)return toast('Select a horse');const stake=getBet('horseStake');if(!stake)return;
      racing=true;adjust(-stake,{wager:true});recordGame('horses');
      const winner=weightedIndex(probs),profiles=raceProfiles(probs,winner),overlay=$('#raceExperience');
      overlay.innerHTML=`<div class="race-broadcast race-v4 ${viewMode==='immersive'?'immersive-camera':'track-camera'}">
        <header><div><small>NEON ROYALE TURF CLUB</small><b>RACE ${String(raceNo).padStart(2,'0')} · WIN MARKET</b></div><div class="broadcast-ticket"><small>YOUR HORSE</small><b>#${state.horseBet+1} ${names[state.horseBet]}</b><span>${fracs[state.horseBet]} · ${decimals[state.horseBet].toFixed(2)}×</span></div><div><small>CAMERA</small><b>${viewMode==='immersive'?'IMMERSIVE LEADER CAM':'FULL TRACK'}</b></div></header>
        <div class="race-countdown-screen" id="raceCountdown"><small>HORSES LOADING</small><strong>10</strong><span>GATES LOCKED</span></div>
        <div class="broadcast-track track-v4" id="broadcastTrack">
          <div class="track-view-layer">
            <div class="track-rail outer"></div><div class="track-rail inner"></div><div class="track-infield"><b>NEON ROYALE</b><span>TURF CLUB</span></div><div class="start-finish-line"></div>
            ${names.map((n,i)=>`<div class="broadcast-horse ${i===state.horseBet?'your-horse':''}" id="broadcastHorse${i}" data-no="${i+1}"><i style="--silk:${silks[i]}">${i+1}</i><span>🏇</span><small>${n}</small></div>`).join('')}
            <div class="race-mini-map"><b>TRACK MAP</b><div class="mini-oval">${names.map((_,i)=>`<i id="miniHorse${i}" style="--silk:${silks[i]}">${i+1}</i>`).join('')}</div></div>
          </div>
          <div class="immersive-view-layer">
            <div class="immersive-rail top"></div><div class="immersive-track-scroll"></div><div class="immersive-rail bottom"></div>
            <div class="immersive-camera-label"><small>LIVE</small><b>LEADER CAMERA</b><span id="cameraLeader">FRONT PACK</span></div>
            ${names.map((n,i)=>`<div class="immersive-horse ${i===state.horseBet?'your-horse':''}" id="immersiveHorse${i}"><span class="immersive-no" style="--silk:${silks[i]}">${i+1}</span><span class="immersive-runner">🏇</span><small>${n}</small></div>`).join('')}
          </div>
          <div class="race-leaderboard" id="raceLeaderboard"></div>
        </div>
        <footer><div><small>RACE TIME</small><b id="raceClock">00:00.0</b></div><div class="race-commentary" id="raceCommentary">Loading into the starting gate…</div><div><small>YOUR POSITION</small><b id="yourPosition">—</b></div></footer>
      </div>`;
      overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');document.body.classList.add('race-mode');await afterPaint();
      const cd=$('#raceCountdown strong');for(let t=10;t>=1;t--){cd.textContent=t;pulse(cd,'countdown-pop');await wait(1000)}$('#raceCountdown small').textContent="THEY'RE SET";cd.textContent='GO';$('#raceCountdown span').textContent='GATES OPEN';pulse(cd,'countdown-pop');await wait(620);$('#raceCountdown').classList.add('gone');

      const trackHorses=names.map((_,i)=>$('#broadcastHorse'+i)),immersiveHorses=names.map((_,i)=>$('#immersiveHorse'+i)),mini=names.map((_,i)=>$('#miniHorse'+i));
      const raceDuration=prefersReducedMotion()?8000:44000+randInt(9001),start=performance.now(),dist=Array(6).fill(0);let lastT=0,lastLeader=-1,commentAt=0;
      await new Promise(resolve=>{function frame(now){
        const elapsed=now-start,t=Math.min(1,elapsed/raceDuration),dt=Math.max(0,t-lastT);lastT=t;
        for(let i=0;i<6;i++)dist[i]+=speedAt(profiles[i],t)*dt;
        const leaderBefore=Math.max(...dist);
        if(t>.90&&dist[winner]<leaderBefore){const closing=clamp((t-.90)/.10,0,1);dist[winner]+=(leaderBefore-dist[winner])*(.08+closing*.30)}
        if(t>.995)dist[winner]=Math.max(dist[winner],Math.max(...dist)+.0005);
        const order=Array.from({length:6},(_,i)=>i).sort((a,b)=>dist[b]-dist[a]),leader=order[0],leaderDist=Math.max(...dist,0.0001),trailerDist=Math.min(...dist);
        for(let i=0;i<6;i++){
          const normalized=Math.min(.999,dist[i]/leaderDist*t),xy=progressToXY(normalized,i);
          trackHorses[i].style.left=`${xy.x}%`;trackHorses[i].style.top=`${xy.y}%`;trackHorses[i].style.zIndex=String(20+Math.round(xy.y));
          const mxy=progressToXY(normalized,0);mini[i].style.left=`${mxy.x}%`;mini[i].style.top=`${mxy.y}%`;
          const spread=Math.max(.018,leaderDist-trailerDist),relative=(leaderDist-dist[i])/spread;
          const x=clamp(70-relative*61,4,92),laneY=16+i*13.3+Math.sin(t*40+i)*1.6;
          immersiveHorses[i].style.left=`${x}%`;immersiveHorses[i].style.top=`${laneY}%`;immersiveHorses[i].style.zIndex=String(30+i);
        }
        $('#raceClock').textContent=`00:${String(Math.floor(elapsed/1000)).padStart(2,'0')}.${Math.floor((elapsed%1000)/100)}`;
        const yourRank=order.indexOf(state.horseBet)+1;$('#yourPosition').textContent=`${ordinal(yourRank)} / 6`;
        $('#raceLeaderboard').innerHTML=order.slice(0,3).map((idx,pos)=>`<span class="${idx===state.horseBet?'you':''}"><b>${pos+1}</b>#${idx+1} ${names[idx]}</span>`).join('');
        const cameraLeader=$('#cameraLeader');if(cameraLeader)cameraLeader.textContent=`#${leader+1} ${names[leader]}`;
        if(leader!==lastLeader||elapsed-commentAt>5000){lastLeader=leader;commentAt=elapsed;const pct=Math.round(t*100);let text=pct<18?`#${leader+1} ${names[leader]} breaks sharply and grabs the early advantage.`:pct<52?`The order changes again — #${leader+1} ${names[leader]} now heads the field.`:pct<78?`They bunch through the turn with #${leader+1} ${names[leader]} narrowly in front.`:`The pressure is on — #${leader+1} ${names[leader]} leads as the challengers close.`;$('#raceCommentary').textContent=text;pulse($('#raceCommentary'),'status-pulse')}
        if(t>=1)resolve();else requestAnimationFrame(frame)
      }requestAnimationFrame(frame)});

      trackHorses[winner].classList.add('broadcast-winner');immersiveHorses[winner].classList.add('immersive-winner');$('#raceCommentary').textContent=`WINNER — #${winner+1} ${names[winner]}!`;pulse($('#raceCommentary'),'result-pop');
      const ret=winner===state.horseBet?stake*decimals[winner]:0;if(ret)adjust(ret,{win:true});await wait(1400);
      overlay.insertAdjacentHTML('beforeend',`<div class="race-result-overlay"><small>OFFICIAL RESULT · RACE ${String(raceNo).padStart(2,'0')}</small><h2>#${winner+1} ${names[winner]}</h2><p>${winner===state.horseBet?`Your ${fracs[winner]} ticket returns <b>${money(ret)}</b>.`:`Your #${state.horseBet+1} ${names[state.horseBet]} ticket did not win.`}</p><div class="race-result-actions"><button class="gold-btn" id="nextRaceCard">NEXT RACE · NEW FIELD</button><button class="glass-btn" id="raceBackSports">RETURN TO SPORTSBOOK</button></div></div>`);
      if(ret>=stake*8)confetti();
      $('#nextRaceCard').onclick=()=>{overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('race-mode');overlay.innerHTML='';racing=false;state.horseBet=null;window.renderHorses()};
      $('#raceBackSports').onclick=()=>{overlay.classList.remove('active');document.body.classList.remove('race-mode');backToSportsbook()};
    };
  };

  const priorShowTutorial=window.showTutorial;
  window.showTutorial=function horseV4Tutorial(game){
    if(game==='horses')return showModal(`<p class="kicker">ROYAL TURF CLUB · V4</p><h2>Horse Racing</h2><p>Each race draws six names from a rotating 30-horse stable. The next race builds a completely new field, randomly assigns the favorite/contender/longshot probability tiers, and recalculates every fractional and decimal price.</p><div class="modal-grid"><div class="modal-card"><b>Track View</b><small>Shows the full oval, track map, race order and finish geography.</small></div><div class="modal-card"><b>Immersive View</b><small>Uses a separate close camera that follows the current leader/front pack. The finish line is hidden, horses are much larger, and the camera reframes as the lead changes.</small></div></div><p>The posted win probabilities still determine the race model. Changing the camera never changes the outcome or odds.</p>`);
    return priorShowTutorial?priorShowTutorial(game):undefined;
  };
})();
