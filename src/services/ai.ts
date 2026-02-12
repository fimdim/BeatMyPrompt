import type { BattleConfig, Verse, ClapScore, ModelId } from '../types';
import { getRandomConstraint } from '../data/chaosConstraints';

const API_URL = 'https://models.github.ai/inference/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

function getToken(): string {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token || token === 'your_github_pat_here') {
    throw new Error(
      'Missing GitHub PAT. Set VITE_GITHUB_TOKEN in your .env file.'
    );
  }
  return token;
}

async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  model: ModelId = DEFAULT_MODEL
): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1.0,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) {
      throw new Error('Rate limit hit — wait a moment and try again.');
    }
    throw new Error(`GitHub Models API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

const STYLE_INSTRUCTIONS: Record<string, string> = {
  rap: 'Write in a punchy rap battle style with bars, rhymes, wordplay, and mic-drop moments.',
  'slam-poetry':
    'Write in passionate slam poetry style — emotional, rhythmic, raw, powerful.',
  shakespeare:
    'Write in Shakespearean English with iambic pentameter, dramatic flair, and theatrical monologue style.',
  corporate:
    'Write using maximum corporate buzzwords — synergy, leverage, disrupt, pivot, circle-back — delivered with absurd confidence.',
  'french-existentialist':
    'Write in the style of a French existentialist philosopher — contemplative, absurd, melancholic, yet oddly poetic.',
};

export async function generateBattle(
  config: BattleConfig
): Promise<{ verseA: Verse; verseB: Verse }> {
  const styleGuide =
    STYLE_INSTRUCTIONS[config.style] || 'Write in a creative poetic style.';

  const chaosLine = config.chaosMode
    ? `\n\nADDITIONAL CONSTRAINT (Chaos Mode): ${getRandomConstraint()}`
    : '';

  const makeSystemPrompt = (label: 'A' | 'B') => {
    const perspective =
      label === 'A'
        ? 'a serious, confident expert'
        : 'a chaotic, funny underdog';
    return `You are a creative AI verse writer for a live battle. Write ONE verse on the given topic.

STYLE: ${styleGuide}

RULES:
- Write exactly ONE verse, 6-10 lines long.
- Write from the perspective of ${perspective}.
- Address the topic directly.
- Make it entertaining and suitable for a live audience.
- Start with a persona name (1-3 words).${chaosLine}

FORMAT your response EXACTLY like this:
Persona: [persona name]
[verse lines]`;
  };

  const user = `Topic: "${config.topic}"`;

  // Generate both verses in parallel, each with its own model
  const [rawA, rawB] = await Promise.all([
    chatCompletion(makeSystemPrompt('A'), user, config.modelA),
    chatCompletion(makeSystemPrompt('B'), user, config.modelB),
  ]);

  return {
    verseA: parseSingleVerse(rawA, 'A', config.modelA),
    verseB: parseSingleVerse(rawB, 'B', config.modelB),
  };
}

function parseSingleVerse(raw: string, label: 'A' | 'B', model: string): Verse {
  const cleaned = raw.replace(/VERSE\s*[AB]/gi, '').trim();
  const lines = cleaned.split('\n').filter((l) => l.trim());
  const personaLine = lines.find((l) => /^persona:/i.test(l.trim()));
  const persona = personaLine
    ? personaLine.replace(/^persona:\s*/i, '').trim()
    : label === 'A'
      ? 'The Expert'
      : 'The Underdog';
  const text = lines
    .filter((l) => !/^persona:/i.test(l.trim()))
    .join('\n')
    .trim();
  return { label, persona, text, model };
}

export async function generateAnnouncerLine(
  verseA: Verse,
  verseB: Verse,
  clapA: ClapScore,
  clapB: ClapScore
): Promise<string> {
  const winner =
    clapA.score > clapB.score
      ? `Verse A (${verseA.persona})`
      : clapA.score < clapB.score
        ? `Verse B (${verseB.persona})`
        : "It's a tie";

  const system =
    'You are a hype announcer for an AI verse battle. Generate ONE short, witty, dramatic sentence announcing the winner. Keep it under 20 words. Be funny and energetic.';

  const user = `Verse A "${verseA.persona}" scored ${clapA.score}/100. Verse B "${verseB.persona}" scored ${clapB.score}/100. Winner: ${winner}. Topic context: the verses were about a creative battle.`;

  return chatCompletion(system, user);
}
