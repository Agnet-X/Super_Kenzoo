/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Grid, Home, Settings } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  onMainMenu: () => void;
  onOpenSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onLevelSelect,
  onMainMenu,
  onOpenSettings,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-stone-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">GAME PAUSED</h2>
          <p className="text-xs text-stone-400 mt-1">Take a breath, knight.</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            id="resume-btn"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-stone-950" /> Resume Game
          </button>

          <button
            id="restart-btn"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 text-stone-200 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Restart Level
          </button>

          <button
            id="settings-pause-btn"
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 text-stone-200 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>

          <button
            id="levels-pause-btn"
            onClick={onLevelSelect}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 text-stone-200 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Grid className="w-4 h-4" /> Level Select
          </button>

          <button
            id="main-menu-pause-btn"
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 text-stone-200 font-semibold text-xs border border-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" /> Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
