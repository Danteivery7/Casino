# Neon Royale Casino Simulator

A static, fake-credit casino and sportsbook simulator designed for Cloudflare Pages.

## Included
- Full casino lobby with themed rooms
- Keno: 20 unique numbers drawn from 1–80, 1–10 spot tickets, each spot-count paytable normalized to about 90% theoretical RTP
- Blackjack: one six-deck shoe, cut-card reshuffle at 78 cards remaining, dealer stands on soft 17, blackjack pays 3:2
- American roulette: 0/00, 38 equally likely pockets and standard 35:1 / 2:1 / 1:1 payouts
- Royal Reels: Classic 3-reel (~91.82% theoretical RTP) and Modern 5-reel / 9-payline (~93.87% theoretical RTP), with the misleading center overlay line removed
- Neon Royale Sportsbook with generated Basketball, Football, Soccer, Hockey, Tennis, Table Tennis, Boxing, MMA and Horse Racing markets
- Sportsbook prices shown as American odds plus decimal return multipliers, derived from posted model probabilities with a simulated bookmaker margin
- Sport-specific full-screen broadcasts targeted around 50 seconds, including courts/fields/rinks, colored uniforms, scoreboards, period/round logic, combat health bars and animated competitors
- Horse racing lives inside Sportsbook with posted model probabilities, fractional and decimal odds, 10% simulated track take, 10-second gate countdown, and a 42–48 second full-screen oval-track race broadcast
- Craps: Pass Line, Don’t Pass and Field wagers with independently generated fair dice
- Baccarat using standard eight-deck Punto Banco drawing rules, including Player/Banker pushes on ties and the normal 5% Banker commission
- Full-pay 9/6 Jacks-or-Better video poker paytable
- Texas Hold'em Poker School tutorials
- Persistent fake bankroll and session stats via localStorage
- Negative balances permitted for simulation
- Red/yellow/green GTA-style balance HUD
- Lightweight authenticity animation layer: sequential card dealing, dealer turns, Keno ball calls, physical-style slot reels, roulette settling, Baccarat deal order, Video Poker card replacements, sports broadcasts and full race presentation
- Reduced-motion support for accessibility and low-overhead CSS/requestAnimationFrame motion

## Fairness / randomness
Outcome-generating randomness is routed through browser `crypto.getRandomValues()` where implemented for audited games and new sportsbook/craps simulations. Card decks and number draws use shuffled finite sets where appropriate. Cosmetic effects such as confetti may still use ordinary visual randomness because they do not affect outcomes.

Sportsbook events use fictional generated competitors. Posted model probabilities determine the simulated market, and the wager does not alter those probabilities after selection.

The simulator is not a certified gambling product. The published RTP/house-edge figures describe the implemented math; short sessions can vary dramatically from those long-run averages.

## Important
This project uses fake simulation credits only. It has no deposits, withdrawals, payment integration, or real-money betting capability.

## Cloudflare Pages
This is a static site. Use the repository root as the deploy directory with no framework preset and no build command.
