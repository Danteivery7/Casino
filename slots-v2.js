'use strict';

(function () {
  const SLOT_SYMBOLS = [
    { key: 'blank', display: '•', label: 'Blank', count: 24, pct: 48 },
    { key: 'cherry', display: '🍒', label: 'Cherry', count: 10, pct: 20 },
    { key: 'lemon', display: '🍋', label: 'Lemon', count: 6, pct: 12 },
    { key: 'bell', display: '🔔', label: 'Bell', count: 4, pct: 8 },
    { key: 'bar', display: 'BAR', label: 'BAR', count: 3, pct: 6 },
    { key: 'seven', display: '7', label: 'Seven', count: 2, pct: 4 },
    { key: 'diamond', display: '◆', label: 'Diamond', count: 1, pct: 2 }
  ];

  const SYMBOL_BY_KEY = Object.fromEntries(SLOT_SYMBOLS.map(s => [s.key, s]));
  const SYMBOL_POOL = SLOT_SYMBOLS.flatMap(s => Array(s.count).fill(s.key));

  const THREE_REEL_PAY = {
    cherry: 25,
    lemon: 35,
    bell: 60,
    bar: 125,
    seven: 250,
    diamond: 1000
  };

  const FIVE_REEL_PAY = {
    cherry: { 3: 55, 4: 110, 5: 275 },
    lemon: { 3: 85, 4: 215, 5: 535 },
    bell: { 3: 135, 4: 375, 5: 1070 },
    bar: { 3: 215, 4: 800, 5: 2675 },
    seven: { 3: 430, 4: 1600, 5: 6400 },
    diamond: { 3: 960, 4: 4800, 5: 24000 }
  };

  const FIVE_LINES = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1]
  ];

  function symbolHtml(key) {
    const s = SYMBOL_BY_KEY[key];
    return `<span class="slot-symbol ${key === 'blank' ? 'slot-blank' : ''}">${s.display}</span>`;
  }

  function makeReelStrips(count) {
    return Array.from({ length: count }, () => shuffle(SYMBOL_POOL));
  }

  function visibleAt(strip, stop) {
    const n = strip.length;
    return [strip[(stop - 1 + n) % n], strip[stop], strip[(stop + 1) % n]];
  }

  function outcomeMatrix(strips) {
    return strips.map(strip => visibleAt(strip, randInt(strip.length)));
  }

  function randomSymbolKey() {
    return SYMBOL_POOL[randInt(SYMBOL_POOL.length)];
  }

  function threeReelScore(matrix) {
    const line = matrix.map(col => col[1]);
    const [a, b, c] = line;
    let mult = 0;
    let label = 'No winning combination';
    let winCount = 0;

    if (a === b && b === c && a !== 'blank') {
      mult = THREE_REEL_PAY[a] || 0;
      label = `Three ${SYMBOL_BY_KEY[a].label}s`;
      winCount = 3;
    } else if (a === 'cherry' && b === 'cherry') {
      mult = 8;
      label = 'Cherry · Cherry · Any';
      winCount = 2;
    } else if (a === 'cherry') {
      mult = 2;
      label = 'Cherry · Any · Any';
      winCount = 1;
    }

    const cells = new Set();
    for (let i = 0; i < winCount; i++) cells.add(`${i}-1`);
    return { mult, label, cells };
  }

  function fiveReelScore(matrix, stake) {
    const lineBet = stake / FIVE_LINES.length;
    const wins = [];
    const cells = new Set();
    let totalReturn = 0;

    FIVE_LINES.forEach((rows, lineIndex) => {
      const keys = rows.map((row, reel) => matrix[reel][row]);
      const first = keys[0];
      if (first === 'blank') return;
      let count = 1;
      while (count < keys.length && keys[count] === first) count++;
      if (count < 3) return;
      const mult = FIVE_REEL_PAY[first]?.[count] || 0;
      if (!mult) return;
      const lineReturn = lineBet * mult;
      totalReturn += lineReturn;
      for (let reel = 0; reel < count; reel++) cells.add(`${reel}-${rows[reel]}`);
      wins.push({ line: lineIndex + 1, key: first, count, mult, lineReturn });
    });

    return { totalReturn, lineBet, wins, cells };
  }

  function paytableHtml(mode) {
    if (mode === 3) {
      return `
        <p class="kicker">ROYAL REELS · CLASSIC</p>
        <h2>3-Reel Paytable</h2>
        <p>This mode has <b>one center payline</b>. The three center symbols are scored from left to right. The listed multiplier is the total amount returned for that spin.</p>
        <div class="slot-paytable-grid slot-paytable-classic">
          <span>◆ ◆ ◆</span><b>1000×</b>
          <span>7 · 7 · 7</span><b>250×</b>
          <span>BAR · BAR · BAR</span><b>125×</b>
          <span>🔔 🔔 🔔</span><b>60×</b>
          <span>🍋 🍋 🍋</span><b>35×</b>
          <span>🍒 🍒 🍒</span><b>25×</b>
          <span>🍒 🍒 ANY</span><b>8×</b>
          <span>🍒 ANY ANY</span><b>2×</b>
        </div>
        <div class="modal-card"><b>Theoretical return: 91.82%</b><small>About 20.25% of spins return something in the long run. Each spin is independent; previous wins and losses never change the next spin.</small></div>`;
    }

    const rows = SLOT_SYMBOLS.filter(s => s.key !== 'blank').map(s => {
      const p = FIVE_REEL_PAY[s.key];
      return `<tr><td>${s.display} ${s.label}</td><td>${p[3]}×</td><td>${p[4]}×</td><td>${p[5]}×</td></tr>`;
    }).join('');

    return `
      <p class="kicker">ROYAL REELS · MODERN</p>
      <h2>5-Reel Paytable</h2>
      <p>This mode uses <b>9 paylines</b>. Your total wager is divided equally across those lines. A line pays for 3, 4, or 5 matching symbols <b>consecutively from the leftmost reel</b>. Multipliers below apply to the wager on that one line.</p>
      <div class="slot-line-legend"><span>1–3 Horizontal</span><span>4–5 V Lines</span><span>6–9 Zigzags</span></div>
      <div class="slot-paytable-scroll"><table class="slot-paytable-table"><thead><tr><th>Symbol</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="modal-card"><b>Theoretical return: 93.87%</b><small>That is the long-run mathematical return across all 9 lines. A short session can finish far above or below it.</small></div>`;
  }

  function slotGuideHtml(mode) {
    return `
      <p class="kicker">HOW ROYAL REELS WORKS</p>
      <h2>Realistic Slot Simulation</h2>
      <p>When you press SPIN, the simulator first selects one random stop on each virtual reel. The rolling animation then reveals those already-selected stops. The animation does not decide the result.</p>
      <div class="modal-grid">
        <div class="modal-card"><b>3-Reel Classic</b><small>Three reels, one center payline, old-school fruit-machine style. Frequent small cherry returns and rare large triples.</small></div>
        <div class="modal-card"><b>5-Reel Modern</b><small>Five reels, three visible rows, and nine paylines. Wins must begin on reel 1 and continue left-to-right on a payline.</small></div>
      </div>
      <p><b>Symbol frequency</b> means how often one reel stop contains that symbol. It is <em>not</em> your chance of winning a spin.</p>
      ${paytableHtml(mode)}`;
  }

  window.renderSlots = function renderSlotsV2() {
    let mode = 5;
    let spinning = false;
    let strips = makeReelStrips(mode);
    let currentMatrix = outcomeMatrix(strips);

    $('#gameMount').innerHTML = `
      <div class="casino-room room-slots slot-v2">
        <div class="room-topline">
          <span class="rules-badge" id="slotRulesBadge">MODERN 5-REEL · 9 PAYLINES · RNG REEL STOPS</span>
          ${betControls('slotBet', 25)}
        </div>
        <div class="slot-mode-row">
          <div class="slot-mode-switch" role="group" aria-label="Slot machine type">
            <button type="button" data-slot-mode="3">CLASSIC 3-REEL</button>
            <button type="button" data-slot-mode="5" class="active">MODERN 5-REEL</button>
          </div>
          <div class="slot-help-actions">
            <button type="button" class="glass-btn slot-small-btn" id="slotPaytableBtn">VIEW PAYTABLE</button>
            <button type="button" class="glass-btn slot-small-btn" id="slotHowBtn">HOW IT WORKS</button>
          </div>
        </div>
        <div class="slot-cabinet modern-five" id="slotCabinet">
          <div class="slot-lights"></div>
          <div class="slot-marquee"><small>NEON ROYALE</small> ROYAL REELS</div>
          <div class="slot-machine-subtitle" id="slotSubtitle">5 REELS · 3 ROWS · 9 ACTIVE PAYLINES</div>
          <div class="slot-reel-bank five" id="slotReelBank"></div>
          <div class="slot-center-line" aria-hidden="true"></div>
          <div class="slot-display" id="slotDisplay">INSERT FAKE CREDIT · PRESS SPIN</div>
          <div class="slot-return-info" id="slotReturnInfo"><span>THEORETICAL RTP</span><b>93.87%</b><span>9 PAYLINES</span></div>
          <div class="game-actions"><button class="primary-btn slot-spin-button" id="slotSpin">SPIN</button></div>
          <div class="slot-frequency-panel">
            <div><b>REEL SYMBOL FREQUENCY</b><small>Chance that a single reel stop is this symbol. This is not the chance of winning the spin.</small></div>
            <div class="slot-frequency-list">${SLOT_SYMBOLS.map(s => `<span><i>${s.display}</i>${s.label} <b>${s.pct}%</b></span>`).join('')}</div>
          </div>
        </div>
      </div>`;

    wireQuickBets($('#gameMount'));

    const bank = $('#slotReelBank');
    const cabinet = $('#slotCabinet');
    const display = $('#slotDisplay');
    const spinBtn = $('#slotSpin');

    function setVisibleMatrix(matrix) {
      bank.innerHTML = matrix.map((col, reelIndex) => `
        <div class="slot-reel-window" data-reel="${reelIndex}">
          <div class="slot-reel-strip">
            ${col.map((key, row) => `<div class="slot-symbol-cell" data-row="${row}">${symbolHtml(key)}</div>`).join('')}
          </div>
        </div>`).join('');
    }

    function clearWinHighlights() {
      $$('.slot-symbol-cell', bank).forEach(c => c.classList.remove('slot-winning-cell'));
    }

    function highlightCells(cells) {
      cells.forEach(token => {
        const [reel, row] = token.split('-').map(Number);
        const win = bank.querySelector(`.slot-reel-window[data-reel="${reel}"]`);
        const visible = [...win.querySelectorAll('.slot-symbol-cell')].slice(-3);
        visible[row]?.classList.add('slot-winning-cell');
      });
    }

    async function rollTo(matrix) {
      clearWinHighlights();
      const windows = $$('.slot-reel-window', bank);
      const animations = windows.map(async (win, reelIndex) => {
        const stripEl = win.querySelector('.slot-reel-strip');
        const fillerCount = 22 + reelIndex * 3 + randInt(5);
        const filler = Array.from({ length: fillerCount }, () => randomSymbolKey());
        const final = matrix[reelIndex];
        stripEl.style.transition = 'none';
        stripEl.style.transform = 'translateY(0px)';
        stripEl.innerHTML = [...filler, ...final].map((key, idx) => `<div class="slot-symbol-cell" data-seq="${idx}">${symbolHtml(key)}</div>`).join('');
        await afterPaint();
        const firstCell = stripEl.querySelector('.slot-symbol-cell');
        const cellH = firstCell.getBoundingClientRect().height;
        const duration = (mode === 3 ? 820 : 900) + reelIndex * (mode === 3 ? 190 : 170);
        stripEl.style.transition = `transform ${duration}ms cubic-bezier(.08,.66,.16,1)`;
        stripEl.style.transform = `translateY(-${fillerCount * cellH}px)`;
        await new Promise(resolve => setTimeout(resolve, prefersReducedMotion() ? 35 : duration));
        pulse(win, 'reel-window-stop');
      });
      await Promise.all(animations);
    }

    function updateMode(nextMode) {
      if (spinning || nextMode === mode) return;
      mode = nextMode;
      strips = makeReelStrips(mode);
      currentMatrix = outcomeMatrix(strips);
      $$('[data-slot-mode]').forEach(b => b.classList.toggle('active', +b.dataset.slotMode === mode));
      bank.className = `slot-reel-bank ${mode === 3 ? 'three' : 'five'}`;
      cabinet.classList.toggle('classic-three', mode === 3);
      cabinet.classList.toggle('modern-five', mode === 5);
      $('#slotRulesBadge').textContent = mode === 3 ? 'CLASSIC 3-REEL · 1 CENTER PAYLINE · RNG REEL STOPS' : 'MODERN 5-REEL · 9 PAYLINES · RNG REEL STOPS';
      $('#slotSubtitle').textContent = mode === 3 ? '3 REELS · 3 VISIBLE ROWS · CENTER LINE PAYS' : '5 REELS · 3 ROWS · 9 ACTIVE PAYLINES';
      $('#slotReturnInfo').innerHTML = mode === 3 ? '<span>THEORETICAL RTP</span><b>91.82%</b><span>1 PAYLINE</span>' : '<span>THEORETICAL RTP</span><b>93.87%</b><span>9 PAYLINES</span>';
      display.textContent = mode === 3 ? 'CLASSIC MACHINE READY' : 'MODERN MACHINE READY';
      setVisibleMatrix(currentMatrix);
      pulse(cabinet, 'machine-mode-change');
    }

    $$('[data-slot-mode]').forEach(b => b.onclick = () => updateMode(+b.dataset.slotMode));
    $('#slotPaytableBtn').onclick = () => showModal(paytableHtml(mode));
    $('#slotHowBtn').onclick = () => showModal(slotGuideHtml(mode));

    bank.className = 'slot-reel-bank five';
    setVisibleMatrix(currentMatrix);

    spinBtn.onclick = async () => {
      if (spinning) return;
      const stake = getBet('slotBet');
      if (!stake) return;

      spinning = true;
      spinBtn.disabled = true;
      $$('[data-slot-mode]').forEach(b => b.disabled = true);
      adjust(-stake, { wager: true });
      recordGame('slots');
      cabinet.classList.add('machine-live');
      display.textContent = mode === 3 ? 'REELS IN MOTION…' : 'SPINNING 9 PAYLINES…';
      pulse(display, 'status-pulse');

      const matrix = outcomeMatrix(strips);
      currentMatrix = matrix;
      await rollTo(matrix);
      await wait(90);

      let totalReturn = 0;
      let resultText = '';
      let cells = new Set();
      let bigWin = false;

      if (mode === 3) {
        const score = threeReelScore(matrix);
        totalReturn = stake * score.mult;
        cells = score.cells;
        if (score.mult) {
          resultText = `${score.label.toUpperCase()} · ${score.mult}× · RETURN ${money(totalReturn)}`;
          bigWin = score.mult >= 125;
        } else {
          resultText = `NO PAYLINE · -${money(stake)}`;
        }
      } else {
        const score = fiveReelScore(matrix, stake);
        totalReturn = score.totalReturn;
        cells = score.cells;
        if (score.wins.length) {
          const best = score.wins.reduce((a, b) => a.lineReturn > b.lineReturn ? a : b);
          resultText = `${score.wins.length} PAYLINE${score.wins.length === 1 ? '' : 'S'} HIT · BEST: ${best.count} ${SYMBOL_BY_KEY[best.key].label.toUpperCase()} · RETURN ${money(totalReturn)}`;
          bigWin = totalReturn >= stake * 20;
        } else {
          resultText = `NO ACTIVE PAYLINE · -${money(stake)}`;
        }
      }

      highlightCells(cells);
      if (totalReturn > 0) {
        adjust(totalReturn, { win: true });
        cabinet.classList.add('slot-win');
        display.textContent = resultText;
        pulse(display, totalReturn > stake ? 'result-pop' : 'result-reveal');
      } else {
        display.textContent = resultText;
        pulse(display, 'result-reveal');
      }

      if (bigWin) confetti();
      await wait(260);
      cabinet.classList.remove('machine-live', 'slot-win');
      spinBtn.disabled = false;
      $$('[data-slot-mode]').forEach(b => b.disabled = false);
      spinning = false;
    };
  };
})();
