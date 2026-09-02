'use strict';
(function sportsbookV4(){
  const N=window.NRSPORTS2;if(!N)return;
  const POSITIONS={
    basketball:{count:5},
    soccer:{count:11},
    football:{count:11},
    hockey:{count:6}
  };
  const sidePlayers=(side)=>$$(`.v4-player[data-side="${side}"]`);
  const clamp=N.clamp;
  const chance=(p)=>N.rand()<p;
  const pause=(ms)=>N.sleep(ms);
  const scoreRefs=()=>[$('#scoreA'),$('#scoreB')];
  function setScore(score){const [a,b]=scoreRefs();if(a)a.textContent=score[0];if(b)b.textContent=score[1]}
  function setTicker(title,text){const a=$('#v2Ticker'),b=$('#v2TickerText');if(a)a.textContent=title;if(b)b.textContent=text}
  function playerMarkup(e,side,i,role=''){const c=side===0?e.a:e.b;return `<div class="v2-player v4-player ${role}" data-side="${side}" data-index="${i}" style="--team:${c.color};--accent:${c.accent}"><i>${i+1}</i></div>`}
  function markMarkup(e){return `<div class="v4-home-mark" style="--home:${e.a.color};--away:${e.b.color}"><b>${e.a.code||e.a.short.slice(0,3).toUpperCase()}</b><span>${e.a.name}</span></div>`}
  function footballMarks(){return '<div class="endzone left"><b>HOME</b></div><div class="endzone right"><b>AWAY</b></div><div class="goalpost left"></div><div class="goalpost right"></div><div class="scrimmage" id="scrimmage"></div><div class="firstdown" id="firstdown"></div>'}
  N.stage=e=>{
    if(!POSITIONS[e.sport])return window.__NR_V3_STAGE?window.__NR_V3_STAGE(e):'';
    const per=POSITIONS[e.sport].count;
    const cls=e.sport==='basketball'?'basketball-court':e.sport==='soccer'?'soccer-pitch':e.sport==='football'?'football-field':'hockey-rink';
    const roles=(side)=>Array.from({length:per},(_,i)=>{
      let role='';
      if((e.sport==='soccer'||e.sport==='hockey')&&i===0)role='goalie';
      if(e.sport==='football')role=i===0?'quarterback':i<6?'line':i<9?'receiver':'back';
      return playerMarkup(e,side,i,role);
    }).join('');
    return `<div class="sport-v2-stage sport-v4-stage ${cls}" id="sportStage" style="--home:${e.a.color};--home2:${e.a.accent};--away:${e.b.color};--away2:${e.b.accent}"><div class="surface-lines"></div>${markMarkup(e)}${e.sport==='basketball'?'<div class="hoop left"></div><div class="hoop right"></div>':e.sport==='soccer'?'<div class="goal left"><i class="keeper-zone"></i></div><div class="goal right"><i class="keeper-zone"></i></div>':e.sport==='hockey'?'<div class="net left"></div><div class="net right"></div>':footballMarks()}${roles(0)}${roles(1)}<div class="v2-ball" id="gameBall">${e.sport==='basketball'?'🏀':e.sport==='football'?'🏈':e.sport==='soccer'?'⚽':'●'}</div><div class="action-word" id="actionWord"></div></div>`;
  };

  N.layout=(e,side,phase='set',state={})=>{
    const set=(s,coords)=>sidePlayers(s).forEach((p,i)=>{const c=coords[i]||coords.at(-1);p.style.left=c[0]+'%';p.style.top=c[1]+'%'});
    if(e.sport==='basketball'){
      const off0=[[58,50],[67,24],[67,76],[79,35],[79,65]],def0=[[53,50],[61,26],[61,74],[72,37],[72,63]];
      const mirror=a=>a.map(([x,y])=>[100-x,y]);
      set(0,side===0?off0:def0);set(1,side===1?mirror(off0):mirror(def0));
    } else if(e.sport==='soccer'){
      const home=[[6,50],[18,20],[18,40],[18,60],[18,80],[36,24],[36,50],[36,76],[53,22],[56,50],[53,78]];
      const away=home.map(([x,y])=>[100-x,y]);
      if(phase==='attack'){
        const shift=side===0?9:-9;
        (side===0?home:away).forEach((c,i)=>{if(i>0)c[0]+=shift});
      }
      set(0,home);set(1,away);
    } else if(e.sport==='hockey'){
      const h=[[7,50],[24,32],[24,68],[42,24],[46,50],[42,76]],a=[[93,50],[76,32],[76,68],[58,24],[54,50],[58,76]];
      if(phase==='attack'){const shift=side===0?12:-12;(side===0?h:a).forEach((c,i)=>{if(i>0)c[0]+=shift})}
      set(0,h);set(1,a);
    } else if(e.sport==='football'){
      const yard=clamp(state.yard??25,5,95),x=side===0?8+yard*.84:92-yard*.84;
      const dir=side===0?1:-1;
      const offense=[[x-6*dir,50],[x,20],[x,32],[x,44],[x,56],[x,68],[x+2*dir,10],[x+2*dir,90],[x-8*dir,28],[x-9*dir,72],[x-12*dir,50]];
      const defense=[[x+3*dir,14],[x+3*dir,28],[x+3*dir,42],[x+3*dir,58],[x+3*dir,72],[x+3*dir,86],[x+10*dir,22],[x+10*dir,78],[x+15*dir,36],[x+15*dir,64],[x+20*dir,50]];
      set(side,offense);set(1-side,defense);
      const los=$('#scrimmage'),fd=$('#firstdown');if(los)los.style.left=x+'%';if(fd)fd.style.left=clamp(x+dir*8.4,4,96)+'%';
    }
  };

  async function moveBall(x,y,ms=260){const b=$('#gameBall');if(!b)return;b.style.transition=`left ${ms}ms cubic-bezier(.2,.75,.2,1),top ${ms}ms ease`;b.style.left=x+'%';b.style.top=y+'%';await pause(ms)}
  function boom(text,kind='score'){N.flash(text,kind)}

  async function basketballPossession(e,side,score){
    N.layout(e,side,'attack');setTicker('LIVE POSSESSION',`${side===0?e.a.short:e.b.short} works into the half court.`);
    await moveBall(side===0?60:40,50,220);await moveBall(side===0?70:30,28+N.ri(45),220);
    if(chance(.12)){boom('STEAL!','steal');return 1-side}
    const three=chance(.38),make=chance(three?.47:.62);
    await moveBall(side===0?91:9,three?28+N.ri(45):44+N.ri(16),260);
    if(make){const pts=three?3:2;score[side]+=pts;boom(three?'THREE!':'BUCKET!','score');setTicker('SCORED',`${side===0?e.a.short:e.b.short} puts ${pts} on the board.`);if(chance(.32)){const run=2+N.ri(7);score[side]+=run;await pause(260);boom(`${run}-0 RUN!`,'score')}}
    else {boom(chance(.35)?'BLOCK!':'MISS!','miss');if(chance(.18)){score[side]+=1;boom('AND 1!','score')}}
    return 1-side;
  }

  async function soccerPossession(e,side,score){
    N.layout(e,side,'attack');setTicker('BUILD-UP',`${side===0?e.a.short:e.b.short} advances through midfield.`);
    const xs=side===0?[34,48,62,77]:[66,52,38,23];for(const x of xs){await moveBall(x,22+N.ri(56),190);if(chance(.05)){boom('TACKLE!','steal');return 1-side}}
    if(chance(.14)){boom('INTERCEPTED','steal');return 1-side}
    const goalX=side===0?94:6;await moveBall(goalX,36+N.ri(28),260);
    const skill=side===0?e.probs[0]:e.probs[1],goal=chance(.20+skill*.13);
    if(goal){score[side]++;boom('GOAL!','goal');setTicker('GOAL',`${side===0?e.a.name:e.b.name} finishes the attack.`)}
    else boom(chance(.62)?'SAVE!':'WIDE!','miss');
    return 1-side;
  }

  async function hockeyPossession(e,side,score){
    N.layout(e,side,'attack');setTicker('RUSH',`${side===0?e.a.short:e.b.short} carries through the neutral zone.`);
    await moveBall(side===0?58:42,30+N.ri(40),180);await moveBall(side===0?74:26,24+N.ri(52),190);
    if(chance(.13)){boom('TAKEAWAY!','steal');return 1-side}
    await moveBall(side===0?94:6,43+N.ri(14),240);
    const skill=side===0?e.probs[0]:e.probs[1],goal=chance(.18+skill*.11);
    if(goal){score[side]++;boom('GOAL!','goal');setTicker('GOAL',`${side===0?e.a.name:e.b.name} beats the goaltender.`)}else boom(chance(.7)?'SAVE!':'POST!','miss');
    return 1-side;
  }

  async function footballDrive(e,side,score,state){
    state.yard=state.posSide===side?state.yard:(20+N.ri(16));state.posSide=side;
    N.layout(e,side,'set',state);setTicker('DRIVE START',`${side===0?e.a.short:e.b.short} takes over at its own ${state.yard}.`);
    let downs=1,toGo=10;
    for(let play=0;play<4;play++){
      N.layout(e,side,'play',state);await moveBall(side===0?8+state.yard*.84:92-state.yard*.84,50,160);
      if(chance(.065)){boom('TURNOVER!','steal');state.yard=100-state.yard;return 1-side}
      const explosive=chance(.13),gain=explosive?18+N.ri(30):Math.max(-4,2+N.ri(13));state.yard+=gain;toGo-=gain;
      const ballX=side===0?8+clamp(state.yard,0,100)*.84:92-clamp(state.yard,0,100)*.84;await moveBall(ballX,25+N.ri(50),240);
      if(state.yard>=100){score[side]+=7;boom('TOUCHDOWN!','goal');setTicker('TOUCHDOWN',`${side===0?e.a.name:e.b.name} reaches the end zone.`);state.yard=25;return 1-side}
      if(toGo<=0){boom('FIRST DOWN!','score');downs=1;toGo=10;setTicker('FIRST DOWN',`${gain} yard gain keeps the drive alive.`)}else{downs++;boom(gain>=10?'BIG GAIN!':gain<0?'STUFFED!':`${gain} YARDS`,'score')}
      if(downs>4)break;
      await pause(120);
    }
    const skill=side===0?e.probs[0]:e.probs[1];
    if(state.yard>=58&&chance(.50+skill*.12)){score[side]+=3;boom('FIELD GOAL!','score');setTicker('FIELD GOAL','The kick is good.');state.yard=25;return 1-side}
    if(state.yard>=70&&chance(.36+skill*.16)){score[side]+=7;boom('TOUCHDOWN!','goal');setTicker('RED ZONE SCORE','The offense punches it in.');state.yard=25;return 1-side}
    boom('PUNT','miss');state.yard=20+N.ri(16);return 1-side;
  }

  N.team=async e=>{
    const o=N.overlay(e,e.sport);o.innerHTML=N.base(e,N.stage(e));
    const intro=e.sport==='basketball'?'TIP-OFF!':e.sport==='hockey'?'PUCK DROP!':e.sport==='soccer'?'KICKOFF!':'OPENING KICKOFF!';
    const introSub=e.sport==='basketball'?'Five on five. Both teams set at center court.':e.sport==='football'?'Eleven on eleven. The opening drive is ready.':e.sport==='soccer'?'Eleven on eleven with both goalkeepers set.':'Six on six including both goaltenders.';
    await N.intro(o,e,intro,introSub);
    let score=[0,0],pos=N.ri(2),done=false,next=0,lc=-1;const state={yard:25,posSide:pos};N.layout(e,pos,'set',state);
    const dur=prefersReducedMotion()?14000:N.DUR[e.sport],start=performance.now();
    await new Promise(res=>{async function frame(now){if(done)return;const el=now-start,t=clamp(el/dur,0,1),sec=Math.floor(el/1000);if(sec!==lc){lc=sec;$('#v2Clock').textContent=N.clock(e.sport,t,{stop:92+N.ri(5)});$('#v2Period').textContent=e.sport==='soccer'?(t<.5?'1ST HALF':'2ND HALF'):e.sport==='hockey'?`PERIOD ${Math.min(3,Math.floor(t*3)+1)}`:`Q${Math.min(4,Math.floor(t*4)+1)}`}
      if(el>=next&&t<.985){next=el+(e.sport==='football'?4300:e.sport==='soccer'?2800:e.sport==='hockey'?2400:1900);if(e.sport==='football')pos=await footballDrive(e,pos,score,state);else if(e.sport==='soccer')pos=await soccerPossession(e,pos,score);else if(e.sport==='hockey')pos=await hockeyPossession(e,pos,score);else pos=await basketballPossession(e,pos,score);setScore(score)}
      if(t>=1){done=true;res()}else requestAnimationFrame(frame)}requestAnimationFrame(frame)});
    if(score[0]===score[1]){setTicker('OVERTIME','One final scoring sequence decides it.');const w=chance(e.probs[0])?0:1;if(e.sport==='basketball'){await basketballPossession(e,w,score);if(score[0]===score[1])score[w]+=2}else if(e.sport==='football'){score[w]+=3;boom('OVERTIME FG!','score')}else if(e.sport==='soccer'){score[w]+=1;boom('EXTRA-TIME GOAL!','goal')}else{score[w]+=1;boom('OVERTIME GOAL!','goal')}setScore(score);await pause(500)}
    const w=score[0]>score[1]?0:1,sum=`${e.a.short} ${score[0]} · ${e.b.short} ${score[1]}`;await N.end(o,`${w===0?e.a.name:e.b.name} WINS`,sum);N.close(o);return{winner:w,summary:sum,finalText:'The visible possessions, shots, goals and drives created the final score.'};
  };

  function fighterDisc(e,side){const c=side===0?e.a:e.b,cls=side===0?'a':'b';return `<div class="fighter-v4 ${cls}" style="--team:${c.color}"><div class="fighter-disc">${c.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><small>${c.name}</small></div>`}
  async function strike(att,def,land,sport){const A=att===0?$('.fighter-v4.a'):$('.fighter-v4.b'),D=def===0?$('.fighter-v4.a'):$('.fighter-v4.b'),W=$('#fightWord');A.classList.add('lunge');if(land)D.classList.add('hit');if(W){W.textContent=land?N.pick(sport==='mma'?['BAM!','THUD!','KICK!','SMACK!']:['POW!','JAB!','KAPOW!','BANG!']):'MISS!';W.style.left=def===0?'30%':'67%';W.classList.add('show')}await pause(300);A.classList.remove('lunge');D.classList.remove('hit');W?.classList.remove('show');}
  N.fight=async e=>{
    const o=N.overlay(e,e.sport);o.innerHTML=N.base(e,`<div class="fight-v4-arena"><div class="arena-lights"></div><div class="arena-crowd">${Array.from({length:34},()=>'<i></i>').join('')}</div><div class="fight-v4-hud"><div><span>${e.a.short}</span><i><b id="hpA"></b></i></div><div><span>${e.b.short}</span><i><b id="hpB"></b></i></div></div><div class="fight-v4-ring ${e.sport==='mma'?'octagon':''}"><div class="ring-rope r1"></div><div class="ring-rope r2"></div><div class="ring-rope r3"></div>${fighterDisc(e,0)}${fighterDisc(e,1)}<div class="fight-word" id="fightWord"></div></div></div>`);
    await N.intro(o,e,'FIGHT!',e.sport==='boxing'?'Six compressed rounds under the lights.':'Three compressed five-minute rounds inside the cage.');
    let hp=[100,100],damage=[0,0],ko=-1,att=N.ri(2),next=0,lc=-1;const dur=prefersReducedMotion()?13000:N.DUR[e.sport],start=performance.now();
    await new Promise(res=>{function f(now){const el=now-start,t=clamp(el/dur,0,1),sec=Math.floor(el/1000);if(sec!==lc){lc=sec;$('#v2Clock').textContent=N.clock(e.sport,t);$('#v2Period').textContent=e.sport==='boxing'?`ROUND ${Math.min(6,Math.floor(t*6)+1)}`:`ROUND ${Math.min(3,Math.floor(t*3)+1)}`}
      if(el>=next&&t<.99){next=el+520+N.ri(620);att=chance(.54)?att:1-att;const def=1-att,skill=att===0?e.probs[0]:e.probs[1],land=chance(.58+skill*.20);if(land){let d=5+N.ri(11);if(chance(.16))d+=8+N.ri(12);hp[def]=Math.max(0,hp[def]-d);damage[att]+=d;strike(att,def,true,e.sport);$('#hpA').style.width=hp[0]+'%';$('#hpB').style.width=hp[1]+'%';$('#scoreA').textContent=damage[0];$('#scoreB').textContent=damage[1];if(hp[def]<=0){ko=att;res();return}}else strike(att,def,false,e.sport)}if(t>=1){res();return}requestAnimationFrame(f)}requestAnimationFrame(f)});
    const w=ko>=0?ko:(damage[0]===damage[1]?(chance(e.probs[0])?0:1):damage[0]>damage[1]?0:1),method=ko>=0?'KNOCKOUT':'DECISION';await N.end(o,method,`${w===0?e.a.name:e.b.name} WINS`);N.close(o);return{winner:w,summary:`${w===0?e.a.short:e.b.short} by ${method}`,finalText:ko>=0?'A visible strike emptied the opponent health bar.':'The decision came from accumulated landed damage.'};
  };
  N.simulate=e=>['boxing','mma'].includes(e.sport)?N.fight(e):['tennis','tabletennis'].includes(e.sport)?N.racquet(e):N.team(e);
})();
