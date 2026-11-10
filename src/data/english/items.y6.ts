import type { EnStatement, Level } from './types'
import { at, choice, open, spell, typed } from './build'
import { cap } from './skins'
import { WORDS_Y56 } from './words'

/** Year 6 English: spelling (Appendix 1, Years 5–6), grammar and punctuation (Appendix 2, Year 6), writing. */

const LV = (i: number): Level => (i < 2 ? 1 : i < 4 ? 2 : 3)

const EI: [word: string, wrong: string, note: string][] = [
  ['receive', 'recieve', 'After c, use ei: receive.'], ['ceiling', 'cieling', 'After c, use ei: ceiling.'], ['deceive', 'decieve', 'After c, use ei: deceive.'],
  ['receipt', 'reciept', 'After c, use ei: receipt.'], ['conceited', 'concieted', 'After c, use ei: conceited.'], ['seize', 'sieze', '“seize” is an exception: ei without a c.'],
  ['protein', 'protien', '“protein” is an exception: ei without a c.'], ['caffeine', 'caffiene', '“caffeine” is an exception: ei without a c.'],
]
const OUGH: [word: string, sound: string, wrong: string][] = [
  ['bought', 'or', 'bort'], ['rough', 'uff', 'ruff'], ['cough', 'off', 'coff'], ['though', 'oh', 'thoe'], ['through', 'oo', 'throo'],
  ['plough', 'ow', 'plow'], ['thorough', 'uh', 'thurra'], ['tough', 'uff', 'tuff'], ['thought', 'or', 'thort'], ['enough', 'uff', 'enuff'],
]
const HYPH: [word: string, wrong: string, note: string][] = [
  ['co-ordinate', 'coordinate', 'A hyphen joins co- to a root that starts with o, so the vowels do not run together.'],
  ['re-enter', 'reenter', 'A hyphen joins re- to a root starting with e.'],
  ['co-operate', 'cooperate', 'A hyphen joins co- to a root starting with o.'],
  ['re-elect', 'reelect', 'A hyphen joins re- to a root starting with e.'],
  ['co-own', 'coown', 'A hyphen joins co- to a root starting with o.'],
  ['pre-eminent', 'preeminent', 'A hyphen joins pre- to a root starting with e.'],
]
const HOMO6: [sentence: string, right: string, wrong: string, note: string][] = [
  ['The ___ of the school spoke at assembly.', 'principal', 'principle', 'The “principal” is the head person; a “principle” is a rule or belief.'],
  ['We bought pens from the ___ shop.', 'stationery', 'stationary', 'stationEry is pEns and papEr; stationAry means stAying still.'],
  ['The bus was ___ at the lights.', 'stationary', 'stationery', '“stationary” means not moving.'],
  ['Keep that sharp ___ away from the {thing}.', 'device', 'devise', '“device” (c) is a noun; “devise” (s) is a verb meaning to plan.'],
  ['The thief tried to ___ the {thing}.', 'steal', 'steel', '“steal” means to take; “steel” is a metal.'],
  ['There was a cold ___ coming through the door.', 'draught', 'draft', 'A “draught” is a current of air; a “draft” is a first version of writing.'],
  ['{actor} walked down the ___ to {his} seat.', 'aisle', 'isle', 'An “aisle” is a passage between seats; an “isle” is an island.'],
  ['Be ___ of the slippery floor.', 'wary', 'weary', '“wary” means careful; “weary” means tired.'],
]
const FORMAL: [informal: string, formal: string][] = [
  ['find out', 'discover'], ['ask for', 'request'], ['go in', 'enter'], ['get', 'receive'], ['help', 'assist'], ['tell', 'inform'], ['need', 'require'], ['start', 'commence'],
]
const SYN: [word: string, syn: string, ant: string, wrongs: string[]][] = [
  ['enormous', 'gigantic', 'tiny', ['fast', 'happy']], ['brave', 'courageous', 'cowardly', ['quiet', 'tall']], ['ancient', 'old', 'modern', ['broken', 'heavy']],
  ['furious', 'livid', 'calm', ['sleepy', 'polite']], ['generous', 'kind', 'selfish', ['hungry', 'early']], ['rapid', 'swift', 'slow', ['bright', 'loud']],
  ['exhausted', 'weary', 'energetic', ['curious', 'damp']], ['fragile', 'delicate', 'sturdy', ['noisy', 'gentle']],
]

const fill = (s: string, c: { thing: string; actor: string; his: string }) => s.replace(/\{thing\}/g, c.thing).replace(/\{actor\}/g, c.actor).replace(/\{his\}/g, c.his)

const twoWay = (pool: [string, string, string][], ask: string) =>
  [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
    const [w, bad, note] = at(c, pool, k)
    return i % 2 === 0 ? choice(r, ask, w, [[bad, note]], note) : typed(`Type the correct spelling. It is NOT “${bad}”.`, w, note)
  }] as EnStatement['items'][number])

export const Y6_ENGLISH: EnStatement[] = [
  {
    id: 'EN-Y6-SP-01', year: 6, domain: 'Spelling', text: 'The “i before e except after c” rule, and its exceptions',
    hints: ['When the sound is “ee”, it is usually i before e (field, believe).', 'After the letter c, it is ei (receive, ceiling). Learn the exceptions: seize, protein, caffeine.', 'Look at the letter before the ie/ei: is it a c?'],
    items: twoWay(EI, 'Which spelling is correct?'),
  },
  {
    id: 'EN-Y6-SP-02', year: 6, domain: 'Spelling', text: 'Words containing the letter string “ough”',
    hints: ['“ough” can be said in lots of different ways.', 'or (bought), uff (rough), off (cough), oh (though), oo (through), ow (plough), uh (thorough).', 'Group the word with others that sound the same: bought, thought, ought.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
      const [w, sound, bad] = at(c, OUGH, k)
      return i % 2 === 0
        ? choice(r, `The “ough” in this word sounds like “${sound}”. Which spelling is correct?`, w, [[bad, `It uses the letter string “ough”: ${w}.`]], `“ough” says “${sound}” in ${w}.`)
        : typed(`Type the word that sounds like “${bad}”. It uses “ough”.`, w, `“ough” says “${sound}” in ${w}.`)
    }]),
  },
  {
    id: 'EN-Y6-SP-03', year: 6, domain: 'Spelling', text: 'Using hyphens to join a prefix to a root word',
    hints: ['Sometimes a hyphen joins a prefix to a word.', 'Use one when the prefix ends in a vowel and the root word starts with one: co-ordinate, re-enter.', 'Look at the last letter of the prefix and the first letter of the root.'],
    items: twoWay(HYPH, 'Which spelling is correct?'),
  },
  {
    id: 'EN-Y6-SP-04', year: 6, domain: 'Spelling', text: 'Homophones and other words that are often confused',
    hints: ['These words sound alike but mean different things.', 'Learn a memory trick: stationEry is for pEns and papEr; a princiPAL is your PAL.', 'Read the whole sentence, work out the meaning, then choose.'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => { const [s, right, wrong, note] = at(c, HOMO6, k); return choice(r, 'Which word fits the gap?', right, [[wrong, note]], note, fill(s, c)) }]),
  },
  {
    id: 'EN-Y6-SP-05', year: 6, domain: 'Spelling', text: 'Words from the Years 5–6 statutory word list (part 2)', chunk: 10,
    hints: ['Listen to Nova say the word, then picture it.', 'Split it into syllables: pro-nun-ci-a-tion.', 'Check the tricky part: double letters, silent letters or unusual vowels.'],
    items: WORDS_Y56.slice(50).map(([w, s], i) => [((i % 10) < 4 ? 1 : (i % 10) < 7 ? 2 : 3) as Level, () => spell(w, s)]),
  },
  {
    id: 'EN-Y6-GR-01', year: 6, domain: 'Grammar', text: 'Formal and informal vocabulary and structures, including the subjunctive',
    hints: ['Formal writing is for serious situations; informal is for friends.', 'Formal words: request (ask for), enter (go in). The subjunctive is very formal: “If I were…”, “I insist that he be…”.', 'Imagine reading it to a judge: does it sound right? Swap chatty words for formal ones.'],
    items: [
      [1, (c, r) => { const [inf, f] = at(c, FORMAL, 0); return choice(r, `Which is the formal way to say “${inf}”?`, f, [[inf, 'That is the informal version.']], `“${f}” is more formal than “${inf}”.`) }],
      [1, (_c, r) => choice(r, 'Which sentence is the most formal?', `Visitors are requested to remain seated.`, [[`Stay sitting down, everyone!`, 'This is chatty and informal.'], [`Can you all sit down?`, 'This is informal.']], 'Formal language uses words like “requested” and “remain”.')],
      [2, (c, r) => choice(r, 'Which sentence uses the subjunctive?', `If I were ${c.actor}, I would be proud.`, [[`If I was ${c.actor}, I would be proud.`, 'In formal writing, use “were” for an imagined situation.']], '“If I were…” is the subjunctive form.')],
      [2, (c) => { const [inf, f] = at(c, FORMAL, 3); return typed(`Make this more formal by replacing “${inf}”: “Please ${inf} ${c.speaker} by Friday.”`, `Please ${f} ${c.speaker} by Friday.`, `“${f}” is more formal.`) }],
      [3, (c) => open(`Rewrite formally: “Hey! Don’t forget to bring your stuff to ${c.event}.”`, 'Keeps the meaning; removes contractions and slang; uses formal vocabulary and structure; punctuated.', `Please remember to bring your equipment to ${c.event}.`)],
      [3, (c) => open(`Write a formal sentence using the subjunctive about ${c.event}.`, 'Uses a correct subjunctive form (If I were…, It is essential that he be…, I suggest that she attend…); formal tone; makes sense.', `It is essential that every visitor arrive before ${c.event} begins.`)],
    ],
  },
  {
    id: 'EN-Y6-GR-02', year: 6, domain: 'Grammar', text: 'Active and passive voice',
    hints: ['In the active voice, the subject does the action: The dog chased the ball.', 'In the passive voice, the subject has the action done to it: The ball was chased by the dog.', 'Find who does the action. If they come after “by”, or are missing, it is passive.'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence is in the passive voice?', `The ${c.thing} was dropped by ${c.actor}.`, [[`${c.actor} dropped the ${c.thing}.`, 'Here the subject does the action: that is active.']], 'The subject (the ' + c.thing + ') has the action done to it.')],
      [1, (c, r) => choice(r, `Active or passive? “${c.actor} ${c.win}.”`, 'active', [['passive', `${c.actor} is doing the action.`]], 'The subject does the action, so it is active.')],
      [2, (c) => typed(`Change to the passive: “${c.actor} lifted the ${c.thing}.”`, [`The ${c.thing} was lifted by ${c.actor}.`], `The object becomes the subject: “The ${c.thing} was lifted by…”`)],
      [2, (c) => typed(`Change to the active: “The ${c.thing} was found by ${c.actor2}.”`, [`${c.actor2} found the ${c.thing}.`], `${c.actor2} does the action, so put them first.`)],
      [3, (_c, r) => choice(r, 'Why might a news report say “The window was broken” instead of “Someone broke the window”?', 'The person who did it is unknown or not important', [['It is shorter to type', 'Length is not the main reason.'], ['It is informal', 'The passive is often more formal, not less.']], 'The passive lets you leave out who did the action.')],
      [3, (c) => open(`Write a sentence about ${c.event} in the passive voice.`, 'A grammatically correct passive sentence (form of “be” + past participle, optionally “by…”); makes sense; punctuated.', `The trophy was lifted by ${c.actor} after ${c.event}.`)],
    ],
  },
  {
    id: 'EN-Y6-GR-03', year: 6, domain: 'Grammar', text: 'Synonyms and antonyms',
    hints: ['Synonyms mean the same or nearly the same; antonyms mean the opposite.', 'Big / large are synonyms. Big / small are antonyms.', 'Put each option in a sentence: does it keep the meaning or flip it?'],
    items: [0, 1, 2, 3, 4, 5].map((k, i) => [LV(i), (c, r) => {
      const [w, syn, ant, wrongs] = at(c, SYN, k)
      if (i < 2) return choice(r, `Which is a synonym of “${w}”?`, syn, [[ant, 'That is the opposite (an antonym).'], ...wrongs.map((x) => [x, 'That has a different meaning.'] as [string, string])], `“${syn}” means nearly the same as “${w}”.`)
      if (i < 4) return choice(r, `Which is an antonym of “${w}”?`, ant, [[syn, 'That means nearly the same (a synonym).'], ...wrongs.map((x) => [x, 'That is not the opposite.'] as [string, string])], `“${ant}” is the opposite of “${w}”.`)
      return open(`Write a sentence about ${c.event} using “${w}” and one of its antonyms.`, `One sentence using “${w}” and a correct antonym of it; makes sense; punctuated.`, `The first half was ${w}, but the second half felt ${ant}.`)
    }]),
  },
  {
    id: 'EN-Y6-GR-04', year: 6, domain: 'Grammar', text: 'Subject and object',
    hints: ['The subject does the verb; the object has the verb done to it.', 'In “Sam kicked the ball”, Sam is the subject and the ball is the object.', 'Find the verb, ask “who or what did it?” (subject), then “to whom or what?” (object).'],
    items: [
      [1, (c, r) => choice(r, `What is the subject? “${c.actor} lifted the ${c.thing}.”`, c.actor, [[`the ${c.thing}`, 'That is the object: it has the action done to it.'], ['lifted', 'That is the verb.']], `${c.actor} does the lifting, so ${c.actor} is the subject.`)],
      [1, (c, r) => choice(r, `What is the object? “The ${c.crowd} cheered ${c.actor}.”`, c.actor, [[`The ${c.crowd}`, 'That is the subject.'], ['cheered', 'That is the verb.']], `${c.actor} is the one being cheered: the object.`)],
      [2, (c, r) => choice(r, `What is the object? “${cap(c.speaker)} gave ${c.actor} a medal.”`, 'a medal', [[cap(c.speaker), 'That is the subject.'], ['gave', 'That is the verb.']], '“a medal” is what was given: the object (' + c.actor + ' is the indirect object).')],
      [2, (c) => typed(`Swap the subject and object: “${c.actor} chased ${c.actor2}.”`, `${c.actor2} chased ${c.actor}.`, 'The object becomes the subject and the subject becomes the object.')],
      [3, (_c, r) => choice(r, 'In a passive sentence, what happens to the object of the active sentence?', 'It becomes the subject', [['It is deleted', 'It moves; it is not deleted.'], ['It stays the object', 'It moves to the front to become the subject.']], 'Active: Sam kicked the ball. Passive: The ball (now the subject) was kicked by Sam.')],
      [3, (c) => open(`Write a sentence about ${c.place} and say which words are the subject and the object.`, 'A sentence with a clear subject, verb and object; the child correctly identifies the subject and object.', `Sentence: The ${c.crowd} filled ${c.place}. Subject: the ${c.crowd}. Object: ${c.place}.`)],
    ],
  },
  {
    id: 'EN-Y6-GR-05', year: 6, domain: 'Grammar', text: 'Linking ideas with repetition, adverbials and ellipsis',
    hints: ['Cohesive devices link ideas so writing flows.', 'You can repeat a key word for effect, use adverbials (On the other hand, As a result), or use ellipsis to leave out words the reader can work out.', 'Read two sentences and ask: how could I link them more smoothly?'],
    items: [
      [1, (_c, r) => choice(r, 'Which adverbial shows a result?', 'As a result', [['On the other hand', 'That shows contrast.'], ['Meanwhile', 'That shows time.']], '“As a result” shows cause and effect.')],
      [1, (c, r) => choice(r, `Which sentence uses ellipsis to avoid repeating words?`, `${c.actor} wanted to win and ${c.actor2} did too.`, [[`${c.actor} wanted to win and ${c.actor2} wanted to win.`, 'The words “wanted to win” are repeated.']], 'Leaving out the repeated words is ellipsis.')],
      [2, (c, r) => choice(r, `Which adverbial best links these? “${c.team} trained every day. ___, they lost the first game.”`, 'However', [['Therefore', 'That suggests the loss was caused by training.'], ['Firstly', 'That is for listing.']], '“However” shows contrast between training and losing.')],
      [2, (c) => typed(`Use ellipsis to shorten: “${c.actor} was excited about ${c.event} and ${c.actor2} was excited about ${c.event}.”`, [`${c.actor} was excited about ${c.event} and ${c.actor2} was too.`, `${c.actor} was excited about ${c.event} and so was ${c.actor2}.`, `${c.actor} and ${c.actor2} were excited about ${c.event}.`], `Leave out the repeated words: “… and ${c.actor2} was too.”`)],
      [3, (c) => open(`Write two sentences about ${c.event} linked by a cohesive adverbial (for example: However, As a result, On the other hand).`, 'Two sentences; the second begins with a suitable cohesive adverbial followed by a comma; the link is logical.', `The ${c.crowd} were nervous. As a result, the noise grew louder and louder.`)],
      [3, (c) => open(`Write a sentence about ${c.actor} that repeats a word on purpose for effect.`, 'Deliberate repetition of a word or phrase for emphasis; makes sense; punctuated.', `${c.actor} trained, trained and trained again until ${c.he} could do it in ${c.his} sleep.`)],
    ],
  },
  {
    id: 'EN-Y6-PU-01', year: 6, domain: 'Punctuation', text: 'Semi-colons, colons and dashes to separate independent clauses',
    hints: ['These marks can join two complete sentences that are closely linked.', 'A semi-colon links two related clauses; a colon introduces an explanation; a dash adds a more informal break.', 'Check both sides would make sense as sentences on their own.'],
    items: [
      [1, (c, r) => choice(r, 'Which sentence uses a semi-colon correctly?', `${c.actor} was exhausted; ${c.he} had trained all day.`, [[`${c.actor} was; exhausted after training.`, 'Both sides of a semi-colon must be complete clauses.']], 'Both sides are complete and closely linked.')],
      [1, (_c, r) => choice(r, 'Which mark introduces an explanation?', 'colon (:)', [['comma (,)', 'A comma cannot join two sentences on its own.'], ['question mark (?)', 'That ends a question.']], 'A colon can introduce an explanation of the first clause.')],
      [2, (c) => typed(`Join with a semi-colon: “The ${c.crowd} were silent. Nobody moved.”`, `The ${c.crowd} were silent; nobody moved.`, 'Replace the full stop with a semi-colon and use a lower-case n.', { exact: true })],
      [2, (c, r) => choice(r, 'Which sentence uses a colon correctly?', `There was only one thing left to do: ${c.actor} had to win.`, [[`There was: only one thing left to do.`, 'A colon must follow a complete clause.']], 'The second part explains the first.')],
      [3, (_c, r) => choice(r, 'Why is the comma wrong here? “It was late, we went home.”', 'Two sentences cannot be joined with only a comma', [['There should be no punctuation at all', 'Something is needed between the two clauses.']], 'Use a full stop, semi-colon or conjunction instead (a “comma splice” is an error).')],
      [3, (c) => open(`Write a sentence about ${c.event} that uses a semi-colon or colon to join two clauses.`, 'Two independent clauses correctly joined by a semi-colon (related ideas) or colon (explanation); makes sense.', `The result was clear: ${c.team} had won.`)],
    ],
  },
  {
    id: 'EN-Y6-PU-02', year: 6, domain: 'Punctuation', text: 'Colons to introduce lists, semi-colons within lists, and bullet points',
    hints: ['A colon can introduce a list after a complete clause.', 'Use semi-colons between list items that are long or already contain commas. Bullet points must be consistent.', 'Check the words before the colon make a complete sentence.'],
    items: [
      [1, (c, r) => choice(r, 'Which uses a colon correctly to introduce a list?', `${c.actor} packed three things: ${c.things}, water and a map.`, [[`${c.actor} packed: ${c.things}, water and a map.`, 'The words before the colon must be a complete clause.']], 'A complete clause comes before the colon.')],
      [1, (_c, r) => choice(r, 'Where do semi-colons help in a list?', 'Between long items that already contain commas', [['After every word', 'They separate whole items, not words.'], ['Only at the end', 'They go between items.']], 'Semi-colons separate list items that contain commas.')],
      [2, (c) => typed(`Add a colon: “You will need three things ${c.things}, a drink and a coat.”`, `You will need three things: ${c.things}, a drink and a coat.`, 'The colon comes after the complete clause, before the list.', { exact: true })],
      [2, (_c, r) => choice(r, 'Which list is punctuated correctly?', `We visited Paris, France; Rome, Italy; and Madrid, Spain.`, [[`We visited Paris, France, Rome, Italy, and Madrid, Spain.`, 'Without semi-colons it is hard to tell the items apart.']], 'Semi-colons separate items that already contain commas.')],
      [3, (_c, r) => choice(r, 'Which set of bullet points is consistent?', '• pack your kit\n• fill your bottle\n• find your seat', [['• pack your kit\n• Your bottle should be filled.\n• seat', 'Bullet points should follow the same pattern.']], 'Each bullet starts the same way (a verb) and follows the same style.')],
      [3, (c) => open(`Write a sentence with a colon introducing a list of three things you would see at ${c.place}.`, 'A complete clause, a colon, then a list of three items correctly separated by commas (or semi-colons); makes sense.', `At ${c.place} you would see three things: cheering ${c.crowd}, bright lights and ${c.things}.`)],
    ],
  },
  {
    id: 'EN-Y6-PU-03', year: 6, domain: 'Punctuation', text: 'Hyphens to avoid ambiguity',
    hints: ['A hyphen can change the meaning of a phrase.', '“man-eating shark” (a shark that eats people) vs “man eating shark” (a man eating shark meat). “re-cover” (cover again) vs “recover” (get better).', 'Read it without the hyphen: could it mean something else?'],
    items: [
      [1, (_c, r) => choice(r, 'Which means a shark that eats people?', 'a man-eating shark', [['a man eating shark', 'Without the hyphen, it sounds like a man is eating shark.']], 'The hyphen joins “man-eating” into one describing word.')],
      [1, (_c, r) => choice(r, 'Which means to put a new cover on the chair?', 're-cover', [['recover', '“recover” means to get better or get something back.']], 'The hyphen shows “cover again”.')],
      [2, (_c, r) => choice(r, 'Which means there are twenty fans who are each one year old? (Read carefully!)', 'twenty one-year-old fans', [['twenty-one year old fans', 'This means 21 fans who are old.'], ['twenty-one-year-old fans', 'This means fans who are 21.']], 'Hyphens group the words that belong together.')],
      [2, (c) => typed(`Add hyphens so it describes ${c.actor}: “${c.actor} is a well known star.”`, `${c.actor} is a well-known star.`, '“well-known” is one describing word before the noun, so it takes a hyphen.', { exact: true })],
      [3, (_c, r) => choice(r, 'Which is correct?', 'a little-used path', [['a little used path', 'Without the hyphen, it could mean a small, used path.']], 'The hyphen makes it clear the path is rarely used.')],
      [3, (c) => open(`Write a sentence about ${c.event} that uses a hyphenated describing word (for example: last-minute, record-breaking, world-famous).`, 'A sentence using a compound adjective with a correctly placed hyphen before a noun; makes sense; punctuated.', `${c.actor} scored a last-minute winner in a record-breaking ${c.event.replace(/^the /, '')}.`)],
    ],
  },
  {
    id: 'EN-Y6-WR-01', year: 6, domain: 'Writing', text: 'Formal writing: letters and reports',
    hints: ['Formal writing suits official letters, reports and speeches.', 'Use formal vocabulary, no contractions, full sentences, clear paragraphs and the passive where useful.', 'Picture your reader (a headteacher, a council). Write as you would speak to them.'],
    items: [
      [1, (_c, r) => choice(r, 'Which is the best opening for a formal letter?', 'Dear Sir or Madam,', [['Hiya!', 'That is very informal.'], ['Yo,', 'That is slang.']], '“Dear Sir or Madam,” is a formal greeting.')],
      [1, (_c, r) => choice(r, 'Which ending suits a formal letter that began “Dear Sir or Madam”?', 'Yours faithfully,', [['See ya,', 'That is informal.'], ['Love from,', 'That is for family and friends.']], 'Use “Yours faithfully” when you do not know the person’s name.')],
      [2, (c) => open(`Write the opening sentence of a formal letter to ${c.speaker}, explaining why you are writing.`, 'Formal tone; no contractions; states the purpose of the letter clearly in one sentence.', `I am writing to request further information about ${c.event}.`)],
      [2, (c) => open(`Write one sentence for a newspaper report about ${c.event}, using the passive voice.`, 'A formal, report-style sentence that includes a passive construction; factual tone; punctuated.', `The match was watched by over ten thousand ${c.crowd}.`)],
      [3, (c) => open(`Write a short formal letter (4–5 sentences) to ${c.speaker} suggesting one improvement to ${c.place}.`, 'Greeting and sign-off suitable for a formal letter; clear purpose; a suggestion with a reason; formal vocabulary; no contractions; paragraphs or clear structure.', `Dear Sir or Madam,\nI am writing to suggest that more seating be added at ${c.place}. Many ${c.crowd} currently have to stand for long periods. Additional seats would make visits safer and more enjoyable. I would be grateful if you could consider this request.\nYours faithfully,`)],
      [3, (c) => open(`Write a short report paragraph (3–4 sentences) about ${c.event}, in a formal style.`, 'Formal, factual tone; past tense; at least one passive or formal construction; logical order; punctuated.', `${cap(c.event)} took place at ${c.place} on Saturday. It was attended by thousands of ${c.crowd}. ${c.actor} ${c.win}, which was widely celebrated.`)],
    ],
  },
  {
    id: 'EN-Y6-WR-02', year: 6, domain: 'Writing', text: 'Précis: summarising a longer passage',
    hints: ['A précis is a short summary that keeps only the main points.', 'Cut examples, repeated ideas and descriptions. Keep who, what, where, when and why.', 'Underline the main point of each sentence, then rewrite them in fewer words.'],
    items: [
      [1, (_c, r) => choice(r, 'What should a summary keep?', 'The main points', [['Every detail', 'A summary leaves out minor details.'], ['Only the first sentence', 'A summary covers the whole text.']], 'A summary keeps the main points only.')],
      [1, (c, r) => choice(r, `Which detail could be cut from a summary of ${c.event}?`, `${c.actor} wore green socks.`, [[`${c.actor} ${c.win}.`, 'That is a main point.']], 'Minor details like socks are not needed in a summary.')],
      [2, (c) => {
        const text = `${cap(c.event)} began at three o’clock. The weather was cold, and many ${c.crowd} wore hats and scarves. ${c.actor} was nervous at the start but grew in confidence. In the final minutes, ${c.actor} ${c.win}. The ${c.crowd} cheered for a long time afterwards.`
        return open('Summarise this in one sentence of no more than 20 words.', 'One sentence, 20 words or fewer; keeps the main event and outcome; leaves out minor details.', `${c.actor} overcame nerves and ${c.win} at the end of ${c.event}, delighting the ${c.crowd}.`, text)
      }],
      [2, (c, r) => choice(r, 'Which is the best one-line summary?', `${c.team.startsWith('the') ? cap(c.team) : c.team} won after a tense finish.`, [[`It was cold and people wore hats.`, 'That is a minor detail, not the main point.']], 'It gives the main event and result.')],
      [3, (c) => {
        const text = `Getting ready for ${c.event} takes careful planning. First, ${c.team} check that every piece of equipment works. Then they rehearse every step, sometimes ten times or more. They also eat healthy food and get plenty of sleep. On the day, they arrive early to warm up. All this preparation helps them stay calm and perform their best.`
        return open('Write a précis of this passage in no more than 30 words.', 'No more than 30 words; keeps the main idea (careful preparation helps performance) and the key steps; own words; no unnecessary detail.', `${c.team.startsWith('the') ? cap(c.team) : c.team} prepare carefully by checking equipment, rehearsing, eating and sleeping well and arriving early, which helps them stay calm and perform well.`, text)
      }],
      [3, (c) => open(`Imagine you watched ${c.event} at ${c.place}. Summarise what happened in exactly two sentences.`, 'Exactly two sentences; gives the main events and outcome of an imagined event; leaves out minor detail; clear and punctuated.', `${c.actor} started slowly at ${c.place}. In the end, ${c.actor} ${c.win} and the ${c.crowd} went wild.`)],
    ],
  },
]
