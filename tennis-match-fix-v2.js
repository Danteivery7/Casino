'use strict';

/* Neon Royale Tennis v2
   - Match ends only when a player actually wins 2 sets.
   - Real tennis point scoring: 15 / 30 / 40 / Deuce / Advantage.
   - Games win sets; 6-6 uses a first-to-7, win-by-2 tiebreak.
   - Rally animation is deliberately slower and easier to follow.
*/
(function tennisMatchFixV2(){
  const N=window.NRSPORTS2;if(!N)return;

  const sleep=ms=>N.sleep(ms);
  const pointLabel=(a,b)=>{
    if(a>=3&&b>=3){
      if(a===b)return ['DEUCE','DEUCE'];
      return a>b?['AD','40']:['40','AD'];
    }
    const map=['0','15','30','40'];
    return [map[Math.min(a,3)],map[Math.min(b,3)]];
  };
  const setScoreText=sets=>sets.map((s,i)=>`${s[0]}-${s[1]}`).join(' · ');

  function playerPointChance(e,server){
    const base=e.probs?.[0]??.5;
    const skill0=.40+base*.20;
    const skill1=.40+(1-base)*.20;
    const serverBonus=.075;
    const p0=skill0+(server===0?serverBonus:-serverBonus*.35);
    const p1=skill1+(server===1?serverBonus:-serverBonus*.35);
    return p0/(p0+p1);
  }

  async function rally(winner,tt=false){
    const b=$('#rBall'),a=$('.racquet-player.a'),c=$('.racquet-player.b');
    if(!b)return;
    const shots=tt?4+N.ri(5):5+N.ri(6);
    for(let i=0;i<shots;i++){
      const left=i%2===0;
      const x=left?24+N.ri(8):68+N.ri(8);
      const y=20+N.ri(61);
      b.style.transition=`left ${tt?135:280}ms linear, top ${tt?135:280}ms ease-in-out`;
      b.style.left=x+'%';b.style.top=y+'%';
      (left?a:c)?.classList.add('swing');
      await sleep(tt?145:300);
      a?.classList.remove('swing');c?.classList.remove('swing');
    }
    N.flash(winner===0?'POINT LEFT':'POINT RIGHT','score');
    await sleep(tt?120:320);
  }

  function paintTennis(setsWon,setGames,pts,setHistory,inTiebreak,tbPts){
    const p=pointLabel(pts[0],pts[1]);
    $('#scoreA').textContent=setsWon[0];$('#scoreB').textContent=setsWon[1];
    $('#v2Period').textContent=`SET ${setsWon[0]+setsWon[1]+1}`;
    const history=setHistory.length?` · Sets ${setScoreText(setHistory)}`:'';
    if(inTiebreak){
      $('#racquetDetail').textContent=`Tiebreak ${tbPts[0]}-${tbPts[1]} · Games ${setGames[0]}-${setGames[1]}${history}`;
      $('#v2Clock').textContent='TIEBREAK';
    }else{
      $('#racquetDetail').textContent=`Games ${setGames[0]}-${setGames[1]} · ${p[0]}-${p[1]}${history}`;
      $('#v2Clock').textContent=`${p[0]}  ·  ${p[1]}`;
    }
  }

  async function tennis(e){
    const o=N.overlay(e,e.sport);
    o.innerHTML=N.base(e,`<div class="racquet-stage tennis tennis-real-v2"><div class="racquet-court"><div class="tennis-baseline left"></div><div class="tennis-baseline right"></div><div class="tennis-service-line left"></div><div class="tennis-service-line right"></div><div class="racquet-net"></div><div class="racquet-player a" style="--team:${e.a.color}">${e.a.short}</div><div class="racquet-player b" style="--team:${e.b.color}">${e.b.short}</div><div class="racquet-ball" id="rBall"></div></div><div class="racquet-scoreline" id="racquetDetail">Games 0-0 · 0-0</div></div>`);
    await N.intro(o,e,'MATCH START!','Best of three sets · standard tennis scoring · 6-6 tiebreak.');

    let setsWon=[0,0],setGames=[0,0],pts=[0,0],setHistory=[],server=N.ri(2),winner=-1;
    let safety=0;
    paintTennis(setsWon,setGames,pts,setHistory,false,[0,0]);

    while(winner<0 && safety++<500){
      const p0=playerPointChance(e,server),pointWinner=N.rand()<p0?0:1;
      await rally(pointWinner,false);
      pts[pointWinner]++;

      const gameWon=pts[pointWinner]>=4 && pts[pointWinner]-pts[1-pointWinner]>=2;
      if(gameWon){
        setGames[pointWinner]++;
        pts=[0,0];
        N.flash('GAME!','score');
        await sleep(500);
        server=1-server;

        if(setGames[0]===6&&setGames[1]===6){
          let tb=[0,0],tbServer=server,pointNo=0;
          paintTennis(setsWon,setGames,pts,setHistory,true,tb);
          while(!(Math.max(...tb)>=7&&Math.abs(tb[0]-tb[1])>=2)){
            const chance0=playerPointChance(e,tbServer),w=N.rand()<chance0?0:1;
            await rally(w,false);tb[w]++;pointNo++;
            if(pointNo===1||pointNo%2===1)tbServer=1-tbServer;
            paintTennis(setsWon,setGames,pts,setHistory,true,tb);
          }
          const sw=tb[0]>tb[1]?0:1;
          setGames[sw]++;
          setHistory.push([...setGames]);
          setsWon[sw]++;
          N.flash('SET!','score');await sleep(650);
          setGames=[0,0];pts=[0,0];server=1-server;
        }else{
          const setWinner=(setGames[0]>=6||setGames[1]>=6)&&Math.abs(setGames[0]-setGames[1])>=2?(setGames[0]>setGames[1]?0:1):-1;
          if(setWinner>=0){
            setHistory.push([...setGames]);setsWon[setWinner]++;
            N.flash('SET!','score');await sleep(650);
            setGames=[0,0];pts=[0,0];
          }
        }
      }

      paintTennis(setsWon,setGames,pts,setHistory,false,[0,0]);
      if(setsWon[0]>=2||setsWon[1]>=2)winner=setsWon[0]>setsWon[1]?0:1;
      await sleep(180);
    }

    if(winner<0)winner=setsWon[0]>setsWon[1]?0:1;
    const score=setScoreText(setHistory);
    await N.end(o,`${winner===0?e.a.name:e.b.name} WINS`,score||`${setsWon[0]}-${setsWon[1]} SETS`);
    N.close(o);
    return{winner,summary:score||`${setsWon[0]}-${setsWon[1]} sets`,finalText:'Every visible rally produced the points, games and sets that determined the winner.'};
  }

  async function tableTennis(e){
    const o=N.overlay(e,e.sport);
    o.innerHTML=N.base(e,`<div class="racquet-stage ping"><div class="racquet-court"><div class="racquet-net"></div><div class="racquet-player a" style="--team:${e.a.color}">${e.a.short}</div><div class="racquet-player b" style="--team:${e.b.color}">${e.b.short}</div><div class="racquet-ball" id="rBall"></div></div><div class="racquet-scoreline" id="racquetDetail">0 - 0</div></div>`);
    await N.intro(o,e,'FIRST SERVE!','Best of five games to 11 · win by two.');
    let games=[0,0],pts=[0,0],server=N.ri(2),winner=-1,totalPts=0;
    while(winner<0){
      const p0=playerPointChance(e,server),w=N.rand()<p0?0:1;
      await rally(w,true);pts[w]++;totalPts++;
      if(totalPts%2===0)server=1-server;
      if(pts[w]>=11&&pts[w]-pts[1-w]>=2){games[w]++;pts=[0,0];totalPts=0;N.flash('GAME!','score');await sleep(300)}
      $('#scoreA').textContent=games[0];$('#scoreB').textContent=games[1];$('#v2Clock').textContent=`GAME ${games[0]+games[1]+1}`;$('#v2Period').textContent='TABLE TENNIS';$('#racquetDetail').textContent=`Points ${pts[0]}-${pts[1]} · Games ${games[0]}-${games[1]}`;
      if(games[w]>=3)winner=w;
    }
    await N.end(o,`${winner===0?e.a.name:e.b.name} WINS`,`${games[0]} GAMES · ${games[1]} GAMES`);N.close(o);return{winner,summary:`${games[0]}-${games[1]} games`,finalText:'The rally and point simulation created the winner.'};
  }

  N.rally=rally;
  N.racquet=e=>e.sport==='tabletennis'?tableTennis(e):tennis(e);
})();
