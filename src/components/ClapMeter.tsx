import { useEffect, useRef, useState, useCallback } from 'react';
import type { ClapScore } from '../types';
import { useAudioMeter } from '../hooks/useAudioMeter';
import { Countdown } from './Countdown';

interface Props {
  verseLabel: 'A' | 'B';
  duration?: number;
  onComplete: (score: ClapScore) => void;
}

type Phase = 'countdown' | 'listening' | 'done';

export function ClapMeter({ verseLabel, duration = 5, onComplete }: Props) {
  const color = verseLabel === 'A' ? 'blue' : 'red';
  const { volume, start, stop, error } = useAudioMeter();
  const [phase, setPhase] = useState<Phase>('countdown');
  const [displayVolume, setDisplayVolume] = useState(0);
  const [overdrive, setOverdrive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);

  const samplesRef = useRef<number[]>([]);
  const peakRef = useRef(0);
  const completedRef = useRef(false);

  // Smooth display volume
  useEffect(() => {
    if (phase !== 'listening') return;
    setDisplayVolume((prev) => prev + (volume - prev) * 0.3);
    samplesRef.current.push(volume);
    if (volume > peakRef.current) peakRef.current = volume;
    if (volume > 90) setOverdrive(true);
  }, [volume, phase]);

  const handleCountdownComplete = useCallback(async () => {
    setPhase('listening');
    await start();
  }, [start]);

  // Timer for listening phase
  useEffect(() => {
    if (phase !== 'listening') return;
    if (timeLeft <= 0) {
      stop();
      setPhase('done');
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, timeLeft, stop]);

  // Fire onComplete when done
  useEffect(() => {
    if (phase !== 'done' || completedRef.current) return;
    completedRef.current = true;

    const samples = samplesRef.current;
    const avg =
      samples.length > 0
        ? samples.reduce((a, b) => a + b, 0) / samples.length
        : 0;
    const peak = peakRef.current;
    const score = Math.round(Math.min(100, avg * 0.6 + peak * 0.4));
    const tooQuiet = avg < 15;

    onComplete({
      verse: verseLabel,
      score,
      overdrive: peak > 90,
      tooQuiet,
    });
  }, [phase, verseLabel, onComplete]);

  if (error) {
    return (
      <div className="clap-meter-error">
        <p>🎙️ Microphone error: {error}</p>
        <p>Please allow microphone access and try again.</p>
      </div>
    );
  }

  return (
    <div className={`clap-meter clap-meter--${color} ${overdrive ? 'clap-meter--overdrive' : ''}`}>
      <h2 className="clap-meter-title">
        {phase === 'countdown'
          ? `Clap for Verse ${verseLabel} in…`
          : phase === 'listening'
            ? `🔊 CLAP NOW for Verse ${verseLabel}!`
            : `Verse ${verseLabel} — Done!`}
      </h2>

      {phase === 'countdown' && (
        <Countdown from={3} onComplete={handleCountdownComplete} />
      )}

      {phase === 'listening' && (
        <>
          <div className="clap-meter-timer">{timeLeft}s</div>
          <div className="meter-container">
            <div
              className={`meter-bar meter-bar--${color}`}
              style={{ height: `${displayVolume}%` }}
            />
            {overdrive && <div className="meter-overdrive-label">⚡ OVERDRIVE ⚡</div>}
          </div>
        </>
      )}
    </div>
  );
}
