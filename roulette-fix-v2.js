'use strict';
(function rouletteQuickFix(){
  const base=window.renderRoulette;
  if(typeof base!=='function')return;

  window.renderRoulette=function renderRouletteFixed(){
    base();

    const shell=document.querySelector('.ri-wheel-shell');
    const pointer=document.getElementById('riPointer');
    if(shell&&pointer){
      shell.style.position='relative';
      shell.prepend(pointer);
    }

    const spin=document.getElementById('spinRoulette');
    if(spin){
      spin.addEventListener('click',()=>{
        document.querySelectorAll('.ri-pocket.winner').forEach(p=>p.classList.remove('winner'));
      },true);
    }
  };
})();
