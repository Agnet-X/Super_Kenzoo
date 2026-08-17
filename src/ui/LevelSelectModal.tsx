/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WORLDS_METADATA } from '../levels/LevelData';
import { SaveData } from '../types';
import { Star, Lock, Play, ArrowLeft, Trophy } from 'lucide-react';
import { soundManager } from '../audio/SoundManager';

interface LevelSelectModalProps {
  saveData: SaveData;
  onSelectLevel: (world: number, level: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  saveData,
  onSelectLevel,
  onClose,
}) => {
  const [selectedWorld, setSelectedWorld] = useState<number>(1);

  const worldMeta = WORLDS_METADATA.find((w) => w.id === selectedWorld) || WORLDS_METADATA[0];

  const levels = [
    { num: 1, name: 'Stage 1', type: 'Adventure' },
    { num: 2, name: 'Stage 2', type: 'Ascent / Challenge' },
    { num: 3, name: 'Stage 3', type: 'Colossus Boss Arena' },
  ];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <button
              id="back-to-menu-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">World &amp; Level Select</h2>
              <p className="text-xs text-stone-400">Choose a realm to explore</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-full border border-stone-700 text-xs font-bold text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>{saveData.totalCoins} Coins</span>
          </div>
        </div>

        {/* World Selection Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-6">
          {WORLDS_METADATA.map((w) => {
            const isUnlocked = saveData.unlockedWorlds.includes(w.id);
            const isSelected = selectedWorld === w.id;

            return (
              <button
                key={w.id}
                disabled={!isUnlocked}
                onClick={() => {
                  soundManager.playCoin();
                  setSelectedWorld(w.id);
                }}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                    : isUnlocked
                    ? 'bg-stone-800/60 border-stone-700/60 text-stone-300 hover:bg-stone-800 hover:border-stone-600'
                    : 'bg-stone-950/40 border-stone-800/40 text-stone-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-2xl mb-1">{w.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap">W{w.id}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-stone-600 mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Selected World Overview */}
        <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <span>{worldMeta.icon}</span>
            <span>World {worldMeta.id}: {worldMeta.name}</span>
          </div>
          <p className="text-xs text-stone-400 mt-1">{worldMeta.desc}</p>
        </div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {levels.map((lvl) => {
            const levelKey = `${selectedWorld}-${lvl.num}`;
            const isCompleted = !!saveData.completedLevels[levelKey];
            const highScore = saveData.levelHighScores[levelKey] || 0;
            const stars = saveData.levelStars[levelKey] || 0;

            return (
              <div
                key={lvl.num}
                className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-stone-600 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{lvl.type}</span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Cleared
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Level {selectedWorld}-{lvl.num}
                  </h3>

                  {/* Stars */}
                  <div className="flex items-center gap-1 pt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < stars ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>

                  {highScore > 0 && (
                    <div className="text-xs text-stone-400 font-mono">
                      High Score: <span className="text-stone-200">{highScore}</span>
                    </div>
                  )}
                </div>

                <button
                  id={`play-level-${selectedWorld}-${lvl.num}-btn`}
                  onClick={() => {
                    soundManager.playJump();
                    onSelectLevel(selectedWorld, lvl.num);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" /> Play Level
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
