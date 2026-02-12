export type Style =
  | 'rap'
  | 'slam-poetry'
  | 'shakespeare'
  | 'corporate'
  | 'french-existentialist';

export const STYLE_LABELS: Record<Style, string> = {
  rap: 'Rap Battle',
  'slam-poetry': 'Slam Poetry',
  shakespeare: 'Shakespearean Monologue',
  corporate: 'Corporate Buzzword Mode',
  'french-existentialist': 'French Existentialist',
};

export type ModelId = string;

export interface ModelOption {
  id: ModelId;
  label: string;
  provider: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4.1', label: 'GPT-4.1', provider: 'OpenAI' },
  { id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-4.1-nano', label: 'GPT-4.1 Nano', provider: 'OpenAI' },
  { id: 'meta/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout', provider: 'Meta' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick', provider: 'Meta' },
  { id: 'deepseek/DeepSeek-R1', label: 'DeepSeek R1', provider: 'DeepSeek' },
  { id: 'mistralai/mistral-small-2503', label: 'Mistral Small', provider: 'Mistral' },
  { id: 'xai/grok-3-mini', label: 'Grok 3 Mini', provider: 'xAI' },
];

export interface BattleConfig {
  topic: string;
  style: Style;
  chaosMode: boolean;
  modelA: ModelId;
  modelB: ModelId;
}

export interface Verse {
  label: 'A' | 'B';
  persona: string;
  text: string;
  model: string;
}

export interface ClapScore {
  verse: 'A' | 'B';
  score: number;
  overdrive: boolean;
  tooQuiet: boolean;
}

export interface BattleResult {
  verseA: Verse;
  verseB: Verse;
  clapA: ClapScore;
  clapB: ClapScore;
  winner: 'A' | 'B' | 'tie';
  announcerLine: string;
}

export type BattlePhase =
  | 'setup'
  | 'generating'
  | 'showVerses'
  | 'clapA'
  | 'clapB'
  | 'result';
