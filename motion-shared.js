/* Neon Royale motion/authenticity override. Loaded after the base game scripts. */
function prefersReducedMotion(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,prefersReducedMotion()?Math.min(ms,35):ms))}
function afterPaint(){return new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))}
function pulse(el,cls='action-pulse'){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),420)}
function cardHtml(c,back=false,extra=''){if(back)return `<div class="playing-card back ${extra}"></div>`;const red=c.s==='♥'||c.s==='♦';return `<div class="playing-card ${red?'red':''} ${extra}"><span class="corner">${c.r}${c.s}</span><span class="pip">${c.s}</span><span class="corner" style="align-self:flex-end;transform:rotate(180deg)">${c.r}${c.s}</span></div>`}

function renderKeno(){
  let picks=[],drawing=false;
  $('#gameMount').innerHTML=`<div class="casino-room room-keno"><div class="room-topline"><span class="rules-badge">CLASSIC 20 / 80 · MAX 10 SPOTS</span>${betControls('kenoBet',25)}</div><div class="keno-stage"><div class="keno-board"><div class="keno-board-header"><b>KENO NUMBER BOARD</b><span id="pickCount">0 / 10 SELECTED</span></div><div class="keno-caller" id="kenoCaller"><small>NEXT DRAW</small><strong>READY</strong></div><div class="number-grid">${Array.from({length:80},(_,i)=>`<button class="keno-num" data-n="${i+1}">${i+1}</button>`).join('')}</div><div class="game-actions"><button class="secondary-btn" id="quickPick">Quick Pick 10</button><button class="secondary-btn" id="clearKeno">Clear</button><button class="primary-btn" id="drawKeno">DRAW 20 NUMBERS</button></div></div><aside class="keno-side"><div class="keno-ticket"><p class="kicker">YOUR TICKET</p><h3>Selected Spots</h3><div class="pick-readout" id="pickReadout">Choose at least one number.</div><div class="draw-balls" id="drawBalls"></div><div id="kenoResult"></div></div><div class="paytable-card"><p class="kicker">ACTIVE PAYTABLE</p><h3>Return multiplier</h3><div id="kenoPayMini" class="paytable-mini"><span>Select spots to view payouts.</span></div></div></aside></div></div>`;
  wireQuickBets($('#gameMount'));
  const controls=()=>[$('#quickPick'),$('#clearKeno'),$('#drawKeno'),...$$('.keno-num')];
  const setBusy=on=>controls().forEach(el=>el&&(el.disabled=on));
  const paint=()=>{
    $$('.keno-num').forEach(b=>b.classList.toggle('selected',picks.includes(+b.dataset.n)));
    $('#pickCount').textContent=`${picks.length} / 10 SELECTED`;
    $('#pickReadout').textContent=picks.length?picks.slice().sort((a,b)=>a-b).join(' · '):'Choose at least one number.';
    const p=kenoPay[picks.length]||{};
    $('#kenoPayMini').innerHTML=Object.keys(p).length?Object.entries(p).map(([h,m])=>`<span>${h} hit${h==='1'?'':'s'}</span><b>${m}×</b>`).join(''):'<span>Select spots to view payouts.</span>';
  };
  $$('.keno-num').forEach(b=>b.onclick=()=>{
    if(drawing)return;
    const n=+b.dataset.n;
    if(picks.includes(n))picks=picks.filter(x=>x!==n);
    else if(picks.length<10)picks.push(n);
    else return toast('Maximum 10 Keno spots');
    paint();pulse(b,'pick-pop');
  });
  $('#quickPick').onclick=async()=>{
    if(drawing)return;
    picks=shuffle(Array.from({length:80},(_,i)=>i+1)).slice(0,10);paint();
    for(const n of picks.slice().sort((a,b)=>a-b)){pulse($(`.keno-num[data-n="${n}"]`),'pick-pop');await wait(28)}
  };
  $('#clearKeno').onclick=()=>{if(drawing)return;picks=[];paint();$('#drawBalls').innerHTML='';$('#kenoResult').innerHTML='';$('#kenoCaller strong').textContent='READY';$$('.keno-num').forEach(b=>b.classList.remove('drawn','hit','draw-flash'))};
  $('#drawKeno').onclick=async()=>{
    if(drawing)return;
    if(!picks.length)return toast('Pick at least one number');
    const bet=getBet('kenoBet');if(!bet)return;
    drawing=true;setBusy(true);adjust(-bet,{wager:true});recordGame('keno');
    const draw=shuffle(Array.from({length:80},(_,i)=>i+1)).slice(0,20),hits=draw.filter(n=>picks.includes(n)),mult=(kenoPay[picks.length]||{})[hits.length]||0,ret=bet*mult;
    const balls=$('#drawBalls'),caller=$('#kenoCaller strong');balls.innerHTML='';$('#kenoResult').innerHTML='<div class="result-banner keno-live">Drawing 20 numbers…</div>';
    $$('.keno-num').forEach(b=>b.classList.remove('drawn','hit','draw-flash'));
    for(let i=0;i<draw.length;i++){
      const n=draw[i],hit=picks.includes(n),cell=$(`.keno-num[data-n="${n}"]`);
      caller.textContent=String(n);pulse($('#kenoCaller'),'caller-pop');
      balls.insertAdjacentHTML('beforeend',`<span class="draw-ball ${hit?'hit':''}">${n}</span>`);
      cell.classList.add('drawn','draw-flash');if(hit)cell.classList.add('hit');
      if(hit)pulse(cell,'hit-pop');
      await wait(105);
      cell.classList.remove('draw-flash');
    }
    caller.textContent='COMPLETE';
    await wait(180);
    if(ret)adjust(ret,{win:true});
    $('#kenoResult').innerHTML=`<div class="result-banner result-reveal">Hit <b>${hits.length}</b> of ${picks.length}. ${ret?`<strong class="win">Return ${money(ret)}</strong>`:`<strong class="loss">No payout</strong>`}</div>`;
    if(ret>=bet*50)confetti();drawing=false;setBusy(false);
  };
  paint();
}
