'use strict';
(function(){
  function alignTrack(root=document){
    root.querySelectorAll?.('svg.motor-track-v4').forEach(svg=>{
      svg.setAttribute('preserveAspectRatio','none');
      svg.classList.add('motor-track-aligned-v5');
      svg.closest('.sports-v2-broadcast')?.classList.add('motorsports-v5');
    });
  }
  alignTrack();
  const observer=new MutationObserver(records=>{
    for(const r of records){
      for(const n of r.addedNodes){
        if(!(n instanceof Element))continue;
        if(n.matches?.('svg.motor-track-v4'))alignTrack(n.parentElement||document);
        else if(n.querySelector?.('svg.motor-track-v4'))alignTrack(n);
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
