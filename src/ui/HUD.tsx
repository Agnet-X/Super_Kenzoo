/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { PlayerStats, PowerUpType } from '../types';
import { Heart, Coins, Star, Pause, Zap, Shield, Flame, Sparkles } from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  levelName: string;
  levelSubtitle: string;
  timeLeft: number;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossName?: string;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  levelName,
  levelSubtitle,
  timeLeft,
  bossHealth,
  bossMaxHealth,
  bossName,
  onPause,
}) => {
  const [displayScore, setDisplayScore] = useState(stats.score);

  // Smooth score counting animation
  useEffect(() => {
    if (displayScore === stats.score) return;
    const diff = stats.score - displayScore;
    const step = Math.max(1, Math.floor(Math.abs(diff) / 8));
    const timer = setTimeout(() => {
      setDisplayScore((prev) => (diff > 0 ? Math.min(stats.score, prev + step) : Math.max(stats.score, prev - step)));
    }, 25);
    return () => clearTimeout(timer);
  }, [stats.score, displayScore]);

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between select-none">
      {/* Top Bar Stats */}
      <div className="flex items-start justify-between">
        {/* Player Health & Lives */}
        <div className="flex flex-col gap-2">
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700/60 shadow-lg pointer-events-auto">
            {Array.from({ length: stats.maxHealth }).map((_, i) => {
              const isFilled = i < stats.health;
              return (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isFilled ? 'text-rose-500 fill-rose-500 scale-100' : 'text-stone-600 scale-90'
                  }`}
                />
              );
            })}
            <div className="ml-2 pl-2 border-l border-stone-700 text-xs font-bold text-amber-400">
              x{stats.lives}
            </div>
          </div>

          {/* Active Power-up Badge */}
          {stats.powerUp !== PowerUpType.NONE && (
            <div className="flex items-center gap-1.5 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-700/60 text-xs font-semibold text-white shadow-md">
              {stats.powerUp === PowerUpType.GROWTH && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
              {stats.powerUp === PowerUpType.FIRE_ORB && <Flame className="w-3.5 h-3.5 text-orange-500" />}
              {stats.powerUp === PowerUpType.SHIELD_ORB && <Shield className="w-3.5 h-3.5 text-blue-400" />}
              {stats.powerUp === PowerUpType.SPEED_GEM && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="capitalize">{stats.powerUp.replace('_', ' ').toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Level Name & Timer */}
        <div className="flex flex-col items-center bg-stone-900/80 backdrop-blur-md px-4 py-1.5 rounded-xl border border-stone-700/60 shadow-lg text-center">
          <div className="text-xs font-semibold text-amber-400 tracking-wider uppercase">{levelSubtitle}</div>
          <div className="text-sm font-bold text-white tracking-tight">{levelName}</div>
          <div className="text-[11px] font-mono text-stone-300 mt-0.5">TIME: {Math.max(0, Math.ceil(timeLeft))}s</div>
        </div>

        {/* Coins, Stars & Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-stone-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-700/60 shadow-lg text-xs font-bold text-white">
            {/* Coins */}
            <div className="flex items-center gap-1 text-amber-400">
              <Coins className="w-4 h-4 fill-amber-400" />
              <span>{stats.coins}</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1 text-yellow-300 pl-2 border-l border-stone-700">
              <Star className="w-4 h-4 fill-yellow-300" />
              <span>{stats.starsCollected}</span>
            </div>

            {/* Score */}
            <div className="pl-2 border-l border-stone-700 font-mono text-stone-200">
              {displayScore.toString().padStart(6, '0')}
            </div>
          </div>

          {/* Pause Button */}
          <button
            id="pause-game-btn"
            onClick={onPause}
            className="pointer-events-auto w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-800 backdrop-blur-md border border-stone-700/60 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
            title="Pause Game (Esc / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Boss Health Bar (When in Boss Level) */}
      {bossHealth !== undefined && bossMaxHealth !== undefined && bossHealth > 0 && (
        <div className="mx-auto w-full max-w-md mt-4 pointer-events-none">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1 px-1 drop-shadow-md">
            <span>{bossName || 'BOSS'}</span>
            <span>{Math.max(0, bossHealth)} / {bossMaxHealth}</span>
          </div>
          <div className="w-full h-3.5 bg-stone-950/80 rounded-full border border-stone-700 p-0.5 shadow-xl overflow-hidden backdrop-blur-md">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-200 shadow-sm"
              style={{ width: `${Math.max(0, (bossHealth / bossMaxHealth) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
