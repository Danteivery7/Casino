'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const STORAGE='neonRoyaleCasinoV3';
const gameMeta={
  keno:{title:'Keno Lounge',eyebrow:'NUMBERS & WHEELS',subtitle:'Lounge 08 · Classic 20-of-80 draw'},
  blackjack:{title:'Blackjack',eyebrow:'GRAND SALON',subtitle:'Table 01 · 6-deck shoe · dealer hits soft 17'},
  roulette:{title:'American Roulette',eyebrow:'MONTE CARLO HALL',subtitle:'Wheel 01 · 0 and 00 · 38 pockets'},
  slots:{title:'Royal Reels',eyebrow:'ELECTRIC ARCADE',subtitle:'Bank A · 5-reel weighted-symbol simulation'},
  horses:{title:'Royal Turf Club',eyebrow:'RACEBOOK',subtitle:'Track 01 · generated field and probability-based odds'},
  poker:{title:'Poker School',eyebrow:'CASINO ACADEMY',subtitle:'Texas Hold’em · hands, betting flow, strategy basics'},
  baccarat:{title:'Baccarat',eyebrow:'GRAND SALON',subtitle:'Table 02 · 8-deck Punto Banco'},
  videopoker:{title:'Video Poker',eyebrow:'ELECTRIC ARCADE',subtitle:'Bank B · Jacks or Better draw poker'}
};
const defaults={bankroll:10000,startBankroll:10000,totalWagered:0,totalWon:0,gamesPlayed:0,biggestWin:0,rouletteBet:null,horseBet:null,baccaratBet:'player',gameCounts:{}};
let state=load();
let currentGame=null;
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(STORAGE)||'{}')}}catch{return {...defaults}}}
function save(){localStorage.setItem(STORAGE,JSON.stringify(state))}
function money(v){const sign=v<0?'-':'';return sign+'$'+Math.abs(v).toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:2})}
function signedMoney(v){return (v>=0?'+':'-')+'$'+Math.abs(v).toLocaleString(undefined,{maximumFractionDigits:2})}
function updateHUD(){
  const b=$('#bankrollBox'),el=$('#bankroll'),pl=$('#sessionPL'),profit=state.bankroll-state.startBankroll;
  el.textContent=money(state.bankroll);b.classList.remove('negative','neutral','positive');
  if(state.bankroll<0)b.classList.add('negative');else if(profit>=Math.max(5000,state.startBankroll*.5))b.classList.add('positive');else b.classList.add('neutral');
  pl.textContent=signedMoney(profit);pl.style.color=profit<0?'#ff6868':profit>0?'#43dd8b':'#e9c567';
}
function adjust(amount,{wager=false,win=false}={}){
  state.bankroll=+(state.bankroll+amount).toFixed(2);if(wager)state.totalWagered+=Math.abs(amount);if(win){state.totalWon+=Math.max(0,amount);state.biggestWin=Math.max(state.biggestWin,amount)}save();updateHUD();flashMoney(amount);
}
function flashMoney(amount){const f=$('#moneyFlash');if(!amount)return;f.textContent=signedMoney(amount);f.className='money-flash '+(amount>0?'win':'loss');void f.offsetWidth;f.classList.add('show')}
function recordGame(game){state.gamesPlayed++;state.gameCounts[game]=(state.gameCounts[game]||0)+1;save()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),1800)}
function confetti(){const c=$('#confetti');c.innerHTML='';for(let i=0;i<34;i++){const p=document.createElement('i');p.style.left=Math.random()*100+'vw';p.style.setProperty('--x',(Math.random()*240-120)+'px');p.style.animationDelay=(Math.random()*.35)+'s';p.style.transform=`rotate(${Math.random()*180}deg)`;c.appendChild(p)}setTimeout(()=>c.innerHTML='',2300)}
function randInt(n){return Math.floor(Math.random()*n)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=randInt(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function clampBet(value){const n=Number(value);return Number.isFinite(n)&&n>0?n:null}
function betControls(id='bet',value=100){return `<div class="bet-cluster"><div class="bet-box"><label>BET</label><span>$</span><input class="bet-input" id="${id}" type="number" min="1" step="1" value="${value}"></div><button class="quick-bet" data-bet-target="${id}" data-bet-val="25">$25</button><button class="quick-bet" data-bet-target="${id}" data-bet-val="100">$100</button><button class="quick-bet" data-bet-target="${id}" data-bet-val="500">$500</button></div>`}
function wireQuickBets(root=document){$$('.quick-bet',root).forEach(b=>b.onclick=()=>{const el=$('#'+b.dataset.betTarget);if(el)el.value=b.dataset.betVal})}
function getBet(id='bet'){const n=clampBet($('#'+id)?.value);if(!n){toast('Enter a bet greater than $0');return null}return n}
function openRoom(game){const meta=gameMeta[game];if(!meta)return;currentGame=game;document.body.dataset.room=game;$('#lobbyView').classList.remove('active');$('#gameView').classList.add('active');$('#gameTitle').textContent=meta.title;$('#gameEyebrow').textContent=meta.eyebrow;$('#gameSubtitle').textContent=meta.subtitle;({keno:renderKeno,blackjack:renderBlackjack,roulette:renderRoulette,slots:renderSlots,horses:renderHorses,poker:renderPoker,baccarat:renderBaccarat,videopoker:renderVideoPoker})[game]();scrollTo({top:0,behavior:'smooth'})}
function goLobby(){currentGame=null;document.body.dataset.room='lobby';$('#gameView').classList.remove('active');$('#lobbyView').classList.add('active');scrollTo({top:0,behavior:'smooth'})}
$$('[data-game]').forEach(b=>b.addEventListener('click',()=>openRoom(b.dataset.game)));$$('[data-go="lobby"]').forEach(b=>b.addEventListener('click',goLobby));$('#backBtn').onclick=goLobby;

const modal=$('#modal'), modalContent=$('#modalContent');
function showModal(html){modalContent.innerHTML=html;modal.showModal()}
function playerCard(){
  const profit=state.bankroll-state.startBankroll;
  showModal(`<p class="kicker">PLAYER SERVICES</p><h2>Neon Royale Player Card</h2><p>Everything here is simulation credit. Set any starting amount you want, including $0. The casino will allow the balance to continue below zero so you can see the full run of a session.</p><div class="stats-grid"><div class="stat-box"><small>CURRENT</small><strong>${money(state.bankroll)}</strong></div><div class="stat-box"><small>SESSION P/L</small><strong>${signedMoney(profit)}</strong></div><div class="stat-box"><small>GAMES PLAYED</small><strong>${state.gamesPlayed}</strong></div><div class="stat-box"><small>TOTAL WAGERED</small><strong>${money(state.totalWagered)}</strong></div><div class="stat-box"><small>BIGGEST RETURN</small><strong>${money(state.biggestWin)}</strong></div><div class="stat-box"><small>STARTING CREDIT</small><strong>${money(state.startBankroll)}</strong></div></div><div class="setting-row"><label>NEW STARTING SIMULATION CREDIT</label><input id="newBankroll" class="modal-input" type="number" step="100" value="${state.startBankroll}"></div><button type="button" class="gold-btn" id="applyBankroll">Start New Session</button>`);
  $('#applyBankroll').onclick=()=>{const n=Number($('#newBankroll').value);if(!Number.isFinite(n)){toast('Enter a valid amount');return}state={...defaults,bankroll:n,startBankroll:n,gameCounts:{}};save();updateHUD();modal.close();toast('New simulated session started')}
}
$('#playerCardBtn').onclick=playerCard;$('#bankrollBox').onclick=playerCard;$('#statsTopBtn').onclick=playerCard;
function guideModal(){showModal(`<p class="kicker">CASINO CONCIERGE</p><h2>Casino Guide</h2><p>Each room uses fake credits and a disclosed probability model. Click a room’s tutorial button for rules specific to that game.</p><div class="modal-grid">${Object.entries(gameMeta).map(([k,v])=>`<div class="modal-card"><b>${v.title}</b><small>${tutorialShort(k)}</small></div>`).join('')}</div><p style="margin-top:16px"><b style="color:#ddbd68">Balance colors:</b> red means below $0, yellow means around your starting range, and green means you are substantially ahead.</p>`)}
$('#guideTopBtn').onclick=guideModal;$('#guideLobbyBtn').onclick=guideModal;
$('#gameHelpBtn').onclick=()=>showTutorial(currentGame);
function tutorialShort(g){return ({keno:'Choose 1–10 numbers. Twenty unique numbers are drawn from 1–80.',blackjack:'Get closer to 21 than the dealer without going over.',roulette:'Bet on the result of a 38-pocket American roulette wheel.',slots:'Weighted random symbols determine reel results and paytable returns.',horses:'Each horse gets a generated win probability; the winner is sampled from those probabilities.',poker:'Learn Hold’em hand rankings, streets, actions, and beginner decisions.',baccarat:'Bet on Player, Banker, or Tie. Closest total to 9 wins.',videopoker:'Hold the cards you want, draw replacements, and make a five-card poker hand.'})[g]||''}
function showTutorial(g){const title=gameMeta[g]?.title||'Game';let body='';
  if(g==='keno')body=`Pick between 1 and 10 spots from 1–80. The simulator then draws exactly 20 unique numbers without replacement. Hits are compared with the displayed paytable. The drawing process is not altered by your bet or bankroll.`;
  if(g==='blackjack')body=`Six decks are shuffled into a shoe. You and the dealer receive two cards. Hit for another card, stand to stop, or double your stake and take one final card. Dealer hits soft 17. Natural blackjack pays 3:2. Splits and insurance are not included in this version.`;
  if(g==='roulette')body=`This is an American wheel: 1–36 plus 0 and 00, giving 38 equally likely pockets. Straight numbers pay 35:1, dozens pay 2:1, and even-money bets pay 1:1.`;
  if(g==='slots')body=`Each reel symbol is selected from disclosed internal weights. Results are generated when you press SPIN; there is no adaptive difficulty and losing streaks do not make a future win more likely.`;
  if(g==='horses')body=`Every generated race assigns six horses different underlying win probabilities. Decimal payout odds are based on those probabilities with a simulated track take. The winner is sampled from the same probability distribution, then the animation visualizes that result.`;
  if(g==='poker')body=`Texas Hold’em gives each player two private cards. Five community cards arrive as flop, turn, and river. Players build the best five-card hand possible. The Poker School room teaches the ranking order and common betting actions.`;
  if(g==='baccarat')body=`Two-card hands are dealt to Player and Banker. Card values total modulo 10, so 7 + 8 = 5. Third-card draws follow fixed Punto Banco rules. Banker wins pay 0.95:1 after the standard 5% commission.`;
  if(g==='videopoker')body=`You receive five cards. Mark any cards HOLD, then draw once to replace the rest. The final hand is paid using the displayed Jacks-or-Better table. The deck is a freshly shuffled 52-card deck for each hand.`;
  showModal(`<p class="kicker">HOW TO PLAY</p><h2>${title}</h2><p>${body}</p><div class="modal-card"><b>Simulation integrity</b><small>Browser randomization uses Math.random(). This is appropriate for a recreational simulator, but it is not certified casino RNG and the site cannot wager real money.</small></div>`)
}

// --- KENO ---
const kenoPay={1:{1:3},2:{2:12},3:{2:2,3:45},4:{2:1,3:5,4:90},5:{3:2,4:15,5:300},6:{3:1,4:5,5:80,6:1000},7:{3:1,4:2,5:18,6:150,7:2000},8:{4:2,5:8,6:50,7:500,8:5000},9:{4:1,5:5,6:25,7:150,8:1500,9:10000},10:{5:2,6:10,7:50,8:500,9:5000,10:20000}};
function renderKeno(){let picks=[];$('#gameMount').innerHTML=`<div class="casino-room room-keno"><div class="room-topline"><span class="rules-badge">CLASSIC 20 / 80 · MAX 10 SPOTS</span>${betControls('kenoBet',25)}</div><div class="keno-stage"><div class="keno-board"><div class="keno-board-header"><b>KENO NUMBER BOARD</b><span id="pickCount">0 / 10 SELECTED</span></div><div class="number-grid">${Array.from({length:80},(_,i)=>`<button class="keno-num" data-n="${i+1}">${i+1}</button>`).join('')}</div><div class="game-actions"><button class="secondary-btn" id="quickPick">Quick Pick 10</button><button class="secondary-btn" id="clearKeno">Clear</button><button class="primary-btn" id="drawKeno">DRAW 20 NUMBERS</button></div></div><aside class="keno-side"><div class="keno-ticket"><p class="kicker">YOUR TICKET</p><h3>Selected Spots</h3><div class="pick-readout" id="pickReadout">Choose at least one number.</div><div class="draw-balls" id="drawBalls"></div><div id="kenoResult"></div></div><div class="paytable-card"><p class="kicker">ACTIVE PAYTABLE</p><h3>Return multiplier</h3><div id="kenoPayMini" class="paytable-mini"><span>Select spots to view payouts.</span></div></div></aside></div></div>`;wireQuickBets($('#gameMount'));
  const paint=()=>{$$('.keno-num').forEach(b=>b.classList.toggle('selected',picks.includes(+b.dataset.n)));$('#pickCount').textContent=`${picks.length} / 10 SELECTED`;$('#pickReadout').textContent=picks.length?picks.slice().sort((a,b)=>a-b).join(' · '):'Choose at least one number.';const p=kenoPay[picks.length]||{};$('#kenoPayMini').innerHTML=Object.keys(p).length?Object.entries(p).map(([h,m])=>`<span>${h} hit${h==='1'?'':'s'}</span><b>${m}×</b>`).join(''):'<span>Select spots to view payouts.</span>'};
  $$('.keno-num').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(picks.includes(n))picks=picks.filter(x=>x!==n);else if(picks.length<10)picks.push(n);else return toast('Maximum 10 Keno spots');paint()});
  $('#quickPick').onclick=()=>{picks=shuffle(Array.from({length:80},(_,i)=>i+1)).slice(0,10);paint()};$('#clearKeno').onclick=()=>{picks=[];paint();$('#drawBalls').innerHTML='';$('#kenoResult').innerHTML=''};
  $('#drawKeno').onclick=()=>{if(!picks.length)return toast('Pick at least one number');const bet=getBet('kenoBet');if(!bet)return;adjust(-bet,{wager:true});recordGame('keno');const draw=shuffle(Array.from({length:80},(_,i)=>i+1)).slice(0,20),hits=draw.filter(n=>picks.includes(n)),mult=(kenoPay[picks.length]||{})[hits.length]||0,ret=bet*mult;$$('.keno-num').forEach(b=>{b.classList.remove('drawn','hit');const n=+b.dataset.n;if(draw.includes(n))b.classList.add('drawn');if(hits.includes(n))b.classList.add('hit')});const balls=$('#drawBalls');balls.innerHTML='';draw.forEach((n,i)=>setTimeout(()=>{balls.insertAdjacentHTML('beforeend',`<span class="draw-ball ${hits.includes(n)?'hit':''}">${n}</span>`)},i*45));if(ret)adjust(ret,{win:true});$('#kenoResult').innerHTML=`<div class="result-banner">Hit <b>${hits.length}</b> of ${picks.length}. ${ret?`<strong class="win">Return ${money(ret)}</strong>`:`<strong class="loss">No payout</strong>`}</div>`;if(ret>=bet*50)confetti()};paint()}
