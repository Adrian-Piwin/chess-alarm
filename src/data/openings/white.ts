/**
 * Openings where the learner plays White.
 *
 * ⚠️ Opening and line ids are persistence keys (progress is stored against
 * them) — never rename one; add a new id instead.
 */
import type { Opening } from '@/domain/types';
import { line } from './define';

export const WHITE_OPENINGS: Opening[] = [
  {
    id: 'italian-game',
    name: 'Italian Game',
    eco: 'C50',
    side: 'w',
    difficulty: 'beginner',
    summary:
      'Develop fast, aim the bishop at f7 and build a slow, solid centre with c3 and d4. The classic first opening for 1.e4 players.',
    lines: [
      line(
        'giuoco-piano',
        'Giuoco Piano: Main Line',
        '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Nce7 11. O-O O-O',
        {
          1: 'Claim the centre and open lines for the queen and bishop.',
          3: 'The knight attacks e5 and develops towards the king side.',
          5: 'The Italian bishop eyes f7, the weakest square in Black’s camp.',
          7: 'c3 prepares d4 to build a big pawn centre.',
          9: 'Strike in the centre now that d4 is supported.',
          19: 'Qb3 hits the knight on d5 and the f7 pawn at the same time.',
        },
      ),
      line(
        'giuoco-pianissimo',
        'Giuoco Pianissimo',
        '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O a6 7. a4 O-O 8. Re1 Ba7 9. h3 h6 10. Nbd2 Re8',
        {
          9: 'd3 keeps everything protected — a slow, strategic build-up.',
          13: 'a4 gains space and stops ...b5 from chasing the bishop.',
          17: 'h3 stops ...Bg4 pinning the knight.',
          19: 'The knight heads to f1 and g3 — a typical manoeuvre.',
        },
      ),
      line(
        'two-knights-quiet',
        'vs Two Knights: Quiet d3',
        '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. d3 Be7 5. O-O O-O 6. Re1 d6 7. c3 Na5 8. Bb5 a6 9. Ba4 b5 10. Bc2 c5',
        {
          7: 'd3 protects e4 and avoids the sharp lines after 4.Ng5.',
          15: 'Keep the bishop: it drops back when the knight chases it.',
          19: 'The bishop on c2 still points at Black’s king side.',
        },
      ),
    ],
  },
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    eco: 'C60',
    side: 'w',
    difficulty: 'intermediate',
    summary:
      'Pressure the knight that defends e5 with Bb5. One of the oldest and richest openings, played at every level.',
    lines: [
      line(
        'closed-chigorin',
        'Closed: Chigorin',
        '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Na5 10. Bc2 c5 11. d4 Qc7',
        {
          5: 'Bb5 attacks the defender of e5.',
          7: 'Retreat but keep the pin tension alive.',
          11: 'Re1 protects e4 so the threat on e5 becomes real.',
          15: 'c3 gives the bishop a retreat square on c2 and prepares d4.',
          17: 'h3 stops ...Bg4 before playing d4.',
        },
      ),
      line(
        'exchange',
        'Exchange Variation',
        '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Bxc6 dxc6 5. O-O f6 6. d4 exd4 7. Nxd4 c5 8. Nb3 Qxd1 9. Rxd1 Bg4 10. f3 Be6',
        {
          7: 'Give up the bishop to damage Black’s pawns.',
          11: 'Open the centre: White’s healthy king-side majority is a long-term edge.',
          17: 'Queens come off — the better pawn structure matters more in the endgame.',
        },
      ),
      line(
        'berlin',
        'Berlin Defence',
        '1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8',
        {
          7: 'Castle first — the e4 pawn can be won back.',
          9: 'd4 opens the centre while Black’s king is still in the middle.',
          15: 'The famous Berlin endgame: Black has lost castling rights.',
        },
      ),
    ],
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    eco: 'C45',
    side: 'w',
    difficulty: 'beginner',
    summary: 'Open the centre immediately with 3.d4 for free, active piece play and clear plans.',
    lines: [
      line(
        'mieses',
        'Mieses Variation',
        '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5 Qe7 7. Qe2 Nd5 8. c4 Ba6 9. b3 g6',
        {
          5: 'Strike the centre straight away.',
          11: 'e5 kicks the knight and gains space.',
          15: 'c4 drives the knight away from the centre.',
        },
      ),
      line(
        'classical',
        'Classical 4...Bc5',
        '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5 5. Nxc6 Qf6 6. Qd2 dxc6 7. Nc3 Be6 8. Na4 Rd8 9. Bd3 Bd4 10. O-O',
        {
          9: 'Trade first, then deal with the threat to f2.',
          11: 'Qd2 defends f2 without blocking development for long.',
          15: 'Na4 hits the bishop and heads for the c5 outpost.',
        },
      ),
    ],
  },
  {
    id: 'vienna-game',
    name: 'Vienna Game',
    eco: 'C25',
    side: 'w',
    difficulty: 'intermediate',
    summary: 'Develop the queen’s knight first and keep the option of a king-side f4 attack.',
    lines: [
      line(
        'vienna-gambit',
        'Vienna Gambit',
        '1. e4 e5 2. Nc3 Nf6 3. f4 d5 4. fxe5 Nxe4 5. Nf3 Be7 6. d4 O-O 7. Bd3 f5 8. exf6 Bxf6 9. O-O Nc6',
        {
          3: 'Nc3 supports e4 and prepares f4.',
          5: 'The gambit: f4 opens the f-file for an attack.',
          7: 'The pawn on e5 cramps Black’s knight.',
          15: 'En passant! Capture the pawn that just jumped past.',
        },
      ),
      line(
        'frankenstein-dracula',
        'Frankenstein–Dracula',
        '1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5 Nd6 5. Bb3 Nc6 6. Nb5 g6 7. Qf3 f5 8. Qd5 Qe7 9. Nxc7+ Kd8 10. Nxa8 b6',
        {
          7: 'Qh5 threatens Qxf7 mate immediately.',
          11: 'Nb5 joins the attack on c7 and d6.',
          15: 'Qd5 renews the mate threat on f7.',
          17: 'The knight forks king and rook — a wild but fun line.',
        },
      ),
      line(
        'quiet-bc4',
        'Quiet Bc4 & Bg5',
        '1. e4 e5 2. Nc3 Nf6 3. Bc4 Nc6 4. d3 Bb4 5. Bg5 h6 6. Bxf6 Bxc3+ 7. bxc3 Qxf6 8. Ne2 d6 9. O-O',
        {
          9: 'Pin the knight to the queen.',
          13: 'Doubled c-pawns, but a strong centre and open b-file — a calm position.',
        },
      ),
    ],
  },
  {
    id: 'kings-gambit',
    name: "King's Gambit",
    eco: 'C30',
    side: 'w',
    difficulty: 'advanced',
    summary: 'The romantic gambit: sacrifice the f-pawn to open lines and hunt the king.',
    lines: [
      line(
        'kieseritzky',
        'Kieseritzky Gambit',
        '1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4 g4 5. Ne5 Nf6 6. Bc4 d5 7. exd5 Bd6 8. d4 Nh5',
        {
          3: 'Offer the f-pawn to deflect Black’s e-pawn.',
          7: 'h4 undermines Black’s pawn chain straight away.',
          9: 'The knight jumps into e5 with ideas against f7.',
        },
      ),
      line(
        'modern-defence',
        'Modern Defence 3...d5',
        '1. e4 e5 2. f4 exf4 3. Nf3 d5 4. exd5 Nf6 5. Bb5+ c6 6. dxc6 bxc6 7. Bc4 Nd5 8. O-O Bd6',
        {
          6: 'Black returns the pawn at once to develop fast.',
          9: 'Bb5+ forces Black to decide how to block.',
        },
      ),
      line(
        'declined-classical',
        'Declined: Classical 2...Bc5',
        '1. e4 e5 2. f4 Bc5 3. Nf3 d6 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. e5 Ne4',
        {
          4: 'The bishop stops White castling — declining is a solid choice.',
          7: 'c3 prepares d4 to shut out the bishop.',
          17: 'e5 gains space; the pawn centre is White’s trump.',
        },
      ),
    ],
  },
  {
    id: 'evans-gambit',
    name: 'Evans Gambit',
    eco: 'C51',
    side: 'w',
    difficulty: 'intermediate',
    summary: 'Sacrifice the b-pawn in the Italian to gain time for c3 and d4 with a fierce initiative.',
    lines: [
      line(
        'accepted-ba5',
        'Accepted 5...Ba5',
        '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 8. cxd4 d5 9. exd5 Nxd5 10. Ba3 Be6',
        {
          7: 'The gambit: deflect the bishop to win time.',
          9: 'c3 comes with tempo on the bishop.',
          19: 'Ba3 stops Black from castling king side.',
        },
      ),
      line(
        'accepted-bc5',
        'Accepted 5...Bc5',
        '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Bc5 6. d4 exd4 7. O-O d6 8. cxd4 Bb6 9. Nc3 Na5 10. Bg5',
        {
          11: 'd4 opens lines — development matters more than a pawn.',
          19: 'Bg5 pins and adds more pressure.',
        },
      ),
      line(
        'declined',
        'Evans Declined',
        '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bb6 5. a4 a6 6. Nc3 Nf6 7. Nd5 Nxd5 8. exd5 Nd4 9. a5 Ba7',
        {
          8: 'Black declines the pawn and keeps the bishop safe.',
          9: 'a4 threatens a5, trapping ideas on the bishop.',
        },
      ),
    ],
  },
  {
    id: 'queens-gambit',
    name: "Queen's Gambit",
    eco: 'D06',
    side: 'w',
    difficulty: 'beginner',
    summary: 'Offer the c-pawn to pull Black’s d-pawn away from the centre. Solid, strategic and timeless.',
    lines: [
      line(
        'qgd-tartakower',
        'vs QGD: Tartakower',
        '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5',
        {
          3: 'The gambit: c4 challenges d5 from the side.',
          7: 'Bg5 pins the knight that defends d5.',
          15: 'Release the tension and simplify into a better structure.',
        },
      ),
      line(
        'qga',
        'vs Queen’s Gambit Accepted',
        '1. d4 d5 2. c4 dxc4 3. Nf3 Nf6 4. e3 e6 5. Bxc4 c5 6. O-O a6 7. dxc5 Qxd1 8. Rxd1 Bxc5',
        {
          4: 'Black takes the pawn, but can’t keep it.',
          7: 'e3 opens the bishop to win the pawn back.',
          9: 'Material is level and White is ahead in development.',
        },
      ),
      line(
        'slav-main',
        'vs Slav: Main Line',
        '1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O O-O 9. Qe2 Bg6 10. e4',
        {
          9: 'a4 stops ...b5 holding on to the pawn.',
          19: 'e4 builds the ideal centre.',
        },
      ),
    ],
  },
  {
    id: 'london-system',
    name: 'London System',
    eco: 'D02',
    side: 'w',
    difficulty: 'beginner',
    summary: 'A reliable set-up: d4, Bf4, e3, Nf3, c3 — the same plan against almost anything.',
    lines: [
      line(
        'vs-d5',
        'vs ...d5 & ...c5',
        '1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 c5 5. c3 Nc6 6. Nbd2 Bd6 7. Bg3 O-O 8. Bd3 b6 9. Ne5 Bb7 10. f4',
        {
          3: 'Get the bishop out before playing e3.',
          9: 'c3 builds the pyramid and supports d4.',
          13: 'Keep the bishop — Bg3 avoids an exchange.',
          17: 'Ne5 and f4: the Stonewall-style attack.',
        },
      ),
      line(
        'vs-kid',
        'vs King’s Indian set-up',
        '1. d4 Nf6 2. Bf4 g6 3. e3 Bg7 4. Nf3 O-O 5. Be2 d6 6. h3 c5 7. c3 Nc6 8. O-O Qb6 9. Qb3 Be6',
        {
          11: 'h3 gives the bishop a home on h2.',
          17: 'Qb3 meets the queen and defends b2.',
        },
      ),
    ],
  },
  {
    id: 'catalan',
    name: 'Catalan Opening',
    eco: 'E04',
    side: 'w',
    difficulty: 'advanced',
    summary: 'Queen’s Gambit ideas with a fianchettoed bishop on g2 that bears down the long diagonal.',
    lines: [
      line(
        'open',
        'Open Catalan',
        '1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 dxc4 5. Nf3 Be7 6. O-O O-O 7. Qc2 a6 8. Qxc4 b5 9. Qc2 Bb7 10. Bd2',
        {
          5: 'g3 prepares the Catalan bishop on g2.',
          8: 'Black grabs the pawn; White wins it back calmly.',
          13: 'Qc2 and Qxc4 recover the pawn.',
        },
      ),
      line(
        'closed',
        'Closed Catalan',
        '1. d4 Nf6 2. c4 e6 3. g3 d5 4. Bg2 Be7 5. Nf3 O-O 6. O-O Nbd7 7. Qc2 c6 8. Nbd2 b6 9. e4 Bb7 10. b3',
        {
          13: 'Qc2 supports the e4 break.',
          17: 'e4 gains central space.',
        },
      ),
    ],
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    eco: 'A20',
    side: 'w',
    difficulty: 'intermediate',
    summary: 'Start with 1.c4 and control d5 from the flank — flexible and positional.',
    lines: [
      line(
        'reversed-sicilian',
        'Reversed Sicilian',
        '1. c4 e5 2. Nc3 Nf6 3. g3 d5 4. cxd5 Nxd5 5. Bg2 Nb6 6. Nf3 Nc6 7. O-O Be7 8. d3 O-O 9. a3 Be6 10. b4',
        {
          1: 'The English: control d5 from the side.',
          5: 'The g2 bishop will rake the long diagonal.',
          17: 'a3 and b4 — a queen-side pawn storm.',
        },
      ),
      line(
        'symmetrical',
        'Symmetrical',
        '1. c4 c5 2. Nc3 Nc6 3. g3 g6 4. Bg2 Bg7 5. Nf3 e6 6. O-O Nge7 7. d3 O-O 8. Bd2 d5 9. a3 b6 10. Rb1 Bb7',
        {
          9: 'Mirror images — the extra tempo is White’s edge.',
          19: 'Rb1 prepares b4 to open the b-file.',
        },
      ),
      line(
        'mikenas',
        'Mikenas–Carls',
        '1. c4 Nf6 2. Nc3 e6 3. e4 d5 4. e5 d4 5. exf6 dxc3 6. bxc3 Qxf6 7. d4 e5 8. Nf3 exd4 9. Bg5 Qe6+ 10. Be2',
        {
          5: 'Grab the centre with e4 immediately.',
          7: 'e5 kicks the knight — the fight gets sharp.',
          17: 'Bg5 hits the queen with tempo.',
        },
      ),
    ],
  },
];
