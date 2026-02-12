import { useState, useCallback } from 'react';
import type { BattleConfig, BattlePhase, Verse, ClapScore } from '../types';
import { generateBattle, generateAnnouncerLine } from '../services/ai';
import { useSpeech } from '../hooks/useSpeech';
import { SetupForm } from './SetupForm';
import { VerseCard } from './VerseCard';
import { ClapMeter } from './ClapMeter';
import { ScoreReveal } from './ScoreReveal';

export function BattleScreen() {
  const [phase, setPhase] = useState<BattlePhase>('setup');
  const [verseA, setVerseA] = useState<Verse | null>(null);
  const [verseB, setVerseB] = useState<Verse | null>(null);
  const [clapA, setClapA] = useState<ClapScore | null>(null);
  const [clapB, setClapB] = useState<ClapScore | null>(null);
  const [announcerLine, setAnnouncerLine] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [soundcheck, setSoundcheck] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState<'A' | 'B' | null>(null);

  const speech = useSpeech();

  const handleGenerate = useCallback(async (config: BattleConfig) => {
    setPhase('generating');
    setError(null);
    try {
      const { verseA: a, verseB: b } = await generateBattle(config);
      setVerseA(a);
      setVerseB(b);
      setPhase('showVerses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate verses');
      setPhase('setup');
    }
  }, []);

  const handleClapADone = useCallback((score: ClapScore) => {
    setClapA(score);
    setPhase('clapB');
  }, []);

  const handleClapBDone = useCallback(
    async (score: ClapScore) => {
      setClapB(score);
      setPhase('result');

      // Generate announcer line in background
      if (verseA && clapA) {
        try {
          const line = await generateAnnouncerLine(verseA, verseB!, clapA, score);
          setAnnouncerLine(line);
        } catch {
          setAnnouncerLine('The crowd has spoken!');
        }
      }
    },
    [verseA, verseB, clapA]
  );

  const handleRetryClap = useCallback((verse: 'A' | 'B') => {
    if (verse === 'A') {
      setClapA(null);
      setPhase('clapA');
    } else {
      setClapB(null);
      setPhase('clapB');
    }
  }, []);

  const handleReadBoth = useCallback(() => {
    if (!verseA || !verseB) return;
    setSpeakingVerse('A');
    speech.speak(verseA.text, () => {
      setSpeakingVerse('B');
      speech.speak(verseB.text, () => setSpeakingVerse(null));
    });
  }, [verseA, verseB, speech]);

  const handleReadAloud = useCallback(
    (verse: Verse) => {
      setSpeakingVerse(verse.label);
      speech.speak(verse.text, () => setSpeakingVerse(null));
    },
    [speech]
  );

  const handleStopReading = useCallback(() => {
    speech.stop();
    setSpeakingVerse(null);
  }, [speech]);

  const handleNewBattle = useCallback(() => {
    speech.stop();
    setSpeakingVerse(null);
    setPhase('setup');
    setVerseA(null);
    setVerseB(null);
    setClapA(null);
    setClapB(null);
    setAnnouncerLine('');
    setError(null);
  }, [speech]);

  const handleSoundcheckDone = useCallback(() => {
    setSoundcheck(false);
  }, []);

  // Soundcheck mode
  if (soundcheck) {
    return (
      <div className="battle-screen">
        <ClapMeter
          verseLabel="A"
          duration={5}
          onComplete={handleSoundcheckDone}
        />
        <p className="soundcheck-note">🔊 Soundcheck — clap to test the meter!</p>
      </div>
    );
  }

  return (
    <div className="battle-screen">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button className="btn btn-small" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {phase === 'setup' && (
        <SetupForm
          onGenerate={handleGenerate}
          onSoundcheck={() => setSoundcheck(true)}
          disabled={false}
        />
      )}

      {phase === 'generating' && (
        <div className="generating">
          <div className="spinner" />
          <p>AI is writing two fire verses…</p>
        </div>
      )}

      {phase === 'showVerses' && verseA && verseB && (
        <div className="show-verses">
          <h2 className="phase-title">The Contenders</h2>
          <div className="verses-grid">
            <VerseCard
              verse={verseA}
              color="blue"
              onReadAloud={() => handleReadAloud(verseA)}
              onStopReading={handleStopReading}
              isSpeaking={speakingVerse === 'A'}
            />
            <VerseCard
              verse={verseB}
              color="red"
              onReadAloud={() => handleReadAloud(verseB)}
              onStopReading={handleStopReading}
              isSpeaking={speakingVerse === 'B'}
            />
          </div>
          <div className="verse-global-actions">
            <button
              className="btn btn-secondary"
              disabled={speech.isSpeaking}
              onClick={handleReadBoth}
            >
              🔊 Read Both Aloud
            </button>
          </div>
          <button
            className="btn btn-primary btn-large"
            onClick={() => {
              handleStopReading();
              setPhase('clapA');
            }}
          >
            👏 Start Clap for Verse A
          </button>
        </div>
      )}

      {phase === 'clapA' && (
        <ClapMeter verseLabel="A" duration={5} onComplete={handleClapADone} />
      )}

      {phase === 'clapB' && (
        <div className="clap-transition">
          {!clapB && (
            <>
              <p className="transition-text">
                Verse A scored <strong>{clapA?.score ?? 0}</strong> / 100
                {clapA?.overdrive && ' ⚡ OVERDRIVE!'}
              </p>
              <button
                className="btn btn-primary btn-large"
                onClick={() => {
                  /* ClapMeter will render below after this text */
                }}
                style={{ display: 'none' }}
              >
                hidden
              </button>
              <ClapMeter verseLabel="B" duration={5} onComplete={handleClapBDone} />
            </>
          )}
        </div>
      )}

      {phase === 'result' && verseA && verseB && clapA && clapB && (
        <ScoreReveal
          verseA={verseA}
          verseB={verseB}
          clapA={clapA}
          clapB={clapB}
          announcerLine={announcerLine}
          onNewBattle={handleNewBattle}
          onRetryClap={handleRetryClap}
        />
      )}
    </div>
  );
}
