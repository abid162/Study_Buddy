import type { EnStatement } from './types'
import { at, choice, open, spell, typed } from './build'
import { cap } from './skins'
import { WORDS_Y34 } from './words'

/** Year 4 English: spelling (Appendix 1, Years 3–4), grammar and punctuation (Appendix 2, Year 4), writing. */

const NEG: [root: string, prefix: string][] = [
  ['appear', 'dis'], ['agree', 'dis'], ['obey', 'dis'], ['behave', 'mis'], ['possible', 'im'], ['patient', 'im'], ['polite', 'im'],
  ['legal', 'il'], ['legible', 'il'], ['regular', 'ir'], ['responsible', 'ir'], ['active', 'in'], ['correct', 'in'], ['visible', 'in'],
  ['happy', 'un'], ['kind', 'un'], ['fair', 'un'],
]
const NEG_SET = ['un', 'dis', 'in', 'im', 'il', 'ir', 'mis']
const OTHER: [word: string, meaning: string, wrong: string[]][] = [
  ['submarine', 'a boat that travels under the sea', ['intermarine', 'automarine', 'antimarine']],
  ['international', 'between different nations', ['subnational', 'supernational', 'autonational']],
  ['supermarket', 'a very large shop', ['submarket', 'intermarket', 'antimarket']],
  ['anticlockwise', 'turning the opposite way to a clock’s hands', ['subclockwise', 'autoclockwise', 'interclockwise']],
  ['autograph', 'a famous person’s own signature', ['subgraph', 'antigraph', 'supergraph']],
  ['refill', 'to fill something again', ['subfill', 'antifill', 'interfill']],
  ['superstar', 'a very famous performer', ['substar', 'interstar', 'antistar']],
  ['subheading', 'a smaller heading under a main heading', ['superheading', 'autoheading', 'antiheading']],
]
const TRICKY_PRE: string[][] = [
  ['irregular', 'iregular', 'inregular', 'unregular'], ['illegal', 'ilegal', 'inlegal', 'unlegal'], ['impossible', 'imposible', 'inpossible', 'unpossible'],
  ['disappear', 'dissappear', 'disapear', 'misappear'], ['misbehave', 'missbehave', 'disbehave', 'unbehave'], ['irresponsible', 'iresponsible', 'inresponsible', 'irresponsable'],
]

const ATION: [verb: string, noun: string, wrong: string][] = [
  ['inform', 'information', 'informtion'], ['adore', 'adoration', 'adoreation'], ['admire', 'admiration', 'admireation'], ['prepare', 'preparation', 'prepareation'],
  ['sense', 'sensation', 'senseation'], ['explore', 'exploration', 'exploreation'], ['celebrate', 'celebration', 'celebrateation'], ['create', 'creation', 'createation'],
]
const LY: [adj: string, adv: string, wrong: string][] = [
  ['sad', 'sadly', 'sadley'], ['happy', 'happily', 'happyly'], ['gentle', 'gently', 'gentlely'], ['basic', 'basically', 'basicly'],
  ['angry', 'angrily', 'angryly'], ['complete', 'completely', 'completly'], ['simple', 'simply', 'simplely'], ['frantic', 'frantically', 'franticly'],
]
const OUS: [root: string, adj: string, wrong: string][] = [
  ['danger', 'dangerous', 'dangerus'], ['fame', 'famous', 'fameous'], ['poison', 'poisonous', 'poisonus'], ['mountain', 'mountainous', 'mountainus'],
  ['humour', 'humorous', 'humourous'], ['glamour', 'glamorous', 'glamourous'], ['courage', 'courageous', 'couragous'], ['vary', 'various', 'varyous'],
]

const ENDINGS: [word: string, wrong: string[], rule: string][] = [
  ['treasure', ['treasher', 'treazure'], '“-sure” sounds like “zhuh” in treasure, measure and pleasure.'],
  ['measure', ['measher', 'meazure'], '“-sure” sounds like “zhuh” in treasure, measure and pleasure.'],
  ['adventure', ['adventcher', 'adventsure'], '“-ture” sounds like “cher” in adventure, picture and creature.'],
  ['creature', ['creacher', 'creatcher'], '“-ture” sounds like “cher” in adventure, picture and creature.'],
  ['television', ['televishon', 'televition'], '“-sion” is used when the root word ends in “-se” or “-de”, or for the “zhun” sound: televise → television.'],
  ['invention', ['invension', 'inventtion'], '“-tion” is the most common ending: invent → invention.'],
  ['expression', ['expretion', 'expresion'], '“-ssion” is used when the root word ends in “-ss”: express → expression.'],
  ['musician', ['musition', 'musisian'], '“-cian” is used when the root word ends in “-c” or “-cs”: music → musician.'],
  ['magician', ['magition', 'magishun'], '“-cian” is used when the root word ends in “-c”: magic → magician.'],
  ['discussion', ['discution', 'discusion'], '“-ssion” is used when the root word ends in “-ss”: discuss → discussion.'],
]

const UNUSUAL: [word: string, wrong: string[], rule: string][] = [
  ['gym', ['jim', 'gim'], 'In some words “y” makes a short “i” sound: gym, myth, pyramid.'],
  ['myth', ['mith', 'mythe'], 'In some words “y” makes a short “i” sound: gym, myth, pyramid.'],
  ['young', ['yung', 'yong'], 'In some words “ou” makes a short “u” sound: young, touch, double.'],
  ['touch', ['tuch', 'tutch'], 'In some words “ou” makes a short “u” sound: young, touch, double.'],
  ['chorus', ['corus', 'korus'], 'In some words from Greek, “ch” makes a “k” sound: chorus, school, echo.'],
  ['echo', ['ecko', 'eko'], 'In some words from Greek, “ch” makes a “k” sound: chorus, school, echo.'],
  ['chef', ['shef', 'sheff'], 'In some words from French, “ch” makes a “sh” sound: chef, machine, brochure.'],
  ['league', ['leeg', 'leag'], 'Some words end in “-gue” for a “g” sound: league, tongue, catalogue.'],
  ['unique', ['uneek', 'unick'], 'Some words end in “-que” for a “k” sound: unique, antique, cheque.'],
  ['science', ['sience', 'syence'], 'In some words “sc” makes an “s” sound: science, scene, scissors.'],
  ['eight', ['ate', 'eyt'], '“eigh” can make an “ay” sound: eight, weigh, neighbour.'],
  ['they', ['thay', 'thei'], '“ey” can make an “ay” sound: they, obey, grey.'],
]

const HOMO2: [sentence: string, right: string, wrong: string, note: string][] = [
  ['I can ___ the {crowd} cheering.', 'hear', 'here', '“hear” has “ear” in it: you hear with your ear. “here” means this place.'],
  ['Please ___ me at the gate after {event}.', 'meet', 'meat', '“meet” means to get together; “meat” is food.'],
  ['The bus driver pressed the ___ to stop.', 'brake', 'break', 'A “brake” slows a vehicle down; to “break” is to smash or have a rest.'],
  ['Let’s check the ___ before we go outside.', 'weather', 'whether', '“weather” is sun, rain and wind; “whether” means if.'],
  ['{actor} won a gold ___ for {his} hard work.', 'medal', 'meddle', 'A “medal” is a prize; to “meddle” is to interfere.'],
  ['The ticket ___ was two pounds.', 'fare', 'fair', 'A “fare” is the price of a journey; “fair” means just, or a funfair.'],
  ['The king’s ___ lasted forty years.', 'reign', 'rain', 'A king or queen’s “reign” is their time in charge; “rain” falls from clouds.'],
  ['{actor} ___ the bus and had to walk to {place}.', 'missed', 'mist', '“missed” is the past of miss; “mist” is a thin cloud near the ground.'],
  ['We sat in ___ and quiet after {event}.', 'peace', 'piece', '“peace” means calm; a “piece” is a part of something (a piece of pie).'],
  ['___ bag is this? It has a name tag.', 'Whose', 'Who’s', '“Whose” asks who owns something; “Who’s” is short for “who is”.'],
  ['I ___ that the answer was wrong.', 'knew', 'new', '“knew” is the past of know; “new” means not old.'],
  ['The plants have ___ very tall.', 'grown', 'groan', '“grown” is from grow; a “groan” is a low, unhappy sound.'],
]

const STD: [wrong: string, right: string, why: string][] = [
  ['We was late for {event}.', 'We were late for {event}.', 'With “we”, use “were”, not “was”.'],
  ['{actor} done really well today.', '{actor} did really well today.', 'In Standard English it is “did”, or “has done”, not just “done”.'],
  ['They was cheering for {team}.', 'They were cheering for {team}.', 'With “they”, use “were”.'],
  ['I seen the {thing} by the door.', 'I saw the {thing} by the door.', 'Use “saw”, or “have seen”, not “seen” on its own.'],
  ['The {crowd} is going home now, ain’t they?', 'The {crowd} are going home now, aren’t they?', '“ain’t” is not Standard English; use “aren’t”.'],
  ['You was brilliant at {event}!', 'You were brilliant at {event}!', 'With “you”, use “were”.'],
  ['{actor} come here yesterday.', '{actor} came here yesterday.', 'For the past, “come” changes to “came”.'],
  ['We never had no time left.', 'We had no time left.', 'Two negatives (never, no) cancel out. Use just one.'],
]

const NOUNS: [noun: string, adj: string[], prep: string][] = [
  ['dog', ['scruffy', 'brown'], 'with a waggy tail'], ['castle', ['ancient', 'grey'], 'on the hill'], ['cake', ['sticky', 'chocolate'], 'on the plate'],
  ['ship', ['enormous', 'rusty'], 'in the harbour'], ['tree', ['tall', 'twisted'], 'by the river'], ['robot', ['shiny', 'silver'], 'with flashing eyes'],
  ['owl', ['wise', 'old'], 'in the barn'], ['dragon', ['fierce', 'green'], 'under the mountain'],
]

const ADVERBIALS = ['Before the start', 'As the lights went down', 'Later that day', 'Without a sound', 'At the very last second', 'In the morning', 'With a huge cheer', 'After a long wait']

const fill = (s: string, c: { thing: string; event: string; actor: string; his: string; crowd: string; team: string; place: string }) =>
  s.replace(/\{thing\}/g, c.thing).replace(/\{event\}/g, c.event).replace(/\{actor\}/g, c.actor).replace(/\{his\}/g, c.his).replace(/\{crowd\}/g, c.crowd).replace(/\{team\}/g, c.team).replace(/\{place\}/g, c.place)

export const Y4_ENGLISH: EnStatement[] = [
  {
    id: 'EN-Y4-SP-01', year: 4, domain: 'Spelling', text: 'Prefixes: un-, dis-, mis-, in-, il-, im-, ir-, re-, sub-, inter-, super-, anti-, auto-',
    hints: ['A prefix goes at the start of a word and changes what it means.', 'il- goes before words starting with l, im- before m or p, ir- before r. un-, dis-, in- and mis- often mean “not” or “wrongly”.', 'Keep the root word exactly as it is and add the prefix in front: dis + appear = disappear (one s, two p’s).'],
    items: [
      [1, (c, r) => { const [root, p] = at(c, NEG, 0); return choice(r, `Which prefix makes the opposite of “${root}”?`, p, NEG_SET.filter((x) => x !== p).slice(0, 3).map((x) => [x, `“${x}${root}” is not a word. Try another prefix.`] as [string, string]), `${p} + ${root} = ${p}${root}.`) }],
      [1, (c) => { const [root, p] = at(c, NEG, 5); return typed(`${c.actor} needs the opposite of “${root}”. Add the right prefix and type the new word.`, `${p}${root}`, `${p} + ${root} = ${p}${root}.`) }],
      [2, (c, r) => { const [w, m, wrong] = at(c, OTHER, 0); return choice(r, `Which word means “${m}”?`, w, wrong, `${w}: the prefix changes the meaning of the root word.`) }],
      [2, (c) => { const [w, m] = at(c, OTHER, 3); return typed(`Type the word that means “${m}”. It starts with one of these prefixes: sub-, inter-, super-, anti-, auto-, re-.`, w, `The word is “${w}”.`) }],
      [3, (c, r) => { const [ok, ...bad] = at(c, TRICKY_PRE, 0); return choice(r, `${c.actor} is checking a sign for ${c.place}. Which spelling is correct?`, ok, bad, `“${ok}” keeps the root word whole and adds the prefix in front.`) }],
      [3, (c) => open(`Write one sentence about ${c.event} that uses a word starting with dis-, mis-, un-, im- or ir-.`, 'One sentence that makes sense; includes a real word with one of the prefixes dis-, mis-, un-, im- or ir-, spelled correctly; capital letter and full stop.', `${c.actor} was unhappy when the ${c.thing} went missing before ${c.event}.`)],
    ],
  },
  {
    id: 'EN-Y4-SP-02', year: 4, domain: 'Spelling', text: 'Suffixes: -ation, -ly (and -ally) and -ous',
    hints: ['A suffix goes at the end of a word: inform + ation, sad + ly, fame + ous.', 'If the root ends in “e”, drop the e before -ation or -ous. If it ends in “y”, change y to i before -ly. Words ending in -ic take -ally.', 'Say the root word, check its last letter, then apply the rule before adding the suffix.'],
    items: [
      [1, (c, r) => { const [v, n, w] = at(c, ATION, 0); return choice(r, `Add -ation to “${v}”. Which spelling is right?`, n, [[w, v.endsWith('e') ? 'Drop the “e” at the end before adding -ation.' : 'Check the letters: just add -ation to the root.'], `${v}ions`], `${v} → ${n}.`) }],
      [1, (c) => { const [a, adv] = at(c, LY, 0); return typed(`${c.actor} moved in a ${a} way. Turn “${a}” into an adverb ending in -ly.`, adv, `${a} → ${adv}.`) }],
      [2, (c, r) => { const [a, adv, w] = at(c, LY, 3); return choice(r, `Which is the correct -ly spelling of “${a}”?`, adv, [[w, a.endsWith('y') ? 'Change the y to i before adding -ly.' : a.endsWith('le') ? 'For words ending in -le, change the -le to -ly.' : a.endsWith('ic') ? 'Words ending in -ic add -ally.' : 'Keep the whole root word, then add -ly.']], `${a} → ${adv}.`) }],
      [2, (c) => { const [root, adj] = at(c, OUS, 0); return typed(`Add -ous to “${root}” to make an adjective. Type it.`, adj, `${root} → ${adj}.`) }],
      [3, (c, r) => { const [root, adj, w] = at(c, OUS, 4); return choice(r, `${cap(c.speaker)} wants the -ous word from “${root}”. Which spelling is correct?`, adj, [[w, 'Look again: some roots change before -ous (humour → humorous, courage → courageous).']], `${root} → ${adj}.`) }],
      [3, (c) => open(`Write a sentence about ${c.event} that uses one word ending in -ly and one ending in -ous.`, 'One sentence that makes sense; one correctly spelled -ly adverb and one correctly spelled -ous adjective; capital letter and full stop.', `${c.actor} bravely faced the dangerous final moments of ${c.event}.`)],
    ],
  },
  {
    id: 'EN-Y4-SP-03', year: 4, domain: 'Spelling', text: 'Endings that sound alike: -sure, -ture, -tion, -sion, -ssion, -cian',
    hints: ['These endings sound similar, so look at the root word for clues.', '-ture sounds like “cher”, -sure like “zhuh”. -ssion if the root ends in -ss, -cian if it ends in -c, -tion is the most common.', 'Find the root (express, music, invent), then pick the ending that fits it.'],
    items: [0, 2, 4, 6, 8, 1].map((k, i) => [(i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3, (c, r) => {
      const [w, wrong, rule] = at(c, ENDINGS, k)
      return i % 2 === 0
        ? choice(r, `Which spelling is correct?`, w, wrong.map((x) => [x, rule] as [string, string]), rule)
        : typed(`Type the correct spelling. It sounds like “${wrong[0]}”.`, w, rule)
    }]),
  },
  {
    id: 'EN-Y4-SP-04', year: 4, domain: 'Spelling', text: 'Unusual spellings: y as /i/, ou as /u/, ch as /k/ and /sh/, -gue, -que, sc, ei/eigh/ey',
    hints: ['These words do not sound the way they are spelled. Picture the word in your head.', 'y can sound like i (gym), ou like u (young), ch like k (chorus) or sh (chef), -gue like g, -que like k, sc like s.', 'Say the word slowly, then think about which tricky letters it uses.'],
    items: [0, 3, 5, 7, 9, 11].map((k, i) => [(i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3, (c, r) => {
      const [w, wrong, rule] = at(c, UNUSUAL, k)
      return i % 2 === 0
        ? choice(r, `${c.actor} wrote a word three ways. Which spelling is correct?`, w, wrong.map((x) => [x, rule] as [string, string]), rule)
        : typed(`It sounds like “${wrong[0]}” but is spelled differently. Type the correct spelling.`, w, rule)
    }]),
  },
  {
    id: 'EN-Y4-SP-05', year: 4, domain: 'Spelling', text: 'Homophones and near-homophones',
    hints: ['Homophones sound the same but have different spellings and meanings.', 'Read the whole sentence and work out the meaning you need.', 'Try each word in the gap and ask: which meaning makes sense here?'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [(i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3, (c, r) => {
      const [s, right, wrong, note] = at(c, HOMO2, k)
      return choice(r, 'Which word fits the gap?', right, [[wrong, note]], note, fill(s, c))
    }]),
  },
  {
    id: 'EN-Y4-SP-06', year: 4, domain: 'Spelling', text: 'Words from the Years 3–4 statutory word list', chunk: 10,
    hints: ['Listen to Nova say the word, then picture it.', 'Split it into syllables and spell each part: ex-per-i-ment.', 'Check the tricky part: double letters, silent letters or unusual vowel sounds.'],
    items: WORDS_Y34.map(([w, s], i) => [((i % 10) < 4 ? 1 : (i % 10) < 7 ? 2 : 3) as 1 | 2 | 3, () => spell(w, s)]),
  },
  {
    id: 'EN-Y4-GR-01', year: 4, domain: 'Grammar', text: 'Plural -s and possessive -s, including apostrophes for plural possession',
    hints: ['A plural just means more than one: fans. A possessive shows who owns something: the fan’s scarf.', 'One owner: apostrophe before the s (the girl’s). Several owners ending in s: apostrophe after the s (the girls’). Irregular plurals: children’s.', 'Ask: is it more than one, or does it own something? How many owners are there?'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence uses an apostrophe correctly?', `${c.actor}’s ${c.thing} is new.`, [[`${c.actor}s ${c.thing} is new.`, 'The thing belongs to one person, so it needs ’s.'], [`The ${c.thing}’s are new.`, 'This is just a plural (more than one), so no apostrophe.']], `The ${c.thing} belongs to ${c.actor}, so we write ${c.actor}’s.`)],
      [1, (c, r) => choice(r, `Is the word in capitals a plural or a possessive? “The ${c.crowd.toUpperCase()} cheered.”`, 'plural', [['possessive', 'Nothing is owned here; it just means more than one.']], `“${c.crowd}” just means more than one, so it is a plural with no apostrophe.`)],
      [2, (_c, r) => choice(r, `Several players share one changing room. Which is correct?`, 'the players’ changing room', [['the player’s changing room', 'That means only one player owns it.'], ['the players changing room', 'Something is owned, so it needs an apostrophe.']], 'More than one owner ending in s: put the apostrophe after the s.')],
      [2, (_c, r) => choice(r, 'Which is correct?', 'the children’s tickets', [['the childrens’ tickets', '“children” is already plural, so add ’s.'], ['the childrens tickets', 'The tickets belong to the children, so an apostrophe is needed.']], '“children” is an irregular plural: add ’s → children’s.')],
      [3, (c) => typed(`Rewrite with an apostrophe: “the ${c.things} of the ${c.crowd}”.`, [`the ${c.crowd}’ ${c.things}`, `the ${c.crowd}' ${c.things}`], `More than one owner ending in s: the ${c.crowd}’ ${c.things}.`, { exact: true })],
      [3, (c) => open(`Write a sentence about ${c.event} with one plural and one possessive word.`, 'One sentence that makes sense; includes a plural noun without an apostrophe and a possessive noun with a correctly placed apostrophe; capital letter and full stop.', `The ${c.crowd} waved ${c.actor}’s flag after ${c.event}.`)],
    ],
  },
  {
    id: 'EN-Y4-GR-02', year: 4, domain: 'Grammar', text: 'Standard English verb forms (we were, not we was; I did, not I done)',
    hints: ['Standard English is the formal English used in writing.', 'Check the verb matches its subject: I was, we were, you were, they were. Past tense: did, saw, came.', 'Read it aloud as if you were reading the news. Which version sounds formal and correct?'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [(i < 2 ? 1 : i < 4 ? 2 : 3) as 1 | 2 | 3, (c, r) => {
      const [w, ok, why] = at(c, STD, k)
      return i < 4
        ? choice(r, 'Which sentence is written in Standard English?', fill(ok, c), [[fill(w, c), why]], why)
        : typed(`Rewrite this in Standard English: “${fill(w, c)}”`, fill(ok, c), why)
    }]),
  },
  {
    id: 'EN-Y4-GR-03', year: 4, domain: 'Grammar', text: 'Expanded noun phrases with adjectives, nouns and prepositional phrases',
    hints: ['A noun phrase is a group of words built around a noun: the dog.', 'Expand it with adjectives before the noun (the scruffy brown dog) and a prepositional phrase after it (with a waggy tail).', 'Ask: what does it look like? Where is it? Add those words around the noun.'],
    items: [
      [1, (c, r) => { const [n, [a1, a2], p] = at(c, NOUNS, 0); return choice(r, 'Which is an expanded noun phrase?', `the ${a1} ${a2} ${n} ${p}`, [[`the ${n}`, 'That is a noun phrase, but it has not been expanded.'], [`${n} ran`, 'That is a clause with a verb, not a noun phrase.']], `Adjectives (${a1}, ${a2}) and a prepositional phrase (${p}) expand the noun “${n}”.`) }],
      [1, (c, r) => { const [n, [a1], p] = at(c, NOUNS, 2); return choice(r, `In “the ${a1} ${n} ${p}”, which part is the prepositional phrase?`, p, [[a1, 'That is an adjective; it comes before the noun.'], [n, 'That is the noun itself.']], `“${p}” starts with a preposition and tells us more about the ${n}.`) }],
      [2, (c) => { const [n] = at(c, NOUNS, 4); return open(`Expand the noun phrase “the ${n}” with two adjectives and a prepositional phrase.`, `An expanded noun phrase built on “${n}”: two suitable adjectives before the noun and a prepositional phrase after it. A full sentence is not needed.`, (() => { const [, [a1, a2], p] = at(c, NOUNS, 4); return `the ${a1} ${a2} ${n} ${p}` })()) }],
      [2, (c, r) => choice(r, `Which noun phrase gives the most detail about the ${c.thing}?`, `the lucky ${c.thing} in ${c.actor}’s bag`, [[`a ${c.thing}`, 'This gives no detail.'], [`the ${c.thing}`, 'This gives no detail.']], 'An adjective (lucky) and a prepositional phrase (in the bag) add detail.')],
      [3, (c) => open(`Describe ${c.place} using one expanded noun phrase in a full sentence.`, 'A full sentence with an expanded noun phrase (adjectives before the noun and/or a prepositional phrase after it); makes sense; capital letter and full stop.', `The noisy ${c.crowd} in the front row waved their bright flags.`)],
      [3, (c) => open(`Improve this sentence with expanded noun phrases: “The ${c.thing} was on the table.”`, 'Rewrites the sentence keeping its meaning, adding adjectives and/or prepositional phrases to the nouns; correct punctuation.', `The battered old ${c.thing} with a broken strap was on the wooden table by the door.`)],
    ],
  },
  {
    id: 'EN-Y4-GR-04', year: 4, domain: 'Grammar', text: 'Fronted adverbials, followed by a comma',
    hints: ['A fronted adverbial comes at the start of a sentence and says when, where or how.', 'After a fronted adverbial, put a comma before the rest of the sentence.', 'Find the words that tell when, where or how, move them to the front, then add the comma.'],
    items: [
      [1, (c, r) => { const a = at(c, ADVERBIALS, 0); return choice(r, 'Which sentence uses a fronted adverbial correctly?', `${a}, ${c.actor} ${c.move}.`, [[`${a} ${c.actor} ${c.move}.`, 'A comma is needed after the fronted adverbial.'], [`${c.actor} ${c.move}, ${a.toLowerCase()}.`, 'The adverbial is at the end here, not at the front.']], `“${a}” comes first and is followed by a comma.`) }],
      [1, (c, r) => { const a = at(c, ADVERBIALS, 1); return choice(r, `What is the fronted adverbial in “${a}, ${c.actor} ${c.win}.”?`, a, [[c.actor, 'That is who did it (the subject).'], [c.win, 'That is what happened.']], `“${a}” tells us when or how, and it comes at the front.`) }],
      [2, (c) => { const a = at(c, ADVERBIALS, 2); return typed(`Add the missing comma: “${a} the ${c.crowd} cheered.”`, `${a}, the ${c.crowd} cheered.`, 'The comma goes straight after the fronted adverbial.', { exact: true }) }],
      [2, (c) => typed(`Move the adverbial to the front and add a comma: “${c.actor} ${c.move} after a long wait.”`, `After a long wait, ${c.actor} ${c.move}.`, '“After a long wait” moves to the front and is followed by a comma.', { exact: true })],
      [3, (c) => open(`Write a sentence about ${c.event} that starts with a fronted adverbial.`, 'Starts with an adverbial (when, where or how) followed by a comma; the rest is a complete clause; makes sense; full stop.', `Just before ${c.event} began, ${c.actor} took a deep breath.`)],
      [3, (c) => open(`Write two sentences about ${c.team}, each starting with a different fronted adverbial.`, 'Two sentences; each begins with a different fronted adverbial followed by a comma; both make sense and are correctly punctuated.', `In the morning, ${c.team} warmed up. Later that day, they celebrated together.`)],
    ],
  },
  {
    id: 'EN-Y4-GR-05', year: 4, domain: 'Grammar', text: 'Choosing nouns or pronouns for clarity and to avoid repetition',
    hints: ['Pronouns (he, she, it, they) replace nouns so we do not repeat them.', 'Use the noun first so the reader knows who you mean, then switch to a pronoun.', 'If two people could be “he” or “she”, use a name again so it stays clear.'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence avoids repeating the name?', `${c.actor} grabbed the ${c.thing} and ${c.he} ran.`, [[`${c.actor} grabbed the ${c.thing} and ${c.actor} ran.`, 'The name is repeated. A pronoun would read better.']], `Using “${c.he}” avoids repeating ${c.actor}.`)],
      [1, (c, r) => choice(r, `Which pronoun can replace “the ${c.crowd}”?`, 'they', [['it', '“it” is for one thing, not a group of people.'], ['he', '“he” is for one person.']], `“The ${c.crowd}” is a group of people, so we use “they”.`)],
      [2, (c, r) => choice(r, `“${c.actor} and ${c.actor2} met. ${cap(c.he)} was excited.” Why is this unclear?`, 'We cannot tell who was excited.', [['It has no capital letter.', 'The capital letters are fine.'], ['The pronoun is plural.', 'The pronoun is singular; the problem is that it could mean either person.']], 'With two people, a pronoun can be unclear. Use the name to make it clear.')],
      [2, (c) => typed(`Replace the repeated noun with a pronoun: “The ${c.thing} was old, so the ${c.thing} was replaced.”`, [`The ${c.thing} was old, so it was replaced.`], '“it” replaces the second “the ' + c.thing + '”.', { exact: false })],
      [3, (c) => open(`Rewrite to make it clear and less repetitive: “${c.actor} saw ${c.actor2}. ${c.actor} waved to ${c.actor2} and ${c.actor2} waved back.”`, 'Keeps the meaning; uses pronouns to cut repetition while staying clear about who does what; correct punctuation.', `${c.actor} saw ${c.actor2} and waved. ${c.actor2} waved back.`)],
      [3, (c) => open(`Write two sentences about ${c.actor} at ${c.place}, using a pronoun in the second sentence.`, 'Two sentences; names the person in the first and uses a suitable pronoun in the second; clear and punctuated.', `${c.actor} arrived early at ${c.place}. ${cap(c.he)} wanted to warm up before everyone else.`)],
    ],
  },
  {
    id: 'EN-Y4-GR-06', year: 4, domain: 'Grammar', text: 'Word classes: determiners, pronouns, possessive pronouns and adverbials',
    hints: ['Each word in a sentence has a job: noun, verb, adjective, determiner, pronoun…', 'Determiners come before nouns (a, an, the, some, my). Possessive pronouns show ownership on their own (mine, yours, his, hers, ours, theirs).', 'Cover the word and ask what job it does in the sentence.'],
    items: [
      [1, (c, r) => choice(r, `Which word is a determiner? “${c.actor} lifted the ${c.thing}.”`, 'the', [[c.actor, 'That is a proper noun (a name).'], ['lifted', 'That is a verb.']], '“the” comes before a noun and tells us which one: it is a determiner.')],
      [1, (_c, r) => choice(r, 'Which determiner fits? “It was ___ amazing game.”', 'an', [['a', 'Use “an” before a vowel sound: an amazing.']], 'Use “an” before a word starting with a vowel sound.')],
      [2, (c, r) => choice(r, `Which word is a possessive pronoun? “That ${c.thing} is mine.”`, 'mine', [['That', 'Here “That” is a determiner.'], ['is', 'That is a verb.']], '“mine” shows ownership and stands on its own: a possessive pronoun.')],
      [2, (_c, r) => choice(r, 'Which word is an adverb? “The crowd cheered loudly.”', 'loudly', [['crowd', 'That is a noun.'], ['cheered', 'That is a verb.']], '“loudly” tells us how they cheered: an adverb.')],
      [3, (c) => typed(`Replace the words in capitals with a possessive pronoun: “That ${c.thing} belongs to ME.” → “That ${c.thing} is ___.”`, ['mine'], '“mine” is the possessive pronoun for “me”.')],
      [3, (c) => open(`Write a sentence about ${c.event} that uses a determiner, a possessive pronoun and an adverb.`, 'One sentence that makes sense containing at least one determiner, one possessive pronoun (mine, yours, his, hers, ours, theirs) and one adverb; punctuated.', `“The ${c.thing} is ours,” ${c.actor} said proudly.`)],
    ],
  },
  {
    id: 'EN-Y4-PU-01', year: 4, domain: 'Punctuation', text: 'Inverted commas and other punctuation for direct speech',
    hints: ['Inverted commas (speech marks) go around the exact words someone says.', 'The punctuation that ends the spoken words goes inside the closing inverted commas. Start the speech with a capital letter.', 'Find the spoken words, wrap them in “ ”, put the comma, ? or ! inside, then add who said it.'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence is punctuated correctly?', `“We can do this!” shouted ${c.actor}.`, [[`“We can do this! shouted ${c.actor}.”`, 'Only the spoken words go inside the inverted commas.'], [`“We can do this”! shouted ${c.actor}.`, 'The exclamation mark belongs inside the inverted commas.']], 'The spoken words and their exclamation mark go inside the inverted commas.')],
      [1, (c, r) => choice(r, `Which words are spoken? ${c.actor} said, “Follow me to ${c.place}.”`, `Follow me to ${c.place}.`, [[`${c.actor} said`, 'That tells us who spoke, but it is not spoken.']], 'The spoken words are inside the inverted commas.')],
      [2, (c, r) => choice(r, 'Where does the comma go?', `“I’m ready,” said ${c.actor}.`, [[`“I’m ready”, said ${c.actor}.`, 'The comma goes inside the closing inverted commas.'], [`“I’m ready” said, ${c.actor}.`, 'The comma goes at the end of the spoken words, inside the inverted commas.']], 'When speech comes first, the comma goes inside the closing inverted commas.')],
      [2, (c) => typed(`Add inverted commas: ${cap(c.speaker)} said, Get ready for ${c.event}.`, [`${cap(c.speaker)} said, “Get ready for ${c.event}.”`, `${cap(c.speaker)} said, "Get ready for ${c.event}."`], 'The spoken words and the full stop go inside the inverted commas.', { exact: true })],
      [3, (c) => typed(`Punctuate: where is my ${c.thing} asked ${c.actor}`, [`“Where is my ${c.thing}?” asked ${c.actor}.`, `"Where is my ${c.thing}?" asked ${c.actor}.`], 'Capital W, a question mark inside the inverted commas, and a full stop at the end.', { exact: true })],
      [3, (c) => open(`Write a line of speech for ${c.actor} at ${c.event}, saying who spoke.`, 'Uses inverted commas around the spoken words; correct punctuation inside the closing inverted commas; a reporting clause (said, shouted, whispered…); capital letters and end punctuation.', `“That was the best day ever!” ${c.actor} shouted.`)],
    ],
  },
  {
    id: 'EN-Y4-WR-01', year: 4, domain: 'Writing', text: 'Organise writing into paragraphs around a theme',
    hints: ['A paragraph is a group of sentences about one idea.', 'Start a new paragraph when the time, place, topic or speaker changes.', 'Plan: what is this paragraph about? Write a first sentence that says so, then add details.'],
    items: [
      [1, (_c, r) => choice(r, 'When should you start a new paragraph?', 'When the time, place or topic changes', [['After every sentence', 'Paragraphs group several sentences about one idea.'], ['Only at the very end', 'Paragraphs organise writing all the way through.']], 'A new paragraph shows a change of time, place, topic or speaker.')],
      [1, (c, r) => choice(r, `Which sentence would start a paragraph about the ${c.crowd}?`, `The ${c.crowd} had been waiting since early morning.`, [[`${c.actor} tied ${c.his} laces.`, 'This is about one person, not the crowd.']], 'A good opening sentence tells the reader what the paragraph is about.')],
      [2, (c, r) => choice(r, `A report about ${c.event} has paragraphs: Before, During, After. Where does “Everyone went home tired but happy” go?`, 'After', [['Before', 'This happened at the end.'], ['During', 'This happened once it was over.']], 'It describes the end, so it goes in the After paragraph.')],
      [2, (c) => open(`Write a topic sentence (the first sentence of a paragraph) about ${c.place}.`, 'One sentence that clearly introduces a paragraph topic about the given place; makes sense; punctuated.', `${cap(c.place)} was the busiest place in town that day.`)],
      [3, (c) => open(`Write a short paragraph (3–4 sentences) about getting ready for ${c.event}.`, 'A paragraph of 3–4 sentences on one theme (getting ready); a clear opening sentence; details that stay on topic; correct punctuation; Year 4 vocabulary.', `Getting ready for ${c.event} took all morning. ${c.actor} packed ${c.his} ${c.things} and checked the time twice. Everyone else was nervous too. By lunchtime, the team was ready.`)],
      [3, (c) => open(`Write two short paragraphs: one about before ${c.event} and one about after it.`, 'Two paragraphs, each on its own theme (before / after); the change of paragraph matches the change of time; each makes sense and is punctuated.', `Before ${c.event}, the ${c.crowd} queued outside. Everyone was excited.\n\nAfter ${c.event}, ${c.actor} waved goodbye. It had been a great day.`)],
    ],
  },
  {
    id: 'EN-Y4-WR-02', year: 4, domain: 'Writing', text: 'Describe settings, characters and events using precise vocabulary',
    hints: ['Good description helps the reader picture the scene.', 'Use your senses: what can you see, hear, smell and feel? Choose precise words (whispered, not said).', 'Pick one thing to describe, then add a sense detail and a strong verb.'],
    items: [
      [1, (_c, r) => choice(r, `Which word is the most precise way to say “said quietly”?`, 'whispered', [['said', 'This does not tell us how it was said.'], ['shouted', 'That means said loudly.']], '“whispered” tells us exactly how it was said.')],
      [1, (c, r) => choice(r, `Which sentence uses a sense to describe ${c.place}?`, `The roar of the ${c.crowd} filled ${c.place}.`, [[`${c.actor} went to ${c.place}.`, 'This tells us what happened but not what it was like.']], 'Hearing the roar helps the reader imagine the place.')],
      [2, (c, r) => choice(r, 'Which verb is most powerful?', `${c.actor} sprinted to the finish.`, [[`${c.actor} went to the finish.`, '“went” is a weak, general verb.'], [`${c.actor} got to the finish.`, '“got” does not show how.']], '“sprinted” shows exactly how the character moved.')],
      [2, (c) => open(`Write one sentence describing what ${c.place} sounds like.`, 'One sentence focused on sound, with precise vocabulary; makes sense; punctuated.', `Drums thudded and the ${c.crowd} chanted until ${c.place} shook.`)],
      [3, (c) => open(`Describe ${c.actor} just before ${c.event} in 2–3 sentences, showing how ${c.he} feels without naming the feeling.`, '2–3 sentences; shows feelings through actions, body language or speech rather than naming them; precise vocabulary; punctuated.', `${c.actor}’s hands trembled as ${c.he} tied ${c.his} laces. ${cap(c.he)} kept glancing at the clock.`)],
      [3, (c) => open(`Describe ${c.place} using at least two senses (3 sentences).`, 'Three sentences; at least two different senses; precise vocabulary and varied sentence starts; punctuated.', `Bright lights blazed above ${c.place}. The air smelled of popcorn, and the ${c.crowd} roared like thunder.`)],
    ],
  },
]
