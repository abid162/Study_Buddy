import type { Beat, BeatResult, Episode } from './types'
import { ordinal } from '../stages'
import { addTwo, changeFrom, checkProduct, clockAfter, costOfMany, difference, fractionOf, goalDifference, lapsToKm, leftOver, milesToKm, mostOf, percentOf, points, priceAfter, ratioPart, roundIt } from './skills'

/** Goals so far: a match beat answered (first try or with help) is a goal for us; an answer that was shown is a goal for them. */
function goals(results: BeatResult[], beats: Beat[]): [number, number] {
  let us = 0
  let them = 0
  for (const r of results) {
    if (!beats.find((b) => b.id === r.beat)?.match) continue
    if (r.outcome === 'shown') them++
    else us++
  }
  return [us, them]
}

/** Match day: each right answer is a chance your team takes; an answer that has to be shown is a chance for the rivals. */
export const FOOTBALL: Episode = {
  world: 'football',
  id: 'match-day',
  title: 'Match day',
  meter: { label: 'Score', icon: '⚽' },
  choices: [
    {
      key: 'number',
      question: (c) => `${c.name}, which shirt number are you wearing for ${c.team}?`,
      options: () => [{ value: '7' }, { value: '9' }, { value: '10' }, { value: '11' }],
    },
    {
      key: 'boots',
      question: () => 'Pick your boots for today.',
      options: () => [
        { value: 'Lightning yellow' },
        { value: 'Ice blue' },
        { value: 'Fire red' },
        { value: 'Golden boots', note: 'Unlocks after 1 match', unlockAt: 1 },
      ],
    },
    {
      key: 'celebration',
      question: () => 'How will you celebrate when you score?',
      options: () => [
        { value: 'Knee slide' },
        { value: 'Heart hands' },
        { value: 'Robot dance' },
        { value: 'Backflip', note: 'Unlocks after 3 matches', unlockAt: 3 },
      ],
    },
  ],
  opening: (c, memory) =>
    `${memory ? `${memory} ` : ''}It’s match day! ${c.name}, you’re starting for ${c.team} in the number ${c.number} shirt and your ${c.boots.toLowerCase()} boots. ${c.rival} are the opponents. Every question you get right is a chance for your team. Let’s win this!`,
  beats: [
    {
      id: 'team-talk',
      scene: 'Team talk',
      intro: (c) => `In the dressing room, the coach is talking about the league table. ${c.team} need a big result today.`,
      skills: [
        { id: 'fp-points', years: [4, 5, 6], make: (r, y, c) => points(r, y, c, ({ w, d }) => `This season ${c.team} have won ${w} games and drawn ${d}. A win is 3 points and a draw is 1. How many points do you have?`) },
        { id: 'fp-gd', years: [5, 6], make: (r, y, c) => goalDifference(r, y, c, ({ s, a }) => `${c.team} have scored ${s} goals and let in ${a}. What is your goal difference?`) },
      ],
      win: (c) => `The coach nods. “That’s the kind of thinking we need on the pitch, number ${c.number}.”`,
      slip: () => 'The coach goes through the table with you. Now everyone knows what’s at stake.',
    },
    {
      id: 'stadium',
      scene: 'The stadium',
      intro: () => 'You walk out to warm up. The stadium is filling up fast.',
      skills: [
        { id: 'fs-round', years: [4, 5, 6], make: (r, y, c) => roundIt(r, y, c, ({ n, to }) => `The crowd today is ${n}. The scoreboard shows it rounded to the nearest ${to}. What does it show?`) },
        { id: 'fs-total', years: [4, 5, 6], make: (r, y, c) => addTwo(r, y, c, ({ a, b }) => `${a} home fans and ${b} away fans are here. How many fans are in the stadium?`) },
        { id: 'fs-left', years: [5, 6], make: (r, y, c) => leftOver(r, y, c, ({ cap, a, b }) => `The stadium holds ${cap}. ${a} home fans and ${b} away fans have arrived. How many seats are still empty?`) },
      ],
      win: () => 'The noise is incredible. The fans are right behind you.',
      slip: () => 'The stadium announcer reads out the crowd. What an atmosphere!',
    },
    {
      id: 'warm-up',
      scene: 'Warm-up',
      intro: () => 'Warm-up time. The fitness coach has a plan.',
      skills: [
        { id: 'fw-laps', years: [4, 5, 6], make: (r, y, c) => lapsToKm(r, y, c, ({ laps, len }) => `You jog ${laps} laps of the ${len} m running track. How far is that in kilometres?`) },
        { id: 'fw-miles', years: [6], make: (r, y, c) => milesToKm(r, y, c, ({ miles }) => `This week the squad ran ${miles} miles in training. 5 miles is about 8 km. About how many kilometres is that?`) },
      ],
      win: () => 'Legs warmed up. You feel quick today!',
      slip: () => 'The fitness coach jogs it through with you. You’re ready.',
    },
    {
      id: 'kit',
      scene: 'Club shop',
      intro: (c) => `Before kick-off, fans queue at the club shop for your number ${c.number} shirt.`,
      skills: [
        { id: 'fk-change', years: [4, 5], make: (r, y, c) => changeFrom(r, y, c, ({ a, b, paid }) => `A fan buys a club scarf for ${a} and a programme for ${b}. They pay with ${paid}. How much change?`) },
        { id: 'fk-many', years: [4, 5, 6], make: (r, y, c) => costOfMany(r, y, c, ({ n, each }) => `A family buys ${n} shirts with your name on the back at ${each} each. How much do they spend?`) },
        { id: 'fk-sale', years: [6], make: (r, y, c) => priceAfter(r, y, c, ({ price, pct }) => `Match-day deal: ${pct}% off training tops. A top is usually ${price}. How much is it today?`) },
      ],
      win: () => 'Your shirt is the best seller today!',
      slip: () => 'The shop manager helps with the till. Everyone gets their kit.',
    },
    {
      id: 'first-half',
      match: true,
      scene: 'First half',
      intro: (c) => `Kick-off! ${c.team} against ${c.rival}. The ball comes to you…`,
      skills: [
        { id: 'fh-passes', years: [4, 5], make: (r, y, c) => fractionOf(r, y, c, ({ n, f }) => `In the first half you made ${n} passes, and ${f} of them reached a teammate. How many passes found a teammate?`) },
        { id: 'fh-pct', years: [5, 6], make: (r, y, c) => percentOf(r, y, c, ({ k, n }) => `You won ${k} of your ${n} tackles. What percentage of tackles did you win?`) },
        { id: 'fh-ratio', years: [6], make: (r, y, c) => ratioPart(r, y, c, ({ a, b, t }) => `${c.team}’s shots on target to off target are in the ratio ${a} : ${b}. You had ${t} shots. How many were on target?`) },
      ],
      win: (c) => `GOAL! ${c.name} scores and does the ${c.celebration.toLowerCase()}!`,
      slip: (c) => `${c.rival} break away and score. Heads up, there’s time to fight back!`,
    },
    {
      id: 'second-half',
      match: true,
      scene: 'Second half',
      intro: () => 'Second half. The fans are louder than ever.',
      skills: [
        { id: 'fs-clock', years: [4, 5, 6], make: (r, y, c) => clockAfter(r, y, c, ({ start, minute, brk }) => `Kick-off was at ${start}. The first half lasted 45 minutes, then there was a ${brk}-minute break. Your team scores in the ${ordinal(minute)} minute. What time is it on the clock?`, 15 * 60, 15, 45) },
        { id: 'fs-check', years: [4, 5, 6], make: (r, y, c) => checkProduct(r, y, c, ({ rows, each, said }) => `The announcer says: “${rows} rows of ${each} fans in the North Stand makes ${said}!” Check it. How many fans are there really?`) },
      ],
      win: (c) => `Another one! ${c.team} are flying!`,
      slip: (c) => `${c.rival} sneak one in at the back post. Keep going!`,
    },
    {
      id: 'final-whistle',
      match: true,
      scene: 'Final whistle',
      intro: () => 'The final whistle is close. One last chance…',
      skills: [
        { id: 'fx-most', years: [4, 5, 6], make: (r, y, c) => mostOf(r, y, c, ['North Stand', 'South Stand', 'East Stand'], ({ list }) => `To pick the loudest stand for a prize, the club counts how many fans in each one sang along: ${list}. Which stand wins?`) },
        { id: 'fx-diff', years: [4, 5, 6], make: (r, y, c) => difference(r, y, c, ({ a, b }) => `This season ${c.team} sold ${a} match tickets and ${c.rival} sold ${b}. How many more did ${c.team} sell?`) },
      ],
      win: (c) => `Last-minute winner! ${c.name} is mobbed by the whole team.`,
      slip: (c) => `${c.rival} hang on for this chance. What a game!`,
    },
  ],
  meterValue: (results, beats) => {
    const [us, them] = goals(results, beats)
    return `${us} – ${them}`
  },
  ending: (c, results) => {
    const [us, them] = goals(results, FOOTBALL.beats)
    if (us > them) return { won: true, title: `${c.team} win ${us}–${them}!`, text: `Three points! ${c.name} is named Player of the Match.` }
    if (us === them) return { won: false, title: `It’s a draw, ${us}–${them}`, text: 'A point each. A bit more practice and those chances will go in next time.' }
    return { won: false, title: `${c.rival} win ${them}–${us}`, text: `Hard luck, ${c.name}. Every great player learns from games like this. Next match, we go again!` }
  },
}
