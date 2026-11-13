import type { Episode } from './types'
import { addTimes, addTwo, changeFrom, checkProduct, costOfMany, difference, fitsLimit, fractionLeft, fractionOf, leftOver, meanOf, mostOf, pairFits, percentOf, priceAfter, roundIt, shareOut, stepsIn, toSeconds } from './skills'

/** Your songs, with their lengths in seconds (used by the soundcheck). */
export const SONGS: Record<string, number> = {
  'Midnight Rocket': 220,
  'Golden Hour': 175,
  'Thunder Dance': 245,
  'Paper Planes': 198,
}

const OTHER = (opener: string) => Object.keys(SONGS).filter((s) => s !== opener)

export const MUSIC: Episode = {
  world: 'music',
  id: 'concert-night',
  title: 'Concert night',
  meter: { label: 'Crowd', icon: '🎤' },
  choices: [
    {
      key: 'stage',
      question: (c) => `${c.name}, every star needs a stage name. Which one is yours?`,
      options: (c) => [{ value: `${c.name} Star` }, { value: `DJ ${c.name}` }, { value: `${c.name} & the Comets` }, { value: `MC ${c.name}` }],
    },
    {
      key: 'outfit',
      question: () => 'What are you wearing on stage tonight?',
      options: () => [
        { value: 'Neon hoodie' },
        { value: 'Glitter jacket' },
        { value: 'Denim and boots' },
        { value: 'Silver cape', note: 'Unlocks after 1 show', unlockAt: 1 },
        { value: 'Gold sequin suit', note: 'Unlocks after 3 shows', unlockAt: 3 },
      ],
    },
    {
      key: 'opener',
      question: () => 'Choose your biggest hit to open the show.',
      options: () => Object.keys(SONGS).map((value) => ({ value })),
    },
  ],
  opening: (c, memory) =>
    `${memory ? `${memory} ` : ''}${c.stage}, you’re about to go on stage in your ${c.outfit.toLowerCase()}! The arena is filling up and “${c.opener}” is ready to open the show. Let’s make tonight unforgettable.`,
  beats: [
    {
      id: 'soundcheck',
      scene: 'Soundcheck',
      intro: (c) => `Soundcheck! The lighting crew are programming the light show for “${c.opener}”.`,
      skills: [
        { id: 'ms-secs', years: [4, 5], make: (r, y, c) => toSeconds(r, y, c, ({ len }) => `“${c.opener}” lasts ${len}. The light desk counts in seconds. How many seconds long is your opener?`, SONGS[c.opener]) },
        { id: 'ms-twice', years: [5, 6], make: (r, y, c) => addTimes(r, y, c, ({ a, b }) => `The band runs “${c.opener}” (${a}) twice, then a new song (${b}) once. How long is the soundcheck?`, SONGS[c.opener]) },
        { id: 'ms-lights', years: [6, 5], make: (r, y, c) => stepsIn(r, y, c, ({ len, every }) => `During a ${len} song, the lights change colour every ${every} seconds. How many colour changes is that?`) },
      ],
      win: () => 'The lights are perfect and the sound engineer gives you a thumbs up.',
      slip: () => 'The crew fix the timings together. Phew, ready just in time!',
    },
    {
      id: 'doors',
      scene: 'Doors open',
      intro: () => 'Doors are open and fans are pouring in!',
      skills: [
        { id: 'md-total', years: [4, 5, 6], make: (r, y, c) => addTwo(r, y, c, ({ a, b }) => `${a} fans have standing tickets and ${b} have seats. How many fans are coming tonight?`) },
        { id: 'md-left', years: [5, 6, 4], make: (r, y, c) => leftOver(r, y, c, ({ cap, a, b }) => `The arena holds ${cap} people. ${a} standing tickets and ${b} seats are already sold. How many tickets are still left?`) },
        { id: 'md-round', years: [4, 5, 6], make: (r, y, c) => roundIt(r, y, c, ({ n, to }) => `${n} tickets are sold. The big screen shows the number rounded to the nearest ${to}. What does it show?`) },
      ],
      win: () => 'The crowd is buzzing and the chant starts: one more minute!',
      slip: () => 'The box office double-checks the numbers. Everyone gets in.',
    },
    {
      id: 'merch',
      scene: 'Merch stand',
      intro: (c) => `Your merch stand is busy. Everyone wants a ${c.stage} T-shirt!`,
      skills: [
        { id: 'mm-change', years: [4, 5], make: (r, y, c) => changeFrom(r, y, c, ({ a, b, paid }) => `A fan buys a T-shirt for ${a} and a poster for ${b}. They pay with ${paid}. How much change do they get?`) },
        { id: 'mm-many', years: [4, 5, 6], make: (r, y, c) => costOfMany(r, y, c, ({ n, each }) => `A family buys ${n} of your hoodies at ${each} each. How much do they spend?`) },
        { id: 'mm-sale', years: [6], make: (r, y, c) => priceAfter(r, y, c, ({ price, pct }) => `Tonight only: ${pct}% off hoodies! A hoodie is usually ${price}. What does it cost tonight?`) },
      ],
      win: () => 'The stand sells out of T-shirts. Fans are wearing your name!',
      slip: () => 'Your tour manager sorts out the money. Every fan gets the right change.',
    },
    {
      id: 'setlist',
      scene: 'Setlist',
      intro: () => 'Backstage, you plan the setlist with your band.',
      skills: [
        { id: 'mf-of', years: [4, 5], make: (r, y, c) => fractionOf(r, y, c, ({ n, f }) => `There are ${n} songs on tonight’s setlist. ${f} of them are crowd favourites. How many crowd favourites will you play?`) },
        { id: 'mf-pct', years: [5, 6], make: (r, y, c) => percentOf(r, y, c, ({ k, n }) => `${k} of your ${n} songs tonight are brand new. What percentage of the setlist is new?`) },
        { id: 'mf-left', years: [6], make: (r, y, c) => fractionLeft(r, y, c, ({ x, y: z }) => `1/${x} of the show is slow songs and 1/${z} is dance tracks. The rest is rock. What fraction of the show is rock?`) },
      ],
      win: () => 'The setlist is a banger. Your drummer can’t wait!',
      slip: () => 'The band talks it through and the setlist comes together.',
    },
    {
      id: 'crew',
      scene: 'Crew check',
      intro: () => 'The stage manager is checking the set before the curtain goes up.',
      skills: [
        { id: 'mc-lights', years: [4, 5, 6], make: (r, y, c) => checkProduct(r, y, c, ({ rows, each, said }) => `The stage manager says: “${rows} rows of ${each} lights is ${said} lights.” Check it! How many lights are there really?`) },
        { id: 'mc-groups', years: [4, 6], make: (r, y, c) => shareOut(r, y, c, ({ n, size }) => `After the show, ${n} fans will meet you in groups of ${size}. How many groups is that?`, false) },
        { id: 'mc-buses', years: [5], make: (r, y, c) => shareOut(r, y, c, ({ n, size }) => `${n} crew and dancers travel to the next city in minibuses that seat ${size}. Everyone needs a seat. How many minibuses do you need?`, true) },
      ],
      win: () => 'Sorted! The crew give you a high five and the curtain is about to rise.',
      slip: () => 'The crew recount everything. The stage is safe and ready.',
    },
    {
      id: 'encore',
      scene: 'Encore',
      intro: (c) => `What a show! The crowd is chanting “${c.stage}!” for an encore.`,
      skills: [
        { id: 'me-fit', years: [4, 5], make: (r, y, c) => fitsLimit(r, y, c, OTHER(c.opener), ({ limit }) => `The venue closes in ${limit}. Which encore song fits without going over?`) },
        { id: 'me-pair', years: [5, 6], make: (r, y, c) => pairFits(r, y, c, OTHER(c.opener) as [string, string, string], ({ limit, list }) => `You have ${limit} left for a double encore. Song lengths: ${list}. Which two songs fit?`) },
      ],
      win: () => 'The encore brings the house down. Phones light up the whole arena!',
      slip: () => 'Your band picks the encore with you. The crowd sings every word.',
    },
    {
      id: 'streams',
      scene: 'The morning after',
      intro: () => 'The next morning, your songs are everywhere online.',
      skills: [
        { id: 'mx-most', years: [4, 5, 6], make: (r, y, c) => mostOf(r, y, c, OTHER(c.opener) as [string, string, string], ({ list }) => `Overnight streams: ${list}. Which song was streamed the most?`) },
        { id: 'mx-diff', years: [4, 5, 6], make: (r, y, c) => difference(r, y, c, ({ a, b }) => `“${c.opener}” has ${a} streams and your newest song has ${b}. How many more streams does “${c.opener}” have?`) },
        { id: 'mx-mean', years: [6], make: (r, y, c) => meanOf(r, y, c, ({ list }) => `Four of your songs got ${list} new fans each in the first hour. What’s the mean number of new fans per song?`) },
      ],
      win: () => 'You’re trending! Fans want to know when the next show is.',
      slip: () => 'Your manager reads the stats with you. The numbers look great.',
    },
  ],
  meterValue: (results) => `${(results.reduce((n, r) => n + (r.outcome === 'first_try' ? 3 : r.outcome === 'helped' ? 2 : 1), 0) * 1000).toLocaleString('en-GB')} fans`,
  ending: (c, results) => {
    const total = results.length
    const score = results.filter((r) => r.outcome !== 'shown').length
    return score >= total - 1
      ? { won: true, title: 'Standing ovation!', text: `${c.stage} smashed it. The whole arena was on its feet, and tickets for your next show sold out in minutes.` }
      : score >= Math.ceil(total / 2)
        ? { won: true, title: 'What a show!', text: `${c.stage} got the crowd singing along. A few more practice runs and the next show will be even bigger.` }
        : { won: false, title: 'Every star starts somewhere', text: `${c.stage}, you kept going through every song. Next time, the crowd will be even louder.` }
  },
}
