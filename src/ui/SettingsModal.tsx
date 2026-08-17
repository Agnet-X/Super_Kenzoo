/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, X, RotateCcw } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';
import { SaveData } from '../types';

interface SettingsModalProps {
  saveData: SaveData;
  onUpdateSaveData: (data: Partial<SaveData>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  saveData,
  onUpdateSaveData,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-stone-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Audio &amp; Game Settings</h2>
            <p className="text-xs text-stone-400">Configure your experience</p>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* SFX Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" /> Sound Effects Volume
              </span>
              <span>{Math.round(saveData.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.soundVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                soundManager.setVolumes(val, saveData.musicVolume);
                onUpdateSaveData({ soundVolume: val });
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Music Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Procedural Music Volume
              </span>
              <span>{Math.round(saveData.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={saveData.musicVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                soundManager.setVolumes(saveData.soundVolume, val);
                onUpdateSaveData({ musicVolume: val });
              }}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Screen Shake Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-800">
            <div>
              <div className="text-xs font-semibold text-white">Camera Screen Shake</div>
              <div className="text-[11px] text-stone-400">Tactile impact and stomp feedback</div>
            </div>
            <button
              onClick={() => onUpdateSaveData({ screenShakeEnabled: !saveData.screenShakeEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                saveData.screenShakeEnabled ? 'bg-amber-500 justify-end' : 'bg-stone-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-stone-950 shadow-sm" />
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          id="save-settings-btn"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-sm shadow-lg transition-all cursor-pointer"
        >
          Save &amp; Return
        </button>
      </div>
    </div>
  );
};
