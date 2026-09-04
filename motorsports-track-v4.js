'use strict';
(function(){
  const N=window.NRSPORTS2;if(!N)return;
  const pt=(points,z)=>{const n=points.length,p=((z%1)+1)%1*n,i=Math.floor(p),f=p-i,a=points[i%n],b=points[(i+1)%n];return{x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f}};
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=N.ri(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
  function renderPoint(points,z,offset=0){
    const q=pt(points,z),a=pt(points,z-.0025),b=pt(points,z+.0025),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
    return{x:q.x+(-dy/len)*offset,y:q.y+(dx/len)*offset};
  }
  function geometry(points){
    const a=points[0],b=points[1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
    const line=(x,y,w=6.9)=>({x1:x-nx*w,y1:y-ny*w,x2:x+nx*w,y2:y+ny*w});
    const finish=line(a[0],a[1],7.2),grid=[];
    for(let k=1;k<=6;k++){const x=a[0]+ux*k*2.2,y=a[1]+uy*k*2.2;grid.push(line(x,y,4.2));}
    const off=8.4,p1={x:a[0]+nx*off,y:a[1]+ny*off},p2={x:b[0]+nx*off,y:b[1]+ny*off};
    return{finish,grid,pit:{x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y},ux,uy,nx,ny,start:a};
  }
  function pitSpot(points,index){
    const g=geometry(points),along=3.2+(index%8)*2.25,row=Math.floor(index/8),side=8.4+row*2.2;
    return{x:g.start[0]+g.ux*along+g.nx*side,y:g.start[1]+g.uy*along+g.ny*side};
  }
  const attrs=l=>`x1="${l.x1.toFixed(2)}" y1="${l.y1.toFixed(2)}" x2="${l.x2.toFixed(2)}" y2="${l.y2.toFixed(2)}"`;
  N.motorRace=async(race,pickIndex)=>{
    const o=N.overlay(null,'motorsports motorsports-v3 motorsports-v4'),g=geometry(race.track.p),trackPts=[...race.track.p,race.track.p[0]].map(x=>x.join(',')).join(' ');
    o.innerHTML=`<div class="sports-v2-topbar"><div><small>NEON ROYALE MOTORSPORTS</small><b>${race.track.name.toUpperCase()}</b></div><div class="v2-clock" id="v2Clock">LAP 1 / 5</div><span>LIVE</span></div>
      <div class="motor-stage motor-stage-v3 motor-stage-v4">
        <div class="motor-track-label"><small>${race.track.type.toUpperCase()}</small><b>5 LAPS</b></div>
        <svg class="motor-track motor-track-v3 motor-track-v4" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <polyline class="track-shadow" points="${trackPts}"/>
          <polyline class="track-curb-red" points="${trackPts}"/>
          <polyline class="track-curb-white" points="${trackPts}"/>
          <polyline class="track-asphalt" points="${trackPts}"/>
          <polyline class="track-center-dash" points="${trackPts}"/>
          <line class="pit-lane" ${attrs(g.pit)}/>
          ${g.grid.map(l=>`<line class="start-grid-line" ${attrs(l)}/>`).join('')}
          <line class="finish-line-base" ${attrs(g.finish)}/>
          <line class="finish-line-check" ${attrs(g.finish)}/>
        </svg>
        <div class="motor-start-label">START / FINISH</div>
        <div class="motor-pit-label">PIT LANE</div>
        ${race.names.map((n,i)=>`<div class="race-car ${i===pickIndex?'your-car':''}" id="car${i}" style="--car:hsl(${i*24} 72% 52%)" title="${n}"><i>${i+1}</i></div>`).join('')}
        <div class="motor-leaders" id="motorLeaders"></div><div class="pit-banner">MANDATORY PIT · LAP 4</div><div class="pit-status-panel" id="pitStatus"></div>
      </div>
      <div class="sports-v2-ticker"><b id="v2Ticker">GRID FORMING</b><span id="v2TickerText">15 drivers are taking their starting positions.</span></div>`;

    const gridOrder=shuffle(Array.from({length:15},(_,i)=>i)),prog=Array(15).fill(0);
    for(let pos=0;pos<gridOrder.length;pos++){
      const i=gridOrder[pos],z=(pos/15)*.014,q=renderPoint(race.track.p,z,(pos%2?1:-1)*1.05),car=$('#car'+i,o);if(car){car.style.left=q.x+'%';car.style.top=q.y+'%';car.style.zIndex=String(30-pos)}
    }
    $('#motorLeaders',o).innerHTML=gridOrder.slice(0,5).map((idx,p)=>`<span class="${idx===pickIndex?'you':''}"><b>G${p+1}</b>#${idx+1} ${race.names[idx]}</span>`).join('');

    const intro=document.createElement('div');intro.className='motor-intro-v3';intro.innerHTML=`<small>NEON ROYALE MOTORSPORTS</small><h1>${race.track.name}</h1><p>${race.track.type} · 15-driver field · live overtakes · 5 laps · varied mandatory pit stop on lap 4</p><div class="motor-grid-intro-v3">${race.names.map((n,i)=>`<span class="${i===pickIndex?'you':''}"><b>#${String(i+1).padStart(2,'0')}</b>${n}</span>`).join('')}</div><strong id="motorStartCount">GRID SET</strong>`;o.appendChild(intro);
    const count=$('#motorStartCount',intro);await N.sleep(900);for(const t of ['3','2','1','LIGHTS OUT!']){count.textContent=t;count.classList.remove('pop');void count.offsetWidth;count.classList.add('pop');await N.sleep(600)}intro.classList.add('out');await N.sleep(320);intro.remove();

    const avgRating=race.ratings.reduce((a,b)=>a+b,0)/race.ratings.length;
    const base=race.ratings.map(x=>1+(x-avgRating)*.0025),pace=base.map(x=>x*(.985+N.rand()*.03));
    const phaseA=Array.from({length:15},()=>N.rand()*Math.PI*2),phaseB=Array.from({length:15},()=>N.rand()*Math.PI*2),surgeStart=Array.from({length:15},()=>.25+N.rand()*4.3),surgePower=Array.from({length:15},()=>.015+N.rand()*.055);
    const pitStarted=Array(15).fill(false),pitUntil=Array(15).fill(0),pitService=Array(15).fill(0),pitDone=Array(15).fill(false);
    const dur=prefersReducedMotion()?14000:N.DUR.motorsports;let last=performance.now(),lastOrder=[...gridOrder],lastPassAt=0;
    await new Promise(res=>{function frame(now){
      const dt=Math.min(.06,(now-last)/dur);last=now;
      const currentOrder=Array.from({length:15},(_,i)=>i).sort((a,b)=>prog[b]-prog[a]),leaderBefore=currentOrder[0],leadProg=prog[leaderBefore],lastProg=prog[currentOrder.at(-1)],spread=leadProg-lastProg;
      for(let i=0;i<15;i++){
        const lap=Math.floor(prog[i]);
        if(lap===3&&!pitStarted[i]){
          pitStarted[i]=true;pitService[i]=prefersReducedMotion()?450+N.ri(650):1800+N.ri(3501);pitUntil[i]=now+pitService[i];
          const car=$('#car'+i,o),q=pitSpot(race.track.p,i);if(car){car.classList.add('pitting');car.style.left=q.x+'%';car.style.top=q.y+'%'}
        }
        if(pitStarted[i]&&!pitDone[i]){
          if(now<pitUntil[i])continue;
          pitDone[i]=true;const car=$('#car'+i,o);car?.classList.remove('pitting');
        }
        const gap=leadProg-prog[i],pos=currentOrder.indexOf(i),ahead=pos>0?currentOrder[pos-1]:null,aheadGap=ahead==null?Infinity:prog[ahead]-prog[i];
        const rhythm=1+Math.sin(now/430+phaseA[i])*.055+Math.sin(now/1120+phaseB[i])*.035;
        const lapWave=1+Math.sin(prog[i]*Math.PI*2+phaseB[i])*.04;
        const sd=(prog[i]-surgeStart[i])/.15,surge=surgePower[i]*Math.exp(-sd*sd);
        const draft=aheadGap>0&&aheadGap<.04?1.03:aheadGap<.07?1.015:1;
        const catchup=spread>.20?1+Math.min(.065,(gap/Math.max(spread,.001))*.065):1;
        const leaderDamp=i===leaderBefore&&currentOrder.length>1&&(prog[leaderBefore]-prog[currentOrder[1]])>.075?.97:1;
        prog[i]+=(pace[i]*rhythm*lapWave*draft*catchup*leaderDamp+surge)*dt*5;
      }
      const order=Array.from({length:15},(_,i)=>i).sort((a,b)=>prog[b]-prog[a]),leader=order[0],lap=Math.min(5,Math.floor(prog[leader])+1);
      $('#v2Clock',o).textContent=`LAP ${lap} / 5`;
      $('#motorLeaders',o).innerHTML=order.slice(0,6).map((idx,p)=>`<span class="${idx===pickIndex?'you':''}"><b>${p+1}</b>#${idx+1} ${race.names[idx]}${pitStarted[idx]&&!pitDone[idx]?' · PIT':''}</span>`).join('');
      const active=[];for(let i=0;i<15;i++)if(pitStarted[i]&&!pitDone[i])active.push({i,left:Math.max(0,pitUntil[i]-now)});
      $('#pitStatus',o).innerHTML=active.length?active.slice(0,5).map(x=>`<span>#${x.i+1} <b>${(x.left/1000).toFixed(1)}s</b></span>`).join(''):'<small>'+((pitDone.filter(Boolean).length)?`${pitDone.filter(Boolean).length}/15 pit stops complete`:'Pit lane opens on lap 4')+'</small>';
      let pass=null;
      if(now-lastPassAt>500){for(let p=0;p<order.length;p++){const idx=order[p],old=lastOrder.indexOf(idx);if(old>=0&&p<old){pass={idx,from:old+1,to:p+1};break}}}
      if(pass){lastPassAt=now;$('#v2Ticker',o).textContent='OVERTAKE';$('#v2TickerText',o).textContent=`#${pass.idx+1} ${race.names[pass.idx]} moves from P${pass.from} to P${pass.to}.`}
      else if(active.length){const x=active[0];$('#v2Ticker',o).textContent='PIT STOPS';$('#v2TickerText',o).textContent=`#${x.i+1} ${race.names[x.i]} is stopped for service · ${(x.left/1000).toFixed(1)}s remaining.`}
      else{$('#v2Ticker',o).textContent=lap===4?'PIT CYCLE':lap===5?'FINAL LAP':'RACE UPDATE';$('#v2TickerText',o).textContent=`#${leader+1} ${race.names[leader]} leads a constantly changing pack.`}
      lastOrder=[...order];
      for(let pos=0;pos<order.length;pos++){
        const i=order[pos];if(pitStarted[i]&&!pitDone[i])continue;
        const ahead=pos>0?order[pos-1]:null,behind=pos<order.length-1?order[pos+1]:null,close=(ahead!=null&&Math.abs(prog[ahead]-prog[i])<.022)||(behind!=null&&Math.abs(prog[i]-prog[behind])<.022);
        const offset=close?((i%5)-2)*1.05:((i%3)-1)*.35,q=renderPoint(race.track.p,prog[i],offset),car=$('#car'+i,o);if(car){car.style.left=q.x+'%';car.style.top=q.y+'%';car.style.zIndex=String(i===pickIndex?60:20+(15-pos))}
      }
      if(prog[leader]>=5)res();else requestAnimationFrame(frame)
    }requestAnimationFrame(frame)});
    const order=Array.from({length:15},(_,i)=>i).sort((a,b)=>prog[b]-prog[a]),winner=order[0];await N.end(o,`${race.names[winner]} WINS`,`${race.track.name} · 5 LAPS`);N.close(o);return{winner};
  };
})();
