import type { Verse } from '../types';
import { AVAILABLE_MODELS } from '../types';

interface Props {
  verse: Verse;
  color: 'blue' | 'red';
  /** If provided, shows a Read Aloud button */
  onReadAloud?: () => void;
  /** If provided, shows a Stop button instead */
  onStopReading?: () => void;
  isSpeaking?: boolean;
}

function modelLabel(modelId: string): string {
  const found = AVAILABLE_MODELS.find((m) => m.id === modelId);
  return found ? found.label : modelId;
}

export function VerseCard({ verse, color, onReadAloud, onStopReading, isSpeaking }: Props) {
  return (
    <div className={`verse-card verse-card--${color}`}>
      <div className="verse-header">
        <span className="verse-label">Verse {verse.label}</span>
        <span className="verse-persona">{verse.persona}</span>
      </div>
      <div className="verse-model-badge">
        🤖 {modelLabel(verse.model)}
      </div>
      <div className="verse-text">
        {verse.text.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {(onReadAloud || onStopReading) && (
        <div className="verse-actions">
          {isSpeaking ? (
            <button className={`btn btn-small btn-stop--${color}`} onClick={onStopReading}>
              ⏹ Stop
            </button>
          ) : (
            <button className={`btn btn-small btn-read--${color}`} onClick={onReadAloud}>
              🔊 Read Aloud
            </button>
          )}
        </div>
      )}
    </div>
  );
}
