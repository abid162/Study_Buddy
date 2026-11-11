/**
 * English statements added to complete the Years 4–6 curriculum:
 * poetry, non-fiction, other text types (fables, play scripts, comparing texts), dictionary and thesaurus use,
 * proof-reading, planning and editing, and writing in different forms.
 */
import type { Rng } from '../bank/rng'
import type { EnCtx, EnDraft, EnStatement, Level } from './types'
import { choice, open, typed, at } from './build'
import { shuffle } from './skins'
import { poemFor, infoFor, type Poem } from './texts'

type G = (c: EnCtx, r: Rng) => EnDraft
const st = (id: string, year: 4 | 5 | 6, domain: EnStatement['domain'], text: string, hints: [string, string, string], items: [Level, G][]): EnStatement => ({ id, year, domain, text, hints, items })
const poemExtract = (p: Poem) => `${p.title}\n\n${p.text}`
const infoExtract = (w: string) => {
  const t = infoFor(w)
  return `${t.title}\n\n${t.text}`
}
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1)
const DEVICE_NAMES = ['simile', 'metaphor', 'personification', 'repetition', 'alliteration'] as const
const DEVICE_WHY: Record<string, string> = {
  simile: 'A simile compares using “like” or “as”.',
  metaphor: 'A metaphor says something IS something else, without “like” or “as”.',
  personification: 'Personification gives something non-human a human action or feeling.',
  repetition: 'Repetition repeats a word, phrase or pattern.',
  alliteration: 'Alliteration repeats the same first sound in words close together.',
}

/* ---------------- shared hints ---------------- */
const H_POEM: [string, string, string] = ['Read the poem aloud, slowly.', 'Look at the pattern of the lines: rhyme, rhythm, how the lines start, who is speaking.', 'Find the exact words in the poem that prove your answer.']
const H_INFO: [string, string, string] = ['Information texts are split into sections with headings.', 'Use the headings to find the right section, then scan for key words from the question.', 'Read the sentence with the key word carefully. That is your answer.']
const H_TYPES: [string, string, string] = ['Think about what kind of text this is and what it is for.', 'Each kind of text has its own features (for example, a moral in a fable, or stage directions in a script).', 'Match the feature in the question to the part of the text that shows it.']
const H_DICT: [string, string, string] = ['Dictionaries list words in alphabetical order.', 'If the first letters are the same, compare the second letters, then the third.', 'Read the whole sentence to choose the meaning that fits.']
const H_PROOF: [string, string, string] = ['Read every word slowly, one at a time.', 'Check spellings, capital letters, punctuation and that the verbs agree.', 'Say the sentence out loud: does it sound and look right?']
const H_EDIT: [string, string, string] = ['Think about who will read it and why.', 'Better writing is clear, precise and joined up with linking words.', 'Compare the choices: which one would a reader find clearest and most interesting?']
const H_FORMS: [string, string, string] = ['Every kind of writing has a job to do.', 'Use the features of that kind of writing (for example: numbered steps, time words, headings).', 'Plan first: what will each sentence or paragraph do?']

/* ---------------- poetry ---------------- */
const formQ: G = (c, r) => {
  const p = poemFor(c.world)
  const forms = ['rhyming couplets', 'an acrostic', 'haiku', 'free verse', 'a limerick', 'a kenning poem'].filter((f) => f !== p.form)
  return choice(r, `What form of poem is “${p.title}”?`, p.form, shuffle(r, forms).slice(0, 3).map((f) => [f, `It is not ${f}. Look at the rhyme, the line pattern and how the lines start.`] as [string, string]), p.formWhy, poemExtract(p))
}
const featureQ: G = (c, r) => {
  const p = poemFor(c.world)
  return choice(r, p.feature.q, p.feature.a, p.feature.wrong, p.feature.explain, poemExtract(p))
}
const deviceQ: G = (c, r) => {
  const p = poemFor(c.world)
  const d = p.devices[Math.floor(r() * p.devices.length)]!
  return choice(r, `In the line “${d.line}”, which technique is the poet using?`, d.device, DEVICE_NAMES.filter((n) => n !== d.device).slice(0, 3).map((n) => [n, `${DEVICE_WHY[n]} Look at the line again.`] as [string, string]), `${cap(d.device)}. ${d.effect}`, poemExtract(p))
}
const wordQ: G = (c, r) => {
  const p = poemFor(c.world)
  return choice(r, `In the line “${p.word.line}”, what does “${p.word.word}” mean?`, p.word.meaning, p.word.wrong.map((w) => [w, 'Read the whole line again. Which meaning fits?'] as [string, string]), `“${cap(p.word.word)}” means ${p.word.meaning}.`, poemExtract(p))
}
const moodQ: G = (c, r) => {
  const p = poemFor(c.world)
  return choice(r, `Which words best describe the mood of “${p.title}”?`, p.mood.a, p.mood.wrong.map((w) => [w, 'Look at the words the poet chose. What feeling do they create?'] as [string, string]), p.mood.why, poemExtract(p))
}
const themeQ: G = (c, r) => {
  const p = poemFor(c.world)
  return choice(r, `What is “${p.title}” mainly about?`, p.theme.a, p.theme.wrong.map((w) => [w, 'Think about the poem as a whole, not one line.'] as [string, string]), `The poem is about ${p.theme.a}.`, poemExtract(p))
}
const poemOpen = (kind: 'favourite' | 'image' | 'evaluate'): G => (c) => {
  const p = poemFor(c.world)
  const d = p.devices[0]!
  if (kind === 'favourite')
    return open(`Copy your favourite line from “${p.title}” and explain why you like it.`, 'Copies a line from the poem accurately and gives a reason linked to its words, sound or picture.', `“${d.line}”, because ${d.effect.charAt(0).toLowerCase()}${d.effect.slice(1)}`, poemExtract(p))
  if (kind === 'image')
    return open(`Find a ${d.device} in “${p.title}”. What does it make you imagine?`, `Finds a correct ${d.device} (or other image) from the poem and explains the picture or feeling it creates.`, `“${d.line}”. ${d.effect}`, poemExtract(p))
  return open(`How does the poet create the mood of “${p.title}”? Use two examples from the poem.`, `Says what the mood is (for example ${p.mood.a}) and gives two quotations from the poem, explaining how each word choice or technique creates the mood.`, `The mood is ${p.mood.a}. ${p.devices[0]!.effect} Also, ${p.devices[1]!.effect.charAt(0).toLowerCase()}${p.devices[1]!.effect.slice(1)}`, poemExtract(p))
}

/* ---------------- non-fiction ---------------- */
const retrieveQ = (k: 0 | 1): G => (c) => {
  const t = infoFor(c.world)
  const [q, acc, keys, ex] = t.retrieve[k]!
  return typed(q, acc, ex, { extract: infoExtract(c.world), keys })
}
const headingQ: G = (c, r) => {
  const t = infoFor(c.world)
  const [what, h] = at(c, t.findUnder, 0)
  return choice(r, `Under which heading would you find out about ${what}?`, h, t.headings.filter((x) => x !== h).map((x) => [x, `That section is about something else. Skim it to check.`] as [string, string]), `The section headed ${h} tells you about ${what}.`, infoExtract(c.world))
}
const layoutQ: G = (c, r) => {
  const t = infoFor(c.world)
  return choice(r, `Why does “${t.title}” use headings?`, 'To help readers find information quickly', [['To make it rhyme', 'Information texts do not need to rhyme.'], ['To tell a story in order', 'This text gives facts, not a story.'], ['To show who is speaking', 'That is what a play script does.']], 'Headings split the text into topics, so readers can find what they need.', infoExtract(c.world))
}
const bulletQ: G = (c, r) => {
  const t = infoFor(c.world)
  return choice(r, `Why are the facts under “DID YOU KNOW?” in “${t.title}” written as bullet points?`, 'They are separate short facts, easy to read one at a time', [['They are the most important part of the story', 'The text is not a story.'], ['They are opinions', 'They are facts that can be checked.'], ['They are instructions to follow', 'They do not tell you to do anything.']], 'Bullet points list separate facts so readers can spot them quickly.', infoExtract(c.world))
}
const opinionQ: G = (c, r) => {
  const t = infoFor(c.world)
  return choice(r, `Which sentence from “${t.title}” is an opinion?`, t.opinion, t.facts.map((f) => [f, 'That is a fact: it can be checked.'] as [string, string]), 'This is what the writer thinks. Not everyone would agree, so it is an opinion.', infoExtract(c.world))
}
const trueQ: G = (c, r) => {
  const t = infoFor(c.world)
  const right = at(c, t.facts, 0)
  return choice(r, `Which statement is true, according to “${t.title}”?`, right, [...t.falses.map((f) => [f, 'Check the text: it says something different.'] as [string, string]), [t.opinion, 'That is the writer’s opinion, not a fact the text proves.']], 'This is stated in the text.', infoExtract(c.world))
}

/* ---------------- fables, scripts, comparing ---------------- */
const FABLES = [
  { title: 'The Hare and the Tortoise', text: 'A speedy hare laughed at a slow tortoise. “I could beat you in a race with my eyes shut,” he boasted. The tortoise agreed to race. The hare dashed ahead, then lay down for a nap. The tortoise plodded on, step by step, and crossed the finish line before the hare woke up.', moral: 'Slow and steady wins the race.', wrong: ['Always run as fast as you can.', 'Never race against a friend.', 'Sleeping is good for you.'] },
  { title: 'The Lion and the Mouse', text: 'A lion caught a tiny mouse. “Please let me go,” squeaked the mouse, “and one day I will help you.” The lion laughed, but let it go. Weeks later, the lion was trapped in a hunter’s net. The mouse heard his roars and nibbled through the ropes until he was free.', moral: 'Even the smallest friend can be a great help.', wrong: ['Lions are the strongest animals.', 'Never trust a mouse.', 'Always stay away from nets.'] },
  { title: 'The Boy Who Cried Wolf', text: 'A shepherd boy was bored. “Wolf! Wolf!” he shouted, and the villagers ran to help, but there was no wolf. He played the same trick again the next day. Then one evening a real wolf came. The boy shouted and shouted, but nobody came, because nobody believed him.', moral: 'If you tell lies, people will not believe you even when you tell the truth.', wrong: ['Wolves only come out at night.', 'Shouting is the best way to get help.', 'Sheep should be kept indoors.'] },
  { title: 'The Ant and the Grasshopper', text: 'All summer, the ant carried grain to its nest while the grasshopper sang in the sunshine. “Why work so hard?” laughed the grasshopper. When winter came, the ground froze. The ant had plenty to eat, but the grasshopper had nothing at all.', moral: 'Work hard now and be ready for the future.', wrong: ['Singing is a waste of time.', 'Ants are cleverer than grasshoppers.', 'Summer is better than winter.'] },
]
const fable = (c: EnCtx) => at(c, FABLES, 0)
const fableExtract = (c: EnCtx) => {
  const f = fable(c)
  return `${f.title}\n\n${f.text}`
}

function script(c: EnCtx) {
  const A = c.actor.toUpperCase()
  const B = c.actor2.toUpperCase()
  const S = c.speaker.replace(/^the /, '').toUpperCase()
  const dir = `(${c.he === 'she' ? 'She' : 'He'} looks at the clock and frowns.)`
  return {
    dir,
    line: `${B}: You can do this. Everyone is waiting for you.`,
    text: `SCENE: Behind the curtain at ${c.place}, five minutes before ${c.event}.

${A}: ${dir} We should have started already.
${B}: You can do this. Everyone is waiting for you.
${S}: (rushing in, out of breath) Two minutes! Places, please!
${A}: (taking a deep breath) Right. Let’s go.`,
  }
}

/* ---------------- dictionary and thesaurus ---------------- */
const WORDS: Record<string, string[]> = {
  football: ['stadium', 'header', 'penalty', 'tackle', 'referee', 'goalkeeper', 'trophy', 'corner'],
  wrestling: ['arena', 'champion', 'rope', 'referee', 'slam', 'turnbuckle', 'belt', 'match'],
  music: ['rhythm', 'chorus', 'drum', 'guitar', 'melody', 'stage', 'tempo', 'encore'],
  story: ['acorn', 'badger', 'forest', 'lantern', 'map', 'owl', 'river', 'woodland'],
  bricks: ['brick', 'cement', 'crane', 'design', 'girder', 'ladder', 'mortar', 'tower'],
  space: ['asteroid', 'astronaut', 'comet', 'galaxy', 'gravity', 'meteor', 'orbit', 'rocket'],
}
const SAME_START: Record<string, string[]> = {
  football: ['striker', 'stadium', 'score', 'shoot'],
  wrestling: ['champion', 'chair', 'cheer', 'chant'],
  music: ['stage', 'song', 'singer', 'sound'],
  story: ['forest', 'fox', 'fern', 'flower'],
  bricks: ['builder', 'brick', 'bridge', 'block'],
  space: ['comet', 'crater', 'cosmic', 'capsule'],
}
const MEANINGS: Record<string, [string, string, string, string[]]> = {
  football: ['pitch', 'The players ran out onto the pitch.', 'the field where a game is played', ['how high or low a sound is', 'to throw something', 'a sticky black substance']],
  wrestling: ['ring', 'The wrestlers climbed into the ring.', 'the raised square where wrestlers fight', ['a piece of jewellery worn on a finger', 'the sound a bell makes', 'a circle drawn on paper']],
  music: ['note', 'The singer held the last note for ages.', 'a single musical sound', ['a short written message', 'a piece of paper money', 'to notice something']],
  story: ['bark', 'The owl sat on the rough bark of the oak.', 'the hard outer covering of a tree', ['the sound a dog makes', 'a small boat', 'to shout an order']],
  bricks: ['level', 'The builder checked the wall with a level.', 'a tool that shows if something is flat', ['a stage in a game', 'a floor of a building', 'equal in score']],
  space: ['star', 'The astronaut saw a bright star from the window.', 'a huge ball of burning gas in space', ['a famous person', 'a shape with points', 'the main actor in a film']],
}
const SYN: [string, string, string, string[]][] = [
  ['big', 'The ___ crowd filled every seat in the arena.', 'enormous', ['tiny', 'tired', 'quiet']],
  ['said', '“Get back to your places!” ___ the coach.', 'shouted', ['whispered', 'giggled', 'asked']],
  ['walked', 'Exhausted after training, the player ___ slowly home.', 'trudged', ['sprinted', 'skipped', 'raced']],
  ['nice', 'The view from the top of the tower was ___.', 'breathtaking', ['awful', 'ordinary', 'boring']],
  ['happy', 'The fans were ___ when the final whistle blew.', 'overjoyed', ['furious', 'puzzled', 'bored']],
  ['scared', 'Alone in the dark forest, the explorer felt ___.', 'terrified', ['delighted', 'proud', 'calm']],
]
const ANT: [string, string, string[]][] = [
  ['ancient', 'modern', ['old', 'huge', 'broken']],
  ['victory', 'defeat', ['win', 'match', 'trophy']],
  ['generous', 'mean', ['kind', 'rich', 'busy']],
  ['expand', 'shrink', ['grow', 'stretch', 'open']],
  ['visible', 'hidden', ['clear', 'bright', 'seen']],
  ['cautious', 'reckless', ['careful', 'quiet', 'slow']],
]
const CLASS: Record<string, [string, string, 'noun' | 'verb']> = {
  football: ['score', 'She will score in the second half.', 'verb'],
  wrestling: ['slam', 'The slam shook the whole ring.', 'noun'],
  music: ['record', 'They will record the new song tomorrow.', 'verb'],
  story: ['map', 'The old map showed a hidden path.', 'noun'],
  bricks: ['design', 'The design for the tower won a prize.', 'noun'],
  space: ['orbit', 'The rocket will orbit the Moon twice.', 'verb'],
}

/* ---------------- proof-reading ---------------- */
const MISSPELT_34: [string, string, (c: EnCtx) => string][] = [
  ['believe', 'beleive', (c) => `I ___ that ${c.actor} will win today.`],
  ['different', 'diffrent', (c) => `The ${c.crowd} wore lots of ___ colours.`],
  ['February', 'Febuary', (c) => `${c.actor} trained hard all through ___.`],
  ['surprise', 'suprise', (c) => `The ending was a big ___ for the ${c.crowd}.`],
  ['library', 'libary', (c) => `${c.actor} borrowed a book from the ___.`],
  ['separate', 'seperate', (c) => `The ${c.things} were kept in a ___ box.`],
  ['interest', 'intrest', (c) => `${c.actor2} has a real ___ in ${c.event}.`],
  ['probably', 'probly', (c) => `${c.actor} will ___ arrive early at ${c.place}.`],
]
const MISSPELT_56: [string, string, (c: EnCtx) => string][] = [
  ['necessary', 'neccessary', (c) => `It is ___ to warm up before ${c.event}.`],
  ['definitely', 'definately', (c) => `${c.actor} will ___ be at ${c.place} tonight.`],
  ['environment', 'enviroment', (c) => `The ${c.crowd} helped keep the ___ clean.`],
  ['rhythm', 'rythm', (c) => `${c.actor2} clapped along to the ___.`],
  ['embarrass', 'embarass', (c) => `${c.actor} did not want to ___ the team.`],
  ['recommend', 'reccomend', (c) => `I ___ arriving early at ${c.place}.`],
  ['restaurant', 'restaraunt', (c) => `After ${c.event}, ${c.actor} ate at a ___.`],
  ['vegetable', 'vegtable', (c) => `${c.actor} grows ___ in the garden.`],
]
const spotQ = (pool: typeof MISSPELT_34): G => (c, r) => {
  const [right, wrong, frame] = at(c, pool, 0)
  const sentence = frame(c).replace('___', wrong)
  const words = sentence.replace(/[.,!?]/g, '').split(' ').filter((w) => w.length > 3 && w !== wrong && !/^[A-Z]/.test(w))
  const others = shuffle(r, [...new Set(words)]).slice(0, 3)
  if (others.length < 2) others.push('the')
  return choice(r, 'Which word in this sentence is spelt wrongly?', wrong, others, `“${wrong}” should be spelt “${right}”.`, sentence)
}

/* ============================== statements ============================== */

export const EXTRA: Record<4 | 5 | 6, EnStatement[]> = {
  4: [
    st('EN-Y4-RD-06', 4, 'Reading', 'Recognise some different forms of poetry', H_POEM, [[1, formQ], [2, featureQ], [3, poemOpen('favourite')]]),
    st('EN-Y4-RD-07', 4, 'Reading', 'Retrieve and record information from non-fiction', H_INFO, [[1, retrieveQ(0)], [2, headingQ], [3, retrieveQ(1)]]),
    st('EN-Y4-RD-08', 4, 'Reading', 'Identify themes and conventions in fables, myths and legends', H_TYPES, [
      [1, (c, r) => { const f = fable(c); return choice(r, `What is the moral of “${f.title}”?`, f.moral, f.wrong.map((w) => [w, 'A moral is the lesson the whole story teaches.'] as [string, string]), `The lesson is: ${f.moral}`, fableExtract(c)) }],
      [2, (c, r) => choice(r, `Which is a usual feature of a fable like “${fable(c).title}”?`, 'It teaches a lesson, often using animals as characters', [['It gives facts under headings', 'That is an information text.'], ['It is set out with stage directions', 'That is a play script.'], ['Every line rhymes', 'Fables are usually stories, not poems.']], 'Fables are short stories, often about animals, that teach a lesson (a moral).', fableExtract(c))],
      [3, (c) => open(`Write your own moral (a lesson) for a story about ${c.event} at ${c.place}, then explain it in one sentence.`, 'A short lesson written as a moral, linked to the setting, with a sentence explaining it.', `Practise every day and you will be ready when it matters, because ${c.actor} only won after training hard.`)],
    ]),
    st('EN-Y4-RD-09', 4, 'Reading', 'Use a dictionary to check the meaning of words', H_DICT, [
      [1, (c, r) => { const ws = shuffle(r, WORDS[c.world]!).slice(0, 4); const first = [...ws].sort()[0]!; return choice(r, `${c.actor} is looking up words in a dictionary. Which word comes first?`, first, ws.filter((w) => w !== first).map((w) => [w, `“${w}” starts with “${w[0]}”, which comes later in the alphabet.`] as [string, string]), `“${first}” comes first in alphabetical order.`) }],
      [2, (c, r) => { const ws = [...SAME_START[c.world]!].sort(); const first = ws[0]!; return choice(r, 'These words start with the same letter. Which comes first in a dictionary?', first, ws.slice(1).map((w) => [w, 'Look at the second letter (or the third if those match).'] as [string, string]), `Compare the letters after the first: “${first}” comes first.`) }],
      [3, (c, r) => { const [w, s, m, wr] = MEANINGS[c.world]!; return choice(r, `In this sentence, what does “${w}” mean?`, m, wr.map((x) => [x, `That is another meaning of “${w}”, but it does not fit this sentence.`] as [string, string]), `Here “${w}” means ${m}.`, s) }],
    ]),
    st('EN-Y4-WR-03', 4, 'Writing', 'Proof-read for spelling and punctuation errors', H_PROOF, [
      [1, spotQ(MISSPELT_34)],
      [2, (c, r) => choice(r, 'Which sentence uses capital letters correctly?', `On Saturday, ${c.actor} met ${c.actor2} in London.`, [[`on Saturday, ${c.actor} met ${c.actor2} in London.`, 'Every sentence starts with a capital letter.'], [`On saturday, ${c.actor} met ${c.actor2} in London.`, 'Days of the week need capital letters.'], [`On Saturday, ${c.actor} met ${c.actor2} in london.`, 'Names of places need capital letters.']], 'Sentence starts, days, names and places all need capital letters.')],
      [3, (c, r) => choice(r, 'Which sentence is punctuated correctly?', `${c.actor}’s ${c.things} were left at ${c.place}.`, [[`${c.actor}s ${c.things} were left at ${c.place}.`, 'It needs an apostrophe to show the things belong to someone.'], [`${c.actor}’s ${c.things} were left at ${c.place}`, 'A sentence needs a full stop at the end.'], [`${c.actor}’s, ${c.things} were left at ${c.place}.`, 'There should not be a comma there.']], 'The apostrophe shows belonging, and the sentence ends with a full stop.')],
    ]),
    st('EN-Y4-WR-04', 4, 'Writing', 'Plan writing, and evaluate and improve it', H_EDIT, [
      [1, (c, r) => choice(r, `${c.actor} wrote three sentences about ${c.event}, but mixed them up.\nA: Finally, everyone cheered.\nB: First, the ${c.crowd} arrived.\nC: Next, ${c.event} began.\nWhich order is right?`, 'B, C, A', [['A, B, C', '“Finally” belongs at the end.'], ['C, A, B', '“First” belongs at the start.'], ['B, A, C', '“Finally” should be last.']], 'Time words (first, next, finally) show the order.')],
      [2, (c, r) => choice(r, `Which is the best improvement of “The ${c.thing} was good.”?`, `The gleaming, brand-new ${c.thing} sparkled under the lights.`, [[`The ${c.thing} was very good.`, '“Very good” is still vague. Use precise adjectives and a strong verb.'], [`The ${c.thing} was good and nice.`, '“Nice” does not add a picture.'], [`Good was the ${c.thing}.`, 'Changing the order does not improve it.']], 'Precise adjectives and a strong verb help the reader picture it.')],
      [3, (c) => open(`Improve this sentence by adding a fronted adverbial and a more powerful verb: “${c.actor} went to ${c.place}.”`, 'Starts with a fronted adverbial followed by a comma, and replaces “went” with a more precise verb.', `Early that morning, ${c.actor} raced to ${c.place}.`)],
    ]),
    st('EN-Y4-WR-05', 4, 'Writing', 'Write for different purposes: instructions and recounts', H_FORMS, [
      [1, (c, r) => choice(r, `${c.actor} is writing instructions for getting ready for ${c.event}. Which sentence belongs in instructions?`, `Put your ${c.things} in your bag.`, [[`Yesterday I put my ${c.things} in my bag.`, 'That is a recount: it tells what happened, in the past tense.'], [`${cap(c.things)} are made in factories.`, 'That is a fact for a report.'], [`I love my ${c.things}!`, 'That is an opinion.']], 'Instructions use bossy (imperative) verbs like “put”.')],
      [2, (c) => open(`Write three numbered instructions telling a new member of ${c.team} how to get ready for ${c.event}.`, 'Three numbered steps, each starting with an imperative verb, in a sensible order.', `1. Pack your ${c.things}. 2. Arrive at ${c.place} early. 3. Warm up with the team.`)],
      [3, (c) => open(`Write a short recount of a day at ${c.place}. Use the past tense and at least two time words.`, 'Past tense throughout, at least two time words or phrases (first, then, later, finally), events in order.', `First, I arrived at ${c.place}. Then I watched ${c.event}. Finally, we cheered as ${c.actor} ${c.win}.`)],
    ]),
  ],
  5: [
    st('EN-Y5-RD-06', 5, 'Reading', 'Read poetry and discuss how poets use language, including figurative language', H_POEM, [[1, deviceQ], [2, wordQ], [3, poemOpen('image')]]),
    st('EN-Y5-RD-07', 5, 'Reading', 'Explain how structure and presentation help the reader in non-fiction', H_INFO, [[1, layoutQ], [2, bulletQ], [3, (c) => open(`How does the layout of “${infoFor(c.world).title}” help a reader who wants to find one fact quickly?`, 'Explains at least one layout feature (headings, sections, bullet points) and how it helps find information.', 'The headings split it into topics, so you can go straight to the right section, and the bullet points make single facts easy to spot.', infoExtract(c.world))]]),
    st('EN-Y5-RD-08', 5, 'Reading', 'Read play scripts and understand how they are set out', H_TYPES, [
      [1, (c, r) => { const s = script(c); return choice(r, 'Which part of the script is a stage direction?', s.dir, [[s.line.split(': ')[1]!, 'That is a line the actor says out loud.'], ['Let’s go.', 'That is spoken.'], ['Two minutes! Places, please!', 'That is spoken.']], 'Stage directions are in brackets. They tell actors what to do, not what to say.', s.text) }],
      [2, (c, r) => choice(r, 'Why is a name written at the start of each line in the script?', 'To show who is speaking', [['To show who wrote the script', 'The writer’s name is not on each line.'], ['To show who is listening', 'It shows the speaker.'], ['To make the names easy to spell', 'That is not why scripts do this.']], 'In a script, the character’s name comes before the words they say.', script(c).text)],
      [3, (c) => open('Write the next two lines of the script. Include one stage direction in brackets.', 'Two lines set out as a script (NAME: words), with at least one stage direction in brackets, continuing the scene sensibly.', `${c.actor2.toUpperCase()}: (giving a thumbs up) Good luck! ${c.actor.toUpperCase()}: (smiling) Thanks. Here goes!`, script(c).text)],
    ]),
    st('EN-Y5-RD-09', 5, 'Reading', 'Use dictionaries to check the spelling and meaning of words', H_DICT, [
      [1, (c, r) => { const [right, wrong] = at(c, MISSPELT_56, 0); const swap = right.replace(/(.)(.)$/, '$2$1'); const alt = swap !== right && swap !== wrong ? swap : `${right}e`; return choice(r, `${c.actor} checks a spelling in the dictionary. Which spelling is correct?`, right, [[wrong, 'Check the dictionary spelling letter by letter.'], [alt, 'Check the ending letter by letter.']], `The correct spelling is “${right}”.`) }],
      [2, (c, r) => { const [w, s, cls] = CLASS[c.world]!; return choice(r, `A dictionary says “${w}” can be a noun or a verb. In this sentence, which is it?`, cls, [[cls === 'noun' ? 'verb' : 'noun', cls === 'noun' ? 'It is a thing here, not an action.' : 'It is an action here, not a thing.'], ['adjective', 'It is not describing a noun.']], `Here “${w}” is a ${cls}.`, s) }],
      [3, (c, r) => { const [w, s, m, wr] = MEANINGS[c.world]!; return choice(r, `“${w}” has several meanings in the dictionary. Which meaning fits this sentence?`, m, wr.map((x) => [x, 'That is a real meaning, but not in this sentence.'] as [string, string]), `Here “${w}” means ${m}.`, s) }],
    ]),
    st('EN-Y5-WR-03', 5, 'Writing', 'Proof-read for spelling and punctuation errors', H_PROOF, [
      [1, spotQ(MISSPELT_56)],
      [2, (c, r) => choice(r, 'Which sentence uses inverted commas (speech marks) correctly?', `“Are you ready?” asked ${c.actor}.`, [[`“Are you ready” asked ${c.actor}?`, 'The question mark goes inside the speech marks.'], [`“Are you ready?” Asked ${c.actor}.`, '“asked” does not need a capital letter.'], [`Are you ready? asked ${c.actor}.`, 'The spoken words need speech marks around them.']], 'The spoken words and their punctuation go inside the inverted commas.')],
      [3, (c) => open(`Rewrite this with the three mistakes corrected: “yesterday ${c.actor} definately wanted to win, but ${c.actor2} was'nt sure.”`, 'Capital letter for “Yesterday”, “definitely” spelt correctly, and “wasn’t” with the apostrophe in the right place.', `Yesterday ${c.actor} definitely wanted to win, but ${c.actor2} wasn’t sure.`)],
    ]),
    st('EN-Y5-WR-04', 5, 'Writing', 'Draft and edit to improve vocabulary and cohesion', H_EDIT, [
      [1, (c, r) => choice(r, `Which word makes this sentence more precise? “${c.actor} ___ across ${c.place}.”`, 'sprinted', [['went', '“Went” does not tell us how.'], ['moved', '“Moved” is still vague.'], ['got', '“Got” does not tell us how.']], '“Sprinted” tells the reader exactly how fast.')],
      [2, (c, r) => choice(r, `Which linking phrase best joins these paragraphs? Paragraph 1: the ${c.crowd} wait nervously. Paragraph 2: ${c.event} begins.`, 'A few minutes later,', [['However,', '“However” shows a contrast, but these events follow each other.'], ['In conclusion,', 'That is for endings.'], ['For example,', 'Paragraph 2 is not an example of paragraph 1.']], 'A time adverbial links the paragraphs and moves the action on.')],
      [3, (c) => open(`Rewrite this to make it more persuasive: “You could come to ${c.event} if you want.”`, 'Uses persuasive features: direct address, strong adjectives, a rhetorical question or a reason, with a confident tone.', `Don’t miss ${c.event}! Where else can you see ${c.actor} live? Book your seat today.`)],
    ]),
    st('EN-Y5-WR-05', 5, 'Writing', 'Write non-chronological reports and poems', H_FORMS, [
      [1, (c, r) => choice(r, `${c.actor} is writing a report about ${c.place}. Which feature belongs in a non-chronological report?`, 'Headings that group facts by topic', [['Time words like “first” and “then”', 'Those are for recounts and stories.'], ['Numbered steps', 'Those are for instructions.'], ['Speech marks for every sentence', 'Reports are not written as dialogue.']], 'Reports group facts under headings, in the present tense.')],
      [2, (c) => open(`Write a short report paragraph about ${c.place}, with a heading and at least two facts in the present tense.`, 'A heading, at least two factual sentences in the present tense, formal tone.', `${cap(c.place.replace(/^the /, ''))}\n${cap(c.place)} is where ${c.event} takes place. Thousands of ${c.crowd} visit it every year.`)],
      [3, (c) => open(`Write a four-line poem about ${c.event}. Include a simile.`, 'Four lines about the topic, with at least one simile using “like” or “as”.', `The ${c.crowd} roar like a stormy sea,\nThe lights shine bright for all to see,\n${c.actor} steps out, ready to go,\nThe best night yet of the whole show.`)],
    ]),
  ],
  6: [
    st('EN-Y6-RD-06', 6, 'Reading', 'Discuss and evaluate how poets use language to create mood and meaning', H_POEM, [[1, moodQ], [2, themeQ], [3, poemOpen('evaluate')]]),
    st('EN-Y6-RD-07', 6, 'Reading', 'Retrieve information from non-fiction and tell fact from opinion', H_INFO, [[1, opinionQ], [2, trueQ], [3, (c) => open(`Present three key facts from “${infoFor(c.world).title}” as bullet points.`, 'Three accurate facts from the text, written as separate bullet points, each short and clear.', infoFor(c.world).facts.map((f) => `• ${f}`).join('\n') + `\n• ${infoFor(c.world).retrieve[0]![3]}`, infoExtract(c.world))]]),
    st('EN-Y6-RD-08', 6, 'Reading', 'Compare texts: how purpose and language differ between a poem and an information text', H_TYPES, [
      [1, (c, r) => choice(r, `Which text was written mainly to give facts: “${poemFor(c.world).title}” or “${infoFor(c.world).title}”?`, `“${infoFor(c.world).title}”`, [[`“${poemFor(c.world).title}”`, 'The poem is written to create pictures and feelings.'], ['Both equally', 'One is mainly facts; the other is mainly feelings and images.']], 'The information text gives facts under headings; the poem creates feelings and images.', `${poemExtract(poemFor(c.world))}\n\n${infoExtract(c.world)}`)],
      [2, (c, r) => choice(r, 'How is the language of the poem different from the information text?', 'The poem uses imagery, such as similes and personification', [['The poem uses headings and bullet points', 'Those are in the information text.'], ['The poem gives exact measurements', 'The information text gives the measurements.'], ['There is no difference', 'Compare a line from each.']], 'Poems use figurative language; information texts use clear, factual language.', `${poemExtract(poemFor(c.world))}\n\n${infoExtract(c.world)}`)],
      [3, (c) => open(`Compare how “${poemFor(c.world).title}” and “${infoFor(c.world).title}” make the reader feel about the topic. Refer to both texts.`, 'Compares both texts with at least one reference to each, and explains the different effects (feelings and images versus facts and information).', `The poem makes me feel ${poemFor(c.world).mood.a}, for example “${poemFor(c.world).devices[0]!.line}”, while the information text helps me understand facts, like “${infoFor(c.world).facts[0]}”`, `${poemExtract(poemFor(c.world))}\n\n${infoExtract(c.world)}`)],
    ]),
    st('EN-Y6-RD-09', 6, 'Reading', 'Use a thesaurus and dictionary to choose precise words', H_DICT, [
      [1, (c, r) => { const [w, frame, best, wr] = at(c, SYN, 0); return choice(r, `${c.actor} uses a thesaurus to replace “${w}”. Which word fits best?`, best, wr.map((x) => [x, 'Read the whole sentence. Does that word make sense here?'] as [string, string]), `“${best}” is the most precise fit.`, frame) }],
      [2, (c, r) => { const [w, ant, wr] = at(c, ANT, 0); return choice(r, `${c.actor} looks up an antonym (opposite) of “${w}”. Which is it?`, ant, wr.map((x) => [x, 'That is similar in meaning, or not related. An antonym is the opposite.'] as [string, string]), `The opposite of “${w}” is “${ant}”.`) }],
      [3, (c) => open(`Replace the word “nice” in this sentence with a more precise word, and explain your choice: “${cap(c.event)} at ${c.place} was nice.”`, 'Replaces “nice” with a precise, suitable word (e.g. thrilling, unforgettable) and explains why it is better.', `“${cap(c.event)} at ${c.place} was thrilling”, because it shows how exciting it felt.`)],
    ]),
    st('EN-Y6-WR-03', 6, 'Writing', 'Proof-read and edit for consistent tense, agreement and punctuation', H_PROOF, [
      [1, (c, r) => choice(r, `Which verb keeps the tense consistent? “Yesterday, ${c.actor} ___ to ${c.place} and trained for hours.”`, 'went', [['goes', 'That is present tense, but “yesterday” and “trained” are past.'], ['will go', 'That is future tense.'], ['going', 'That needs a helper verb, like “was going”.']], 'Past tense matches “yesterday” and “trained”.')],
      [2, (c, r) => choice(r, 'Which sentence is correct?', `The ${c.crowd} in the front row were cheering loudly.`, [[`The ${c.crowd} in the front row was cheering loudly.`, `The subject is “${c.crowd}” (plural), so use “were”.`], [`The ${c.crowd} in the front row is cheering loudly.`, 'The tense and agreement are both wrong.'], [`The ${c.crowd} in the front row were cheered loudly.`, 'That changes the meaning.']], 'The verb must agree with the subject: plural subject, plural verb.')],
      [3, (c) => open(`Edit this paragraph so the tense is consistent and the punctuation is correct: “${c.actor} walks into ${c.place}. The ${c.crowd} cheered loudly ${c.he} waved back and smiles.”`, 'Consistent tense throughout (all past or all present), and the run-on sentence fixed with a full stop, semicolon or conjunction.', `${c.actor} walked into ${c.place}. The ${c.crowd} cheered loudly; ${c.he} waved back and smiled.`)],
    ]),
    st('EN-Y6-WR-04', 6, 'Writing', 'Evaluate and edit to suit the audience, purpose and level of formality', H_EDIT, [
      [1, (c, r) => choice(r, `${c.actor} is writing to the manager of ${c.place}. Which sentence is the most formal?`, `I would be grateful if you could send me further information.`, [['Can you send me some more stuff?', '“Stuff” is informal.'], ['Send me more info, thanks!', 'That is a chatty, informal tone.'], ['Gimme the details, yeah?', 'That is very informal.']], 'Formal writing uses polite, complete sentences and no slang.')],
      [2, (c, r) => choice(r, `Which version of a sentence for a report about ${c.place} is clearest and most cohesive?`, `A new visitor centre opened at ${c.place} last spring. Since then, it has welcomed thousands of ${c.crowd}.`, [[`A new visitor centre opened at ${c.place} last spring. It has welcomed thousands of ${c.crowd}. It opened last spring.`, 'That repeats information.'], ['It opened last spring and it has welcomed and it has thousands.', 'That is muddled and repetitive.'], ['Thousands. Visitor centre. Last spring.', 'Those are not proper sentences.']], 'The adverbial “Since then” links the ideas clearly.')],
      [3, (c) => open(`Rewrite this informal message as a formal email: “Hiya! Can we come to ${c.place} next week? Cheers!”`, 'Formal greeting and sign-off, polite request, complete sentences, no slang.', `Dear Sir or Madam,\nI am writing to ask whether our class could visit ${c.place} next week.\nYours faithfully,\n${c.actor}`)],
    ]),
    st('EN-Y6-WR-05', 6, 'Writing', 'Write narratives and balanced arguments', H_FORMS, [
      [1, (c, r) => choice(r, `${c.actor} is writing a balanced argument. Which sentence belongs in it?`, 'On the other hand, some people believe it costs too much.', [['Once upon a time, there was a champion.', 'That is a story opening.'], ['Step 1: open the door.', 'That is an instruction.'], ['Everyone agrees with me, so there is nothing to discuss.', 'A balanced argument gives both sides.']], 'Balanced arguments give points for and against, linked with phrases like “on the other hand”.')],
      [2, (c) => open(`Write a short balanced argument: should ${c.event} take place on school days? Give one point for, one against, and a conclusion.`, 'One point for and one point against, each with a reason, linked with a contrast phrase, plus a short conclusion.', `Some people think it should, because more ${c.crowd} could watch. On the other hand, children need to be in school. Overall, weekends are better.`)],
      [3, (c) => open(`Write the opening of a story that starts with a flashback to ${c.actor}’s first visit to ${c.place}.`, 'A story opening that clearly moves back in time (a flashback), with past-tense narration and a link back to the present.', `${c.actor} closed ${c.his} eyes. Ten years earlier, ${c.he} had stood in this same spot at ${c.place}, too nervous to speak. Now, the ${c.crowd} were chanting ${c.his} name.`)],
    ]),
  ],
}
