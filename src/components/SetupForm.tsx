import { useState } from 'react';
import type { BattleConfig, Style, ModelId } from '../types';
import { STYLE_LABELS, AVAILABLE_MODELS } from '../types';

interface Props {
  onGenerate: (config: BattleConfig) => void;
  onSoundcheck: () => void;
  disabled: boolean;
}

const STYLES = Object.keys(STYLE_LABELS) as Style[];
const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;

export function SetupForm({ onGenerate, onSoundcheck, disabled }: Props) {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<Style>('rap');
  const [chaosMode, setChaosMode] = useState(false);
  const [modelA, setModelA] = useState<ModelId>(DEFAULT_MODEL);
  const [modelB, setModelB] = useState<ModelId>(DEFAULT_MODEL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({ topic: topic.trim(), style, chaosMode, modelA, modelB });
  };

  return (
    <form className="setup-form" onSubmit={handleSubmit}>
      <h1 className="app-title">
        <span className="title-icon">🎤</span> BeatMyPrompt
      </h1>
      <p className="app-subtitle">Live AI Verse Battles — Powered by Applause</p>

      <div className="form-group">
        <label htmlFor="topic">Topic</label>
        <input
          id="topic"
          type="text"
          placeholder='e.g. "Cloud vs On-Prem", "Dev vs PM"'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={disabled}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="style">Style</label>
        <select
          id="style"
          value={style}
          onChange={(e) => setStyle(e.target.value as Style)}
          disabled={disabled}
        >
          {STYLES.map((s) => (
            <option key={s} value={s}>
              {STYLE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group form-group--half">
          <label htmlFor="modelA">🔵 Model for Verse A</label>
          <select
            id="modelA"
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            disabled={disabled}
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.provider})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group form-group--half">
          <label htmlFor="modelB">🔴 Model for Verse B</label>
          <select
            id="modelB"
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            disabled={disabled}
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.provider})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group chaos-toggle">
        <label>
          <input
            type="checkbox"
            checked={chaosMode}
            onChange={(e) => setChaosMode(e.target.checked)}
            disabled={disabled}
          />
          <span className="chaos-label">🌀 Chaos Mode</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={disabled || !topic.trim()}>
          ⚔️ Generate Battle
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSoundcheck}
          disabled={disabled}
        >
          🔊 Soundcheck
        </button>
      </div>
    </form>
  );
}
