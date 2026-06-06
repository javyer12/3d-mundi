/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, BookOpen, Sparkles, RotateCcw, TrendingUp } from 'lucide-react';

interface NavbarProps {
  activeTab: 'stadiums' | 'album' | 'stats';
  setActiveTab: (tab: 'stadiums' | 'album' | 'stats') => void;
  collectedCount: number;
  totalCount: number;
  onReset: () => void;
  onCheatCollectAll: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  collectedCount,
  totalCount,
  onReset,
  onCheatCollectAll,
}) => {
  const percentage = Math.round((collectedCount / totalCount) * 100) || 0;

  return (
    <nav id="app-navbar" className="sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 text-white shadow-xl px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-[#EEB211] text-[#52071C] p-2 rounded-xl shadow-lg shadow-[#EEB211]/20 animate-pulse">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-xl tracking-tight uppercase">
              FIFA <span className="text-[#EEB211]">WORLD CUP</span> 3D
            </h1>
            <p className="text-[10px] font-mono text-white/60 tracking-wider uppercase">
              STADIUMS & STICKER BENTO ALBUM
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex bg-black/30 p-1 rounded-xl border border-white/10 flex-wrap">
          <button
            id="nav-stadiums-tab"
            onClick={() => setActiveTab('stadiums')}
            className={`flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
              activeTab === 'stadiums'
                ? 'bg-[#EEB211] text-[#52071C] font-bold shadow-md shadow-[#EEB211]/15'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>🏟️ Estadios 3D</span>
          </button>
          <button
            id="nav-album-tab"
            onClick={() => setActiveTab('album')}
            className={`flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
              activeTab === 'album'
                ? 'bg-[#EEB211] text-[#52071C] font-bold shadow-md shadow-[#EEB211]/15'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Álbum 3D</span>
          </button>
          <button
            id="nav-stats-tab"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold tracking-wide uppercase transition-all duration-300 ${
              activeTab === 'stats'
                ? 'bg-[#EEB211] text-[#52071C] font-bold shadow-md shadow-[#EEB211]/15'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>📊 Info Mundial</span>
          </button>
        </div>

        {/* Album Progress and Quick Controls */}
        <div className="flex items-center gap-4 flex-wrap justify-center font-sans">
          {/* Progress pill */}
          <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-xl border border-white/10">
            <div className="text-right">
              <span className="block text-xs font-bold text-white/80 uppercase tracking-wider">Álbum Completado</span>
              <span className="text-[10px] font-mono text-white/50">
                {collectedCount} / {totalCount} Cromos
              </span>
            </div>
            
            <div className="relative flex items-center justify-center w-11 h-11">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="stroke-white/10"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  className="stroke-[#EEB211] transition-all duration-500 ease-out"
                  strokeWidth="3.5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - percentage / 100)}
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-[#EEB211]">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              id="action-collect-all"
              onClick={onCheatCollectAll}
              title="Llenar Álbum"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-[#EEB211] hover:text-[#52071C] text-white/90 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Completar</span>
            </button>
            <button
              id="action-reset"
              onClick={onReset}
              title="Reiniciar Álbum"
              className="p-2 bg-white/10 hover:bg-rose-500/30 text-white/60 hover:text-rose-450 border border-white/10 hover:border-rose-500/20 rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
