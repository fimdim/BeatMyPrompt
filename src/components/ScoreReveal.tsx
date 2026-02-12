import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import type { Verse, ClapScore } from '../types';

interface Props {
  verseA: Verse;
  verseB: Verse;
  clapA: ClapScore;
  clapB: ClapScore;
  announcerLine: string;
  onNewBattle: () => void;
  onRetryClap: (verse: 'A' | 'B') => void;
}

export function ScoreReveal({
  verseA,
  verseB,
  clapA,
  clapB,
  announcerLine,
  onNewBattle,
  onRetryClap,
}: Props) {
  const [animatedA, setAnimatedA] = useState(0);
  const [animatedB, setAnimatedB] = useState(0);
  const [showWinner, setShowWinner] = useState(false);

  const winner =
    clapA.score > clapB.score ? 'A' : clapA.score < clapB.score ? 'B' : 'tie';

  // Animate bars
  useEffect(() => {
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setAnimatedA(Math.round(clapA.score * ease));
      setAnimatedB(Math.round(clapB.score * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setShowWinner(true);
      }
    };

    requestAnimationFrame(animate);
  }, [clapA.score, clapB.score]);

  // Confetti on winner reveal
  useEffect(() => {
    if (!showWinner || winner === 'tie') return;

    const x = winner === 'A' ? 0.25 : 0.75;
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { x, y: 0.6 },
      colors:
        winner === 'A'
          ? ['#3b82f6', '#60a5fa', '#93c5fd']
          : ['#ef4444', '#f87171', '#fca5a5'],
    });
  }, [showWinner, winner]);

  return (
    <div className="score-reveal">
      <h2 className="score-reveal-title">
        {showWinner
          ? winner === 'tie'
            ? "IT'S A TIE!"
            : `🏆 WINNER: VERSE ${winner}!`
          : 'Tallying the applause…'}
      </h2>

      <div className="score-bars">
        <div className={`score-column ${showWinner && winner === 'A' ? 'score-column--winner' : ''}`}>
          <div className="score-value">{animatedA}</div>
          <div className="score-bar-track">
            <div
              className="score-bar score-bar--blue"
              style={{ height: `${animatedA}%` }}
            />
          </div>
          <div className="score-persona">
            Verse A<br />{verseA.persona}
          </div>
          {clapA.tooQuiet && (
            <button className="btn btn-small" onClick={() => onRetryClap('A')}>
              🔇 Too quiet — Retry?
            </button>
          )}
        </div>

        <div className="score-vs">VS</div>

        <div className={`score-column ${showWinner && winner === 'B' ? 'score-column--winner' : ''}`}>
          <div className="score-value">{animatedB}</div>
          <div className="score-bar-track">
            <div
              className="score-bar score-bar--red"
              style={{ height: `${animatedB}%` }}
            />
          </div>
          <div className="score-persona">
            Verse B<br />{verseB.persona}
          </div>
          {clapB.tooQuiet && (
            <button className="btn btn-small" onClick={() => onRetryClap('B')}>
              🔇 Too quiet — Retry?
            </button>
          )}
        </div>
      </div>

      {showWinner && announcerLine && (
        <p className="announcer-line">"{announcerLine}"</p>
      )}

      {showWinner && (
        <button className="btn btn-primary" onClick={onNewBattle}>
          ⚔️ New Battle
        </button>
      )}
    </div>
  );
}
