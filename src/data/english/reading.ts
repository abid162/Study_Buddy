import type { Rng } from '../bank/rng'
import type { EnDraft, EnStatement, Level } from './types'
import { choice, open, typed } from './build'
import { leadOf, type Lead } from './skins'

/**
 * Reading comprehension: one original passage per world, with its own questions for each year.
 * Each reading statement gets 2 passage-specific items per world plus 1 item that works with any passage.
 */

type RQ = (L: Lead, r: Rng, text: string) => EnDraft
interface Passage {
  world: string
  title: string
  text: (L: Lead) => string
  /** q[year] = five pairs, one pair per reading statement (RD-01 … RD-05) */
  q: Record<4 | 5 | 6, [RQ, RQ][]>
}

export const PASSAGES: Passage[] = [
  {
    world: 'football', title: 'The Last Penalty',
    text: (L) => `The score was one-all and the cup final had gone to penalties. Above the stadium, grey clouds rolled in like a heavy blanket, but nobody in the crowd noticed the cold.

${L.name} walked slowly from the halfway line. ${L.His} legs felt like jelly and ${L.his} heart thumped against ${L.his} ribs. In the third row, ${L.his} grandmother waved the faded blue scarf she had brought to every match for forty years.

${L.name} placed the ball on the spot and stepped back. The goalkeeper bounced on the line, arms stretched wide. For a moment the whole stadium held its breath.

Then ${L.he} ran, struck the ball low and hard, and watched it skim past the keeper’s fingertips into the bottom corner. The net rippled. The silence shattered into a roar so loud it seemed to shake the floodlights.

Stadium FC had won the cup. As teammates piled on top of ${L.him}, ${L.name} looked up at the third row and pointed at the blue scarf. It was, ${L.he} later said, the best moment of ${L.his} life.`,
    q: {
      4: [
        [(_L, r) => choice(r, 'What was the score before the penalties?', 'one-all', [['two-one', 'Look at the first sentence.'], ['nil-nil', 'Look at the first sentence.']], 'The first sentence says the score was one-all.'),
         (L) => typed(`Who waved a blue scarf?`, ['his grandmother', 'her grandmother', 'grandmother', 'the grandmother', `${L.name}’s grandmother`], `${L.name}’s grandmother waved the scarf.`, { keys: ['grandmother', 'gran'] })],
        [(L, r) => choice(r, `How did ${L.name} feel walking to the spot?`, 'nervous', [['bored', 'Look at how ${L.his} legs and heart felt.'.replace('${L.his}', L.his)], ['angry', 'The clues show worry, not anger.']], `“Legs felt like jelly” and a thumping heart show nerves.`),
         (L) => open(`Why did ${L.name} point at the third row after scoring?`, 'Explains that the player was showing thanks/love to the grandmother (with the lucky scarf) who was sitting there; uses the text.', `${L.He} wanted to share the moment with ${L.his} grandmother, who was sitting there with the scarf.`)],
        [(_L, r) => choice(r, 'In the passage, what does “shattered” suggest about the silence?', 'It ended suddenly', [['It got quieter', 'The opposite happened: it became a roar.'], ['It lasted longer', 'It stopped, it did not continue.']], 'Something that shatters breaks suddenly.'),
         (_L, r) => choice(r, 'Which word in paragraph 3 means jumped up and down?', 'bounced', [['stretched', 'That means reached out.'], ['placed', 'That means put down.']], 'The goalkeeper “bounced” on the line.')],
        [(_L) => open(`Clouds rolled in above the stadium. What do you think might happen after the celebrations?`, 'A sensible prediction (e.g. it starts to rain) linked to a clue in the text (the grey clouds).', 'It might start to rain, because grey clouds were rolling in.'),
         (L) => open(`Do you think ${L.name} will keep playing for Stadium FC? Why?`, 'A prediction with a reason based on the text (e.g. it was the best moment of their life, the team celebrated together).', `Yes, because ${L.he} loved winning with ${L.his} teammates.`)],
        [(L, r) => choice(r, 'Which is the best summary of the passage?', `${L.name} scores the winning penalty in the cup final.`, [['A grandmother buys a new scarf.', 'The scarf is a detail, and it is old, not new.'], ['A goalkeeper saves every penalty.', 'The keeper does not save it.']], 'This sums up the main event.'),
         (L, r) => choice(r, 'What is paragraph 2 mainly about?', `How ${L.name} felt, and ${L.his} grandmother watching`, [['The weather', 'That is paragraph 1.'], ['The celebration', 'That is the last paragraph.']], 'Paragraph 2 describes nerves and the grandmother.')],
      ],
      5: [
        [(_L) => typed('How many years had the grandmother brought the scarf to matches?', ['forty', '40', 'forty years', '40 years'], 'She had brought it for forty years.', { keys: ['forty', '40'] }),
         (L, r) => choice(r, `Where did ${L.name} aim the ball?`, 'low into the bottom corner', [['high into the top corner', 'The text says “low and hard”.'], ['straight at the keeper', 'It went past the keeper’s fingertips.']], 'It was struck low and went into the bottom corner.')],
        [(_L) => open(`How do we know the moment mattered to the whole crowd? Give evidence.`, 'Uses evidence such as “the whole stadium held its breath” or the roar that “seemed to shake the floodlights”, and explains it.', 'The whole stadium held its breath, which shows everyone cared about the result.'),
         (_L) => open(`What can you infer about the grandmother? Use evidence.`, 'A reasonable inference (e.g. she is a loyal, long-time fan) supported by evidence (brought the scarf for forty years).', 'She is a very loyal fan, because she has brought the same scarf for forty years.')],
        [(_L, r) => choice(r, 'Why did the writer say the roar “seemed to shake the floodlights”?', 'To show how loud the crowd was', [['To say the lights were broken', 'It is exaggeration, not a fact.'], ['To describe the weather', 'It is about the crowd’s noise.']], 'The exaggeration shows how loud the cheer was.'),
         (_L) => open('Find and copy a phrase that builds tension before the penalty. Explain your choice.', 'Copies a suitable phrase (e.g. “held its breath”, “arms stretched wide”, “legs felt like jelly”) and explains how it builds tension.', '“The whole stadium held its breath” makes us wait to see what happens.')],
        [(L) => open('Summarise the passage in no more than 25 words.', 'No more than 25 words; covers the penalty, the winning goal and the celebration/grandmother; own words.', `In a tense cup final shootout, a nervous ${L.name} scores the winning penalty and celebrates with ${L.his} grandmother in the crowd.`),
         (_L, r) => choice(r, 'Which key detail would you keep in a summary?', 'Stadium FC won the cup.', [['The clouds were grey.', 'That is a background detail.'], ['The keeper bounced on the line.', 'That is a small detail.']], 'The result is a key detail.')],
        [(L, r) => choice(r, 'Which is an opinion?', `It was the best moment of ${L.his} life.`, [['The score was one-all.', 'That is a fact.'], ['Stadium FC had won the cup.', 'That is a fact.']], 'Only the player can decide it was the best moment: it is an opinion.'),
         (_L, r) => choice(r, 'Which is a fact from the passage?', 'The match went to penalties.', [['Penalties are the most exciting part of football.', 'That is an opinion.']], 'It can be checked in the text.')],
      ],
      6: [
        [(_L, r) => choice(r, 'Which row was the grandmother sitting in?', 'the third row', [['the front row', 'Check paragraph 2.'], ['the back row', 'Check paragraph 2.']], 'She was in the third row.'),
         (_L) => typed('What colour was the scarf?', ['blue', 'faded blue'], 'It was a faded blue scarf.', { keys: ['blue'] })],
        [(L) => open(`How does ${L.name}’s mood change from paragraph 2 to the end? Use evidence.`, 'Identifies the change from nervous (legs like jelly, heart thumping) to overjoyed/proud (best moment of life, pointing to grandmother), with evidence for both.', `${L.He} starts nervous – ${L.his} legs “felt like jelly” – but ends overjoyed, calling it “the best moment of ${L.his} life”.`),
         (_L) => open('Why do you think the writer mentions the scarf at the start and at the end?', 'Explains the link/circular structure: the scarf connects the grandmother’s loyalty to the winning moment; shows family support.', 'It links the start and end, showing the win was shared with the grandmother who supported for years.')],
        [(_L, r) => choice(r, '“Grey clouds rolled in like a heavy blanket.” What kind of figurative language is this?', 'a simile', [['a metaphor', 'It uses “like”, so it is a simile.'], ['personification', 'It compares rather than giving human actions.']], 'A simile compares using “like” or “as”.'),
         (L) => open('Explain the effect of “legs felt like jelly”.', 'Explains it shows weakness/wobbliness from nerves and helps the reader feel the tension.', 'It shows ${he} was so nervous ${his} legs felt weak and wobbly.'.replace('${he}', L.he).replace('${his}', L.his))],
        [(_L) => open('Sum up each paragraph in no more than five words.', 'Five short summaries in order, each capturing that paragraph’s main point (e.g. score and weather; nerves and grandmother; the build-up; the goal; the win and celebration).', '1 Final goes to penalties. 2 Nerves and grandmother watching. 3 Everyone waits. 4 The winning goal. 5 Celebration and the scarf.'),
         (_L, r) => choice(r, 'What is the main theme of the passage?', 'Courage and family support', [['Bad weather', 'The weather is only background.'], ['Learning new rules', 'This is not in the passage.']], 'The player is brave and shares the win with family.')],
        [(_L, r) => choice(r, 'Why does paragraph 3 end with “held its breath”?', 'To create suspense before the kick', [['To show the crowd was ill', 'It is about tension, not illness.']], 'Pausing the action builds suspense.'),
         (_L) => open('Paragraph 4 uses short, punchy sentences. Why might the writer have done this?', 'Explains that short sentences speed up the pace/create impact at the climax.', 'Short sentences make the moment feel fast and dramatic.')],
      ],
    },
  },
  {
    world: 'wrestling', title: 'The Comeback',
    text: (L) => `Six months ago, ${L.name} had limped out of the arena with a twisted ankle. Tonight, ${L.he} was back to challenge for the Thunder Belt.

The lights dropped. Fireworks fizzed and crackled along the ramp, and the ${'fans'} stamped their feet until the floor trembled. ${L.name} marched to the ring with ${L.his} chin up, even though a small voice inside asked, “What if it happens again?”

${L.His} opponent, the Iron Giant, was enormous – a full head taller and as wide as a doorway. The bell rang. The Giant charged like a runaway train.

But ${L.name} had spent every week of ${L.his} recovery studying the Giant’s moves. ${L.He} ducked, spun and used the Giant’s own speed against him. The Giant crashed to the mat with a thud.

One, two, three! The referee raised ${L.name}’s arm. As the golden belt was fastened around ${L.his} waist, ${L.he} whispered, “This is for my coach, who never stopped believing in me.”`,
    q: {
      4: [
        [(L, r) => choice(r, `What injury did ${L.name} have six months ago?`, 'a twisted ankle', [['a broken arm', 'Look at the first sentence.'], ['a sore back', 'Look at the first sentence.']], 'The first sentence mentions a twisted ankle.'),
         (_L) => typed('What was the name of the belt?', ['the Thunder Belt', 'Thunder Belt'], 'It was the Thunder Belt.', { keys: ['thunder'] })],
        [(L, r) => choice(r, `What did the “small voice inside” show about ${L.name}?`, `${L.He} was a little worried`, [['${He} was bored'.replace('${He}', L.He), 'The question shows worry.'], ['${He} was angry'.replace('${He}', L.He), 'The question shows worry.']], 'Asking “What if it happens again?” shows worry about getting hurt.'),
         (L) => open(`Why do you think ${L.name} thanked ${L.his} coach?`, 'Explains that the coach supported/believed in the wrestler during the injury and recovery, using a clue from the text.', `Because the coach never stopped believing in ${L.him} while ${L.he} was injured.`)],
        [(_L, r) => choice(r, 'What does “enormous” mean?', 'very big', [['very fast', 'It describes size.'], ['very loud', 'It describes size.']], '“enormous” means very big.'),
         (_L, r) => choice(r, 'Which word describes the sound of the fireworks?', 'crackled', [['marched', 'That is how the wrestler walked.'], ['trembled', 'That is what the floor did.']], 'Fireworks “fizzed and crackled”.')],
        [(L) => open(`What do you think ${L.name} will do next, now ${L.he} is champion?`, 'A sensible prediction (e.g. defend the belt, celebrate with the coach) with a reason from the text.', `${L.He} will probably celebrate with ${L.his} coach and then defend the belt.`),
         (_L) => open('Do you think the Iron Giant will want a rematch? Why?', 'A prediction with a reason (e.g. he lost, he is big and strong and will want to win back).', 'Yes, because he lost in front of everyone and will want to win.')],
        [(L, r) => choice(r, 'Which is the best summary?', `${L.name} recovers from injury and wins the Thunder Belt.`, [['Fireworks go off at the arena.', 'That is only a detail.'], ['The Iron Giant wins easily.', 'He loses.']], 'This covers the main events.'),
         (L, r) => choice(r, 'What is paragraph 4 mainly about?', `How ${L.name} beat the Giant`, [['The fireworks', 'That is paragraph 2.'], ['The injury', 'That is paragraph 1.']], 'Paragraph 4 explains how the Giant was beaten.')],
      ],
      5: [
        [(L) => typed(`How long ago was ${L.name} injured?`, ['six months', 'six months ago', '6 months'], 'Six months ago.', { keys: ['six', '6'] }),
         (_L, r) => choice(r, 'How did the fans make the floor tremble?', 'They stamped their feet', [['They jumped on it', 'Check paragraph 2.'], ['The fireworks shook it', 'Check paragraph 2.']], 'The fans stamped their feet.')],
        [(L) => open(`How did ${L.name} win against a much bigger opponent? Use evidence.`, 'Explains the wrestler studied the Giant’s moves during recovery and used the Giant’s speed against him; uses evidence.', `${L.He} studied the Giant’s moves while recovering, then used the Giant’s own speed against him.`),
         (L) => open(`What kind of person is ${L.name}? Give two qualities with evidence.`, 'Two reasonable qualities (e.g. brave, determined, clever, grateful) each supported by evidence from the text.', `Brave – ${L.he} came back after injury. Clever – ${L.he} studied the Giant’s moves.`)],
        [(_L, r) => choice(r, '“charged like a runaway train” makes the Giant seem…', 'fast and impossible to stop', [['slow and careful', 'A runaway train is fast and out of control.'], ['small and weak', 'Trains are huge and powerful.']], 'The simile shows speed and power.'),
         (_L) => open('Find and copy a phrase that makes the entrance exciting. Explain why.', 'Copies a suitable phrase from paragraph 2 (e.g. “fireworks fizzed and crackled”, “stamped their feet until the floor trembled”) and explains its effect.', '“The floor trembled” shows how wild and excited the crowd was.')],
        [(L) => open('Summarise the passage in no more than 25 words.', 'No more than 25 words; covers the return from injury, the win against a bigger opponent and the dedication to the coach.', `After six months injured, ${L.name} returns, outsmarts the huge Iron Giant and wins the Thunder Belt, thanking ${L.his} coach.`),
         (L, r) => choice(r, 'Which detail is least important for a summary?', 'The fireworks fizzed along the ramp.', [[`${L.name} won the belt.`, 'That is the main result.'], [`${L.name} had been injured.`, 'That is important background.']], 'The fireworks are atmosphere, not a key event.')],
        [(_L, r) => choice(r, 'Which is an opinion?', 'The Iron Giant is the scariest wrestler ever.', [['The bell rang.', 'That is a fact from the passage.'], ['The referee raised the winner’s arm.', 'That is a fact.']], '“Scariest ever” is a personal view.'),
         (L, r) => choice(r, 'Which is a fact?', `${L.name} won the Thunder Belt.`, [['Wrestling is the best sport.', 'That is an opinion.']], 'It can be checked in the passage.')],
      ],
      6: [
        [(_L, r) => choice(r, 'How much taller was the Iron Giant?', 'a full head taller', [['twice as tall', 'Check paragraph 3.'], ['a little shorter', 'Check paragraph 3.']], 'He was a full head taller.'),
         (_L) => typed('What did the referee count to?', ['three', '3', 'one, two, three'], 'One, two, three: a pin.', { keys: ['three', '3'] })],
        [(L) => open(`How does the writer show that ${L.name} is both nervous and brave in paragraph 2?`, 'Brave: marched with chin up. Nervous: small voice asking “What if it happens again?” Explains both with evidence.', `${L.He} marched with ${L.his} chin up (brave), even though a voice asked “What if it happens again?” (nervous).`),
         (_L) => open('Why is the opponent called “the Iron Giant”? What does the name suggest?', 'Explains the name suggests size, strength and toughness (iron = hard/strong; giant = huge).', 'It suggests he is huge and as hard and strong as iron.')],
        [(_L, r) => choice(r, '“as wide as a doorway” is an example of…', 'a simile', [['a metaphor', 'It uses “as … as”, so it is a simile.'], ['alliteration', 'Alliteration repeats first sounds.']], 'A simile compares using “as” or “like”.'),
         (_L) => open('Explain the effect of “Fireworks fizzed and crackled”.', 'Identifies onomatopoeia and/or alliteration and explains it helps the reader hear the exciting entrance.', 'The sound words (onomatopoeia) let the reader hear the fireworks and feel the excitement.')],
        [(_L) => open('Sum up how the passage is organised, from start to finish, in three stages.', 'Three stages in order, e.g. the injury and return; the entrance and the opponent; the fight and victory.', 'The injury and comeback, the entrance and opponent, then the fight and victory.'),
         (_L, r) => choice(r, 'What is the main message?', 'Hard work and belief can help you overcome setbacks', [['Bigger people always win', 'The smaller wrestler wins.']], 'The wrestler recovers and wins through preparation and support.')],
        [(_L, r) => choice(r, 'Why does the passage start with the injury?', 'To show how far the wrestler has come', [['To describe the arena', 'The arena comes later.']], 'Starting with the setback makes the win more powerful.'),
         (_L) => open('Why do you think the writer ends with the words to the coach?', 'Explains the ending adds emotion/gratitude and links back to the comeback theme.', 'It shows the win was shared and that support made the comeback possible.')],
      ],
    },
  },
  {
    world: 'music', title: 'Soundcheck',
    text: (L) => `Ten minutes before the concert, every light on the stage flickered and went out. The amplifiers hummed, then fell silent. Backstage, the band stared at each other in the darkness.

Outside, five thousand fans were waiting. Some had queued since breakfast. A murmur rippled through the crowd, growing louder and more worried every second.

${L.name} grabbed an old acoustic guitar from its case. It needed no electricity – just fingers and strings. “Follow me,” ${L.he} said, and walked out onto the dark stage.

At first, only the front row could hear. Then, one by one, the fans switched on their phone torches until the arena glittered like a sky full of stars. Five thousand voices joined the chorus of the band’s first ever song.

When the power finally returned, nobody wanted the singalong to stop. Later, the fans agreed it was the most magical concert they had ever seen.`,
    q: {
      4: [
        [(_L, r) => choice(r, 'When did the lights go out?', 'ten minutes before the concert', [['halfway through the concert', 'Look at the first sentence.'], ['at the end', 'Look at the first sentence.']], 'The first sentence tells us.'),
         (_L) => typed('How many fans were waiting?', ['five thousand', '5000', '5,000'], 'Five thousand fans.', { keys: ['five thousand', '5000', '5,000'] })],
        [(_L, r) => choice(r, 'How did the crowd feel when the lights went out?', 'worried', [['excited', 'The murmur grew “more worried”.'], ['sleepy', 'They were waiting eagerly.']], 'The text says the murmur grew more worried.'),
         (L) => open(`Why did ${L.name} choose the acoustic guitar?`, 'Explains it does not need electricity, so it could be played during the power cut.', 'Because it needed no electricity, so it still worked in the power cut.')],
        [(_L, r) => choice(r, 'What does “murmur” mean?', 'a low, quiet sound of voices', [['a loud scream', 'A murmur is quiet.'], ['a type of song', 'It is the sound of people talking.']], 'A murmur is a low sound of many voices.'),
         (_L, r) => choice(r, 'Which word tells us the amplifiers made a low, steady sound?', 'hummed', [['glittered', 'That is about light.'], ['grabbed', 'That is an action.']], 'The amplifiers “hummed”.')],
        [(_L) => open('What do you think the band will do at their next concert? Why?', 'A sensible prediction (e.g. include an acoustic singalong) linked to the text.', 'They might plan an acoustic singalong, because the fans loved it.'),
         (_L) => open('What might the fans tell their friends the next day?', 'A sensible prediction based on the text (e.g. it was magical, the power went out but everyone sang).', 'That the lights went out but everyone sang together and it was magical.')],
        [(_L, r) => choice(r, 'Which is the best summary?', 'A power cut turns a concert into a magical singalong.', [['A guitar breaks during a show.', 'The guitar works fine.'], ['Fans go home early.', 'They stay and sing.']], 'It covers the main events.'),
         (_L, r) => choice(r, 'What is paragraph 2 mainly about?', 'The crowd waiting outside', [['The guitar', 'That is paragraph 3.'], ['The phone torches', 'That is paragraph 4.']], 'Paragraph 2 describes the waiting fans.')],
      ],
      5: [
        [(_L, r) => choice(r, 'Since when had some fans been queuing?', 'since breakfast', [['since lunch', 'Check paragraph 2.'], ['since the day before', 'Check paragraph 2.']], 'Some had queued since breakfast.'),
         (_L) => typed('Which song did everyone sing?', ['the band’s first ever song', 'their first ever song', 'their first song', 'the first song'], 'They sang the band’s first ever song.', { keys: ['first'] })],
        [(L) => open(`What does “Follow me” show about ${L.name}? Use evidence.`, 'Infers leadership/confidence/calm under pressure, supported by evidence (walked onto the dark stage, grabbed the guitar).', `It shows ${L.he} is a calm leader: ${L.he} walked out onto the dark stage first.`),
         (_L) => open('Why did the fans switch on their phone torches?', 'Explains they wanted to light up the dark stage/join in/support the band; justified from the text.', 'To light up the dark arena and show they were joining in.')],
        [(_L, r) => choice(r, 'Why does the writer say the arena “glittered like a sky full of stars”?', 'To show how beautiful the torches looked', [['To say it was night-time', 'It describes the torches, not the time.']], 'The simile shows how magical the lights looked.'),
         (_L) => open('Find and copy a phrase that shows the worry growing. Explain it.', 'Copies “growing louder and more worried every second” (or similar) and explains how it builds tension.', '“Growing louder and more worried every second” shows the panic spreading.')],
        [(L) => open('Summarise the passage in no more than 25 words.', 'No more than 25 words; power cut, acoustic singalong with torches, power returns and fans love it.', `When the power fails, ${L.name} leads an acoustic singalong lit by phone torches, and fans call it the most magical concert ever.`),
         (_L, r) => choice(r, 'Which detail is most important for a summary?', 'The power went out before the concert.', [['Some fans queued since breakfast.', 'That is a small detail.']], 'The power cut causes everything else.')],
        [(_L, r) => choice(r, 'Which is an opinion?', 'It was the most magical concert ever.', [['The lights went out.', 'That is a fact.'], ['Five thousand fans were waiting.', 'That is a fact.']], '“Most magical” is a personal judgement.'),
         (_L, r) => choice(r, 'Which is a fact?', 'The acoustic guitar needed no electricity.', [['Acoustic music is better than electric music.', 'That is an opinion.']], 'It is true and can be checked.')],
      ],
      6: [
        [(_L, r) => choice(r, 'Where was the band when the lights went out?', 'backstage', [['on the stage', 'Check paragraph 1.'], ['outside', 'Check paragraph 1.']], 'They were backstage.'),
         (_L) => typed('Who could hear the guitar at first?', ['the front row', 'only the front row', 'front row'], 'Only the front row could hear at first.', { keys: ['front'] })],
        [(_L) => open('How does the mood change through the passage? Use evidence.', 'Traces the mood from tense/worried (dark, silent, worried murmur) to joyful/magical (glittered, voices joined, most magical), with evidence.', 'It starts tense – the murmur grew “more worried” – and ends joyful, with fans calling it “magical”.'),
         (_L) => open('Why did nobody want the singalong to stop when the power returned?', 'Infers that the shared, unplanned moment felt special/magical; supported by the text.', 'Because singing together in the torchlight felt special and magical.')],
        [(_L, r) => choice(r, 'Which phrase is a simile?', 'glittered like a sky full of stars', [['every light flickered and went out', 'That is literal description.']], 'It compares using “like”.'),
         (_L) => open('“A murmur rippled through the crowd.” Explain why “rippled” is a good word choice.', 'Explains that “rippled” suggests the sound spreading gradually through the crowd like ripples on water.', 'It shows the worry spreading through the crowd like ripples on water.')],
        [(_L) => open('Write a one-sentence summary for each half of the passage (paragraphs 1–2 and 3–5).', 'Two sentences: one for the power cut and worried crowd; one for the singalong and the magical ending.', 'The power fails and the waiting crowd grows worried. The singer leads an acoustic singalong that becomes a magical night.'),
         (_L, r) => choice(r, 'What is the main theme?', 'Turning a problem into something special', [['Why electricity is dangerous', 'This is not the focus.']], 'The power cut becomes the best part of the night.')],
        [(_L, r) => choice(r, 'Why might the writer have used a short sentence in “Follow me,” he said?', 'To show quick, confident leadership', [['To make the passage longer', 'Short sentences make it shorter.']], 'Short speech shows decisive action.'),
         (_L) => open('Why do you think the writer chose to end with what the fans agreed?', 'Explains it gives a satisfying ending/confirms the problem became a positive, from the audience’s view.', 'It shows the problem turned into a great memory for everyone.')],
      ],
    },
  },
  {
    world: 'story', title: 'The Lost Map',
    text: (L) => `Deep in the forest stood an oak so old that its trunk had split down the middle. One misty morning, ${L.name} squeezed inside the hollow and found something rolled in oilskin: half of a torn map.

The map showed the river, a crooked bridge and a cross marked in faded red ink. The other half, which surely showed the treasure, was missing.

${L.name} followed the river for hours. Mud sucked at ${L.his} boots and brambles snagged ${L.his} sleeves. At the crooked bridge, a wise old owl blinked down from a branch. “Many have crossed,” it hooted, “but few have looked beneath.”

${L.name} knelt on the slippery bank and peered under the bridge. Wedged between two stones was a tin box. Inside lay the missing half of the map – and a note: “The real treasure is the courage it took to get here.”

${L.name} laughed, tucked both halves into ${L.his} pocket, and set off home as the sun broke through the mist.`,
    q: {
      4: [
        [(_L, r) => choice(r, 'Where did the map come from?', 'inside a hollow oak tree', [['under the bridge', 'That is where the second half was.'], ['from the owl', 'The owl gave a clue, not the map.']], 'The first half was in the hollow oak.'),
         (_L) => typed('What colour ink marked the cross?', ['red', 'faded red'], 'It was faded red ink.', { keys: ['red'] })],
        [(L, r) => choice(r, `How do you think ${L.name} felt following the river for hours?`, 'tired but determined', [['bored and giving up', `${L.He} kept going.`], ['scared and running home', `${L.He} did not turn back.`]], 'Walking for hours through mud shows determination.'),
         (_L) => open('Why did the owl say “few have looked beneath”?', 'Explains it was a hint to look under the bridge, where the missing half was hidden.', 'It was a clue to look under the bridge.')],
        [(_L, r) => choice(r, 'What does “snagged” mean?', 'caught on', [['washed', 'Brambles catch on clothes.'], ['painted', 'Brambles catch on clothes.']], 'Brambles “snagged” (caught on) the sleeves.'),
         (_L, r) => choice(r, 'Which word describes the shape of the bridge?', 'crooked', [['slippery', 'That describes the bank.'], ['faded', 'That describes the ink.']], 'It was a “crooked bridge”.')],
        [(L) => open(`What do you think ${L.name} will do with the map now?`, 'A sensible prediction (e.g. keep it, show friends, go on another adventure) with a reason.', `${L.He} might keep it to remember the adventure.`),
         (_L) => open('The note said the real treasure is courage. Do you think there was any other treasure? Why?', 'A reasoned opinion using clues from the text (e.g. no — the note says courage is the treasure).', 'No, because the note says the real treasure is courage.')],
        [(L, r) => choice(r, 'Which is the best summary?', `${L.name} finds both halves of a map and learns courage is the real treasure.`, [['An owl steals a map.', 'The owl helps.'], ['A tree falls down.', 'The tree is old but stands.']], 'It covers the main events.'),
         (_L, r) => choice(r, 'What is paragraph 3 mainly about?', 'The journey and the owl’s clue', [['Finding the first half', 'That is paragraph 1.'], ['Going home', 'That is the last paragraph.']], 'Paragraph 3 is the journey and the owl.')],
      ],
      5: [
        [(_L, r) => choice(r, 'What was the first half of the map wrapped in?', 'oilskin', [['paper', 'Check paragraph 1.'], ['a tin box', 'That held the second half.']], 'It was rolled in oilskin.'),
         (_L) => typed('Where exactly was the tin box?', ['between two stones', 'under the bridge', 'wedged between two stones under the bridge'], 'Wedged between two stones under the bridge.', { keys: ['stone', 'bridge'] })],
        [(L) => open(`What can you infer about ${L.name}’s character? Use evidence.`, 'A reasonable quality (curious, determined, brave, observant) with evidence (squeezed into the hollow; walked for hours; peered under the bridge).', `${L.He} is determined: ${L.he} followed the river for hours through mud and brambles.`),
         (_L) => open('Why do you think the person who left the note did not hide real treasure?', 'Infers they wanted to teach a lesson about courage/the journey; supported by the note.', 'They wanted the finder to realise the adventure itself was valuable.')],
        [(L, r) => choice(r, '“Mud sucked at his boots” – what does this suggest?', 'The mud was deep and hard to walk through', [['The mud was dry', 'Sucking mud is wet and sticky.']], 'It shows how difficult the walk was.'.replace('his', L.his)),
         (_L) => open('Find and copy a phrase that makes the forest sound mysterious. Explain why.', 'Copies a suitable phrase (e.g. “misty morning”, “an oak so old its trunk had split”) and explains the mysterious effect.', '“One misty morning” makes it hard to see, which feels mysterious.')],
        [(L) => open('Summarise the passage in no more than 25 words.', 'No more than 25 words; finding half a map, following it, owl’s clue, finding the other half and the note about courage.', `${L.name} finds half a map, follows a clue under a bridge, and discovers the other half with a note: courage is the treasure.`),
         (_L, r) => choice(r, 'Which detail matters most to the plot?', 'The owl’s clue to look beneath the bridge', [['The sleeves were snagged', 'That is a small detail.']], 'The clue leads to the second half.')],
        [(_L, r) => choice(r, 'Which is an opinion?', 'Courage is more valuable than gold.', [['The map was torn.', 'That is a fact in the story.'], ['The tin box was under the bridge.', 'That is a fact in the story.']], 'People may disagree, so it is an opinion.'),
         (_L, r) => choice(r, 'Which is a fact in the story?', 'The oak trunk had split down the middle.', [['Forests are the best place for adventures.', 'That is an opinion.']], 'It is stated in the story.')],
      ],
      6: [
        [(_L, r) => choice(r, 'What did the first half of the map show?', 'the river, a crooked bridge and a red cross', [['the treasure', 'The treasure half was missing.']], 'Paragraph 2 lists them.'),
         (_L) => typed('What was the weather like when the story ended?', ['the sun broke through the mist', 'sunny', 'the sun came out'], 'The sun broke through the mist.', { keys: ['sun'] })],
        [(_L) => open('Why do you think the writer included the owl?', 'Explains the owl acts as a wise guide giving a clue, adding mystery and moving the plot forward.', 'The owl is a wise guide that gives the clue needed to find the box.'),
         (L) => open(`How does ${L.name} react to the note, and what does this tell us?`, 'Notes the laugh and calm acceptance; infers good humour/understanding of the lesson.', `${L.He} laughs, which shows ${L.he} understands and is happy with the lesson.`)],
        [(_L, r) => choice(r, '“the sun broke through the mist” at the end suggests…', 'a hopeful, happy ending', [['danger is coming', 'Sunshine usually suggests hope.']], 'Light after mist suggests things are clear and happy.'),
         (_L) => open('The owl “blinked down”. What does this suggest about the owl?', 'Explains it suggests calm, watchful wisdom, perhaps slightly mysterious.', 'It suggests the owl is calm, wise and watching.')],
        [(_L) => open('Summarise the story’s structure in three stages.', 'Three stages: discovery of half a map; journey and clue; finding the second half and the lesson.', 'Discovery of the map, the journey and the clue, then finding the box and the lesson.'),
         (_L, r) => choice(r, 'What is the main theme?', 'The journey and courage matter more than treasure', [['Owls are dangerous', 'The owl helps.']], 'The note makes the theme clear.')],
        [(_L, r) => choice(r, 'Why is the mist mentioned at the start and the end?', 'It frames the story and shows a change from mystery to clarity', [['It is a mistake', 'Writers repeat images on purpose.']], 'Mist at the start, sun breaking through at the end.'),
         (_L) => open('Why do you think the note is the last piece of speech or writing in the story?', 'Explains that the note delivers the message/twist and gives the story its meaning at the climax.', 'It reveals the twist and the message just before the ending.')],
      ],
    },
  },
  {
    world: 'bricks', title: 'The Tallest Tower',
    text: (L) => `The weather forecast was clear: a storm would hit Brick City at sunset. ${L.name} and the builders had one day to finish the tallest tower the city had ever seen.

By midday, the tower stood twelve floors high. But at the thirteenth floor it began to sway, creaking like an old ship. Everyone froze. A single brick tumbled from the top and smashed on the ground.

“We need to go faster!” someone shouted.

“No,” said ${L.name} quietly. “We need to go wider.” ${L.He} explained that a tower with a wider base is much more stable, just like standing with your feet apart.

So the builders took the top floors down, widened the bottom three floors and started again. It was slower, but every new floor felt solid. As the first drops of rain fell, the final flag was raised on the twentieth floor. The storm howled all night, but in the morning the tower was still standing, straight and proud.`,
    q: {
      4: [
        [(_L, r) => choice(r, 'When would the storm hit?', 'at sunset', [['at midday', 'Check the first sentence.'], ['in the morning', 'Check the first sentence.']], 'The forecast said sunset.'),
         (_L) => typed('How many floors did the finished tower have?', ['twenty', '20', '20 floors', 'twenty floors'], 'Twenty floors.', { keys: ['twenty', '20'] })],
        [(_L, r) => choice(r, 'Why did everyone freeze?', 'They were scared the tower would fall', [['They were cold', 'Look at what the tower was doing.'], ['They were tired', 'Look at what the tower was doing.']], 'The tower was swaying.'),
         (L) => open(`Why did ${L.name} speak “quietly”?`, 'Gives a reason linked to calm/confidence/thinking carefully, from the text.', `${L.He} was calm and thinking clearly while others panicked.`)],
        [(_L, r) => choice(r, 'What does “stable” mean?', 'steady and not likely to fall', [['wobbly', 'That is the opposite.'], ['colourful', 'It is about steadiness.']], 'Stable means steady.'),
         (_L, r) => choice(r, 'Which word tells us the tower moved from side to side?', 'sway', [['smashed', 'That is what the brick did.'], ['raised', 'That is what happened to the flag.']], 'The tower began to “sway”.')],
        [(_L) => open('What do you think the people of Brick City will say when they see the tower in the morning?', 'A sensible prediction with a reason (e.g. amazed it survived the storm).', 'They will be amazed it survived the storm.'),
         (_L) => open('What might the builders do differently next time? Why?', 'A sensible prediction linked to the lesson (e.g. start with a wide base).', 'Start with a wide base, because that kept the tower steady.')],
        [(_L, r) => choice(r, 'Which is the best summary?', 'Builders make a tower wider so it survives a storm.', [['A storm knocks a tower down.', 'The tower survives.'], ['A brick breaks a window.', 'That does not happen.']], 'It covers the main events.'),
         (_L, r) => choice(r, 'What is the last paragraph mainly about?', 'Rebuilding and the tower surviving', [['The weather forecast', 'That is paragraph 1.']], 'The last paragraph tells how they rebuilt and survived.')],
      ],
      5: [
        [(_L, r) => choice(r, 'At which floor did the tower begin to sway?', 'the thirteenth', [['the twelfth', 'It stood twelve floors high first.'], ['the twentieth', 'That was the final floor.']], 'It swayed at the thirteenth floor.'),
         (_L) => typed('Which floors did the builders widen?', ['the bottom three floors', 'bottom three', 'the bottom three'], 'They widened the bottom three floors.', { keys: ['bottom', 'three'] })],
        [(L) => open(`Was ${L.name}’s idea a good one? Use evidence.`, 'Yes, with evidence: every floor felt solid; the tower survived the storm.', 'Yes – every new floor felt solid and the tower survived the storm.'),
         (_L) => open('Why did someone shout “We need to go faster!”?', 'Infers panic about the approaching storm/deadline; supported by the text.', 'They were panicking because the storm was coming at sunset.')],
        [(_L, r) => choice(r, '“creaking like an old ship” helps the reader…', 'hear and imagine the tower straining', [['know the tower was by the sea', 'It is a comparison, not a location.']], 'The simile adds sound and danger.'),
         (_L) => open('Find and copy a phrase that shows the storm was powerful. Explain.', 'Copies “The storm howled all night” (or similar) and explains the effect.', '“The storm howled all night” makes it sound wild and fierce.')],
        [(L) => open('Summarise the passage in no more than 25 words.', 'No more than 25 words; the deadline, the swaying, the wider-base idea, and the tower surviving.', `Racing a storm, the builders’ tower starts to sway, so ${L.name} has them widen the base, and it survives the night.`),
         (_L, r) => choice(r, 'Which detail is key?', 'They widened the base.', [['A flag was raised.', 'That is a detail, not the key change.']], 'The wider base is why the tower survived.')],
        [(_L, r) => choice(r, 'Which is a fact from the passage?', 'The tower had twenty floors.', [['Tall towers are the most beautiful buildings.', 'That is an opinion.']], 'It is stated in the text.'),
         (_L, r) => choice(r, 'Which is an opinion?', 'Building towers is the best job in the world.', [['A brick fell and smashed.', 'That is a fact in the story.']], 'People may disagree.')],
      ],
      6: [
        [(_L, r) => choice(r, 'How high was the tower at midday?', 'twelve floors', [['twenty floors', 'That was the final height.']], 'It stood twelve floors high at midday.'),
         (L) => typed(`What did ${L.name} compare a wide base to?`, ['standing with your feet apart', 'feet apart'], 'Standing with your feet apart.', { keys: ['feet'] })],
        [(L) => open(`Compare ${L.name} with the person who shouted. What does the contrast show?`, 'Contrasts the calm, thoughtful leader with the panicked shouter; shows good decisions come from staying calm.', `${L.name} stays calm and thinks, while the shouter panics; it shows calm thinking solves problems.`),
         (_L) => open('Why do you think the writer included the falling brick?', 'Explains it raises the tension/shows the danger was real.', 'It shows the danger was real and builds tension.')],
        [(_L, r) => choice(r, '“The storm howled” is an example of…', 'personification', [['a simile', 'There is no “like” or “as”.'], ['a fact', 'Storms do not really howl like animals.']], 'The storm is given an animal or human action.'),
         (_L) => open('Explain the effect of the ending “straight and proud”.', 'Explains personification/triumphant tone: the tower is described like a proud person, showing success.', 'It makes the tower seem like a proud person, celebrating the success.')],
        [(_L) => open('Summarise the problem, the solution and the result in one sentence each.', 'Three sentences: problem (tower swaying, storm coming); solution (wider base); result (tower survives).', 'The tower swayed as a storm approached. They widened the base. It survived the night.'),
         (_L, r) => choice(r, 'What is the main lesson?', 'Slow, careful work can beat rushing', [['Always build as fast as possible', 'Rushing nearly caused a collapse.']], 'Going wider (and slower) worked.')],
        [(_L, r) => choice(r, 'Why is the short line “Everyone froze.” effective?', 'It creates a sudden, tense pause', [['It explains how cold it was', 'It is about fear, not temperature.']], 'Short sentences can stop the action for effect.'),
         (_L) => open('Why does the writer mention the first drops of rain as the flag was raised?', 'Explains the timing creates suspense/shows they finished just in time.', 'It shows they finished just in time, adding suspense.')],
      ],
    },
  },
  {
    world: 'space', title: 'Lift-off',
    text: (L) => `Three hundred and eighty kilometres above the Earth, the space station drifted silently through the dark. ${L.name} was writing ${L.his} daily log when a red light began to flash.

“Warning,” said the computer calmly. “Fuel cell three is failing.” Without that fuel cell, the station would slowly lose power.

${L.name} pulled on ${L.his} gloves and floated through the airlock to the storage bay. Spanners and bolts drifted past ${L.him} like lazy fish. ${L.He} found the spare fuel cell, wrapped in silver foil, exactly where the checklist said it would be.

Swapping it took forty careful minutes. Every movement had to be slow, because in space a dropped tool can float away forever. At last the red light blinked off and the computer said, “All systems normal.”

${L.name} drifted to the window. Below, the Earth glowed blue and white, like a marble on black velvet. ${L.He} smiled and added one line to ${L.his} log: “Problem solved. View still amazing.”`,
    q: {
      4: [
        [(_L, r) => choice(r, 'How far above the Earth was the space station?', '380 kilometres', [['38 kilometres', 'Check the first sentence.'], ['3,800 kilometres', 'Check the first sentence.']], 'Three hundred and eighty kilometres.'),
         (_L) => typed('Which fuel cell was failing?', ['three', '3', 'fuel cell three', 'number three'], 'Fuel cell three.', { keys: ['three', '3'] })],
        [(L, r) => choice(r, `How did ${L.name} deal with the problem?`, 'calmly and carefully', [['in a panic', 'The text shows slow, careful work.'], ['by ignoring it', `${L.He} fixed it.`]], 'Forty careful minutes shows calm.'),
         (_L) => open('Why did every movement have to be slow?', 'Explains a dropped tool could float away forever in space.', 'Because in space a dropped tool can float away forever.')],
        [(_L, r) => choice(r, 'What does “drifted” mean?', 'moved slowly with no control', [['moved very fast', 'Drifting is slow.'], ['stayed perfectly still', 'Drifting is gentle movement.']], 'To drift is to move slowly, carried along.'),
         (_L, r) => choice(r, 'Which word tells us how the computer spoke?', 'calmly', [['silently', 'That describes the station.'], ['slowly', 'That describes the movements.']], 'The computer spoke “calmly”.')],
        [(L) => open(`What do you think ${L.name} will do tomorrow?`, 'A sensible prediction from the text (e.g. check the fuel cells, write the log, look at Earth).', `${L.He} will probably check the other fuel cells and write ${L.his} log.`),
         (_L) => open('What might happen if the spare fuel cell had been missing?', 'A sensible prediction (the station would slowly lose power) linked to the text.', 'The station would slowly lose power.')],
        [(L, r) => choice(r, 'Which is the best summary?', `${L.name} replaces a failing fuel cell on the space station.`, [['A rocket lands on the Moon.', 'That is not in the passage.'], ['The computer breaks.', 'The computer works fine.']], 'It covers the main event.'),
         (_L, r) => choice(r, 'What is paragraph 3 mainly about?', 'Finding the spare fuel cell', [['Looking at Earth', 'That is the last paragraph.'], ['The warning', 'That is paragraph 2.']], 'Paragraph 3 is the trip to the storage bay.')],
      ],
      5: [
        [(_L) => typed('How long did the swap take?', ['forty minutes', '40 minutes', 'forty careful minutes', '40'], 'Forty careful minutes.', { keys: ['forty', '40'] }),
         (_L, r) => choice(r, 'What was the spare fuel cell wrapped in?', 'silver foil', [['bubble wrap', 'Check paragraph 3.'], ['a blanket', 'Check paragraph 3.']], 'It was wrapped in silver foil.')],
        [(L) => open(`What does the last line of the log tell us about ${L.name}? Use evidence.`, 'Infers calm/positive/humorous attitude and appreciation of space; uses the log line as evidence.', `${L.He} stays calm and still enjoys space: “Problem solved. View still amazing.”`),
         (_L) => open('Why is it important that the fuel cell was “exactly where the checklist said”?', 'Explains good organisation/planning helps in emergencies; supported by text.', 'Because careful planning meant the problem could be fixed quickly and safely.')],
        [(_L, r) => choice(r, 'Why does the writer compare the tools to “lazy fish”?', 'To show they floated slowly in the air', [['To say there were fish on the station', 'It is a comparison.']], 'The simile shows how things float in zero gravity.'),
         (_L) => open('Find and copy a phrase that makes space sound peaceful. Explain.', 'Copies a suitable phrase (e.g. “drifted silently through the dark”) and explains its calm effect.', '“Drifted silently through the dark” sounds slow and calm.')],
        [(L) => open('Summarise the passage in no more than 25 words.', 'No more than 25 words; warning, fixing the fuel cell carefully, problem solved and admiring Earth.', `When a fuel cell fails, ${L.name} carefully replaces it with the spare, then admires the Earth and logs that the problem is solved.`),
         (_L, r) => choice(r, 'Which detail would you leave out of a summary?', 'The spanners drifted like lazy fish.', [['Fuel cell three was failing.', 'That is the main problem.']], 'It is description, not a key event.')],
        [(_L, r) => choice(r, 'Which is a fact from the passage?', 'The swap took forty minutes.', [['Space is the most exciting place to work.', 'That is an opinion.']], 'It is stated in the text.'),
         (_L, r) => choice(r, 'Which is an opinion?', 'View still amazing.', [['Fuel cell three is failing.', 'That is a fact.']], 'Saying a view is amazing is a personal judgement.')],
      ],
      6: [
        [(_L, r) => choice(r, 'What was the astronaut doing when the light began to flash?', 'writing a daily log', [['sleeping', 'Check paragraph 1.'], ['eating', 'Check paragraph 1.']], 'Writing the daily log.'),
         (_L) => typed('What did the computer say when the problem was fixed?', ['all systems normal', '“All systems normal.”'], '“All systems normal.”', { keys: ['normal'] })],
        [(_L) => open('How does the writer show that the situation was serious, but not a panic?', 'Serious: warning, losing power. Not panic: computer speaks calmly, careful movements, checklist. Uses evidence for both.', 'It is serious because the station could lose power, but the computer speaks “calmly” and the work is slow and careful.'),
         (_L) => open('Why do you think the writer ends with the log entry?', 'Explains it echoes the opening (daily log), shows calm humour and closes the story neatly.', 'It links back to the opening log and ends on a calm, happy note.')],
        [(_L, r) => choice(r, '“like a marble on black velvet” is…', 'a simile', [['a metaphor', 'It uses “like”.'], ['onomatopoeia', 'It is not a sound word.']], 'It compares using “like”.'),
         (_L) => open('Explain what “like a marble on black velvet” suggests about the Earth.', 'Explains it suggests Earth is small, round, precious/beautiful and stands out against the dark space.', 'It makes Earth seem small, beautiful and precious against the dark.')],
        [(_L) => open('Sum up each paragraph in no more than five words.', 'Five short summaries in order (e.g. calm station, warning light; fuel cell failing; finding the spare; careful repair; admiring Earth).', '1 Quiet station, warning. 2 Fuel cell failing. 3 Finding the spare. 4 Careful repair. 5 Admiring Earth.'),
         (_L, r) => choice(r, 'What is the main theme?', 'Calm preparation helps solve problems', [['Space is dangerous so nobody should go', 'The passage shows problems can be solved.']], 'The checklist and careful work solve the problem.')],
        [(_L, r) => choice(r, 'Why does the passage start with the station drifting “silently”?', 'To make the warning more surprising', [['To explain how fuel cells work', 'It sets a calm scene.']], 'A calm start makes the alarm stand out.'),
         (_L) => open('Why did the writer include the detail that “a dropped tool can float away forever”?', 'Explains it raises the stakes/tension and explains why the repair took so long.', 'It shows the danger and explains why every move had to be slow.')],
      ],
    },
  },
]

const RD_TEXT: Record<4 | 5 | 6, string[]> = {
  4: ['Retrieve and record information from a text', 'Infer characters’ feelings, thoughts and motives from their actions', 'Explain the meaning of words in context', 'Predict what might happen from details stated and implied', 'Identify main ideas drawn from more than one paragraph and summarise them'],
  5: ['Retrieve, record and present information', 'Draw inferences and justify them with evidence', 'Discuss words and phrases that capture the reader’s interest', 'Summarise the main ideas, identifying key details', 'Distinguish between statements of fact and opinion'],
  6: ['Retrieve and present information from texts', 'Infer and justify with evidence from the text', 'Explain how figurative language contributes to meaning', 'Summarise the main ideas across paragraphs', 'Explain how structure and the writer’s choices affect the reader'],
}
const RD_HINTS: [string, string, string][] = [
  ['The answer is written in the text. Find the right paragraph.', 'Look for a key word from the question in the passage.', 'Read the sentence around that key word carefully, then copy or choose the answer.'],
  ['The answer is not written directly: use clues.', 'Look at what characters do and say, and how they are described.', 'Find one clue, then explain what it tells you, using “because”.'],
  ['Words are chosen on purpose.', 'Read the sentence around the word. What does it make you see, hear or feel?', 'Swap the word for a simpler one: what is lost?'],
  ['Think about the passage as a whole.', 'What is each paragraph mostly about? Which details really matter?', 'Say the main point in one sentence, leaving out small details.'],
  ['Think about why the writer made this choice.', 'Facts can be checked; opinions are what someone thinks. Structure is how the text is ordered.', 'Ask: what effect does this have on the reader?'],
]

/** Items that work with any world’s passage (the AI sees the passage when marking). */
const GENERIC: Record<4 | 5 | 6, ((L: Lead) => [string, string, string])[]> = {
  4: [
    (_L) => [`Find and copy one sentence that tells you where the story takes place.`, 'A sentence copied (or nearly copied) from the passage that shows the setting.', 'Any sentence naming the place, e.g. the first sentence.'],
    (L) => [`How does ${L.name} feel at the end? Give one piece of evidence.`, 'A suitable feeling with one piece of evidence from the passage.', `${L.He} feels happy, because ${L.he} smiles at the end.`],
    (_L) => ['Find and copy one word from the passage that describes a sound.', 'A single sound word copied from the passage (e.g. roar, hummed, crackled, howled, thud).', 'roar'],
    (_L) => ['What do you think happens next? Use a clue from the passage.', 'A sensible prediction supported by a clue from the passage.', 'They celebrate, because the problem has been solved.'],
    (_L) => ['Which paragraph is the most exciting? Explain why.', 'Names a paragraph and gives a reason linked to events or words in it.', 'Paragraph 4, because that is when the big moment happens.'],
  ],
  5: [
    (L) => [`Find and copy two facts about ${L.name} from the passage.`, 'Two facts about the main character copied or closely paraphrased from the passage.', `Any two details the passage states about ${L.name}.`],
    (L) => [`What is ${L.name}’s biggest strength? Justify your answer with evidence.`, 'Names a quality and supports it with a quotation or close reference.', `Staying calm – ${L.he} solves the problem without panicking.`],
    (_L) => ['Find and copy the phrase you think is most exciting. Explain why.', 'A phrase copied from the passage with a clear explanation of its effect on the reader.', 'Any vivid phrase with a reason, e.g. it helps me picture the scene.'],
    (_L) => ['Summarise the passage in one sentence.', 'One sentence capturing the main problem and outcome.', 'The main character faces a problem and solves it.'],
    (_L) => ['Write one fact and one opinion about the passage.', 'One accurate fact from the passage and one clearly marked opinion.', 'Fact: it happens in one day. Opinion: it is the most exciting story I have read.'],
  ],
  6: [
    (_L) => ['Find and copy two details that show when the events happen.', 'Two time details copied from the passage (e.g. ten minutes before, by midday, at sunset).', 'Any two time phrases from the passage.'],
    (L) => [`What does the passage tell us about ${L.name}’s character? Refer to the text in your answer.`, 'A developed inference about character with at least one quotation or close reference and explanation.', `${L.He} is determined, shown when ${L.he} keeps going despite the problem.`],
    (_L) => ['Find a simile, metaphor or personification and explain its effect.', 'Identifies a correct example of figurative language from the passage, names the device, and explains the effect.', 'A simile from the passage with what it makes the reader imagine.'],
    (_L) => ['Explain how the main idea develops from the beginning to the end.', 'Traces the main idea across beginning, middle and end with reference to the text.', 'It begins with a problem, builds tension, and ends with success.'],
    (_L) => ['How does the writer make the ending satisfying?', 'Explains at least one structural or language choice in the ending and its effect.', 'The ending links back to the start and shows the problem is solved.'],
  ],
}

export const passageFor = (world: string) => PASSAGES.find((p) => p.world === world) ?? PASSAGES[0]!

/** Reading statements for a year. The passage is attached to every item as its extract. */
export function readingStatements(year: 4 | 5 | 6): EnStatement[] {
  return RD_TEXT[year].map((text, k) => ({
    id: `EN-Y${year}-RD-0${k + 1}`, year, domain: 'Reading' as const, text, hints: RD_HINTS[k]!,
    items: ([0, 1, 2] as const).map((j) => [([1, 2, 3] as Level[])[j]!, (c, r) => {
      const p = passageFor(c.world)
      const L = leadOf(c.world)
      const passage = `${p.title}\n\n${p.text(L)}`
      if (j < 2) return { ...p.q[year][k]![j as 0 | 1](L, r, passage), extract: passage }
      const [prompt, rubric, model] = GENERIC[year][k]!(L)
      return open(prompt, rubric, model, passage)
    }]),
  }))
}
