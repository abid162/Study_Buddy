import type { EnStatement, Level } from './types'
import { at, choice, open, spell, typed } from './build'
import { cap } from './skins'
import { WORDS_Y56 } from './words'

/** Year 5 English: spelling (Appendix 1, Years 5–6), grammar and punctuation (Appendix 2, Year 5), writing. */

const LV = (i: number): Level => (i < 2 ? 1 : i < 4 ? 2 : 3)

const CIOUS: [root: string, word: string, wrong: string][] = [
  ['vice', 'vicious', 'vitious'], ['grace', 'gracious', 'gratious'], ['space', 'spacious', 'spatious'], ['malice', 'malicious', 'malitious'],
  ['ambition', 'ambitious', 'ambicious'], ['caution', 'cautious', 'caucious'], ['nutrition', 'nutritious', 'nutricious'], ['infection', 'infectious', 'infecious'],
]
const CIAL: [word: string, wrong: string, note: string][] = [
  ['official', 'offitial', '-cial usually comes after a vowel: offi-cial.'], ['special', 'spetial', '-cial usually comes after a vowel: spe-cial.'],
  ['artificial', 'artifitial', '-cial usually comes after a vowel.'], ['social', 'sotial', '-cial usually comes after a vowel.'],
  ['partial', 'parcial', '-tial usually comes after a consonant: par-tial.'], ['essential', 'essencial', '-tial usually comes after a consonant: essen-tial.'],
  ['confidential', 'confidencial', '-tial usually comes after a consonant.'], ['initial', 'inicial', '“initial” is an exception: it uses -tial after a vowel.'],
]
const ANT: [word: string, wrong: string, note: string][] = [
  ['observant', 'observent', 'observe → observant, observance (-ant, -ance).'], ['hesitancy', 'hesitency', 'hesitate → hesitant, hesitancy.'],
  ['innocence', 'innocance', 'innocent → innocence (-ent, -ence).'], ['decency', 'decancy', 'decent → decency.'],
  ['frequency', 'frequancy', 'frequent → frequency.'], ['confidence', 'confidance', 'confident → confidence.'],
  ['tolerance', 'tolerence', 'tolerate → tolerant, tolerance.'], ['obedience', 'obediance', 'obedient → obedience.'],
  ['independence', 'independance', 'independent → independence.'], ['expectancy', 'expectency', 'expectant → expectancy.'],
]
const ABLE: [word: string, wrong: string, note: string][] = [
  ['adorable', 'adorible', 'adore → adorable: drop the e, add -able.'], ['considerable', 'considerible', 'consider is a whole word, so it takes -able.'],
  ['comfortable', 'comfortible', 'comfort is a whole word, so it takes -able.'], ['dependable', 'dependible', 'depend is a whole word, so it takes -able.'],
  ['possible', 'possable', '“poss” is not a word on its own, so it takes -ible.'], ['horrible', 'horrable', '“horr” is not a word on its own, so it takes -ible.'],
  ['visible', 'visable', '“vis” is not a word on its own, so it takes -ible.'], ['incredible', 'incredable', '“incred” is not a word on its own, so it takes -ible.'],
  ['sensible', 'sensable', '“sens” on its own is not a word here, so it takes -ible.'], ['reasonably', 'reasonibly', 'reason → reasonable → reasonably.'],
]
const FER: [word: string, wrong: string, note: string][] = [
  ['referring', 'refering', 'In “referring” the stress stays on “fer”, so double the r.'], ['preferred', 'prefered', 'The stress stays on “fer”, so double the r.'],
  ['reference', 'refference', 'In “reference” the stress moves to the start, so the r is not doubled.'], ['preference', 'preferrence', 'The stress moves away from “fer”, so the r is not doubled.'],
  ['transferred', 'transfered', 'The stress stays on “fer”, so double the r.'], ['offering', 'offerring', '“offer” is stressed on “of”, so do not double the r.'],
]
const SILENT: [word: string, wrong: string][] = [
  ['doubt', 'dout'], ['island', 'iland'], ['lamb', 'lam'], ['knight', 'nite'], ['solemn', 'solem'], ['thistle', 'thisle'],
  ['gnome', 'nome'], ['wrist', 'rist'], ['castle', 'casle'], ['column', 'colum'], ['knock', 'nock'], ['climb', 'clime'],
]
const HOMO5: [sentence: string, right: string, wrong: string, note: string][] = [
  ['{speaker} gave {actor} some good ___.', 'advice', 'advise', 'With “c” it is a noun (advice); with “s” it is a verb (to advise).'],
  ['{team} need to ___ every day.', 'practise', 'practice', 'In British English, practise (s) is the verb and practice (c) is the noun.'],
  ['The {crowd} were not ___ onto the pitch.', 'allowed', 'aloud', '“allowed” means permitted; “aloud” means out loud.'],
  ['{actor} ___ the {thing} to {actor2}.', 'passed', 'past', '“passed” is a verb (pass); “past” is about time gone by, or going beyond.'],
  ['{actor} ___ the {crowd} in a song.', 'led', 'lead', 'The past of “lead” (to guide) is “led”.'],
  ['We ___ the answer correctly.', 'guessed', 'guest', '“guessed” is the past of guess; a “guest” is a visitor.'],
  ['The new rule had a big ___ on {team}.', 'effect', 'affect', '“effect” is usually a noun (a result); “affect” is usually a verb.'],
  ['After dinner we had ice cream for ___.', 'dessert', 'desert', '“dessert” (two s’s, like “sweet stuff”) is pudding; a “desert” is dry land.'],
]
const VERBS: [from: string, verb: string, wrong: string][] = [
  ['active', 'activate', 'activeate'], ['class', 'classify', 'classise'], ['solid', 'solidify', 'solidate'], ['short', 'shorten', 'shortify'],
  ['dark', 'darken', 'darkify'], ['apology', 'apologise', 'apologyise'], ['simple', 'simplify', 'simplen'], ['fright', 'frighten', 'frightify'],
  ['pure', 'purify', 'purise'], ['hospital', 'hospitalise', 'hospitalify'],
]
const VPRE: [prefix: string, root: string, word: string, meaning: string][] = [
  ['de', 'frost', 'defrost', 'remove the frost from'], ['mis', 'understand', 'misunderstand', 'understand wrongly'], ['over', 'cook', 'overcook', 'cook too much'],
  ['re', 'build', 'rebuild', 'build again'], ['dis', 'connect', 'disconnect', 'break the connection'], ['de', 'code', 'decode', 'work out a coded message'],
  ['over', 'sleep', 'oversleep', 'sleep too long'], ['mis', 'place', 'misplace', 'put somewhere and lose'], ['re', 'write', 'rewrite', 'write again'],
  ['dis', 'like', 'dislike', 'not like'],
]
const CERTAIN: [most: string, least: string, mid: string][] = [
  ['will', 'might', 'should'], ['must', 'could', 'should'], ['definitely', 'perhaps', 'probably'], ['certainly', 'possibly', 'probably'],
]
const LINKS: [word: string, job: string][] = [
  ['Meanwhile', 'time'], ['Later that day', 'time'], ['Nearby', 'place'], ['On the other side of town', 'place'], ['Secondly', 'number'], ['Finally', 'number'],
]

const fill = (s: string, c: { thing: string; actor: string; actor2: string; crowd: string; team: string; speaker: string }) =>
  s.replace(/\{thing\}/g, c.thing).replace(/\{actor2\}/g, c.actor2).replace(/\{actor\}/g, c.actor).replace(/\{crowd\}/g, c.crowd).replace(/\{team\}/g, cap(c.team)).replace(/\{speaker\}/g, cap(c.speaker))

/** Two-way spelling statement from a [word, wrong, note] pool: choose, then type. */
const twoWay = (pool: [string, string, string][], ask: string) =>
  [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
    const [w, bad, note] = at(c, pool, k)
    return i % 2 === 0 ? choice(r, ask, w, [[bad, note]], note) : typed(`Type the correct spelling. It is NOT “${bad}”.`, w, note)
  }] as EnStatement['items'][number])

export const Y5_ENGLISH: EnStatement[] = [
  {
    id: 'EN-Y5-SP-01', year: 5, domain: 'Spelling', text: 'Endings that sound like /shus/: -cious and -tious',
    hints: ['Both endings sound like “shus”.', 'If the root ends in -ce, use -cious (grace → gracious). If it ends in -tion, use -tious (caution → cautious).', 'Find the root word and check its ending before you choose.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
      const [root, w, bad] = at(c, CIOUS, k)
      const note = root.endsWith('ce') ? `“${root}” ends in -ce, so use -cious.` : `“${root}” ends in -tion, so use -tious.`
      return i % 2 === 0 ? choice(r, `Make an adjective from “${root}”. Which spelling is right?`, w, [[bad, note]], note) : typed(`Turn “${root}” into an adjective ending in /shus/.`, w, note)
    }]),
  },
  {
    id: 'EN-Y5-SP-02', year: 5, domain: 'Spelling', text: 'Endings that sound like /shul/: -cial and -tial',
    hints: ['Both endings sound like “shul”.', '-cial usually comes after a vowel (special); -tial after a consonant (partial). Watch for exceptions like initial.', 'Look at the letter just before the ending: vowel or consonant?'],
    items: twoWay(CIAL, 'Which spelling is correct?'),
  },
  {
    id: 'EN-Y5-SP-03', year: 5, domain: 'Spelling', text: 'Words ending in -ant, -ance, -ancy, -ent, -ence, -ency',
    hints: ['These endings sound alike, so link the word to its family.', 'If you know the -ant or -ent form, keep the same vowel: innocent → innocence, tolerant → tolerance.', 'Say the related word (confident, observant) and copy its vowel.'],
    items: twoWay(ANT, 'Which spelling is correct?'),
  },
  {
    id: 'EN-Y5-SP-04', year: 5, domain: 'Spelling', text: 'Words ending in -able, -ible, -ably, -ibly',
    hints: ['-able and -ible sound the same.', 'If the root is a whole word (comfort, depend), it usually takes -able. If not (poss, horr), it usually takes -ible.', 'Cover the ending: is what is left a real word?'],
    items: twoWay(ABLE, 'Which spelling is correct?'),
  },
  {
    id: 'EN-Y5-SP-05', year: 5, domain: 'Spelling', text: 'Adding suffixes beginning with vowels to words ending in -fer',
    hints: ['Words like refer, prefer and transfer can double their r.', 'Double the r if “fer” is still stressed after adding the ending (referring); do not double it if the stress moves (reference).', 'Say the new word aloud and listen for where the stress falls.'],
    items: twoWay(FER, 'Which spelling is correct?'),
  },
  {
    id: 'EN-Y5-SP-06', year: 5, domain: 'Spelling', text: 'Words with silent letters',
    hints: ['Some letters are written but not said.', 'Common silent letters: b in doubt and lamb, k in knight, n in column, t in castle, w in wrist, g in gnome.', 'Say the word in a “spelling voice”, sounding every letter: k-night, col-umn.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
      const [w, bad] = at(c, SILENT, k)
      return i % 2 === 0 ? choice(r, `${c.actor} wrote this word on a sign. Which spelling is correct?`, w, [[bad, `“${w}” has a silent letter.`]], `“${w}” has a silent letter.`) : typed(`This word has a silent letter. It sounds like “${bad}”. Type it.`, w, `The spelling is “${w}”.`)
    }]),
  },
  {
    id: 'EN-Y5-SP-07', year: 5, domain: 'Spelling', text: 'Homophones and near-homophones (Years 5–6)',
    hints: ['These words sound the same or nearly the same.', 'Work out whether you need a noun or a verb: advice / advise, practice / practise.', 'Try each word in the gap and check the meaning.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => { const [s, right, wrong, note] = at(c, HOMO5, k); return choice(r, 'Which word fits the gap?', right, [[wrong, note]], note, fill(s, c)) }]),
  },
  {
    id: 'EN-Y5-SP-08', year: 5, domain: 'Spelling', text: 'Words from the Years 5–6 statutory word list (part 1)', chunk: 10,
    hints: ['Listen to Nova say the word, then picture it.', 'Break it into syllables and spell each part: ac-com-mo-date.', 'Check the tricky part: double letters (accommodate), silent letters or unusual endings.'],
    items: WORDS_Y56.slice(0, 50).map(([w, s], i) => [((i % 10) < 4 ? 1 : (i % 10) < 7 ? 2 : 3) as Level, () => spell(w, s)]),
  },
  {
    id: 'EN-Y5-GR-01', year: 5, domain: 'Grammar', text: 'Turning nouns or adjectives into verbs with -ate, -ise, -ify and -en',
    hints: ['Suffixes can turn a noun or adjective into a verb.', 'Common ones: -ate (activate), -ise (apologise), -ify (simplify), -en (darken).', 'Try each suffix on the word and listen for the one that sounds right.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
      const [from, verb, bad] = at(c, VERBS, k)
      return i < 4
        ? choice(r, `Which verb comes from “${from}”?`, verb, [[bad, 'That is not a real word. Try a different suffix.']], `${from} → ${verb}.`)
        : open(`Use the verb “${verb}” in a sentence about ${c.event}.`, `One sentence that makes sense using “${verb}” correctly as a verb (any tense); punctuated.`, `${c.actor} had to ${verb} the plan before ${c.event}.`)
    }]),
  },
  {
    id: 'EN-Y5-GR-02', year: 5, domain: 'Grammar', text: 'Verb prefixes: dis-, de-, mis-, over-, re-',
    hints: ['A verb prefix changes the meaning of a verb.', 'dis- and de- often mean undo or remove; mis- means wrongly; over- means too much; re- means again.', 'Read the meaning you need, then pick the prefix that matches it.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
      const [p, root, word, meaning] = at(c, VPRE, k)
      const others = ['dis', 'de', 'mis', 'over', 're'].filter((x) => x !== p).slice(0, 2)
      return i % 2 === 0
        ? choice(r, `Which verb means “${meaning}”?`, word, others.map((o) => [`${o}${root}`, `“${o}-” changes the meaning differently.`] as [string, string]), `${p}- + ${root} = ${word}.`)
        : typed(`Add a prefix to “${root}” so it means “${meaning}”.`, word, `${p}- + ${root} = ${word}.`)
    }]),
  },
  {
    id: 'EN-Y5-GR-03', year: 5, domain: 'Grammar', text: 'Relative clauses with who, which, where, when, whose and that',
    hints: ['A relative clause adds information about a noun.', 'It starts with a relative pronoun: who (people), which (things), where (places), when (times), whose (belonging), that.', 'Find the noun you want to describe, then add the relative pronoun and the extra detail straight after it.'],
    items: [
      [1, (c, r) => choice(r, `Which word starts the relative clause? “${c.actor}, who ${c.win}, smiled.”`, 'who', [[c.actor, 'That is the noun being described.'], ['smiled', 'That is the main verb.']], `“who ${c.win}” tells us more about ${c.actor}.`)],
      [1, (c, r) => choice(r, `Which relative pronoun fits? “${cap(c.place)}, ___ ${c.event} happened, was packed.”`, 'where', [['who', '“who” is for people.'], ['which', 'For a place, “where” fits better here.']], 'Use “where” for a place.')],
      [2, (c, r) => choice(r, `Which relative pronoun fits? “${c.actor}, ___ ${c.thing} was broken, needed help.”`, 'whose', [['who', 'Something belongs to the person, so use “whose”.'], ['which', '“which” is for things, and we need belonging.']], '“whose” shows the thing belongs to someone.')],
      [2, (c) => typed(`Join with “which”: “The ${c.thing} was new. It cost a lot.”`, [`The ${c.thing}, which was new, cost a lot.`, `The ${c.thing}, which cost a lot, was new.`], 'The relative clause goes after the noun, with commas around it.', { exact: false })],
      [3, (c) => open(`Write a sentence about ${c.actor} with a relative clause starting with “who”.`, 'One sentence with a relative clause introduced by “who” that adds information about the person; commas where needed; makes sense.', `${c.actor}, who had trained all week, ${c.win}.`)],
      [3, (c) => open(`Add a relative clause to: “${cap(c.place)} was full.”`, 'Keeps the main clause and adds a relevant relative clause (where/which/that…) correctly placed and punctuated.', `${cap(c.place)}, where ${c.event} was taking place, was full.`)],
    ],
  },
  {
    id: 'EN-Y5-GR-04', year: 5, domain: 'Grammar', text: 'Showing how likely something is with modal verbs and adverbs',
    hints: ['Some words show how sure we are: will, might, could, should, must; perhaps, surely, definitely.', '“will”, “must”, “definitely” are very sure; “might”, “could”, “perhaps” are less sure.', 'Imagine a scale from impossible to certain and place each word on it.'],
    items: [
      [1, (c, r) => { const [most, least, mid] = at(c, CERTAIN, 0); return choice(r, `Which word makes it most certain? “${c.team} ___ win.”`, most, [[least, 'This shows it may or may not happen.'], [mid, 'This is fairly likely, but not certain.']], `“${most}” shows the highest certainty.`) }],
      [1, (c, r) => choice(r, `Which word is a modal verb? “${c.actor} might ${c.move}.”`, 'might', [[c.actor, 'That is the subject.']], '“might” is a modal verb: it shows possibility.')],
      [2, (c, r) => { const [most, least, mid] = at(c, CERTAIN, 2); return choice(r, `Which word makes it least certain? “___, ${c.actor} will be there.”`, cap(least), [[cap(most), 'That makes it very certain.'], [cap(mid), 'That is fairly likely.']], `“${cap(least)}” shows it is only possible.`) }],
      [2, (c) => typed(`Change the sentence so it is only possible, not certain: “${c.actor} will ${c.move}.”`, [`${c.actor} might ${c.move}.`, `${c.actor} may ${c.move}.`, `${c.actor} could ${c.move}.`, `Perhaps ${c.actor} will ${c.move}.`], 'Use a modal like might, may or could, or an adverb like perhaps.')],
      [3, (c) => open(`Write two sentences about the next ${c.event.replace(/^the /, '')}: one certain and one only possible.`, 'Two sentences; one uses a modal verb or adverb showing certainty (will, must, definitely); the other shows possibility (might, could, perhaps); punctuated.', `${c.team.startsWith('the') ? cap(c.team) : c.team} will definitely train on Monday. They might win the next one.`)],
      [3, (c) => open(`${cap(c.speaker)} is not sure if ${c.event} will go ahead. Write what ${c.speaker} might say, using two different words that show possibility.`, 'Uses at least two different words showing possibility (modal verbs and/or adverbs); appropriate meaning; punctuated.', `“Perhaps it could be delayed, but we might still start on time.”`)],
    ],
  },
  {
    id: 'EN-Y5-GR-05', year: 5, domain: 'Grammar', text: 'Linking ideas across paragraphs with adverbials of time, place and number',
    hints: ['Cohesion means writing that flows and links together.', 'Adverbials like Meanwhile, Later, Nearby, Firstly, Finally link one paragraph to the next.', 'Ask: does the next paragraph move on in time, change place, or list the next point?'],
    items: [
      [1, (_c, r) => choice(r, 'Which adverbial shows time?', 'Meanwhile', [['Nearby', 'That shows place.'], ['Secondly', 'That shows order or number.']], '“Meanwhile” shows what was happening at the same time.')],
      [1, (_c, r) => choice(r, 'Which adverbial shows place?', 'Nearby', [['Later', 'That shows time.'], ['Firstly', 'That shows order.']], '“Nearby” tells us where.')],
      [2, (c, r) => { const [w, job] = at(c, LINKS, 0); return choice(r, `Does “${w}” link paragraphs by time, place or number?`, job, (['time', 'place', 'number'] as string[]).filter((x) => x !== job).map((x) => [x, `Think about what “${w}” tells the reader.`] as [string, string]), `“${w}” is an adverbial of ${job}.`) }],
      [2, (c, r) => choice(r, `Paragraph 1: ${c.actor} warmed up. Paragraph 2 starts: “___, the ${c.crowd} found their seats.”`, 'Meanwhile', [['Firstly', 'This does not show things happening at the same time.'], ['Finally', 'This would mean it is the last thing.']], '“Meanwhile” links two things happening at the same time.')],
      [3, (c) => open(`Write the first sentence of a new paragraph about ${c.event}, starting with an adverbial that links it to what happened before.`, 'Opens with a suitable cohesive adverbial (time, place or number) followed by a comma; continues the event logically; punctuated.', `Later that afternoon, ${c.actor} ${c.win}.`)],
      [3, (c) => open(`Write three short sentences giving instructions for getting ready for ${c.event}, using adverbials of number (Firstly, Next, Finally).`, 'Three sentences in order, each starting with a number/sequence adverbial and a comma; clear instructions; punctuated.', `Firstly, pack your ${c.things}. Next, check the time. Finally, head to ${c.place}.`)],
    ],
  },
  {
    id: 'EN-Y5-PU-01', year: 5, domain: 'Punctuation', text: 'Brackets, dashes and commas to show parenthesis',
    hints: ['Parenthesis is extra information added to a sentence.', 'Put a pair of brackets ( ), dashes – – or commas , , around the extra information.', 'Remove the extra part: the sentence should still make sense on its own.'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence uses brackets correctly?', `${c.actor} (the fastest on ${c.team}) ${c.move}.`, [[`${c.actor} (the fastest on ${c.team} ${c.move}.`, 'Brackets come in pairs.'], [`(${c.actor} the fastest) on ${c.team} ${c.move}.`, 'The brackets should go around the extra information only.']], 'The brackets surround the extra information.')],
      [1, (c, r) => choice(r, `What is the parenthesis in: “${c.actor} – who was very tired – ${c.win}.”?`, 'who was very tired', [[c.win, 'That is part of the main sentence.']], 'The words between the dashes are extra information.')],
      [2, (c) => typed(`Add the missing commas for parenthesis: “${c.actor} who never gives up ${c.win}.”`, `${c.actor}, who never gives up, ${c.win}.`, 'Put a comma before and after the extra information.', { exact: true })],
      [2, (c, r) => choice(r, 'Which sentence still makes sense if you remove the parenthesis?', `The ${c.thing} (a gift from ${c.actor2}) was shiny.`, [[`The (${c.thing} was a gift) from ${c.actor2}.`, 'Removing that would break the sentence.']], 'Without the brackets it reads: “The ' + c.thing + ' was shiny.”')],
      [3, (c) => open(`Add extra information in brackets to this sentence: “${cap(c.place)} was busy.”`, 'Adds a relevant piece of extra information inside a correctly placed pair of brackets; the sentence still makes sense without it.', `${cap(c.place)} (which holds thousands of ${c.crowd}) was busy.`)],
      [3, (c) => open(`Write a sentence about ${c.actor} that uses a pair of dashes for parenthesis.`, 'One sentence with a pair of dashes around extra information; the sentence makes sense without it; punctuated.', `${c.actor} – the star of ${c.team} – ${c.win}.`)],
    ],
  },
  {
    id: 'EN-Y5-PU-02', year: 5, domain: 'Punctuation', text: 'Using commas to make meaning clear',
    hints: ['A comma can change what a sentence means.', 'Use commas after fronted adverbials and subordinate clauses, between items in a list, and to separate a name being spoken to.', 'Read the sentence both ways: does a comma stop it being confusing?'],
    items: [
      [1, (c, r) => choice(r, `${c.actor} is inviting ${c.actor2} to eat. Which is correct?`, `Let’s eat, ${c.actor2}!`, [[`Let’s eat ${c.actor2}!`, 'Without the comma, it sounds like they will eat ' + c.actor2 + '!']], 'The comma shows ' + c.actor + ' is talking to ' + c.actor2 + '.')],
      [1, (c, r) => choice(r, 'Which list is punctuated correctly?', `${cap(c.actor)} packed ${c.things}, snacks, water and a map.`, [[`${cap(c.actor)} packed ${c.things} snacks water and a map.`, 'Commas separate items in a list.']], 'Commas separate the items in a list.')],
      [2, (c) => typed(`Add the comma: “When ${c.event} ended the ${c.crowd} cheered.”`, `When ${c.event} ended, the ${c.crowd} cheered.`, 'Put a comma after the opening subordinate clause.', { exact: true })],
      [2, (c, r) => choice(r, 'Which sentence means the ' + c.crowd + ' were happy?', `The ${c.crowd}, happy and loud, waved flags.`, [[`The ${c.crowd} happy and loud waved flags.`, 'Without commas, this is hard to read.']], 'The commas mark off “happy and loud” so the sentence is clear.')],
      [3, (c) => open(`Write a sentence about ${c.actor} where adding or moving a comma would change the meaning, and explain the difference.`, 'Gives a sentence in two versions (or one sentence plus explanation) showing how a comma changes meaning; explanation is accurate.', '“Let’s eat, Grandma!” means we are talking to Grandma; “Let’s eat Grandma!” means something very different.')],
      [3, (c) => open(`Write a sentence about ${c.event} that starts with a subordinate clause and uses a comma correctly.`, 'Opens with a subordinate clause (when, if, because, although…) followed by a comma and a main clause; makes sense.', `Although it was raining, ${c.actor} ${c.win}.`)],
    ],
  },
  {
    id: 'EN-Y5-WR-01', year: 5, domain: 'Writing', text: 'Writing to persuade, for a chosen audience and purpose',
    hints: ['Persuasive writing tries to make the reader agree or act.', 'Use a clear point of view, reasons with evidence, and persuasive language (Imagine…, Surely…, a rhetorical question).', 'Decide who you are writing to, then give your strongest reason first.'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence is the most persuasive?', `Surely everyone deserves a chance to see ${c.event}?`, [[`${cap(c.event)} is on Saturday.`, 'This is a fact, not persuasion.']], 'A rhetorical question with “Surely” persuades the reader.')],
      [1, (_c, r) => choice(r, 'What is the purpose of a persuasive leaflet?', 'To make the reader agree or do something', [['To tell a story', 'That is narrative writing.'], ['To explain how something works', 'That is an explanation.']], 'Persuasive writing tries to convince the reader.')],
      [2, (c) => open(`Write a rhetorical question to persuade children to join ${c.team}.`, 'A question that does not need an answer and is designed to persuade; relevant to the topic; punctuated with a question mark.', `Who wouldn’t want to be part of ${c.team}?`)],
      [2, (c) => open(`Give one reason, with a detail, why ${c.place} is worth visiting.`, 'States a clear reason and supports it with a relevant detail or example; persuasive tone; punctuated.', `${cap(c.place)} is worth visiting because you can watch ${c.event} up close with thousands of cheering ${c.crowd}.`)],
      [3, (c) => open(`Write a short persuasive paragraph (4–5 sentences) asking your headteacher for a class trip to ${c.place}.`, 'Formal enough for a headteacher; clear request; at least two reasons; persuasive devices (rhetorical question, emotive language, modal verbs); paragraph structure; punctuated.', `I am writing to ask whether our class could visit ${c.place}. The trip would help us with our topic work. Imagine how excited everyone would be! Surely it would be a day to remember. Please consider our request.`)],
      [3, (c) => open(`Write an advert (3–4 sentences) for tickets to ${c.event}.`, 'Aimed at a clear audience; persuasive language; an exciting opening; a call to action; punctuated.', `Don’t miss the biggest day of the year! Watch ${c.actor} live at ${c.place}. Tickets are going fast. Book yours today!`)],
    ],
  },
  {
    id: 'EN-Y5-WR-02', year: 5, domain: 'Writing', text: 'Using dialogue to show character and move the action on',
    hints: ['Dialogue is what characters say. It can show their personality and move the story forward.', 'Use inverted commas, a new line for each new speaker, and a reporting verb that shows how they speak.', 'Think: what does this character want right now? Let them say it.'],
    items: [
      [1, (c, r) => choice(r, `Which line of dialogue shows ${c.actor} is nervous?`, `“W-what if I mess it up?” ${c.actor} stammered.`, [[`“Let’s go,” said ${c.actor}.`, 'This does not show any feeling.']], 'The stammer and the worried question show nerves.')],
      [1, (_c, r) => choice(r, 'When a new person starts speaking, you should…', 'start a new line', [['use capital letters for every word', 'Only the first word of the speech needs a capital.'], ['leave out inverted commas', 'Inverted commas are still needed.']], 'Each new speaker starts on a new line.')],
      [2, (c) => open(`Write one line of dialogue that shows ${c.actor} is confident.`, 'Speech in inverted commas that shows confidence through the words and/or the reporting verb; correctly punctuated.', `“Watch this,” ${c.actor} grinned. “I’ve got it.”`)],
      [2, (c) => open(`Write one line of dialogue from ${c.speaker} that tells everyone what happens next.`, 'Speech that moves the action forward (an instruction, news or a decision); correctly punctuated with a reporting clause.', `“Everyone to ${c.place} now – ${c.event} starts in five minutes!” called ${c.speaker}.`)],
      [3, (c) => open(`Write a short conversation (3–4 lines) between ${c.actor} and ${c.actor2} just before ${c.event}.`, 'Two speakers; new line for each speaker; inverted commas and punctuation correct; dialogue shows character and moves action on; varied reporting verbs.', `“Are you ready?” whispered ${c.actor2}.\n“I think so,” ${c.actor} replied, taking a deep breath.\n“Then let’s go!”`)],
      [3, (c) => open(`Rewrite this as dialogue: ${c.actor} told ${c.actor2} that ${c.he} had lost the ${c.thing}.`, 'Turns reported speech into direct speech with inverted commas; correct punctuation and pronouns; makes sense.', `“I’ve lost the ${c.thing}!” ${c.actor} told ${c.actor2}.`)],
    ],
  },
]
