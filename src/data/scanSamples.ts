import type { ScanItem, ScanResult } from './ai'

/**
 * A pretend marked sheet for each year and subject, so the scanner can be demonstrated without a photo
 * (and if n8n is offline). It is labelled as a sample on screen.
 */
const I = (curriculum_id: string, question: string, child_answer: string, status: ScanItem['status'], correct_answer: string, feedback: string, steps: string[] = []): ScanItem => ({
  curriculum_id, question, child_answer, status, correct_answer, feedback, steps,
})

const MATHS: Record<4 | 5 | 6, ScanItem[]> = {
  4: [
    I('MA-Y4-MD-04', '46 × 3', '138', 'correct', '138', 'Spot on. You multiplied the tens and the ones and added them together.'),
    I('MA-Y4-FR-03', 'Find 3/4 of 20', '15', 'correct', '15', 'Great: one quarter is 5, so three quarters is 15.'),
    I('MA-Y4-AS-01', '3,452 + 1,280', '4,632', 'incorrect', '4,732', 'So close! In the hundreds column, 4 + 2 + the 1 you carried makes 7, not 6.', ['Ones: 2 + 0 = 2', 'Tens: 5 + 8 = 13, write 3 and carry 1', 'Hundreds: 4 + 2 + 1 = 7', 'Thousands: 3 + 1 = 4, so 4,732']),
    I('MA-Y4-PV-07', 'Round 3,467 to the nearest 100', '3,400', 'incorrect', '3,500', 'Look at the tens digit. It is 6, which is 5 or more, so round up.', ['Hundreds digit: 4', 'Look next door at the tens digit: 6', '6 is 5 or more, so the hundreds go up to 5', 'Answer: 3,500']),
  ],
  5: [
    I('MA-Y5-AS-01', '48,275 + 16,839', '65,114', 'correct', '65,114', 'Excellent column addition, with every carry in the right place.'),
    I('MA-Y5-MD-06', '437 ÷ 6', '72 r 5', 'correct', '72 r 5', 'Correct. 6 × 72 = 432, and 437 − 432 leaves 5.'),
    I('MA-Y5-FR-04', '2/3 + 1/6', '3/9', 'incorrect', '5/6', 'You added the tops and the bottoms. First make the denominators the same.', ['Change 2/3 into sixths: 4/6', 'Now add: 4/6 + 1/6', 'Add the numerators only: 5/6']),
    I('MA-Y5-PV-04', 'Round 284,617 to the nearest 10,000', '290,000', 'incorrect', '280,000', 'Check the thousands digit: it is 4, so round down.', ['Ten-thousands digit: 8', 'Look at the thousands digit: 4', '4 is less than 5, so keep 8', 'Answer: 280,000']),
  ],
  6: [
    I('MA-Y6-FR-03', '3/4 − 2/5', '7/20', 'correct', '7/20', 'Perfect: you found a common denominator of 20 first.'),
    I('MA-Y6-FR-04', '2/3 × 3/5', '6/15', 'partly', '2/5', 'Your multiplying is right. Now simplify: 6 and 15 can both be divided by 3.', ['Multiply the numerators: 2 × 3 = 6', 'Multiply the denominators: 3 × 5 = 15', 'Simplify 6/15 by dividing by 3: 2/5']),
    I('MA-Y6-PV-02', 'Round 4,682,519 to the nearest 100,000', '4,700,000', 'correct', '4,700,000', 'Correct: the ten-thousands digit is 8, so you rounded up.'),
    I('MA-Y6-FR-08', '2.35 × 4', '8.4', 'incorrect', '9.4', 'Check the carry from the tenths into the ones.', ['4 × 0.05 = 0.2', '4 × 0.3 = 1.2', '4 × 2 = 8', '8 + 1.2 + 0.2 = 9.4']),
  ],
}

const ENGLISH: Record<4 | 5 | 6, ScanItem[]> = {
  4: [
    I('EN-Y4-SP-01', 'Add a prefix to make the opposite of “possible”.', 'unpossible', 'incorrect', 'impossible', 'Before a word starting with p, use im-: impossible.', ['Look at the first letter of the root: p', 'im- goes before m or p', 'im + possible = impossible']),
    I('EN-Y4-GR-04', 'Add a comma: After lunch we played outside.', 'After lunch, we played outside.', 'correct', 'After lunch, we played outside.', 'Yes! The comma goes straight after the fronted adverbial.'),
    I('EN-Y4-PU-01', 'Add inverted commas: Come here said Mum.', '“Come here” said Mum.', 'partly', '“Come here,” said Mum.', 'The speech marks are right. Add a comma inside them, after “here”.'),
    I('EN-Y4-SP-05', 'Choose: I can ___ the birds. (here / hear)', 'hear', 'correct', 'hear', 'Great: you hear with your ear.'),
  ],
  5: [
    I('EN-Y5-SP-04', 'Spell: the stars were ___ (seen).', 'visable', 'incorrect', 'visible', '“vis” is not a word on its own, so it takes -ible.', ['Cover the ending: “vis”', 'Not a whole word, so use -ible', 'visible']),
    I('EN-Y5-GR-03', 'Add a relative clause: The dog barked.', 'The dog, which was hungry, barked.', 'correct', 'The dog, which was hungry, barked.', 'Lovely relative clause, with commas in the right places.'),
    I('EN-Y5-PU-01', 'Add brackets: My aunt a pilot flew to Spain.', 'My aunt (a pilot flew to Spain.', 'partly', 'My aunt (a pilot) flew to Spain.', 'Brackets come in pairs: close the bracket after “pilot”.'),
    I('EN-Y5-SP-07', 'Choose: Can you give me some ___? (advice / advise)', 'advice', 'correct', 'advice', 'Right: advice with a c is the noun.'),
  ],
  6: [
    I('EN-Y6-GR-02', 'Change to the passive: The cat chased the mouse.', 'The mouse was chased by the cat.', 'correct', 'The mouse was chased by the cat.', 'Perfect passive sentence.'),
    I('EN-Y6-PU-01', 'Join with a semi-colon: It was late. We went home.', 'It was late, we went home.', 'incorrect', 'It was late; we went home.', 'A comma cannot join two sentences. Use a semi-colon instead.', ['Both parts are complete sentences', 'Replace the full stop with a semi-colon', 'Start the second part with a lower-case letter']),
    I('EN-Y6-SP-01', 'Spell: I will ___ a letter tomorrow. (receive)', 'recieve', 'incorrect', 'receive', 'After c, it is ei: receive.', ['Find the c', 'After c, write e then i', 'receive']),
    I('EN-Y6-GR-01', 'Use the subjunctive: If I ___ you, I would rest. (was / were)', 'were', 'correct', 'were', 'Yes: “If I were…” is the subjunctive.'),
  ],
}

export function sampleResult(year: 4 | 5 | 6, subject: 'maths' | 'english'): ScanResult {
  const items = (subject === 'maths' ? MATHS : ENGLISH)[year]
  const correct = items.filter((i) => i.status === 'correct').length
  return {
    subject,
    readable: true,
    summary: `A Year ${year} ${subject} sheet with ${items.length} questions.`,
    score: { correct, total: items.length },
    items,
    praise: 'Brilliant effort! You showed your working, which made it easy to see your thinking.',
    next_step: subject === 'maths' ? 'Practise the questions marked in coral, step by step with Nova.' : 'Practise the rules Nova highlighted, then try the sheet again.',
  }
}
