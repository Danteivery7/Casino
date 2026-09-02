'use strict';
(function(){
  const N=window.NRSPORTS2;if(!N)return;
  const entry=$('#sportsbookLobbyCard');
  if(entry){
    entry.onclick=N.open;
    const row=$('.sports-chip-row');
    if(row&&!row.textContent.includes('Motorsports'))row.insertAdjacentHTML('beforeend','<span>🏎️ Motorsports</span>');
  }
  if(!document.querySelector('link[href="horse-v5.css"]')){
    const css=document.createElement('link');css.rel='stylesheet';css.href='horse-v5.css';document.head.appendChild(css);
  }
  if(!document.querySelector('script[src="horse-v5.js"]')){
    const js=document.createElement('script');js.src='horse-v5.js';js.defer=true;document.body.appendChild(js);
  }
})();
