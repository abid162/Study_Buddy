/**
 * Poems and information texts, one of each per world (all original, written for Study Buddy).
 * Facts in the information texts were checked when written (November 2026); keep them accurate if you edit.
 */

export interface Poem {
  world: string
  title: string
  text: string
  form: string
  /** why it is that form, for Nova's explanation */
  formWhy: string
  /** a question about this poem's form or features */
  feature: { q: string; a: string; wrong: [string, string][]; explain: string }
  devices: { line: string; device: 'simile' | 'metaphor' | 'personification' | 'repetition' | 'alliteration'; effect: string }[]
  word: { word: string; line: string; meaning: string; wrong: string[] }
  mood: { a: string; wrong: string[]; why: string }
  theme: { a: string; wrong: string[] }
}

export const POEMS: Poem[] = [
  {
    world: 'football',
    title: 'Under the Floodlights',
    text: `The floodlights blaze like rising suns,
The whistle blows, the striker runs.
The ball’s a comet, white and bright,
It curls and swerves into the night.
The keeper dives, the crowd stands tall,
And forty thousand voices call.
The net shakes hands with every cheer:
The greatest goal we’ve seen this year!`,
    form: 'rhyming couplets',
    formWhy: 'Each pair of lines rhymes: suns and runs, bright and night, tall and call, cheer and year.',
    feature: { q: 'Which word in the poem rhymes with “runs”?', a: 'suns', wrong: [['blows', 'That is in the same line, but it does not rhyme with “runs”.'], ['bright', '“Bright” rhymes with “night”.'], ['call', '“Call” rhymes with “tall”.']], explain: '“Suns” and “runs” end the first two lines and rhyme.' },
    devices: [
      { line: 'The floodlights blaze like rising suns', device: 'simile', effect: 'It compares the lights to suns using “like”, to show how bright they are.' },
      { line: 'The ball’s a comet, white and bright', device: 'metaphor', effect: 'It says the ball IS a comet, to show how fast and bright it flies.' },
      { line: 'The net shakes hands with every cheer', device: 'personification', effect: 'It gives the net a human action, as if it is celebrating too.' },
    ],
    word: { word: 'swerves', line: 'It curls and swerves into the night.', meaning: 'changes direction suddenly', wrong: ['stops moving', 'gets bigger', 'falls straight down'] },
    mood: { a: 'excited', wrong: ['sad', 'sleepy', 'scared'], why: 'Bright lights, running, cheering and “the greatest goal” all build excitement.' },
    theme: { a: 'the thrill of scoring a great goal', wrong: ['how to look after a football pitch', 'a quiet night at home', 'why football is bad for you'] },
  },
  {
    world: 'wrestling',
    title: 'CHAMPION',
    text: `Crowds stamp their feet like a storm on a tin roof.
Hands grip the ropes, ready and waiting.
A bell rings out, sharp as a whistle.
Muscles tense; the ring holds its breath.
Pinned! The referee slaps the mat: one, two, three.
Into the air goes the golden belt,
Over the heads of the cheering fans,
Now shining like a second sun.`,
    form: 'an acrostic',
    formWhy: 'The first letters of the lines spell a word down the side: C-H-A-M-P-I-O-N.',
    feature: { q: 'What word do the first letters of the lines spell?', a: 'CHAMPION', wrong: [['CROWDS', 'That is the first word, not the word spelt down the side.'], ['WRESTLER', 'Read the first letter of each line, from top to bottom.'], ['PINNED', 'That word is inside the poem. Read the first letters down the side.']], explain: 'C-H-A-M-P-I-O-N: it is an acrostic.' },
    devices: [
      { line: 'Crowds stamp their feet like a storm on a tin roof', device: 'simile', effect: 'It compares the stamping to a storm using “like”, so we hear how loud it is.' },
      { line: 'the ring holds its breath', device: 'personification', effect: 'It gives the ring a human action, to show the tense silence before the finish.' },
      { line: 'A bell rings out, sharp as a whistle', device: 'simile', effect: 'It compares the bell to a whistle using “as”, to show how sudden and clear it sounds.' },
    ],
    word: { word: 'tense', line: 'Muscles tense; the ring holds its breath.', meaning: 'tighten and get ready', wrong: ['relax and rest', 'grow bigger', 'shake with cold'] },
    mood: { a: 'tense, then triumphant', wrong: ['calm, then sleepy', 'sad, then angry', 'bored the whole time'], why: 'It builds tension (“holds its breath”) and ends in victory with the shining belt.' },
    theme: { a: 'the moment of winning a title', wrong: ['how a wrestling ring is built', 'a day at the beach', 'losing a match'] },
  },
  {
    world: 'music',
    title: 'Three Haiku for the Big Show',
    text: `Lights fade into dark,
the whole crowd is holding breath.
One note splits the night.

Drums thunder like rain,
guitars sparkle, bright and sharp:
a thousand hearts jump.

Encore! Encore! Calls
rise like birds into the sky.
The song never ends.`,
    form: 'haiku',
    formWhy: 'Each verse has three lines of 5, 7 and 5 syllables.',
    feature: { q: 'How many syllables are in the first line of each haiku?', a: '5', wrong: [['7', 'Seven is the middle line.'], ['3', 'Three is the number of lines in each haiku.'], ['10', 'Clap the syllables: Lights-fade-in-to-dark.']], explain: 'A haiku has lines of 5, 7 and 5 syllables.' },
    devices: [
      { line: 'Drums thunder like rain', device: 'simile', effect: 'It compares the drums to rain using “like”, so we hear a fast, heavy beat.' },
      { line: 'One note splits the night', device: 'metaphor', effect: 'It describes the note as if it cuts the night open, to show how powerful the first sound is.' },
      { line: 'Encore! Encore!', device: 'repetition', effect: 'Repeating the word makes us hear the crowd shouting again and again.' },
    ],
    word: { word: 'encore', line: 'Encore! Encore! Calls', meaning: 'a call from the crowd for one more song', wrong: ['the first song of a show', 'a type of guitar', 'a quiet part of a song'] },
    mood: { a: 'magical and exciting', wrong: ['gloomy and sad', 'angry and loud', 'bored and sleepy'], why: 'Lights, thunder-like drums and hearts jumping make it feel magical and exciting.' },
    theme: { a: 'the magic of a live concert', wrong: ['learning to read music', 'a storm at sea', 'a broken guitar'] },
  },
  {
    world: 'story',
    title: 'The Old Oak Speaks',
    text: `I have stood here for three hundred winters.
My roots grip the earth like old fingers,
and my branches stretch to tickle the clouds.
Foxes sleep beneath me.
Owls whisper secrets in my leaves.
When storms come roaring through the forest,
I bend, I creak, I groan,
but I do not fall.
Come back in a hundred years.
I will still be waiting.`,
    form: 'free verse',
    formWhy: 'It has no regular rhyme or rhythm, and the lines are different lengths.',
    feature: { q: 'Who is speaking in this poem?', a: 'the oak tree', wrong: [['a fox', 'The foxes sleep beneath the speaker.'], ['an owl', 'The owls are in the speaker’s leaves.'], ['a storm', 'The storms roar through the forest; they do not speak.']], explain: '“My roots” and “my branches” show the oak tree is speaking.' },
    devices: [
      { line: 'My roots grip the earth like old fingers', device: 'simile', effect: 'It compares the roots to fingers using “like”, to show how tightly they hold on.' },
      { line: 'my branches stretch to tickle the clouds', device: 'personification', effect: 'It gives the tree a playful human action, and shows how tall it is.' },
      { line: 'I bend, I creak, I groan', device: 'repetition', effect: 'Repeating “I” and three verbs shows the tree struggling, but strong.' },
    ],
    word: { word: 'grip', line: 'My roots grip the earth like old fingers,', meaning: 'hold tightly', wrong: ['let go', 'dig quickly', 'grow slowly'] },
    mood: { a: 'calm and strong', wrong: ['silly and funny', 'frightened and weak', 'angry and loud'], why: 'The tree is patient and “does not fall”, even in storms.' },
    theme: { a: 'strength and patience in nature', wrong: ['how to cut down a tree', 'a race between animals', 'a busy city'] },
  },
  {
    world: 'bricks',
    title: 'The Builder of Brick Town',
    text: `A builder who lived in Brick Town
Stacked bricks that went up and not down.
He built them so high
They tickled the sky,
And clouds wore his towers like a crown.`,
    form: 'a limerick',
    formWhy: 'It is a funny five-line poem; lines 1, 2 and 5 rhyme, and lines 3 and 4 rhyme.',
    feature: { q: 'Which word rhymes with “Town” at the end of line 1?', a: 'down', wrong: [['high', '“High” rhymes with “sky”.'], ['bricks', '“Bricks” does not rhyme with “Town”.'], ['builder', '“Builder” does not rhyme with “Town”.']], explain: 'Town, down and crown all rhyme.' },
    devices: [
      { line: 'They tickled the sky', device: 'personification', effect: 'It gives the towers a playful human action, to show how tall they are.' },
      { line: 'clouds wore his towers like a crown', device: 'simile', effect: 'It compares the towers to a crown using “like”, which is a funny picture.' },
      { line: 'A builder who lived in Brick Town', device: 'alliteration', effect: 'The repeated “b” sounds (builder, Brick) make the line bouncy and fun to say.' },
    ],
    word: { word: 'stacked', line: 'Stacked bricks that went up and not down.', meaning: 'piled one on top of another', wrong: ['knocked over', 'painted', 'sold'] },
    mood: { a: 'funny and playful', wrong: ['sad and lonely', 'scary and dark', 'serious and angry'], why: 'Limericks are meant to be funny, and the towers wearing clouds like a crown is a silly picture.' },
    theme: { a: 'building something amazing', wrong: ['a storm knocking a house down', 'learning to swim', 'a lost key'] },
  },
  {
    world: 'space',
    title: 'Moon',
    text: `Night-lighter,
tide-puller,
sky-traveller,
silver-smiler,
crater-keeper,
dream-holder,
Earth’s oldest friend,
always circling,
never leaving.`,
    form: 'a kenning poem',
    formWhy: 'It describes the Moon with pairs of words joined by hyphens, like “tide-puller”, instead of using its name in the lines.',
    feature: { q: 'What is the poem describing?', a: 'the Moon', wrong: [['the Sun', 'The Sun does not have craters you can see like this, and it does not circle Earth.'], ['a rocket', 'A rocket does not pull the tides.'], ['a star', 'A star does not circle Earth.']], explain: 'Tide-puller, crater-keeper and always circling Earth: it is the Moon.' },
    devices: [
      { line: 'silver-smiler', device: 'personification', effect: 'It gives the Moon a human smile, so it feels friendly.' },
      { line: 'Earth’s oldest friend', device: 'metaphor', effect: 'It describes the Moon as a friend, to show it has always been with Earth.' },
      { line: 'always circling, never leaving', device: 'repetition', effect: 'The pattern of “always … never …” shows the Moon is faithful and constant.' },
    ],
    word: { word: 'circling', line: 'always circling,', meaning: 'going round and round', wrong: ['shining brightly', 'falling down', 'getting smaller'] },
    mood: { a: 'calm and full of wonder', wrong: ['angry and loud', 'silly and jokey', 'scared and worried'], why: 'Gentle kennings like “dream-holder” and “silver-smiler” make it calm and wondering.' },
    theme: { a: 'the Moon as Earth’s faithful companion', wrong: ['how to build a rocket', 'a scary night in a forest', 'the hottest planet'] },
  },
]

export interface InfoText {
  world: string
  title: string
  /** headings in CAPITALS on their own lines; bullets start with "• " */
  text: string
  headings: string[]
  /** "Under which heading would you find…": [what, heading] */
  findUnder: [string, string][]
  /** retrieval questions: [question, accepted answers, key words, explanation] */
  retrieve: [string, string[], string[], string][]
  opinion: string
  facts: string[]
  /** statements the text does NOT support (for "which is true?") */
  falses: string[]
}

export const INFO_TEXTS: InfoText[] = [
  {
    world: 'football',
    title: 'Football: The Basics',
    text: `THE PITCH
A football pitch is a rectangle of grass with a goal at each end. Each goal is 7.32 metres wide and 2.44 metres high.

THE TEAMS
Each team has eleven players on the pitch, including one goalkeeper. The goalkeeper is the only player allowed to handle the ball, and only inside their own penalty area.

THE MATCH
A professional match lasts 90 minutes, split into two halves of 45 minutes. If the scores are level in a cup match, there may be extra time and then a penalty shootout.

DID YOU KNOW?
• The penalty spot is 11 metres from the goal line.
• A referee shows a yellow card as a warning and a red card to send a player off.

Football is the most exciting sport in the world.`,
    headings: ['THE PITCH', 'THE TEAMS', 'THE MATCH', 'DID YOU KNOW?'],
    findUnder: [['how long a match lasts', 'THE MATCH'], ['how many players are in a team', 'THE TEAMS'], ['the size of the goal', 'THE PITCH']],
    retrieve: [
      ['How many players does each team have on the pitch?', ['eleven', '11', 'eleven players', '11 players'], ['eleven', '11'], 'Each team has eleven players on the pitch.'],
      ['How far is the penalty spot from the goal line?', ['11 metres', 'eleven metres', '11 m', '11'], ['11', 'eleven'], 'The penalty spot is 11 metres from the goal line.'],
    ],
    opinion: 'Football is the most exciting sport in the world.',
    facts: ['A professional match lasts 90 minutes.', 'Each goal is 7.32 metres wide.'],
    falses: ['Any player can handle the ball anywhere.', 'A match has three halves.'],
  },
  {
    world: 'wrestling',
    title: 'Inside the Wrestling Ring',
    text: `THE RING
A wrestling ring is a square, usually about six metres along each side. It usually has three ropes on each side, joined at the four corners by padded turnbuckles.

HOW TO WIN
A wrestler can win by pinfall: holding the other wrestler’s shoulders on the mat while the referee counts to three. A match can also be won by submission, when an opponent gives up.

STAYING SAFE
Professional wrestlers train for years. They learn how to fall safely, and there is padding under the canvas to soften landings.

DID YOU KNOW?
• Matches are planned in advance, like a show, but the moves still take great strength and skill.
• A tag team match has two wrestlers on each side.

A title match is the best thing to watch on a Saturday night.`,
    headings: ['THE RING', 'HOW TO WIN', 'STAYING SAFE', 'DID YOU KNOW?'],
    findUnder: [['what a pinfall is', 'HOW TO WIN'], ['how wrestlers avoid getting hurt', 'STAYING SAFE'], ['how many ropes there are', 'THE RING']],
    retrieve: [
      ['How many does the referee count to for a pinfall?', ['three', '3'], ['three', '3'], 'The referee counts to three.'],
      ['How many wrestlers are on each side in a tag team match?', ['two', '2', 'two wrestlers', '2 wrestlers'], ['two', '2'], 'A tag team match has two wrestlers on each side.'],
    ],
    opinion: 'A title match is the best thing to watch on a Saturday night.',
    facts: ['There is padding under the canvas.', 'A match can be won by submission.'],
    falses: ['A wrestling ring is a circle.', 'Wrestlers do not need to train.'],
  },
  {
    world: 'music',
    title: 'How a Guitar Makes Sound',
    text: `STRINGS
Most guitars have six strings. When a string is plucked, it vibrates very quickly, and that vibration makes the sound.

THE BODY
On an acoustic guitar, the vibrations pass into the hollow wooden body, which makes the sound louder. An electric guitar has a solid body and uses pickups and an amplifier instead.

CHANGING THE NOTE
Pressing a string against the metal frets on the neck makes the vibrating part shorter, which makes the note higher. Thinner strings also play higher notes.

DID YOU KNOW?
• Some guitars have twelve strings, arranged in pairs.
• A piano has 88 keys.

The guitar is the coolest instrument ever invented.`,
    headings: ['STRINGS', 'THE BODY', 'CHANGING THE NOTE', 'DID YOU KNOW?'],
    findUnder: [['how to make a note higher', 'CHANGING THE NOTE'], ['how an electric guitar is louder', 'THE BODY'], ['what makes the sound', 'STRINGS']],
    retrieve: [
      ['How many strings do most guitars have?', ['six', '6', 'six strings', '6 strings'], ['six', '6'], 'Most guitars have six strings.'],
      ['How many keys does a piano have?', ['88', 'eighty-eight', '88 keys'], ['88', 'eighty-eight'], 'A piano has 88 keys.'],
    ],
    opinion: 'The guitar is the coolest instrument ever invented.',
    facts: ['Thinner strings play higher notes.', 'An acoustic guitar has a hollow wooden body.'],
    falses: ['All guitars have twelve strings.', 'A shorter vibrating string makes a lower note.'],
  },
  {
    world: 'story',
    title: 'The Life of an Oak Tree',
    text: `FROM ACORN TO TREE
An oak tree grows from an acorn. A young oak can take around 40 years before it grows acorns of its own.

COUNTING THE YEARS
Each year, a tree trunk grows a new layer of wood. Scientists can count these rings to find out how old a tree is.

A HOME FOR WILDLIFE
A single oak tree can support hundreds of different kinds of insects, birds and other creatures.

DID YOU KNOW?
• Some oak trees in Britain are more than 1,000 years old.
• Trees take in carbon dioxide and give out oxygen.

Walking through an oak forest is the most peaceful way to spend a Sunday.`,
    headings: ['FROM ACORN TO TREE', 'COUNTING THE YEARS', 'A HOME FOR WILDLIFE', 'DID YOU KNOW?'],
    findUnder: [['how to tell a tree’s age', 'COUNTING THE YEARS'], ['which animals live in oaks', 'A HOME FOR WILDLIFE'], ['what an oak grows from', 'FROM ACORN TO TREE']],
    retrieve: [
      ['What does an oak tree grow from?', ['an acorn', 'acorn', 'acorns'], ['acorn'], 'An oak tree grows from an acorn.'],
      ['What gas do trees give out?', ['oxygen'], ['oxygen'], 'Trees take in carbon dioxide and give out oxygen.'],
    ],
    opinion: 'Walking through an oak forest is the most peaceful way to spend a Sunday.',
    facts: ['A tree trunk grows a new layer of wood each year.', 'Some oak trees in Britain are more than 1,000 years old.'],
    falses: ['Oak trees grow acorns in their first year.', 'Trees give out carbon dioxide and take in oxygen.'],
  },
  {
    world: 'bricks',
    title: 'How Bricks Are Made',
    text: `CLAY
Most bricks are made from clay dug out of the ground. The clay is mixed with water until it is soft enough to shape.

SHAPING
The clay is pressed into moulds, or pushed out in a long strip and cut into blocks. In the UK, a standard brick is 215 millimetres long, 102.5 millimetres wide and 65 millimetres high.

FIRING
The shaped bricks are dried and then fired in a very hot oven called a kiln, at around 1,000 degrees Celsius. Firing makes them hard and strong.

DID YOU KNOW?
• Builders join bricks together with mortar, a mix of sand, cement and water.
• People have used bricks for thousands of years.

Red brick houses are the most beautiful homes in any city.`,
    headings: ['CLAY', 'SHAPING', 'FIRING', 'DID YOU KNOW?'],
    findUnder: [['the size of a brick', 'SHAPING'], ['how bricks are made hard', 'FIRING'], ['what bricks are made from', 'CLAY']],
    retrieve: [
      ['What is the hot oven that bricks are fired in called?', ['a kiln', 'kiln'], ['kiln'], 'Bricks are fired in a kiln.'],
      ['How long is a standard UK brick, in millimetres?', ['215', '215 millimetres', '215 mm', '215mm'], ['215'], 'A standard brick is 215 millimetres long.'],
    ],
    opinion: 'Red brick houses are the most beautiful homes in any city.',
    facts: ['Mortar is a mix of sand, cement and water.', 'Firing makes bricks hard and strong.'],
    falses: ['Bricks are made from sand only.', 'Bricks are fired at around 100 degrees Celsius.'],
  },
  {
    world: 'space',
    title: 'Life on the International Space Station',
    text: `WHERE IT IS
The International Space Station (ISS) orbits Earth about 400 kilometres above the ground. It travels so fast that it goes all the way round Earth about every 90 minutes.

LIVING IN SPACE
Astronauts on the ISS float because they are falling around Earth all the time. They sleep in small sleeping bags fixed to the wall so that they do not drift around.

FOOD AND WATER
Food is sent up in sealed packets. Much of the water on board is recycled, including water collected from the air.

DID YOU KNOW?
• Astronauts on the ISS see about 16 sunrises every day.
• British astronaut Tim Peake spent six months on the ISS in 2015 and 2016.

Being an astronaut is the best job in the universe.`,
    headings: ['WHERE IT IS', 'LIVING IN SPACE', 'FOOD AND WATER', 'DID YOU KNOW?'],
    findUnder: [['how astronauts sleep', 'LIVING IN SPACE'], ['how high the ISS is', 'WHERE IT IS'], ['how water is recycled', 'FOOD AND WATER']],
    retrieve: [
      ['How long does the ISS take to go round Earth?', ['about 90 minutes', '90 minutes', '90', 'ninety minutes'], ['90', 'ninety'], 'It goes round Earth about every 90 minutes.'],
      ['Where do astronauts sleep on the ISS?', ['in sleeping bags', 'sleeping bags', 'in small sleeping bags fixed to the wall', 'in sleeping bags on the wall'], ['sleeping bag'], 'They sleep in small sleeping bags fixed to the wall.'],
    ],
    opinion: 'Being an astronaut is the best job in the universe.',
    facts: ['The ISS orbits about 400 kilometres above the ground.', 'Food is sent up in sealed packets.'],
    falses: ['The ISS stays still above one country.', 'Astronauts on the ISS see one sunrise a day.'],
  },
]

export const poemFor = (world: string) => POEMS.find((p) => p.world === world) ?? POEMS[0]!
export const infoFor = (world: string) => INFO_TEXTS.find((p) => p.world === world) ?? INFO_TEXTS[0]!
