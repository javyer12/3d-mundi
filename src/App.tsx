/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { STADIUMS } from './data/stadiums';
import { PLAYERS } from './data/players';
import { Navbar } from './components/Navbar';
import { StadiumRenderer } from './components/StadiumRenderer';
import { AlbumRenderer } from './components/AlbumRenderer';
import { StatsRenderer } from './components/StatsRenderer';
import { Stadium, Player } from './types';
import { Compass, Sparkles, BookOpen, Clock, Heart, Award, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'stadiums' | 'album' | 'stats'>('stadiums');
  
  // Persistent Storage for Album Collections
  const [collectedIds, setCollectedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('mundial_3d_collected_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Start with 3 default awesome superstars collected for instant satisfaction
    return ['messi', 'bellingham', 'dibu'];
  });

  // Keep track of active selected stadium
  const [selectedStadium, setSelectedStadium] = useState<Stadium>(STADIUMS[0]);

  // Persist collected cards to localStorage
  useEffect(() => {
    localStorage.setItem('mundial_3d_collected_ids', JSON.stringify(collectedIds));
  }, [collectedIds]);

  const handleCardsCollected = (newIds: string[]) => {
    setCollectedIds(newIds);
  };

  const handleResetAlbum = () => {
    if (window.confirm('¿Seguro que quieres reiniciar tu álbum? Esto borrará tus cromos coleccionados.')) {
      setCollectedIds(['messi', 'bellingham', 'dibu']);
    }
  };

  const handleCheatCollectAll = () => {
    const allIds = PLAYERS.map((p) => p.id);
    setCollectedIds(allIds);
  };

  return (
    <div className="min-h-screen bg-[#52071C] bg-gradient-to-br from-[#52071C] via-[#350412] to-[#1d020a] text-white flex flex-col font-sans transition-colors duration-500 selection:bg-[#EEB211] selection:text-[#52071C]">
      
      {/* Dynamic Animated Particle Lights Header Background */}
      <div className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 left-1/4 w-[350px] h-[350px] bg-[#EEB211]/10 rounded-full blur-[120px]" />
        <div className="absolute -top-32 right-1/4 w-[350px] h-[350px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collectedCount={collectedIds.length}
        totalCount={PLAYERS.length}
        onReset={handleResetAlbum}
        onCheatCollectAll={handleCheatCollectAll}
      />

      {/* Main Container Layout */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 z-10">
        
        <AnimatePresence mode="wait">
          {activeTab === 'stadiums' && (
            <motion.div
              id="stadiums-view-section"
              key="stadiums"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Context Summary Header Banner */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#EEB211] font-bold uppercase tracking-widest">
                    <Compass className="w-4 h-4 animate-spin-slow" />
                    <span>Mundial de la FIFA • Norteamérica 2026</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase">
                    Estadios de la Copa Mundial 3D
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed text-justify">
                    Explora y analiza en 3D interactivo las maravillas arquitectónicas del mayor evento del fútbol. Usa los controles de cámara incorporados para alternar entre tomas aéreas de gran plano, perspectivas de los jugadores y las imponentes tribunas.
                  </p>
                </div>

                <div className="flex gap-3 bg-black/30 p-4 rounded-2xl border border-white/10 shrink-0 w-full md:w-auto">
                  <div className="text-center px-4 py-1 border-r border-white/10">
                    <span className="block text-xl font-extrabold text-[#EEB211] font-mono">4</span>
                    <span className="text-[10px] text-white/50 font-mono tracking-wider">ESTADIOS</span>
                  </div>
                  <div className="text-center px-4 py-1 border-r border-white/10">
                    <span className="block text-xl font-extrabold text-white font-mono">248K</span>
                    <span className="text-[10px] text-white/50 font-mono tracking-wider">CAPACIDAD</span>
                  </div>
                  <div className="text-center px-4 py-1">
                    <span className="block text-xl font-extrabold text-[#EEB211] font-mono">100%</span>
                    <span className="text-[10px] text-white/50 font-mono tracking-wider">FIDELIDAD 3D</span>
                  </div>
                </div>
              </div>

              {/* STADIUMS INTERACTIVE 3D COMPONENT MATRIX */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Stadium Selector Menu (1 Column On Desktop) */}
                <div className="lg:col-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-3.5">
                  <h3 className="font-extrabold text-xs text-[#EEB211] uppercase tracking-widest font-sans border-b border-white/10 pb-3">
                    Selecciona un Estadio
                  </h3>

                  <div id="stadium-selector-list" className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scroll-smooth">
                    {STADIUMS.map((st) => (
                      <button
                        id={`stadium-select-btn-${st.id}`}
                        key={st.id}
                        onClick={() => setSelectedStadium(st)}
                        className={`w-72 lg:w-full text-left p-3.5 rounded-2xl border transition-all duration-300 shrink-0 relative overflow-hidden flex flex-col justify-between h-32 lg:h-auto ${
                          selectedStadium.id === st.id
                            ? 'bg-gradient-to-br from-[#3d0515] to-[#1a0209] border-[#EEB211] shadow-lg shadow-[#EEB211]/20 hover:border-[#EEB211]'
                            : 'bg-black/20 border-white/5 hover:bg-white/5 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {/* Selected Indicator Light bar */}
                        {selectedStadium.id === st.id && (
                          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#EEB211]" />
                        )}

                        <div className="space-y-1 z-10">
                          <span className="text-[10px] font-mono block text-white/40 uppercase font-bold text-ellipsis overflow-hidden">
                            Sede • {st.city}
                          </span>
                          <h4 className="font-extrabold text-sm text-white">
                            {st.name}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between mt-4 w-full z-10">
                          <span className="text-xs font-mono text-[#EEB211] font-bold">
                            👤 {st.capacity} cap.
                          </span>
                          <span className="text-[10px] font-mono text-white/60 px-2 py-0.5 rounded bg-black/40 border border-white/10">
                            {st.opened}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary 3D Stadium Stage Canvas Viewer (3 Columns On Desktop) */}
                <div id="stadium-viewer-wrapper" className="lg:col-span-3">
                  <StadiumRenderer stadium={selectedStadium} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'album' && (
            <motion.div
              id="album-view-section"
              key="album"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Album Intro Explainer Header */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#EEB211] font-bold uppercase tracking-widest">
                    <BookOpen className="w-4 h-4" />
                    <span>Álbum Digital Interactivo 3D</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase">
                    Colección Oficial de Cromos del Mundial
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed text-justify">
                    Colecciona a las 18 estrellas de fútbol mundialistas. Abre nuevos sobres de cromos gratuitos, colecciona versiones doradas celestiales y examina los atributos de tus jugadores en el visor 3D 360° para leer estadísticas de ataque, defensa y clubes de élite.
                  </p>
                </div>

                <div className="flex gap-4 items-center self-stretch md:self-auto bg-black/30 p-4 border border-white/10 rounded-2xl shrink-0">
                  <div className="text-left">
                    <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Progreso Actual</span>
                    <p className="text-base font-extrabold text-[#EEB211] font-mono">
                      {collectedIds.length} / {PLAYERS.length} Cromos
                    </p>
                  </div>
                  <div className="text-left border-l border-white/10 pl-4">
                    <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Rarezas Encontradas</span>
                    <p className="text-base font-extrabold text-white font-mono">
                      {PLAYERS.filter(p => p.isRare && collectedIds.includes(p.id)).length} Especiales
                    </p>
                  </div>
                </div>
              </div>

              {/* CORE ALBUM COMPONENT VIEW */}
              <div id="album-renderer-wrapper">
                <AlbumRenderer
                  players={PLAYERS}
                  collectedIds={collectedIds}
                  onCardsCollected={handleCardsCollected}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              id="stats-view-section"
              key="stats"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Stats Intro Explainer Header */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#EEB211] font-bold uppercase tracking-widest">
                    <Trophy className="w-4 h-4" />
                    <span>Bento de Información & Datos Históricos</span>
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase">
                    Centro de Estadísticas & Horarios de Partidos
                  </h2>
                  <p className="text-sm text-white/70 leading-relaxed text-justify">
                    Accede a información fundamental e interactiva sobre la Copa Mundial de la FIFA 2026 y ediciones pasadas. Explora las alineaciones tácticas proyectadas para los candidatos favoritos, revisa los horarios locales ajustados y analiza las probabilidades matemáticas de campeonar.
                  </p>
                </div>

                <div className="flex gap-4 items-center self-stretch md:self-auto bg-[#c5a850]/10 p-4 border border-white/10 rounded-2xl shrink-0">
                  <div className="text-left font-sans">
                    <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Edición Presente</span>
                    <p className="text-base font-extrabold text-[#EEB211] font-mono uppercase">
                      Mundial 2026
                    </p>
                  </div>
                  <div className="text-left border-l border-white/10 pl-4 font-sans">
                    <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Sedes Oficiales</span>
                    <p className="text-base font-extrabold text-white font-mono uppercase">
                      16 Ciudades
                    </p>
                  </div>
                </div>
              </div>

              {/* CORE STATS BENTO BOARD COMPONENT */}
              <div id="stats-dashboard-wrapper">
                <StatsRenderer />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright marker */}
      <footer className="bg-black/40 border-t border-white/10 text-white/40 text-center py-6 text-xs font-mono select-none mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Mundial 3D Engine. Desarrollado con tecnología de renderizado procedimental y Bento Grid style.</p>
          <div className="flex gap-4 text-[10px] text-white/50">
            <span className="text-[#EEB211] uppercase tracking-wider">🏆 Mundial 2026</span>
            <span className="uppercase tracking-wider">⭐ Copa Mundial de la FIFA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
