/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Star, ArrowRight, RotateCcw, Grid } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface VictoryModalProps {
  score: number;
  coins: number;
  timeLeft: number;
  starsEarned: number;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  coins,
  timeLeft,
  starsEarned,
  isLastLevel,
  onNextLevel,
  onRestart,
  onLevelSelect,
}) => {
  const [tallyScore, setTallyScore] = useState(0);
  const timeBonus = Math.max(0, Math.floor(timeLeft * 10));
  const finalScore = score + timeBonus + coins * 50;

  useEffect(() => {
    soundManager.playLevelClear();
    let current = 0;
    const step = Math.max(10, Math.floor(finalScore / 30));
    const timer = setInterval(() => {
      current += step;
      if (current >= finalScore) {
        setTallyScore(finalScore);
        clearInterval(timer);
      } else {
        setTallyScore(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [finalScore]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-stone-950/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2 shadow-lg">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">LEVEL COMPLETE!</h2>
          <p className="text-xs text-stone-400">Realm purified by your aura.</p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-3 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`w-8 h-8 transition-transform duration-500 ${
                i < starsEarned
                  ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-md'
                  : 'text-stone-700 scale-90'
              }`}
            />
          ))}
        </div>

        {/* Score Breakdown */}
        <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span>Base Score</span>
            <span className="font-mono text-stone-200">{score}</span>
          </div>
          <div className="flex items-center justify-between text-stone-400">
            <span>Coins Bonus</span>
            <span className="font-mono text-stone-200">+{coins * 50}</span>
          </div>
          <div className="flex items-center justify-between text-stone-400">
            <span>Time Bonus ({Math.ceil(timeLeft)}s)</span>
            <span className="font-mono text-stone-200">+{timeBonus}</span>
          </div>
          <div className="pt-2 border-t border-stone-800 flex items-center justify-between font-bold text-sm text-amber-400">
            <span>Total Score</span>
            <span className="font-mono text-base">{tallyScore}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="next-level-btn"
            onClick={onNextLevel}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLastLevel ? 'Finish Campaign' : 'Next Stage'} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            <button
              id="replay-level-btn"
              onClick={onRestart}
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay
            </button>
            <button
              id="victory-levels-btn"
              onClick={onLevelSelect}
              className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" /> Stages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
