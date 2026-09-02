'use strict';
(function(){const N=window.NRSPORTS2;if(!N)return;const entry=$('#sportsbookLobbyCard');if(entry){entry.onclick=N.open;const row=$('.sports-chip-row');if(row&&!row.textContent.includes('Motorsports'))row.insertAdjacentHTML('beforeend','<span>🏎️ Motorsports</span>')}})();
