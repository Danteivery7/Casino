function renderBlackjack(){
  let shoe=freshDeck(6),player=[],dealer=[],stake=0,active=false,busy=false;
  $('#gameMount').innerHTML=`<div class="casino-room room-blackjack"><div class="room-topline"><span class="rules-badge">6 DECKS · BLACKJACK 3:2 · DEALER HITS SOFT 17</span>${betControls('bjBet',100)}</div><div class="dealer-status" id="dealerStatus"><span></span><b>TABLE READY</b></div><div class="table-felt"><div class="table-label">DEALER <span id="dealerValue"></span></div><div class="hand-row" id="dealerHand"></div><div class="table-label">PLAYER <span id="playerValue"></span></div><div class="hand-row" id="playerHand"></div><div class="game-actions"><button class="primary-btn" id="dealBJ">DEAL</button><button class="secondary-btn" id="hitBJ" disabled>HIT</button><button class="secondary-btn" id="standBJ" disabled>STAND</button><button class="secondary-btn" id="doubleBJ" disabled>DOUBLE</button></div><div id="bjResult" class="result-banner">Place a simulated wager and deal.</div></div></div>`;
  wireQuickBets($('#gameMount'));const draw=()=>shoe.pop();
  function valueLabels(hide=true){$('#playerValue').textContent=player.length?`· ${blackjackValue(player).value}`:'';$('#dealerValue').textContent=dealer.length?(hide?`· ${blackjackValue([dealer[0]]).value} + ?`:`· ${blackjackValue(dealer).value}`):''}
  function buttons(on){$('#hitBJ').disabled=!on||busy;$('#standBJ').disabled=!on||busy;$('#doubleBJ').disabled=!on||busy;$('#dealBJ').disabled=on||busy}
  function status(text,live=false){const s=$('#dealerStatus');s.querySelector('b').textContent=text;s.classList.toggle('live',live);pulse(s,'status-pulse')}
  async function addCard(who,card,{hidden=false}={}){const hand=who==='player'?$('#playerHand'):$('#dealerHand');hand.insertAdjacentHTML('beforeend',cardHtml(card,hidden,'card-enter'));await afterPaint();const el=hand.lastElementChild;pulse(el,'card-land');await wait(185);valueLabels(true);return el}
  async function revealHole(){const back=$('#dealerHand .playing-card.back');if(!back)return;status('DEALER REVEALS HOLE CARD',true);back.classList.add('card-flip-out');await wait(150);back.outerHTML=cardHtml(dealer[1],false,'card-flip-in');await wait(230);valueLabels(false)}
  async function finish(type,text,ret=0){active=false;busy=true;buttons(false);valueLabels(false);await wait(120);if(ret)adjust(ret,{win:type==='win'});$('#bjResult').innerHTML=`<strong class="${type}">${text}</strong>`;pulse($('#bjResult'),'result-reveal');status(type==='push'?'PUSH':type==='win'?'PLAYER WINS':'DEALER WINS');if(type==='win'&&ret>=stake*2.5)confetti();busy=false;$('#dealBJ').disabled=false}
  async function dealerPlay(){
    if(!active||busy)return;busy=true;buttons(false);status('DEALER TURN',true);await revealHole();
    while(true){const x=blackjackValue(dealer);if(x.value<17||(x.value===17&&x.soft)){status(`DEALER HITS ON ${x.value}${x.soft?' SOFT':''}`,true);dealer.push(draw());await addCard('dealer',dealer.at(-1));valueLabels(false);await wait(220)}else break}
    const p=blackjackValue(player).value,d=blackjackValue(dealer).value;
    busy=false;
    if(d>21)return finish('win',`Dealer busts at ${d} · return ${money(stake*2)}`,stake*2);
    if(d>p)return finish('loss',`Dealer ${d} beats ${p} · lose ${money(stake)}`);
    if(d<p)return finish('win',`${p} beats dealer ${d} · return ${money(stake*2)}`,stake*2);
    return finish('push',`Push at ${p} · ${money(stake)} returned`,stake)
  }
  $('#dealBJ').onclick=async()=>{
    if(busy)return;stake=getBet('bjBet');if(!stake)return;if(shoe.length<75)shoe=freshDeck(6);
    adjust(-stake,{wager:true});recordGame('blackjack');player=[];dealer=[];active=true;busy=true;$('#playerHand').innerHTML='';$('#dealerHand').innerHTML='';$('#bjResult').textContent='Dealing…';status('DEALING',true);buttons(false);
    player.push(draw());await addCard('player',player[0]);dealer.push(draw());await addCard('dealer',dealer[0]);player.push(draw());await addCard('player',player[1]);dealer.push(draw());await addCard('dealer',dealer[1],{hidden:true});
    busy=false;valueLabels(true);buttons(true);status('PLAYER ACTION');
    const p=blackjackValue(player).value,d=blackjackValue(dealer).value;
    if(p===21&&d===21){busy=true;await revealHole();busy=false;return finish('push','Both have blackjack · push',stake)}
    if(p===21){busy=true;await revealHole();busy=false;return finish('win',`Natural blackjack · return ${money(stake*2.5)}`,stake*2.5)}
    if(d===21){busy=true;await revealHole();busy=false;return finish('loss','Dealer has blackjack')}
    $('#bjResult').textContent='Hit, stand, or double.'
  };
  $('#hitBJ').onclick=async()=>{if(!active||busy)return;busy=true;buttons(true);status('PLAYER HITS',true);player.push(draw());await addCard('player',player.at(-1));$('#doubleBJ').disabled=true;const v=blackjackValue(player).value;busy=false;if(v>21)return finish('loss',`Bust at ${v} · lose ${money(stake)}`);buttons(true);$('#doubleBJ').disabled=true;status('PLAYER ACTION')};
  $('#standBJ').onclick=dealerPlay;
  $('#doubleBJ').onclick=async()=>{if(!active||busy)return;busy=true;buttons(false);adjust(-stake,{wager:true});stake*=2;status('PLAYER DOUBLES',true);player.push(draw());await addCard('player',player.at(-1));const v=blackjackValue(player).value;busy=false;if(v>21)return finish('loss',`Bust after doubling · lose ${money(stake)}`);return dealerPlay()}
}


function baccaratCardValue(c){return ['10','J','Q','K'].includes(c.r)?0:c.r==='A'?1:+c.r}
function renderBaccarat(){
  let choice='player',dealing=false;
  $('#gameMount').innerHTML=`<div class="casino-room room-baccarat"><div class="room-topline"><span class="rules-badge">8 DECKS · PUNTO BANCO · BANKER COMMISSION 5%</span>${betControls('bacStake',100)}</div><div class="bac-caller" id="bacCaller">PLACE YOUR WAGER</div><div class="bac-bets"><button class="bac-bet-btn active" data-bac="player">PLAYER · 1:1</button><button class="bac-bet-btn" data-bac="banker">BANKER · 0.95:1</button><button class="bac-bet-btn" data-bac="tie">TIE · 8:1</button></div><div class="baccarat-table"><div class="bac-side"><p class="kicker">PLAYER</p><h3>PLAYER</h3><div class="bac-value" id="playerBacVal">—</div><div class="hand-row" id="playerBac"></div></div><div class="bac-side"><p class="kicker">BANKER</p><h3>BANKER</h3><div class="bac-value" id="bankerBacVal">—</div><div class="hand-row" id="bankerBac"></div></div></div><div class="game-actions"><button class="primary-btn" id="dealBac">DEAL BACCARAT</button></div><div id="bacResult" class="result-banner">Choose Player, Banker, or Tie.</div></div>`;
  wireQuickBets($('#gameMount'));
  $$('[data-bac]').forEach(b=>b.onclick=()=>{if(dealing)return;$$('[data-bac]').forEach(x=>x.classList.remove('active'));b.classList.add('active');pulse(b,'chip-drop');choice=b.dataset.bac});
  const updateVals=(p,b)=>{$('#playerBacVal').textContent=p.length?'TOTAL '+baccaratVal(p):'—';$('#bankerBacVal').textContent=b.length?'TOTAL '+baccaratVal(b):'—'};
  async function dealTo(side,card,p,b){const target=side==='player'?$('#playerBac'):$('#bankerBac');$('#bacCaller').textContent=side==='player'?'CARD TO PLAYER':'CARD TO BANKER';pulse($('#bacCaller'),'status-pulse');target.insertAdjacentHTML('beforeend',cardHtml(card,false,'card-enter'));await afterPaint();pulse(target.lastElementChild,'card-land');updateVals(p,b);await wait(220)}
  $('#dealBac').onclick=async()=>{
    if(dealing)return;const stake=getBet('bacStake');if(!stake)return;dealing=true;adjust(-stake,{wager:true});recordGame('baccarat');$('#dealBac').disabled=true;$$('[data-bac]').forEach(x=>x.disabled=true);$('#playerBac').innerHTML='';$('#bankerBac').innerHTML='';$('#bacResult').textContent='Dealing…';
    let deck=freshDeck(8),p=[],b=[];
    p.push(deck.pop());await dealTo('player',p[0],p,b);b.push(deck.pop());await dealTo('banker',b[0],p,b);p.push(deck.pop());await dealTo('player',p[1],p,b);b.push(deck.pop());await dealTo('banker',b[1],p,b);
    let pv=baccaratVal(p),bv=baccaratVal(b),p3=null;
    if(pv<8&&bv<8){
      if(pv<=5){p3=deck.pop();p.push(p3);await dealTo('player',p3,p,b)}
      pv=baccaratVal(p);const p3v=p3?baccaratCardValue(p3):null;let bankerDraw=false;
      if(!p3)bankerDraw=bv<=5;else if(bv<=2)bankerDraw=true;else if(bv===3&&p3v!==8)bankerDraw=true;else if(bv===4&&p3v>=2&&p3v<=7)bankerDraw=true;else if(bv===5&&p3v>=4&&p3v<=7)bankerDraw=true;else if(bv===6&&p3v>=6&&p3v<=7)bankerDraw=true;
      if(bankerDraw){const c=deck.pop();b.push(c);await dealTo('banker',c,p,b)}
    }
    pv=baccaratVal(p);bv=baccaratVal(b);const outcome=pv===bv?'tie':pv>bv?'player':'banker';let ret=0;
    $('#bacCaller').textContent='SHOWDOWN';pulse($('#bacCaller'),'result-pop');await wait(220);
    if(choice===outcome){ret=choice==='tie'?stake*9:choice==='banker'?stake*1.95:stake*2;adjust(ret,{win:true})}
    $('#bacResult').innerHTML=`${outcome.toUpperCase()} wins ${pv}–${bv} · ${ret?`<strong class="win">return ${money(ret)}</strong>`:`<strong class="loss">lose ${money(stake)}</strong>`}`;pulse($('#bacResult'),'result-reveal');if(choice==='tie'&&ret)confetti();
    await wait(180);$('#bacCaller').textContent='PLACE YOUR WAGER';$('#dealBac').disabled=false;$$('[data-bac]').forEach(x=>x.disabled=false);dealing=false
  }
}

