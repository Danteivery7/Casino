'use strict';
(function(){
  const N=window.NRSPORTS2;if(!N)return;
  const entry=$('#sportsbookLobbyCard');
  if(entry){
    entry.onclick=N.open;
    const row=$('.sports-chip-row');
    if(row&&!row.textContent.includes('Motorsports'))row.insertAdjacentHTML('beforeend','<span>🏎️ Motorsports</span>');
  }
  const style=src=>{if(document.querySelector(`link[href="${src}"]`))return;const x=document.createElement('link');x.rel='stylesheet';x.href=src;document.head.appendChild(x)};
  const script=src=>new Promise((resolve,reject)=>{if(document.querySelector(`script[src="${src}"]`))return resolve();const x=document.createElement('script');x.src=src;x.async=false;x.onload=resolve;x.onerror=reject;document.body.appendChild(x)});
  style('horse-v5.css');
  style('sportsbook-v3.css');
  style('sportsbook-v4.css');
  style('integrity-v1.css');
  style('mobile-v1.css');
  style('motorsports-fix-v3.css');
  style('motorsports-track-v4.css');
  style('motorsports-track-align-v5.css');
  style('motorsports-driver-glow-v6.css');
  style('roulette-multibet-v3.css');
  style('audio-v2.css');
  script('horse-v5.js')
    .then(()=>script('sportsbook-v3.js'))
    .then(()=>script('sportsbook-v4.js'))
    .then(()=>script('integrity-v1.js'))
    .then(()=>script('roulette-fix-v2.js'))
    .then(()=>script('roulette-multibet-v3.js'))
    .then(()=>script('roulette-chip-amount-v4.js'))
    .then(()=>script('slots-reel-fix-v2.js'))
    .then(()=>script('motorsports-track-v4.js'))
    .then(()=>script('motorsports-track-align-v5.js'))
    .then(()=>script('audio-v2.js'))
    .catch(err=>console.error('Casino enhancement load failed',err));
})();