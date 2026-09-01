# Neon Royale Casino Simulator

A static, fake-credit casino simulator designed for Cloudflare Pages.

## Included
- Full casino lobby with themed rooms
- Keno: 20 numbers drawn from 1–80, 1–10 spot tickets
- Blackjack: six-deck shoe, dealer hits soft 17, blackjack pays 3:2
- American roulette: 0/00, 38 equally likely pockets
- Royal Reels slots with disclosed symbol weights
- Generated horse racing with model probabilities, derived decimal odds, and animated races
- Baccarat using standard Punto Banco drawing rules
- Jacks-or-Better video poker
- Texas Hold'em Poker School tutorials
- Persistent fake bankroll and session stats via localStorage
- Negative balances permitted for simulation
- Red/yellow/green GTA-style balance HUD

## Important
This project uses fake simulation credits only. It has no deposits, withdrawals, payment integration, or real-money betting capability. Browser randomness uses `Math.random()` and is not a certified gambling RNG.

## Cloudflare Pages
This is a static site. Use the repository root as the deploy directory with no framework preset and no build command.
