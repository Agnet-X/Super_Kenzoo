/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Zap, Flame } from 'lucide-react';
import { inputManager } from '../engine/Input';

export const TouchControls: React.FC = () => {
  const handleTouchStart = (key: 'left' | 'right' | 'down' | 'up' | 'jump' | 'attack' | 'run', e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    inputManager.setTouchButton(key, true);
  };

  const handleTouchEnd = (key: 'left' | 'right' | 'down' | 'up' | 'jump' | 'attack' | 'run', e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    inputManager.setTouchButton(key, false);
  };

  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none px-6 flex items-end justify-between select-none z-20 md:hidden">
      {/* Virtual D-Pad (Left / Right / Down) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          id="touch-left-btn"
          onTouchStart={(e) => handleTouchStart('left', e)}
          onTouchEnd={(e) => handleTouchEnd('left', e)}
          onMouseDown={(e) => handleTouchStart('left', e)}
          onMouseUp={(e) => handleTouchEnd('left', e)}
          className="w-14 h-14 rounded-2xl bg-stone-900/80 active:bg-amber-500/80 backdrop-blur-md border border-stone-700/80 flex items-center justify-center text-white active:text-stone-950 shadow-xl active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          id="touch-down-btn"
          onTouchStart={(e) => handleTouchStart('down', e)}
          onTouchEnd={(e) => handleTouchEnd('down', e)}
          onMouseDown={(e) => handleTouchStart('down', e)}
          onMouseUp={(e) => handleTouchEnd('down', e)}
          className="w-14 h-14 rounded-2xl bg-stone-900/80 active:bg-amber-500/80 backdrop-blur-md border border-stone-700/80 flex items-center justify-center text-white active:text-stone-950 shadow-xl active:scale-95 transition-all"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          id="touch-right-btn"
          onTouchStart={(e) => handleTouchStart('right', e)}
          onTouchEnd={(e) => handleTouchEnd('right', e)}
          onMouseDown={(e) => handleTouchStart('right', e)}
          onMouseUp={(e) => handleTouchEnd('right', e)}
          className="w-14 h-14 rounded-2xl bg-stone-900/80 active:bg-amber-500/80 backdrop-blur-md border border-stone-700/80 flex items-center justify-center text-white active:text-stone-950 shadow-xl active:scale-95 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons (B: Run/Attack, A: Jump) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          id="touch-attack-btn"
          onTouchStart={(e) => handleTouchStart('attack', e)}
          onTouchEnd={(e) => handleTouchEnd('attack', e)}
          onMouseDown={(e) => handleTouchStart('attack', e)}
          onMouseUp={(e) => handleTouchEnd('attack', e)}
          className="w-14 h-14 rounded-full bg-stone-900/80 active:bg-orange-500/80 backdrop-blur-md border border-stone-700/80 flex items-center justify-center text-orange-400 active:text-stone-950 shadow-xl active:scale-95 transition-all font-bold text-sm"
        >
          RUN / ✦
        </button>

        <button
          id="touch-jump-btn"
          onTouchStart={(e) => handleTouchStart('jump', e)}
          onTouchEnd={(e) => handleTouchEnd('jump', e)}
          onMouseDown={(e) => handleTouchStart('jump', e)}
          onMouseUp={(e) => handleTouchEnd('jump', e)}
          className="w-16 h-16 rounded-full bg-amber-500/90 active:bg-amber-400 backdrop-blur-md border border-amber-400/80 flex items-center justify-center text-stone-950 font-black text-base shadow-xl active:scale-95 transition-all"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
