/**
 * Openings where the learner plays Black.
 *
 * ⚠️ Opening and line ids are persistence keys (progress is stored against
 * them) — never rename one; add a new id instead.
 */
import type { Opening } from '@/domain/types';
import { line } from './define';

export const BLACK_OPENINGS: Opening[] = [
  {
    id: 'sicilian-najdorf',
    name: 'Sicilian Najdorf',
    eco: 'B90',
    side: 'b',
    difficulty: 'advanced',
    summary: 'The fighting answer to 1.e4. The quiet ...a6 keeps every option open and prepares ...e5 or ...b5.',
    lines: [
      line(
        'english-attack',
        'English Attack',
        '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7',
        {
          2: 'The Sicilian: fight for d4 from the side.',
          10: 'The Najdorf move: controls b5 and prepares ...e5.',
          12: 'Kick the knight and claim central space.',
          14: 'Develop with an eye on the d5 square.',
        },
      ),
      line(
        'bg5',
        '6.Bg5 Main Line',
        '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5',
        {
          12: '...e6 keeps the knight on f6 well protected.',
          16: 'The queen on c7 eyes the half-open c-file.',
          20: '...b5: the queen-side attack starts. Race on!',
        },
      ),
      line(
        'be2',
        '6.Be2 Classical',
        '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be2 e5 7. Nb3 Be7 8. O-O O-O 9. Be3 Be6 10. Qd2 Nbd7',
        {
          12: 'Against quiet set-ups, ...e5 grabs the centre.',
          18: 'The bishop on e6 fights for the key d5 square.',
        },
      ),
    ],
  },
  {
    id: 'sicilian-dragon',
    name: 'Sicilian Dragon',
    eco: 'B70',
    side: 'b',
    difficulty: 'advanced',
    summary: 'Fianchetto the bishop on g7 to breathe fire down the long diagonal. Sharp, double-edged play.',
    lines: [
      line(
        'yugoslav',
        'Yugoslav Attack',
        '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Rc8 11. Bb3 Ne5',
        {
          10: 'The Dragon: fianchetto the bishop.',
          12: 'The Dragon bishop is Black’s best piece.',
          20: 'Rc8 lines up on the half-open c-file.',
          22: 'Ne5 heads for c4 to hit White’s strong pieces.',
        },
      ),
      line(
        'classical',
        'Classical 6.Be2',
        '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be2 Bg7 7. O-O O-O 8. Be3 Nc6 9. Nb3 Be6 10. f4 Qc8',
        {
          16: 'Develop and put pressure on d4.',
          20: 'Qc8 connects the rooks and eyes the c-file.',
        },
      ),
    ],
  },
  {
    id: 'french-defence',
    name: 'French Defence',
    eco: 'C00',
    side: 'b',
    difficulty: 'intermediate',
    summary: 'Solid and counter-attacking: ...e6 and ...d5, then undermine White’s centre with ...c5.',
    lines: [
      line(
        'advance',
        'Advance Variation',
        '1. e4 e6 2. d4 d5 3. e5 c5 4. c3 Nc6 5. Nf3 Qb6 6. a3 c4 7. Nbd2 Na5 8. Be2 Bd7 9. O-O Ne7',
        {
          2: 'Prepare ...d5 with a pawn protecting it.',
          6: 'Attack the base of White’s pawn chain.',
          10: 'Qb6 piles up on d4 and b2.',
          12: 'Grab queen-side space; the knight will go to b3.',
        },
      ),
      line(
        'winawer',
        'Winawer',
        '1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5 5. a3 Bxc3+ 6. bxc3 Ne7 7. Qg4 O-O 8. Bd3 Nbc6 9. Qh5 Ng6',
        {
          6: 'Pin the knight to increase pressure on e4.',
          10: 'Double White’s pawns in return for the bishop.',
          14: 'Castle into it with confidence — the king is well defended.',
        },
      ),
      line(
        'tarrasch',
        'Tarrasch 3...c5',
        '1. e4 e6 2. d4 d5 3. Nd2 c5 4. exd5 Qxd5 5. Ngf3 cxd4 6. Bc4 Qd6 7. O-O Nf6 8. Nb3 Nc6 9. Nbxd4 Nxd4 10. Nxd4 a6',
        {
          6: 'Strike at d4 at once.',
          8: 'Recapture with the queen for active piece play.',
          20: '...a6 prepares ...b5 and ...Bb7.',
        },
      ),
    ],
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann Defence',
    eco: 'B10',
    side: 'b',
    difficulty: 'beginner',
    summary: 'Rock-solid: support ...d5 with ...c6 and get the light-squared bishop out before ...e6.',
    lines: [
      line(
        'classical',
        'Classical 4...Bf5',
        '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5 5. Ng3 Bg6 6. h4 h6 7. Nf3 Nd7 8. h5 Bh7 9. Bd3 Bxd3 10. Qxd3 e6',
        {
          2: '...c6 prepares ...d5 with rock-solid support.',
          8: 'Develop the bishop *before* ...e6 locks it in.',
          12: '...h6 gives the bishop a safe home on h7.',
          20: 'Now ...e6 — every piece has a good square.',
        },
      ),
      line(
        'advance',
        'Advance Variation',
        '1. e4 c6 2. d4 d5 3. e5 Bf5 4. Nf3 e6 5. Be2 c5 6. Be3 Nd7 7. O-O Ne7 8. c4 dxc4 9. Na3 Nd5 10. Nxc4 Be7',
        {
          6: 'Bishop out first, as always in the Caro-Kann.',
          10: '...c5 hits the head of White’s centre.',
          18: 'The knight lands on the perfect d5 square.',
        },
      ),
      line(
        'exchange',
        'Exchange Variation',
        '1. e4 c6 2. d4 d5 3. exd5 cxd5 4. Bd3 Nc6 5. c3 Nf6 6. Bf4 Bg4 7. Qb3 Qd7 8. Nd2 e6 9. Ngf3 Bd6 10. Bxd6 Qxd6',
        {
          12: 'Active bishop before ...e6.',
          14: 'Qd7 calmly defends b7.',
        },
      ),
    ],
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian Defence',
    eco: 'B01',
    side: 'b',
    difficulty: 'beginner',
    summary: 'Challenge e4 right away with 1...d5. Simple, direct and easy to learn.',
    lines: [
      line(
        'qa5',
        'Main Line 3...Qa5',
        '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6 5. Nf3 c6 6. Bc4 Bf5 7. Bd2 e6 8. Qe2 Bb4 9. O-O-O Nbd7',
        {
          2: 'Hit e4 immediately.',
          6: 'The queen is safe on a5 and pins the c3 knight.',
          10: '...c6 gives the queen a retreat and controls b5 and d5.',
        },
      ),
      line(
        'qd6',
        'Modern 3...Qd6',
        '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qd6 4. d4 Nf6 5. Nf3 a6 6. g3 Bg4 7. Bg2 Nc6 8. O-O O-O-O',
        {
          6: 'Qd6 is harder to attack with tempo.',
          10: '...a6 takes b5 away from White’s pieces.',
          16: 'Castle long and go for the centre.',
        },
      ),
      line(
        'marshall',
        'Marshall 2...Nf6',
        '1. e4 d5 2. exd5 Nf6 3. d4 Nxd5 4. Nf3 g6 5. Be2 Bg7 6. O-O O-O 7. c4 Nb6 8. Nc3 Nc6 9. d5 Ne5',
        {
          4: 'Win the pawn back with the knight instead.',
          8: 'Fianchetto and pressure d4.',
          18: 'The knight finds a great central square.',
        },
      ),
    ],
  },
  {
    id: 'petrov-defence',
    name: 'Petrov Defence',
    eco: 'C42',
    side: 'b',
    difficulty: 'intermediate',
    summary: 'Counter-attack e4 with 2...Nf6. A super-solid, symmetrical choice used by world champions.',
    lines: [
      line(
        'classical',
        'Classical 5.d4',
        '1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. d4 d5 6. Bd3 Nc6 7. O-O Be7 8. c4 Nb4 9. Be2 O-O 10. Nc3 Bf5',
        {
          4: 'Counter-attack e4 instead of defending e5.',
          6: 'Don’t take on e4 yet! Kick the knight first.',
          8: 'Now the pawn is safe to take.',
          16: 'Nb4 chases White’s bishop off its best diagonal.',
        },
      ),
      line(
        'nimzowitsch',
        'Nimzowitsch 5.Nc3',
        '1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. Nc3 Nxc3 6. dxc3 Be7 7. Be3 Nc6 8. Qd2 Be6 9. O-O-O Qd7',
        {
          10: 'Trade knights and develop calmly.',
          18: 'Black can castle either side; the position is balanced.',
        },
      ),
      line(
        'qe2',
        '5.Qe2 Queen Trade',
        '1. e4 e5 2. Nf3 Nf6 3. Nxe5 d6 4. Nf3 Nxe4 5. Qe2 Qe7 6. d3 Nf6 7. Bg5 Qxe2+ 8. Bxe2 Be7 9. Nc3 c6',
        {
          10: 'Pin the pin: block the e-file with the queen.',
          14: 'Trade queens — this endgame is very comfortable for Black.',
        },
      ),
    ],
  },
  {
    id: 'kings-indian',
    name: "King's Indian Defence",
    eco: 'E60',
    side: 'b',
    difficulty: 'advanced',
    summary: 'Let White build a big centre, then attack it — and White’s king — with ...e5 and ...f5.',
    lines: [
      line(
        'classical',
        'Classical Main Line',
        '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. Nf3 O-O 6. Be2 e5 7. O-O Nc6 8. d5 Ne7 9. Ne1 Nd7 10. Nd3 f5',
        {
          4: 'Fianchetto: the bishop will pressure the long diagonal.',
          12: '...e5: the key central strike.',
          18: 'Reroute the knight so the f-pawn can advance.',
          20: '...f5: the king-side attack is on.',
        },
      ),
      line(
        'samisch',
        'Sämisch Variation',
        '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6 5. f3 O-O 6. Be3 e5 7. d5 Nh5 8. Qd2 f5 9. O-O-O Nd7',
        {
          14: 'Nh5 prepares ...f5 immediately.',
          16: 'Strike with ...f5 before White attacks.',
        },
      ),
      line(
        'fianchetto',
        'Fianchetto Variation',
        '1. d4 Nf6 2. c4 g6 3. Nf3 Bg7 4. g3 O-O 5. Bg2 d6 6. O-O Nbd7 7. Nc3 e5 8. e4 c6 9. h3 Qb6',
        {
          14: '...e5 challenges the centre.',
          18: 'Qb6 hits b2 and d4 at the same time.',
        },
      ),
    ],
  },
  {
    id: 'queens-gambit-declined',
    name: "Queen's Gambit Declined",
    eco: 'D30',
    side: 'b',
    difficulty: 'intermediate',
    summary: 'Hold the d5 point with ...e6. Classical, reliable and full of instructive middlegames.',
    lines: [
      line(
        'orthodox',
        'Orthodox: Capablanca Freeing',
        '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5 10. Bxe7 Qxe7',
        {
          4: 'Decline: keep a pawn on d5.',
          16: 'Take on c4 only once White’s bishop has moved.',
          18: 'Capablanca’s freeing manoeuvre — trade pieces to free the position.',
        },
      ),
      line(
        'exchange',
        'Exchange Variation',
        '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. cxd5 exd5 5. Bg5 c6 6. e3 Be7 7. Bd3 Nbd7 8. Qc2 O-O 9. Nge2 Re8 10. O-O Nf8',
        {
          8: 'Recapture with the pawn: the c8 bishop is free now.',
          20: 'Nf8 is a flexible defensive regroup (to g6 or e6).',
        },
      ),
      line(
        'bf4',
        '5.Bf4 with ...c5',
        '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Nf3 Be7 5. Bf4 O-O 6. e3 c5 7. dxc5 Bxc5 8. Qc2 Nc6 9. a3 Qa5 10. Rd1 Re8',
        {
          12: '...c5 challenges the centre straight away.',
          18: 'Qa5 pins the knight and eyes c3.',
        },
      ),
    ],
  },
  {
    id: 'slav-defence',
    name: 'Slav Defence',
    eco: 'D10',
    side: 'b',
    difficulty: 'intermediate',
    summary: 'Support d5 with ...c6 and keep the light-squared bishop free. A favourite of solid players.',
    lines: [
      line(
        'main',
        'Main Line 4...dxc4',
        '1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. Nc3 dxc4 5. a4 Bf5 6. e3 e6 7. Bxc4 Bb4 8. O-O Nbd7 9. Qe2 Bg6 10. e4 O-O',
        {
          4: 'The Slav: ...c6 supports d5 without blocking the bishop.',
          10: 'The bishop gets out before ...e6.',
          14: 'Pin the knight to slow down e4.',
        },
      ),
      line(
        'exchange',
        'Exchange Variation',
        '1. d4 d5 2. c4 c6 3. cxd5 cxd5 4. Nc3 Nf6 5. Bf4 Nc6 6. e3 Bf5 7. Nf3 e6 8. Bb5 Nd7 9. Qa4 Qb6',
        {
          12: 'Mirror White’s development.',
          16: 'Nd7 covers the pin and eyes e5.',
        },
      ),
      line(
        'e3-bf5',
        '4.e3 Bf5',
        '1. d4 d5 2. c4 c6 3. Nf3 Nf6 4. e3 Bf5 5. Nc3 e6 6. Nh4 Bg6 7. Nxg6 hxg6 8. Bd3 Nbd7 9. O-O Bd6 10. h3 Qc7',
        {
          8: 'The bishop is out — the Slav’s main goal.',
          14: 'Recapture towards the centre, opening the h-file.',
        },
      ),
    ],
  },
  {
    id: 'nimzo-indian',
    name: 'Nimzo-Indian Defence',
    eco: 'E20',
    side: 'b',
    difficulty: 'advanced',
    summary: 'Pin the c3 knight with ...Bb4 to control e4 — one of the most respected defences to 1.d4.',
    lines: [
      line(
        'rubinstein',
        'Rubinstein 4.e3',
        '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5 6. Nf3 c5 7. O-O Nc6 8. a3 Bxc3 9. bxc3 dxc4 10. Bxc4 Qc7',
        {
          6: 'The Nimzo pin: control e4 by pinning its defender.',
          16: 'Give the bishop to double White’s pawns.',
          20: 'Qc7 prepares ...e5 to hit the centre.',
        },
      ),
      line(
        'classical',
        'Classical 4.Qc2',
        '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 b6 7. Bg5 Bb7 8. f3 h6 9. Bh4 d5 10. e3 Nbd7',
        {
          12: 'The b7 bishop still fights for e4.',
          18: 'Strike in the centre once development is done.',
        },
      ),
    ],
  },
  {
    id: 'dutch-leningrad',
    name: 'Dutch Defence: Leningrad',
    eco: 'A87',
    side: 'b',
    difficulty: 'advanced',
    summary: 'Grab e4 with 1...f5 and combine it with a King’s Indian fianchetto for a king-side attack.',
    lines: [
      line(
        'main',
        'Main Line 7...Qe8',
        '1. d4 f5 2. g3 Nf6 3. Bg2 g6 4. Nf3 Bg7 5. O-O O-O 6. c4 d6 7. Nc3 Qe8 8. d5 a5 9. Be3 Na6',
        {
          2: 'The Dutch: control e4 with a pawn.',
          6: 'The Leningrad fianchetto.',
          14: 'Qe8 prepares ...e5 and a queen swing to h5.',
          18: 'The knight heads to c5 via a6.',
        },
      ),
      line(
        'd5-e5',
        'd5 & ...e5 en passant',
        '1. d4 f5 2. c4 Nf6 3. Nc3 g6 4. Nf3 Bg7 5. g3 O-O 6. Bg2 d6 7. O-O c6 8. d5 e5 9. dxe6 Bxe6',
        {
          14: '...c6 challenges White’s space on d5.',
          18: 'Recapture and the bishop lands on a great diagonal.',
        },
      ),
    ],
  },
];
