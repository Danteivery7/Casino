'use strict';
(function(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  const KEY='neonRoyaleSoundV2';let on=localStorage.getItem(KEY)!=='off';
  let c,m,amb,ag,eng,eg,hoof,noise,last={a:'',f:'',t:'',p:'',r:'',b:'',e:''};

  const ensure=()=>{
    if(c)return c;c=new AC();m=c.createGain();m.gain.value=on ? .72 : 0;m.connect(c.destination);
    noise=c.createBuffer(1,c.sampleRate*4,c.sampleRate);const d=noise.getChannelData(0);let x=0;
    for(let i=0;i<d.length;i++){x=(x+.02*(Math.random()*2-1))*.992;d[i]=x*.8+(Math.random()*2-1)*.025}
    amb=c.createBufferSource();amb.buffer=noise;amb.loop=true;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=760;
    ag=c.createGain();ag.gain.value=.026;amb.connect(f);f.connect(ag);ag.connect(m);amb.start();return c;
  };
  const T=()=>c.currentTime;
  const env=(g,t,v,d)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d)};
  const tone=(hz,d=.15,type='sine',v=.1,delay=0,end=0)=>{if(!on)return;ensure();const t=T()+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(hz,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);env(g,t,v,d);o.connect(g);g.connect(m);o.start(t);o.stop(t+d+.05)};
  const burst=(d=.12,v=.1,cut=1600,delay=0)=>{if(!on)return;ensure();const t=T()+delay,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=noise;f.type='lowpass';f.frequency.value=cut;env(g,t,v,d);s.connect(f);f.connect(g);g.connect(m);s.start(t,Math.random()*3);s.stop(t+d+.05)};
  const crowd=(v=.11,d=.7)=>{burst(d,v,1050);tone(230,d*.55,'triangle',v*.12,.03,180)};
  const hit=(v=.18)=>{burst(.1,v,900);tone(88,.11,'sine',v*.6,0,52)};
  const whistle=()=>{tone(1950,.18,'sine',.11,0,2450);tone(2350,.12,'sine',.07,.12,1900)};
  const bell=()=>[620,930,1240].forEach((h,i)=>tone(h,.55,'sine',.1/(i+1),0,h*.985));
  const buzzer=()=>{tone(115,.42,'sawtooth',.085,0,92);tone(230,.42,'square',.04)};
  const swish=()=>burst(.15,.065,5200);
  const puck=()=>{burst(.055,.075,3600);tone(690,.055,'square',.03)};
  const kick=()=>{hit(.09);tone(145,.08,'sine',.05,0,88)};
  const racquet=(tt)=>tone(tt?1050:520,tt ? .045 : .065,'triangle',tt ? .05 : .065,0,tt?780:390);
  const horn=()=>{tone(220,.72,'sawtooth',.065);tone(277,.72,'sawtooth',.05);tone(330,.72,'sawtooth',.045);crowd(.14,.9)};
  const pit=()=>{for(let i=0;i<4;i++)burst(.05,.09,2600,i*.12)};

  const sport=()=>{const o=document.querySelector('.sports-v2-broadcast');if(!o)return'';return ['basketball','football','soccer','hockey','boxing','mma','tennis','tabletennis','motorsports'].find(s=>o.classList.contains(s))||''};
  const engine=(yes)=>{if(!yes){if(eng){clearInterval(eng._i);try{eng.stop()}catch{}eng=null}return}if(eng||!on)return;ensure();eng=c.createOscillator();eg=c.createGain();eng.type='sawtooth';eng.frequency.value=78;eg.gain.value=.018;eng.connect(eg);eg.connect(m);eng.start();let u=0;eng._i=setInterval(()=>{if(eng)eng.frequency.setTargetAtTime(u++%2?86:118,T(),.18)},420)};
  const hooves=(yes)=>{if(!yes){if(hoof){clearInterval(hoof);hoof=null}return}if(hoof||!on)return;hoof=setInterval(()=>{hit(.04);setTimeout(()=>hit(.03),95)},310)};

  function action(s,t){if(!t||t===last.a)return;last.a=t;t=t.toUpperCase();
    if(s==='basketball'){if(/THREE|BUCKET|RUN|AND 1/.test(t)){swish();crowd(.07,.4)}else if(/STEAL|BLOCK/.test(t)){hit(.07);whistle()}else if(/MISS/.test(t))tone(310,.07,'square',.04)}
    if(s==='soccer'){if(/GOAL/.test(t)){whistle();crowd(.15,.95)}else if(/SAVE|WIDE/.test(t))kick();else if(/TACKLE|INTERCEPT/.test(t)){kick();hit(.07)}}
    if(s==='hockey'){if(/GOAL/.test(t))horn();else if(/SAVE|POST/.test(t))puck();else if(/TAKEAWAY|TURNOVER/.test(t)){puck();hit(.12)}}
    if(s==='football'){if(/TOUCHDOWN/.test(t)){whistle();crowd(.14,.85)}else if(/FIELD GOAL/.test(t)){whistle();crowd(.08,.5)}else if(/TURNOVER|STUFFED|YARDS|GAIN|FIRST DOWN/.test(t))hit(.12);else if(/PUNT/.test(t)){kick();whistle()}}
  }
  function fight(t){if(!t||t===last.f)return;last.f=t;/WHIFF/i.test(t)?burst(.08,.04,3400):hit(/KAPOW|KICK|SMACK/i.test(t) ? .22 : .15)}
  function ticker(s,t){if(!t||t===last.t)return;last.t=t;t=t.toUpperCase();if(s==='motorsports'&&/PIT CYCLE/.test(t))pit();if(s==='hockey'&&/RUSH/.test(t))puck();if(s==='soccer'&&/BUILD-UP/.test(t))kick();if(s==='football'&&/DRIVE|SNAP/.test(t))hit(.05)}
  function period(s,p){if(!p||p===last.p)return;const old=last.p;last.p=p;if(!old)return;if(s==='boxing'||s==='mma')bell();else if(s==='basketball'||s==='hockey')buzzer();else if(s==='football')whistle()}
  function end(s,t){if(!t||t===last.e)return;last.e=t;if(!/WIN|FINAL|KNOCKOUT|DECISION/i.test(t))return;if(s==='boxing'||s==='mma')bell();else if(s==='hockey')horn();else if(s==='motorsports'){tone(880,.1,'square',.06);tone(1320,.13,'square',.05,.11);crowd(.1,.65)}else{whistle();crowd(.1,.6)}}

  function tick(){
    if(!on){engine(false);hooves(false);return}
    const s=sport(),horse=!!document.querySelector('.race-broadcast');
    if(c)ag.gain.setTargetAtTime((s||horse) ? .05 : (document.body.dataset.room==='lobby' ? .026 : .032),T(),.4);
    engine(s==='motorsports');hooves(horse);
    action(s,document.querySelector('.sports-v2-broadcast #actionWord')?.textContent?.trim()||'');
    fight(document.querySelector('.sports-v2-broadcast #fightWord')?.textContent?.trim()||'');
    ticker(s,document.querySelector('.sports-v2-broadcast #v2Ticker')?.textContent?.trim()||'');
    period(s,document.querySelector('.sports-v2-broadcast #v2Period')?.textContent?.trim()||'');
    const rb=document.querySelector('.sports-v2-broadcast #rBall');if(rb){const pos=rb.style.left+'|'+rb.style.top;if(pos!==last.b){if(last.b)racquet(s==='tabletennis');last.b=pos}}else last.b='';
    const rd=document.querySelector('.sports-v2-broadcast #racquetDetail')?.textContent?.trim()||'';if(rd&&rd!==last.r){if(last.r)racquet(s==='tabletennis');last.r=rd}
    end(s,document.querySelector('.sports-v2-broadcast .sports-v2-end')?.textContent?.trim()||'');
  }

  const toggle=v=>{on=!!v;localStorage.setItem(KEY,on?'on':'off');ensure();if(c.state==='suspended')c.resume().catch(()=>{});m.gain.setTargetAtTime(on ? .72 : 0,T(),.05);if(!on){engine(false);hooves(false)}const b=document.getElementById('soundToggle');if(b){b.textContent=on?'🔊 Sound':'🔇 Sound';b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))}};
  const nav=document.querySelector('.top-nav');if(nav&&!document.getElementById('soundToggle')){const b=document.createElement('button');b.id='soundToggle';b.type='button';b.textContent=on?'🔊 Sound':'🔇 Sound';b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on);b.onclick=e=>{e.stopPropagation();toggle(!on)};nav.appendChild(b)}
  const unlock=()=>{ensure();if(on&&c.state==='suspended')c.resume().catch(()=>{});document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('keydown',unlock,true)};
  document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);setInterval(tick,120);
  window.NRAUDIO={toggle,get enabled(){return on},crowd,hit,bell,whistle,horn};
})();