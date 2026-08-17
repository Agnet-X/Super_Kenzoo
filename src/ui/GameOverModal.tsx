/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skull, RotateCcw, Grid, Home } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  coins: number;
  onRetry: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  coins,
  onRetry,
  onLevelSelect,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-stone-950/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2 shadow-lg">
            <Skull className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-black text-rose-500 tracking-tight">GAME OVER</h2>
          <p className="text-xs text-stone-400">Do not falter. Rise again, knight.</p>
        </div>

        {/* Stats recap */}
        <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-stone-400">
            <span>Score Reached</span>
            <span className="font-mono text-stone-200 font-bold">{score}</span>
          </div>
          <div className="flex items-center justify-between text-stone-400">
            <span>Coins Collected</span>
            <span className="font-mono text-amber-400 font-bold">{coins}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="retry-game-btn"
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>

          <button
            id="gameover-levels-btn"
            onClick={onLevelSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Grid className="w-4 h-4" /> Level Select
          </button>

          <button
            id="gameover-home-btn"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
