function renderRoulette(){
  state.rouletteBet=null;let spinning=false,rotation=0;
  $('#gameMount').innerHTML=`<div class="casino-room room-roulette"><div class="room-topline"><span class="rules-badge">AMERICAN WHEEL · 38 EQUALLY LIKELY POCKETS</span>${betControls('rouletteStake',100)}</div><div class="roulette-stage"><div class="roulette-machine"><div class="roulette-call" id="rouletteCall">PLACE YOUR BETS</div><div class="roulette-pointer"></div><div class="roulette-wheel" id="rouletteWheel"><span class="roulette-ball"></span></div><div class="roulette-result" id="rouletteResult">—</div></div><div class="betting-board"><p class="kicker">PLACE BET</p><div class="selected-bet" id="selectedRouletteBet">No bet selected</div><div class="roulette-numbers">${['0','00',...Array.from({length:36},(_,i)=>String(i+1))].map(n=>`<button class="roulette-bet-btn ${n==='0'||n==='00'?'green':rouletteReds.has(+n)?'red':'black'}" data-rbet="n:${n}">${n}</button>`).join('')}</div><div class="outside-bets">${[['red','RED'],['black','BLACK'],['odd','ODD'],['even','EVEN'],['low','1–18'],['high','19–36'],['d1','1st 12'],['d2','2nd 12'],['d3','3rd 12']].map(([k,l])=>`<button class="roulette-bet-btn" data-rbet="${k}">${l}</button>`).join('')}</div><div class="game-actions"><button class="primary-btn" id="spinRoulette">SPIN WHEEL</button></div><div id="rouletteBanner" class="result-banner">Straight 35:1 · Dozens 2:1 · Even-money 1:1</div></div></div></div>`;
  wireQuickBets($('#gameMount'));
  $$('[data-rbet]').forEach(b=>b.onclick=()=>{if(spinning)return;$$('[data-rbet]').forEach(x=>x.classList.remove('active'));b.classList.add('active');pulse(b,'chip-drop');state.rouletteBet=b.dataset.rbet;$('#selectedRouletteBet').textContent='Selected: '+b.textContent.trim()});
  $('#spinRoulette').onclick=async()=>{
    if(spinning)return;if(!state.rouletteBet)return toast('Choose a roulette bet');const stake=getBet('rouletteStake');if(!stake)return;
    spinning=true;adjust(-stake,{wager:true});recordGame('roulette');
    const pockets=['0','00',...Array.from({length:36},(_,i)=>String(i+1))],result=pockets[randInt(38)],n=Number(result),type=state.rouletteBet;let won=false,profitMult=0;
    if(type.startsWith('n:')){won=type.slice(2)===result;profitMult=35}else if(!['0','00'].includes(result)){if(type==='red')won=rouletteReds.has(n);if(type==='black')won=!rouletteReds.has(n);if(type==='odd')won=n%2===1;if(type==='even')won=n%2===0;if(type==='low')won=n<=18;if(type==='high')won=n>=19;if(type==='d1')won=n<=12;if(type==='d2')won=n>=13&&n<=24;if(type==='d3')won=n>=25;profitMult=['d1','d2','d3'].includes(type)?2:1}
    const ret=won?stake*(profitMult+1):0,wheel=$('#rouletteWheel'),call=$('#rouletteCall');
    $('#spinRoulette').disabled=true;$$('[data-rbet]').forEach(b=>b.disabled=true);call.textContent='NO MORE BETS';call.classList.add('live');pulse(call,'status-pulse');
    rotation+=1440+randInt(720);wheel.style.transform=`rotate(${rotation}deg)`;wheel.classList.add('spinning');$('#rouletteResult').textContent='•••';
    await wait(2550);call.textContent='BALL SETTLING';pulse(call,'status-pulse');await wait(500);wheel.classList.remove('spinning');
    const color=['0','00'].includes(result)?'GREEN':rouletteReds.has(n)?'RED':'BLACK';$('#rouletteResult').textContent=`${result} · ${color}`;pulse($('#rouletteResult'),'result-pop');
    const winningCell=$(`[data-rbet="n:${result}"]`);winningCell?.classList.add('winner-flash');await wait(260);
    if(ret)adjust(ret,{win:true});$('#rouletteBanner').innerHTML=won?`<strong class="win">WIN · ${money(ret)} returned</strong>`:`<strong class="loss">LOSE · ${money(stake)}</strong>`;pulse($('#rouletteBanner'),'result-reveal');
    await wait(180);winningCell?.classList.remove('winner-flash');call.textContent='PLACE YOUR BETS';call.classList.remove('live');$('#spinRoulette').disabled=false;$$('[data-rbet]').forEach(b=>b.disabled=false);spinning=false;if(profitMult>=35&&won)confetti()
  }
}


function renderSlots(){
  const symbols=[{s:'🍒',w:31,p:3},{s:'🍋',w:25,p:4},{s:'🔔',w:18,p:6},{s:'BAR',w:13,p:9},{s:'7',w:8,p:18},{s:'◆',w:5,p:35}],total=symbols.reduce((a,x)=>a+x.w,0);let spinning=false;
  const pick=()=>{let r=Math.random()*total;for(const x of symbols){r-=x.w;if(r<0)return x.s}return symbols[0].s};
  $('#gameMount').innerHTML=`<div class="casino-room room-slots"><div class="room-topline"><span class="rules-badge">WEIGHTED SYMBOL RNG · CENTER PAYLINE</span>${betControls('slotBet',25)}</div><div class="slot-cabinet"><div class="slot-lights"></div><div class="slot-marquee">ROYAL REELS</div><div class="reels">${Array.from({length:5},(_,i)=>`<div class="reel" id="reel${i}">7</div>`).join('')}</div><div class="slot-payline"></div><div class="slot-display" id="slotDisplay">INSERT FAKE CREDIT · PRESS SPIN</div><div class="game-actions"><button class="primary-btn" id="slotSpin">SPIN</button></div><div class="stat-line"><span>◆ Cherry 31%</span><span>◆ Lemon 25%</span><span>◆ Bell 18%</span><span>◆ BAR 13%</span><span>◆ 7 8%</span><span>◆ Diamond 5%</span></div></div></div>`;
  wireQuickBets($('#gameMount'));
  $('#slotSpin').onclick=async()=>{
    if(spinning)return;const stake=getBet('slotBet');if(!stake)return;spinning=true;adjust(-stake,{wager:true});recordGame('slots');
    const reels=$$('.reel'),out=reels.map(()=>pick()),timers=[];$('#slotSpin').disabled=true;$('.slot-cabinet').classList.add('machine-live');$('#slotDisplay').textContent='SPINNING…';
    reels.forEach((r,i)=>{r.classList.add('spin');timers[i]=setInterval(()=>r.textContent=pick(),65+i*4)});
    for(let i=0;i<reels.length;i++){await wait(i===0?520:180);clearInterval(timers[i]);reels[i].textContent=out[i];reels[i].classList.remove('spin');pulse(reels[i],'reel-stop')}
    const counts={};out.forEach(s=>counts[s]=(counts[s]||0)+1);let best=0,label='';for(const x of symbols){const c=counts[x.s]||0;if(c>=3){const m=x.p*(c===3?1:c===4?3:8);if(m>best){best=m;label=x.s}}}
    const ret=stake*best;await wait(170);if(ret){adjust(ret,{win:true});$('.slot-cabinet').classList.add('slot-win');$('#slotDisplay').textContent=`${label} COMBINATION · RETURN ${money(ret)}`;pulse($('#slotDisplay'),'result-pop')}else{$('#slotDisplay').textContent=`NO PAYLINE · -${money(stake)}`;pulse($('#slotDisplay'),'result-reveal')}
    if(ret>=stake*50)confetti();await wait(240);$('.slot-cabinet').classList.remove('machine-live','slot-win');$('#slotSpin').disabled=false;spinning=false
  }
}


function renderVideoPoker(){
  let deck=[],hand=[],held=Array(5).fill(false),phase='deal',stake=0,busy=false;
  $('#gameMount').innerHTML=`<div class="casino-room room-videopoker"><div class="room-topline"><span class="rules-badge">JACKS OR BETTER · FRESH 52-CARD DECK EACH HAND</span>${betControls('vpStake',25)}</div><div class="video-poker-machine"><div class="vp-status" id="vpStatus">READY</div><div class="vp-paytable">${[['ROYAL',800],['STRAIGHT FLUSH',50],['FOUR KIND',25],['FULL HOUSE',9],['FLUSH',6],['STRAIGHT',4],['THREE KIND',3],['TWO PAIR',2],['JACKS+',1]].map(([a,b])=>`<span><b>${a}</b>${b}×</span>`).join('')}</div><div class="vp-hand" id="vpHand">${Array.from({length:5},()=>`<div class="vp-card-wrap"><div class="playing-card back"></div><button class="hold-btn" disabled>HOLD</button></div>`).join('')}</div><div class="game-actions"><button class="primary-btn" id="vpAction">DEAL</button></div><div id="vpResult" class="result-banner">Deal five cards, hold what you want, then draw once.</div></div></div>`;
  wireQuickBets($('#gameMount'));
  function wrapHtml(c,i,animate=''){return `<div class="vp-card-wrap">${cardHtml(c,false,animate)}<button class="hold-btn ${held[i]?'held':''}" data-hold="${i}">${held[i]?'HELD':'HOLD'}</button></div>`}
  function wireHolds(){$$('[data-hold]').forEach(b=>b.onclick=()=>{if(phase!=='draw'||busy)return;const i=+b.dataset.hold;held[i]=!held[i];b.classList.toggle('held',held[i]);b.textContent=held[i]?'HELD':'HOLD';pulse(b,'hold-pop');pulse(b.closest('.vp-card-wrap'),'card-hold-pulse')})}
  async function initialDeal(){const mount=$('#vpHand');mount.innerHTML='';for(let i=0;i<5;i++){hand[i]=deck.pop();mount.insertAdjacentHTML('beforeend',wrapHtml(hand[i],i,'card-enter'));await afterPaint();pulse(mount.lastElementChild.querySelector('.playing-card'),'card-land');await wait(145)}wireHolds()}
  async function replaceCard(i){const wrap=$$('#vpHand .vp-card-wrap')[i],card=wrap.querySelector('.playing-card');card.classList.add('card-flip-out');await wait(130);hand[i]=deck.pop();wrap.innerHTML=cardHtml(hand[i],false,'card-flip-in')+`<button class="hold-btn" data-hold="${i}">HOLD</button>`;await wait(165)}
  $('#vpAction').onclick=async()=>{
    if(busy)return;
    if(phase==='deal'){
      stake=getBet('vpStake');if(!stake)return;busy=true;adjust(-stake,{wager:true});recordGame('videopoker');deck=freshDeck(1);hand=Array(5);held=Array(5).fill(false);$('#vpAction').disabled=true;$('#vpStatus').textContent='DEALING';pulse($('#vpStatus'),'status-pulse');$('#vpResult').textContent='Dealing five cards…';await initialDeal();phase='draw';busy=false;$('#vpAction').disabled=false;$('#vpAction').textContent='DRAW';$('#vpStatus').textContent='SELECT HOLDS';$('#vpResult').textContent='Choose any cards to HOLD, then draw replacements.';
    }else{
      busy=true;$('#vpAction').disabled=true;$$('.hold-btn').forEach(b=>b.disabled=true);$('#vpStatus').textContent='DRAWING';pulse($('#vpStatus'),'status-pulse');
      const replace=[];for(let i=0;i<5;i++)if(!held[i])replace.push(i);for(const i of replace)await replaceCard(i);
      const [key,label]=evaluatePoker(hand),mult=key?vpPays[key]:0,ret=stake*mult;if(ret)adjust(ret,{win:true});$('#vpStatus').textContent=label.toUpperCase();pulse($('#vpStatus'),'result-pop');$('#vpResult').innerHTML=ret?`<strong class="win">${label} · return ${money(ret)}</strong>`:`<strong class="loss">${label} · lose ${money(stake)}</strong>`;pulse($('#vpResult'),'result-reveal');phase='deal';$('#vpAction').textContent='NEW HAND';if(mult>=25)confetti();await wait(180);busy=false;$('#vpAction').disabled=false
    }
  }
}

