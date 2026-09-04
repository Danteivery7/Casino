'use strict';

/* Neon Royale Roulette chip betting
   Every click adds one chip to that exact betting spot.
   Multiple numbers/outside bets and repeated clicks on the same spot are allowed.
*/
(function rouletteChipBetting(){
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
  const labelOf=key=>key.startsWith('n:')?key.slice(2):({red:'RED',black:'BLACK',odd:'ODD',even:'EVEN',low:'1–18',high:'19–36',d1:'1st 12',d2:'2nd 12',d3:'3rd 12'})[key]||key;

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

  window.renderRoulette=function renderRouletteChips(){
    let spinning=false,rotation=0,lastTick=-1;
    const bets=new Map();
    const labels=WHEEL.map((n,i)=>`<span class="ri-pocket ri-${pocketColor(n)}" data-pocket="${i}" style="transform:translate(-50%,-50%) rotate(${i*sector}deg) translateY(-118px) rotate(90deg)">${n}</span>`).join('');
    const betButton=(key,label,cls='')=>`<button class="roulette-bet-btn ${cls}" data-rbet="${key}"><span>${label}</span><i class="roulette-chip-count"></i></button>`;

    $('#gameMount').innerHTML=`<div class="casino-room room-roulette roulette-integrity roulette-multibet-v3">
      <div class="room-topline"><span class="rules-badge">AMERICAN WHEEL · CLICK TO PLACE CHIPS · POINTER DECIDES</span>${betControls('rouletteStake',100)}</div>
      <div class="roulette-stage">
        <div class="roulette-machine ri-machine">
          <div class="roulette-call" id="rouletteCall">PLACE YOUR BETS</div>
          <div class="ri-wheel-shell"><div class="ri-pointer" id="riPointer">▼</div><div class="ri-wheel" id="rouletteWheel" style="background:${gradient()}"><div class="ri-hub"><b>NR</b><small>ROULETTE</small></div>${labels}</div></div>
          <div class="roulette-result" id="rouletteResult">—</div>
          <small class="ri-integrity-note">Whatever pocket stops under the pointer is the result.</small>
        </div>
        <div class="betting-board">
          <p class="kicker">CLICK ANY SPOTS YOU WANT</p>
          <div class="roulette-multi-summary" id="rouletteMultiSummary"><b>0 CHIPS PLACED</b><small>Each click adds one chip.</small></div>
          <div class="roulette-numbers">${['0','00',...Array.from({length:36},(_,i)=>String(i+1))].map(n=>betButton(`n:${n}`,n,n==='0'||n==='00'?'green':RED.has(n)?'red':'black')).join('')}</div>
          <div class="outside-bets">${[['red','RED'],['black','BLACK'],['odd','ODD'],['even','EVEN'],['low','1–18'],['high','19–36'],['d1','1st 12'],['d2','2nd 12'],['d3','3rd 12']].map(([k,l])=>betButton(k,l)).join('')}</div>
          <div class="game-actions"><button class="secondary-btn" id="clearRouletteBets">CLEAR CHIPS</button><button class="primary-btn" id="spinRoulette">SPIN WHEEL</button></div>
          <div id="rouletteBanner" class="result-banner">Straight 35:1 · Dozens 2:1 · Even-money 1:1</div>
        </div>
      </div>
    </div>`;

    wireQuickBets($('#gameMount'));
    const betLabel=$('.room-topline .bet-box label');if(betLabel)betLabel.textContent='CHIP';
    const summary=$('#rouletteMultiSummary');

    function totalChips(){let n=0;for(const count of bets.values())n+=count;return n;}
    function paint(){
      $$('[data-rbet]').forEach(b=>{
        const count=bets.get(b.dataset.rbet)||0;
        b.classList.toggle('active',count>0);
        const badge=$('.roulette-chip-count',b);if(badge)badge.textContent=count?`×${count}`:'';
      });
      const chip=Number($('#rouletteStake')?.value)||0,count=totalChips();
      summary.innerHTML=`<b>${count} CHIP${count===1?'':'S'} PLACED</b><small>${money(chip)} each · ${money(chip*count)} total</small>`;
    }

    $$('[data-rbet]').forEach(b=>b.onclick=()=>{if(spinning)return;const k=b.dataset.rbet;bets.set(k,(bets.get(k)||0)+1);pulse(b,'chip-drop');paint()});
    $('#rouletteStake').addEventListener('input',paint);
    $('#clearRouletteBets').onclick=()=>{if(spinning)return;bets.clear();paint()};
    paint();

    $('#spinRoulette').onclick=async()=>{
      if(spinning)return;
      const chipCount=totalChips();if(!chipCount)return toast('Click at least one roulette spot');
      const chipValue=getBet('rouletteStake');if(!chipValue)return;
      const totalStake=chipValue*chipCount;
      spinning=true;adjust(-totalStake,{wager:true});recordGame('roulette');
      $('#spinRoulette').disabled=true;$('#clearRouletteBets').disabled=true;$$('[data-rbet]').forEach(b=>b.disabled=true);
      $$('.ri-pocket.winner').forEach(p=>p.classList.remove('winner'));
      const call=$('#rouletteCall'),wheel=$('#rouletteWheel'),pointer=$('#riPointer');call.textContent='NO MORE BETS';call.classList.add('live');$('#rouletteResult').textContent='SPINNING';
      const start=rotation,turns=8+ri(5),release=unit()*360,target=start+turns*360+release,duration=prefersReducedMotion()?900:5000+ri(901),t0=performance.now();
      await new Promise(resolve=>{function frame(now){const t=Math.min(1,(now-t0)/duration),ease=1-Math.pow(1-t,5),r=start+(target-start)*ease;wheel.style.transform=`rotate(${r}deg)`;const p=pocketUnderPointer(r);if(p.idx!==lastTick){lastTick=p.idx;pointer.classList.remove('tick');void pointer.offsetWidth;pointer.classList.add('tick')}if(t<1)requestAnimationFrame(frame);else{rotation=target;resolve()}}requestAnimationFrame(frame)});
      const {idx,value:result}=pocketUnderPointer(rotation),color=pocketColor(result).toUpperCase();
      $(`.ri-pocket[data-pocket="${idx}"]`)?.classList.add('winner');call.textContent='WINNING POCKET';$('#rouletteResult').textContent=`${result} · ${color}`;pulse($('#rouletteResult'),'result-pop');speak(result,color.toLowerCase());

      let totalReturn=0;const winners=[];
      for(const [key,count] of bets){const wager=chipValue*count,p=payout(key,result,wager);if(p.won){totalReturn+=p.ret;winners.push(`${labelOf(key)} ×${count}`)}}
      if(totalReturn)adjust(totalReturn,{win:true});
      const net=totalReturn-totalStake;
      $('#rouletteBanner').innerHTML=totalReturn?`<strong class="${net>=0?'win':'loss'}">${winners.join(' · ')} · return ${money(totalReturn)} · net ${signedMoney(net)}</strong>`:`<strong class="loss">No winning chips · lose ${money(totalStake)}</strong>`;
      await new Promise(r=>setTimeout(r,prefersReducedMotion()?30:900));
      call.textContent='PLACE YOUR BETS';call.classList.remove('live');$('#spinRoulette').disabled=false;$('#clearRouletteBets').disabled=false;$$('[data-rbet]').forEach(b=>b.disabled=false);spinning=false;
      if(winners.some(x=>/^\d+|^00/.test(x)))confetti();
    };
  };
})();
