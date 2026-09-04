'use strict';

/* Neon Royale Audio v1
   Lightweight Web Audio ambience + event-driven sports SFX.
   No external audio assets: effects are synthesized in-browser.
*/
(function neonRoyaleAudio(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  const STORE='neonRoyaleSoundV1';
  let enabled=localStorage.getItem(STORE)!=='off';
  let ctx=null,master=null,ambience=null,ambienceGain=null,engineOsc=null,engineGain=null,hoofTimer=null;
  let noiseBuffer=null,lastAction='',lastFight='',lastTicker='',lastPeriod='',lastRacquet='',lastBallPos='',lastEnd='',lastRoom='';

  function ensure(){
    if(ctx)return ctx;
    ctx=new AudioCtx();
    master=ctx.createGain();master.gain.value=enabled?.72:0;master.connect(ctx.destination);
    noiseBuffer=makeNoise(4);
    startAmbience();
    return ctx;
  }
  function makeNoise(sec){
    const b=ctx.createBuffer(2,ctx.sampleRate*sec,ctx.sampleRate);
    for(let ch=0;ch<2;ch++){
      const d=b.getChannelData(ch);let brown=0;
      for(let i=0;i<d.length;i++){brown=(brown+.018*(Math.random()*2-1))*.992;d[i]=brown*.75+(Math.random()*2-1)*.03;}
    }
    return b;
  }
  function now(){return ctx.currentTime}
  function gainNode(v=1){const g=ctx.createGain();g.gain.value=v;g.connect(master);return g}
  function envelope(g,t,a=.01,s=.08,r=.12,peak=.2){g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),t+a);g.gain.setValueAtTime(Math.max(.0002,peak*.8),t+a+s);g.gain.exponentialRampToValueAtTime(.0001,t+a+s+r)}
  function tone(freq,dur=.15,type='sine',vol=.15,delay=0,endFreq=null){if(!enabled)return;ensure();const t=now()+delay,o=ctx.createOscillator(),g=gainNode(0);o.type=type;o.frequency.setValueAtTime(freq,t);if(endFreq)o.frequency.exponentialRampToValueAtTime(endFreq,t+dur);envelope(g,t,.006,dur*.45,dur*.45,vol);o.connect(g);o.start(t);o.stop(t+dur+.08)}
  function burst(dur=.12,vol=.12,cut=1800,delay=0){if(!enabled)return;ensure();const t=now()+delay,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=gainNode(0);s.buffer=noiseBuffer;f.type='lowpass';f.frequency.value=cut;s.connect(f);f.connect(g);envelope(g,t,.003,dur*.35,dur*.6,vol);s.start(t,Math.random()*3);s.stop(t+dur+.08)}
  function crowd(vol=.12,dur=.75){burst(dur,vol,1100);tone(230,dur*.55,'triangle',vol*.14,.04,180);tone(310,dur*.45,'triangle',vol*.1,.09,260)}
  function impact(vol=.22){burst(.10,vol,900);tone(85,.11,'sine',vol*.75,0,52)}
  function whistle(){tone(1950,.18,'sine',.12,0,2450);tone(2350,.12,'sine',.08,.12,1900)}
  function bell(){[620,930,1240].forEach((f,i)=>tone(f,.58,'sine',.11/(i+1),0,f*.985))}
  function buzzer(){tone(115,.42,'sawtooth',.09,0,92);tone(230,.42,'square',.045)}
  function swish(){burst(.16,.07,5200);tone(480,.06,'sine',.035)}
  function bounce(){tone(105,.075,'sine',.07,0,64)}
  function kick(){impact(.11);tone(145,.08,'sine',.055,0,88)}
  function puck(){burst(.055,.075,3600);tone(690,.055,'square',.035)}
  function racquet(tt=false){tone(tt?1050:520,tt?.045:.065,'triangle',tt?.055:.07,0,tt?780:390)}
  function horn(){tone(220,.75,'sawtooth',.07);tone(277,.75,'sawtooth',.055);tone(330,.75,'sawtooth',.05);crowd(.15,1.0)}
  function pitGun(){for(let i=0;i<4;i++)burst(.055,.1,2600,i*.12)}

  function startAmbience(){
    if(ambience)return;
    ambience=ctx.createBufferSource();ambience.buffer=noiseBuffer;ambience.loop=true;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=760;
    ambienceGain=ctx.createGain();ambienceGain.gain.value=.024;
    ambience.connect(lp);lp.connect(ambienceGain);ambienceGain.connect(master);ambience.start();
  }
  function setAmbience(level){if(!ctx||!ambienceGain)return;ambienceGain.gain.setTargetAtTime(level,now(),.45)}
  function startEngine(){if(!enabled){stopEngine();return}ensure();if(engineOsc)return;engineOsc=ctx.createOscillator();engineGain=ctx.createGain();engineOsc.type='sawtooth';engineOsc.frequency.value=72;engineGain.gain.value=.018;engineOsc.connect(engineGain);engineGain.connect(master);engineOsc.start();let up=true;engineOsc._timer=setInterval(()=>{if(!engineOsc)return;engineOsc.frequency.setTargetAtTime(up?118:82,now(),.18);up=!up},420)}
  function stopEngine(){if(!engineOsc)return;clearInterval(engineOsc._timer);try{engineOsc.stop()}catch{}engineOsc.disconnect();engineOsc=null;engineGain=null}
  function startHooves(){if(hoofTimer||!enabled)return;ensure();let flip=false;hoofTimer=setInterval(()=>{if(!document.querySelector('.race-broadcast,.race-v5'))return;impact(.045);setTimeout(()=>impact(.035),flip?130:95);flip=!flip},300)}
  function stopHooves(){if(hoofTimer){clearInterval(hoofTimer);hoofTimer=null}}

  function activeSport(){const o=document.querySelector('.sports-v2-broadcast');if(!o)return'';for(const s of ['basketball','football','soccer','hockey','boxing','mma','tennis','tabletennis','motorsports'])if(o.classList.contains(s))return s;return''}
  function handleAction(s,text){
    if(!text||text===lastAction)return;lastAction=text;const t=text.toUpperCase();
    if(s==='basketball'){
      if(/THREE|BUCKET|RUN|AND 1/.test(t)){swish();crowd(.08,.45)}else if(/STEAL|BLOCK/.test(t)){impact(.07);whistle()}else if(/MISS/.test(t)){tone(310,.07,'square',.045)}else bounce();
    }else if(s==='soccer'){
      if(/GOAL/.test(t)){whistle();crowd(.16,1.0)}else if(/SAVE|WIDE/.test(t))kick();else if(/TACKLE|INTERCEPT/.test(t)){kick();impact(.08)}
    }else if(s==='hockey'){
      if(/GOAL/.test(t))horn();else if(/SAVE|POST/.test(t))puck();else if(/TAKEAWAY|TURNOVER/.test(t)){puck();impact(.12)}
    }else if(s==='football'){
      if(/TOUCHDOWN/.test(t)){whistle();crowd(.15,.9)}else if(/FIELD GOAL/.test(t)){whistle();crowd(.09,.55)}else if(/TURNOVER|STUFFED|YARDS|GAIN|FIRST DOWN/.test(t))impact(.13);else if(/PUNT/.test(t)){kick();whistle()}
    }
  }
  function handleFight(text){if(!text||text===lastFight)return;lastFight=text;const t=text.toUpperCase();if(/WHIFF/.test(t))burst(.08,.045,3400);else{impact(/KAPOW|KICK|SMACK/.test(t)?.22:.15);tone(175,.055,'square',.045)}}
  function handlePeriod(s,p){if(!p||p===lastPeriod)return;const prev=lastPeriod;lastPeriod=p;if(!prev)return;if(s==='boxing'||s==='mma')bell();else if(s==='basketball'||s==='hockey')buzzer();else if(s==='football')whistle()}
  function handleTicker(s,t){if(!t||t===lastTicker)return;lastTicker=t;const u=t.toUpperCase();if(s==='motorsports'&&/PIT CYCLE/.test(u))pitGun();if(s==='hockey'&&/RUSH/.test(u))puck();if(s==='soccer'&&/BUILD-UP/.test(u))kick();if(s==='basketball'&&/POSSESSION/.test(u))bounce();if(s==='football'&&/DRIVE|SNAP/.test(u))impact(.055)}
  function handleEnd(s,text){if(!text||text===lastEnd)return;lastEnd=text;if(!/WIN|FINAL|KNOCKOUT|DECISION/i.test(text))return;if(s==='boxing'||s==='mma')bell();else if(s==='hockey')horn();else if(s==='motorsports'){tone(880,.11,'square',.07);tone(1320,.14,'square',.06,.12);crowd(.11,.7)}else{whistle();crowd(.11,.65)}}

  function tick(){
    if(!enabled){stopEngine();stopHooves();return}
    const s=activeSport(),horse=!!document.querySelector('.race-broadcast,.race-v5');
    if(ctx)setAmbience(s||horse?.052:document.body.dataset.room==='lobby'?.026:.032);
    if(s==='motorsports')startEngine();else stopEngine();
    if(horse)startHooves();else stopHooves();
    const action=document.querySelector('.sports-v2-broadcast #actionWord')?.textContent?.trim()||'';handleAction(s,action);
    const fight=document.querySelector('.sports-v2-broadcast #fightWord')?.textContent?.trim()||'';handleFight(fight);
    const ticker=document.querySelector('.sports-v2-broadcast #v2Ticker')?.textContent?.trim()||'';handleTicker(s,ticker);
    const period=document.querySelector('.sports-v2-broadcast #v2Period')?.textContent?.trim()||'';handlePeriod(s,period);
    const rd=document.querySelector('.sports-v2-broadcast #racquetDetail')?.textContent?.trim()||'';if(rd&&rd!==lastRacquet){if(lastRacquet)racquet(s==='tabletennis');lastRacquet=rd}
    const ball=document.querySelector('.sports-v2-broadcast #rBall');if(ball){const pos=ball.style.left+'|'+ball.style.top;if(pos&&pos!==lastBallPos){if(lastBallPos)racquet(s==='tabletennis');lastBallPos=pos}}else lastBallPos='';
    const end=document.querySelector('.sports-v2-broadcast .sports-v2-end')?.textContent?.trim()||'';handleEnd(s,end);
    const room=document.body.dataset.room||'';if(room!==lastRoom){lastRoom=room;if(!s&&room!=='lobby')tone(520,.07,'sine',.025)}
  }

  function applyEnabled(v){enabled=!!v;localStorage.setItem(STORE,enabled?'on':'off');ensure();if(ctx.state==='suspended')ctx.resume().catch(()=>{});master.gain.setTargetAtTime(enabled?.72:0,now(),.05);if(!enabled){stopEngine();stopHooves()}const b=document.getElementById('soundToggle');if(b){b.textContent=enabled?'🔊 Sound':'🔇 Sound';b.classList.toggle('active',enabled);b.setAttribute('aria-pressed',String(enabled))}}
  function addToggle(){if(document.getElementById('soundToggle'))return;const nav=document.querySelector('.top-nav');if(!nav)return;const b=document.createElement('button');b.id='soundToggle';b.type='button';b.textContent=enabled?'🔊 Sound':'🔇 Sound';b.setAttribute('aria-pressed',String(enabled));b.classList.toggle('active',enabled);b.addEventListener('click',e=>{e.stopPropagation();applyEnabled(!enabled)});nav.appendChild(b)}

  addToggle();
  const unlock=()=>{ensure();if(enabled&&ctx.state==='suspended')ctx.resume().catch(()=>{});document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('keydown',unlock,true)};
  document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);
  setInterval(tick,120);
  window.NRAUDIO={setEnabled:applyEnabled,get enabled(){return enabled},impact,crowd,bell,whistle,horn};
})();