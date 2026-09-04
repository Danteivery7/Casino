'use strict';

/* Neon Royale Roulette multi-bet pass
   - Multiple straight/outside bets can be active at once.
   - The wager input is the stake PER selected spot.
   - Every active wager settles independently from the physical pointer result.
*/
(function rouletteMultiBetV3(){
  const U32=0x100000000;
  const unit=()=>{if(window.crypto?.getRandomValues){const a=new Uint32Array(1);window.crypto.getRandomValues(a);return a[0]/U32}return Math.random()};
  const ri=n=>Math.floor(unit()*n);
  const norm=d=>((d%360)+360)%360;
  const WHEEL=['0','28','9','26','30','11','7','20','32','17','5','22','34','15','3','24','36','13','1','00','27','10','25','29','12','8','19','31','18','6','21','33','16','4','23','35','14','2'];
  const RED=new Set(['1','3','5','7','9','12','14','16','18','19','21','23','25','27','30','32','34','36']);
  const sector=360/WHEEL.length;
  const pocketColor=n=>(n==='0'||n==='00')?'green':RED.has(n)?'red':'black';
  const gradient=()=>`conic-gradient(from ${-sector/2}deg,${WHEEL.map((n,i)=>`${pocketColor(n)==='green'?'#087c48':pocketColor(n)==='red'?'#a8232b':'#171717'} ${i*sector}deg ${(i+1)*sector}deg`).join(',')})`;
  const pocketUnderPointer=rotation=>{const internal=norm(-rotation),idx=Math.floor((internal+sector/2)/sector)%38;return{idx,value:WHEEL[idx]}};
  const labelOf=key=>{
    if(key.startsWith('n:'))return key.slice(2);
    return ({red:'RED',black:'BLACK',odd:'ODD',even:'EVEN',low:'1–18',high:'19–36',d1:'1st 12',d2:'2nd 12',d3:'3rd 12'})[key]||key;
  };
  function payout(key,result,stake){
    const n=Number(result);let won=false,profit=0;
    if(key.startsWith('n:')){won=key.slice(2)===result;profit=35;}
    else if(result!=='0'&&result!=='00'){
      if(key==='red')won=RED.has(result);
      if(key==='black')won=!RED.has(result);
      if(key==='odd')won=n%2===1;
      if(key==='even')won=n%2===0;
      if(key==='low')won=n>=1&&n<=18;
      if(key==='high')won=n>=19&&n<=36;
      if(key==='d1')won=n>=1&&n<=12;
      if(key==='d2')won=n>=13&&n<=24;
      if(key==='d3')won=n>=25&&n<=36;
      profit=['d1','d2','d3'].includes(key)?2:1;
    }
    return{won,ret:won?stake*(profit+1):0};
  }
  function speak(value,color){try{if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(`${value==='00'?'double zero':value}, ${color}`);u.rate=1.05;u.volume=.8;window.speechSynthesis.speak(u)}catch{}}

  window.renderRoulette=function renderRouletteMulti(){
    let spinning=false,rotation=0,lastTick=-1;
    const bets=new Set(Array.isArray(state.rouletteBet)?state.rouletteBet:[]);
    const labels=WHEEL.map((n,i)=>`<span class="ri-pocket ri-${pocketColor(n)}" data-pocket="${i}" style="transform:translate(-50%,-50%) rotate(${i*sector}deg) translateY(-118px) rotate(90deg)">${n}</span>`).join('');
    $('#gameMount').innerHTML=`<div class="casino-room room-roulette roulette-integrity roulette-multibet-v3">
      <div class="room-topline"><span class="rules-badge">AMERICAN WHEEL · MULTI-BET TABLE · POINTER DECIDES</span>${betControls('rouletteStake',100)}</div>
      <div class="roulette-stage">
        <div class="roulette-machine ri-machine">
          <div class="roulette-call" id="rouletteCall">PLACE YOUR BETS</div>
          <div class="ri-wheel-shell"><div class="ri-pointer" id="riPointer">▼</div><div class="ri-wheel" id="rouletteWheel" style="background:${gradient()}"><div class="ri-hub"><b>NR</b><small>ROULETTE</small></div>${labels}</div></div>
          <div class="roulette-result" id="rouletteResult">—</div>
          <small class="ri-integrity-note">The fixed pointer reads the final physical pocket. The stake shown is applied to every selected betting spot.</small>
        </div>
        <div class="betting-board">
          <p class="kicker">PLACE MULTIPLE BETS</p>
          <div class="roulette-multi-summary" id="rouletteMultiSummary"></div>
          <div class="roulette-numbers">${['0','00',...Array.from({length:36},(_,i)=>String(i+1))].map(n=>`<button class="roulette-bet-btn ${n==='0'||n==='00'?'green':RED.has(n)?'red':'black'}" data-rbet="n:${n}">${n}</button>`).join('')}</div>
          <div class="outside-bets">${[['red','RED'],['black','BLACK'],['odd','ODD'],['even','EVEN'],['low','1–18'],['high','19–36'],['d1','1st 12'],['d2','2nd 12'],['d3','3rd 12']].map(([k,l])=>`<button class="roulette-bet-btn" data-rbet="${k}">${l}</button>`).join('')}</div>
          <div class="game-actions"><button class="secondary-btn" id="clearRouletteBets">CLEAR BETS</button><button class="primary-btn" id="spinRoulette">SPIN WHEEL</button></div>
          <div id="rouletteBanner" class="result-banner">Straight 35:1 · Dozens 2:1 · Even-money 1:1</div>
        </div>
      </div>
    </div>`;
    wireQuickBets($('#gameMount'));
    const betLabel=$('.room-topline .bet-box label');if(betLabel)betLabel.textContent='BET / SPOT';
    const summary=$('#rouletteMultiSummary');
    function paint(){
      $$('[data-rbet]').forEach(b=>b.classList.toggle('active',bets.has(b.dataset.rbet)));
      state.rouletteBet=[...bets];save();
      const per=Number($('#rouletteStake')?.value)||0,total=per*bets.size;
      summary.innerHTML=bets.size?`<b>${bets.size} ACTIVE BET${bets.size===1?'':'S'}</b><span>${[...bets].map(labelOf).join(' · ')}</span><small>${money(per)} per spot · ${money(total)} total wager</small>`:`<b>NO BETS SELECTED</b><span>Tap any numbers and outside bets. Tap again to remove one.</span><small>The wager amount applies to each selected spot.</small>`;
    }
    $$('[data-rbet]').forEach(b=>b.onclick=()=>{if(spinning)return;const k=b.dataset.rbet;bets.has(k)?bets.delete(k):bets.add(k);pulse(b,'chip-drop');paint()});
    $('#rouletteStake').addEventListener('input',paint);
    $('#clearRouletteBets').onclick=()=>{if(spinning)return;bets.clear();paint()};
    paint();

    $('#spinRoulette').onclick=async()=>{
      if(spinning)return;
      if(!bets.size)return toast('Select at least one roulette bet');
      const perBet=getBet('rouletteStake');if(!perBet)return;
      const totalStake=perBet*bets.size;
      spinning=true;adjust(-totalStake,{wager:true});recordGame('roulette');
      $('#spinRoulette').disabled=true;$('#clearRouletteBets').disabled=true;$$('[data-rbet]').forEach(b=>b.disabled=true);
      $$('.ri-pocket.winner').forEach(p=>p.classList.remove('winner'));
      const call=$('#rouletteCall'),wheel=$('#rouletteWheel'),pointer=$('#riPointer');call.textContent='NO MORE BETS';call.classList.add('live');$('#rouletteResult').textContent='SPINNING';
      const start=rotation,turns=8+ri(5),release=unit()*360,target=start+turns*360+release,duration=prefersReducedMotion()?900:5000+ri(901),t0=performance.now();
      await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-t0)/duration),ease=1-Math.pow(1-t,5),r=start+(target-start)*ease;wheel.style.transform=`rotate(${r}deg)`;const p=pocketUnderPointer(r);if(p.idx!==lastTick){lastTick=p.idx;pointer.classList.remove('tick');void pointer.offsetWidth;pointer.classList.add('tick')}if(t<1)requestAnimationFrame(frame);else{rotation=target;resolve()}}requestAnimationFrame(frame)});
      const {idx,value:result}=pocketUnderPointer(rotation),color=pocketColor(result).toUpperCase();
      $(`.ri-pocket[data-pocket="${idx}"]`)?.classList.add('winner');call.textContent='WINNING POCKET';$('#rouletteResult').textContent=`${result} · ${color}`;pulse($('#rouletteResult'),'result-pop');speak(result,color.toLowerCase());
      let totalReturn=0;const winners=[];
      for(const key of bets){const p=payout(key,result,perBet);if(p.won){totalReturn+=p.ret;winners.push(`${labelOf(key)} ${money(p.ret)}`)}}
      if(totalReturn)adjust(totalReturn,{win:true});
      const net=totalReturn-totalStake;
      $('#rouletteBanner').innerHTML=totalReturn?`<strong class="${net>=0?'win':'loss'}">${winners.length} winning bet${winners.length===1?'':'s'} · return ${money(totalReturn)} · net ${signedMoney(net)}</strong><div class="roulette-win-breakdown">${winners.join(' · ')}</div>`:`<strong class="loss">No winning bets · lose ${money(totalStake)}</strong>`;
      await new Promise(r=>setTimeout(r,prefersReducedMotion()?30:900));
      call.textContent='PLACE YOUR BETS';call.classList.remove('live');$('#spinRoulette').disabled=false;$('#clearRouletteBets').disabled=false;$$('[data-rbet]').forEach(b=>b.disabled=false);spinning=false;
      if(winners.some(x=>/^\d+ |^00 /.test(x)))confetti();
    };
  };
})();
