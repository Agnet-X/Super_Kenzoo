/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Grid, Settings, HelpCircle, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface MainMenuProps {
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenSettings: () => void;
  onOpenControls: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenSettings,
  onOpenControls,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-stone-950/80 via-stone-900/90 to-stone-950/95 backdrop-blur-xs select-none">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 6 Worlds &bull; Original Sound Synthesizer
          </span>
        </div>

        <button
          id="menu-mute-btn"
          onClick={onToggleMute}
          className="p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Title Hero */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xl my-auto">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-3.5 py-1 rounded-full border border-cyan-800/60 shadow-lg">
          The Prism Realm
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            suber <span className="text-amber-400">Kenzo</span>
          </h1>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold tracking-wider">
            <span>🎁</span> Gift From me
          </div>
        </div>

        <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
          Master smooth platforming physics, dynamic enemy tracking, and varied stompable &amp; spiked foes.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md pt-4">
          <button
            id="play-campaign-btn"
            onClick={() => {
              soundManager.playPowerUp();
              onStartGame();
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            Play Campaign
          </button>

          <button
            id="level-select-btn"
            onClick={onOpenLevelSelect}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-98 text-white font-semibold text-base border border-stone-700 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Grid className="w-5 h-5 text-stone-400" />
            Level Select
          </button>
        </div>

        {/* Secondary Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            id="settings-btn"
            onClick={onOpenSettings}
            className="text-xs font-medium text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
          <span className="text-stone-700">&bull;</span>
          <button
            id="controls-btn"
            onClick={onOpenControls}
            className="text-xs font-medium text-stone-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" /> Controls &amp; Moves
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-stone-400 text-center font-mono">
        🎮 التحكم: الأسهم (<kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-amber-400">←</kbd> <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-amber-400">→</kbd>) للحركة &bull; (<kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-amber-400">↑</kbd>) للقفز &bull; (<kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 text-amber-400">↓</kbd>) للانحناء &bull; (<kbd className="px-2 py-0.5 bg-stone-800 rounded border border-stone-700 text-amber-400">Space / المسطرة</kbd>) للضرب
      </div>
    </div>
  );
};
