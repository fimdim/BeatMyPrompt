const CHAOS_CONSTRAINTS: string[] = [
  'Include a cooking metaphor in every other line',
  'Explain it as if to a medieval king',
  'Every line must reference the cloud',
  'Work in a dramatic plot twist halfway through',
  'Include at least one cat-related pun',
  'Write as if you are narrating a nature documentary',
  'Throw in a dramatic courtroom objection',
  'Reference a famous movie scene',
  'Include a weather forecast somewhere in the verse',
  'Compare everything to coffee',
  'Add a conspiracy theory undertone',
  'Write as if the WiFi just went down mid-verse',
  'Mention at least three different animals',
  'Include a dramatic countdown from 5',
  'Speak as if the audience is on a sinking ship',
  'Reference a famous love song but about code',
  'Include an existential crisis about semicolons',
  'Write as if delivering breaking news',
  'Add a plot twist involving time travel',
  'Include an apology to a rubber duck',
];

export function getRandomConstraint(): string {
  return CHAOS_CONSTRAINTS[Math.floor(Math.random() * CHAOS_CONSTRAINTS.length)];
}
