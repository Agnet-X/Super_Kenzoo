/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Gamepad2, ArrowRight, Sparkles, Shield, Flame, Zap } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Moves &amp; Controls</h2>
              <p className="text-xs text-stone-400">Master the movement physics</p>
            </div>
          </div>
          <button
            id="close-controls-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Moves List */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-800">
            <div>
              <div className="font-bold text-white">الحركة يميناً ويساراً (Move Left / Right)</div>
              <div className="text-stone-400 text-[11px]">تسارع سلس وسرعة قصوى بالأسهم</div>
            </div>
            <div className="flex gap-1.5 font-mono font-bold text-amber-400">
              <kbd className="px-2.5 py-1 bg-stone-950 rounded border border-stone-700">←</kbd>
              <kbd className="px-2.5 py-1 bg-stone-950 rounded border border-stone-700">→</kbd>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-800">
            <div>
              <div className="font-bold text-white">القفز (Jump)</div>
              <div className="text-stone-400 text-[11px]">سهم للأعلى (قفزة قصيرة أو عالية حسب الضغط)</div>
            </div>
            <div className="flex gap-1.5 font-mono font-bold text-amber-400">
              <kbd className="px-3 py-1 bg-stone-950 rounded border border-stone-700 text-sm">↑</kbd>
              <span className="text-stone-500 self-center">/</span>
              <kbd className="px-2 py-1 bg-stone-950 rounded border border-stone-700">W</kbd>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-800">
            <div>
              <div className="font-bold text-white">الانحناء / الهبوط السريع (Crouch)</div>
              <div className="text-stone-400 text-[11px]">سهم للأسفل للانحناء أو الهبوط السريع في الجو</div>
            </div>
            <div className="flex gap-1.5 font-mono font-bold text-amber-400">
              <kbd className="px-3 py-1 bg-stone-950 rounded border border-stone-700 text-sm">↓</kbd>
              <span className="text-stone-500 self-center">/</span>
              <kbd className="px-2 py-1 bg-stone-950 rounded border border-stone-700">S</kbd>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <div>
              <div className="font-bold text-amber-300">الضرب والهجوم والكرات النارية (Attack / Shoot)</div>
              <div className="text-stone-400 text-[11px]">ضربة السيف الطاقية وإطلاق كرات النار بالمسطرة</div>
            </div>
            <div className="flex gap-1.5 font-mono font-bold text-amber-400">
              <kbd className="px-3 py-1 bg-amber-500 text-stone-950 font-black rounded border border-amber-400 shadow-sm">Space (المسطرة)</kbd>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-800">
            <div>
              <div className="font-bold text-white">إيقاف مؤقت (Pause / Menu)</div>
              <div className="text-stone-400 text-[11px]">إيقاف اللعبة والوصول لاختيار المراحل</div>
            </div>
            <div className="flex gap-1.5 font-mono font-bold text-amber-400">
              <kbd className="px-2 py-1 bg-stone-950 rounded border border-stone-700">Esc</kbd>
              <span className="text-stone-500 self-center">/</span>
              <kbd className="px-2 py-1 bg-stone-950 rounded border border-stone-700">P</kbd>
            </div>
          </div>
        </div>

        {/* Enemy Types Guide */}
        <div className="pt-2 border-t border-stone-800 space-y-2">
          <div className="text-xs font-bold text-stone-300">Enemy Combat Guide:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              <div className="font-bold flex items-center gap-1 text-emerald-400">
                <span>🟢</span> Stompable Foes
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Jump on their soft head to defeat them instantly (+200 pts) &amp; bounce up!
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300">
              <div className="font-bold flex items-center gap-1 text-rose-400">
                <span>🔴</span> Spiked / Armored Foes
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Sharp top spikes deflect stomp jumps &amp; hurt Kenzo! Defeat with Solar Fireballs or bypass.
              </p>
            </div>
          </div>
        </div>

        {/* Powerups Guide */}
        <div className="pt-2 border-t border-stone-800 space-y-2">
          <div className="text-xs font-bold text-stone-300">Prism Power-Ups:</div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/40 text-stone-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Growth Prism: +1 Max HP</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/40 text-stone-300">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Solar Orb: Cast Fireballs</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/40 text-stone-300">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Zephyr Shield: Absorb Hit</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-800/40 text-stone-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Swift Gem: Super Sprint</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          id="got-it-controls-btn"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold text-sm shadow-lg transition-all cursor-pointer"
        >
          Got It!
        </button>
      </div>
    </div>
  );
};
