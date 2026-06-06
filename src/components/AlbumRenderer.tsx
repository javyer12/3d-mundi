/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Player } from '../types';
import { Sparkles, Eye, Navigation, Layers, RotateCw, X, Gift } from 'lucide-react';
import { Player3DAvatar } from './StatsRenderer';

interface AlbumRendererProps {
  players: Player[];
  collectedIds: string[];
  onCardsCollected: (newIds: string[]) => void;
}

export const AlbumRenderer: React.FC<AlbumRendererProps> = ({
  players,
  collectedIds,
  onCardsCollected,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const inspectMountRef = useRef<HTMLDivElement>(null);
  
  // Page states: 3 double-page spreads (6 players per spread)
  // Spread 0: Players index 0-5
  // Spread 1: Players index 6-11
  // Spread 2: Players index 12-17
  const [currentSpread, setCurrentSpread] = useState<number>(0);
  
  // Action/inspect states
  const [inspectingPlayer, setInspectingPlayer] = useState<Player | null>(null);
  const [openingPack, setOpeningPack] = useState<boolean>(false);
  const [packStage, setPackStage] = useState<'closed' | 'ripping' | 'revealed'>('closed');
  const [packOpenedReward, setPackOpenedReward] = useState<Player[]>([]);
  const [currentPackRewardIdx, setCurrentPackRewardIdx] = useState<number>(0);

  // References for main album 3D scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const slotsGroupRef = useRef<THREE.Group | null>(null);

  // References for inspecting 3D scene
  const inspectSceneRef = useRef<THREE.Scene | null>(null);
  const inspectRendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const inspectCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const inspectControlsRef = useRef<OrbitControls | null>(null);
  const inspectCardMeshRef = useRef<THREE.Mesh | null>(null);

  const PLAYERS_PER_SPREAD = 6;
  const currentSpreadPlayers = players.slice(
    currentSpread * PLAYERS_PER_SPREAD,
    (currentSpread + 1) * PLAYERS_PER_SPREAD
  );

  // Helper: Procedural Canvas card drawing
  const drawCardTexture = (player: Player, collected: boolean, isBack: boolean): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      if (!collected) {
        // --- LOCKED STICKER PLACEHOLDER ---
        // Dark slate futuristic background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dashed outline
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        ctx.setLineDash([]);

        // Grid lines inside
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
        ctx.lineWidth = 1.5;
        for (let y = 50; y < canvas.height; y += 50) {
          ctx.beginPath();
          ctx.moveTo(15, y);
          ctx.lineTo(canvas.width - 15, y);
          ctx.stroke();
        }

        // Lock sticker symbol / silhouette
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 230, 70, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', canvas.width / 2, 245);

        // Name placeholder text
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('BLOQUEADO', canvas.width / 2, 360);

        ctx.font = '14px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(player.name.toUpperCase(), canvas.width / 2, 400);
        ctx.fillText(`${player.country.toUpperCase()}`, canvas.width / 2, 430);
        ctx.fillText(`Nº ${player.number} • ${player.position}`, canvas.width / 2, 460);
      } else if (isBack) {
        // --- STICKER BACK COVER DESIGN ---
        // Retro blue / gold card cover backing
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Outer borders
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        ctx.strokeStyle = '#eab308'; // Gold accent
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

        // Background decorative circles
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.08)';
        ctx.lineWidth = 30;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#eab308';
        ctx.textAlign = 'center';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('COPA MUNDIAL 2026', canvas.width / 2, 140);

        // World cup trophy miniature drawing simple representation
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 20, 280);
        ctx.lineTo(canvas.width / 2 + 20, 280);
        ctx.lineTo(canvas.width / 2 + 10, 215);
        ctx.arc(canvas.width / 2, 195, 20, 0, Math.PI, true);
        ctx.lineTo(canvas.width / 2 - 10, 215);
        ctx.closePath();
        ctx.fill();

        // Base
        ctx.fillStyle = '#d97706';
        ctx.fillRect(canvas.width / 2 - 15, 280, 30, 10);
        ctx.fillRect(canvas.width / 2 - 25, 290, 50, 6);

        // Descriptive bar code mockup
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(50, 420, canvas.width - 100, 50);
        
        ctx.fillStyle = '#000000';
        for (let i = 60; i < canvas.width - 70; i += Math.floor(Math.random() * 8) + 3) {
          const barW = Math.random() > 0.4 ? 3 : 1.5;
          ctx.fillRect(i, 425, barW, 40);
        }

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SERIAL #${player.id.toUpperCase()}-${player.number}`, canvas.width / 2, 500);
      } else {
        // --- ACQUIRED STICKER (FRONT) ---
        // Gradient base reflecting rarity
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (player.isRare) {
          gradient.addColorStop(0, '#fef08a'); // Shiny vibrant Gold yellow
          gradient.addColorStop(0.5, '#ca8a04');
          gradient.addColorStop(1, '#854d0e');
        } else {
          gradient.addColorStop(0, '#dbeafe'); // High-contrast Blue-white standard
          gradient.addColorStop(0.5, '#2563eb');
          gradient.addColorStop(1, '#1e3a8a');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Metallic Borders
        ctx.strokeStyle = player.isRare ? '#eab308' : '#cbd5e1';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // Glowing holographic inner stroke
        ctx.strokeStyle = player.isRare ? '#fef08a' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

        // Player Avatar background circle
        ctx.fillStyle = player.avatarColor;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 175, 75, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Player initials silhouette
        ctx.font = 'bold 50px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(player.name.split(' ').map(n => n[0]).join(''), canvas.width / 2, 192);

        // Floating big shirt number
        ctx.font = 'black 32px sans-serif';
        ctx.fillStyle = player.isRare ? '#000000' : '#ffffff';
        ctx.fillText(`#${player.number}`, canvas.width / 2, 85);

        // Flag and position boxes
        ctx.font = '30px sans-serif';
        ctx.fillText(player.flagUrl, 60, 110);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.fillRect(40, 130, 42, 28);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(player.position, 61, 149);

        // Big overall rating score
        ctx.font = 'bold 44px sans-serif';
        ctx.fillStyle = player.isRare ? '#ffffff' : '#fef08a';
        ctx.fillText(`${player.rating}`, 320, 110);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('RAT', 320, 130);

        // Name banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(25, 275, canvas.width - 50, 42);

        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = player.isRare ? '#fef08a' : '#ffffff';
        ctx.fillText(player.name.toUpperCase(), canvas.width / 2, 304);

        // Club name
        ctx.font = 'italic 12px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(player.club, canvas.width / 2, 345);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(35, 365, canvas.width - 70, 1.5);

        // Core stats grid (PAC, SHO, PAS, DRI, DEF, PHY)
        const stats = [
          { name: 'PAC', val: player.stats.pac },
          { name: 'SHO', val: player.stats.sho },
          { name: 'PAS', val: player.stats.pas },
          { name: 'DRI', val: player.stats.dri },
          { name: 'DEF', val: player.stats.def },
          { name: 'PHY', val: player.stats.phy }
        ];

        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#ffffff';
        const startX = 65;
        const spacingX = 125;
        
        // Row 1
        stats.slice(0, 3).forEach((st, i) => {
          ctx.fillText(`${st.val} ${st.name}`, startX + i * spacingX, 400);
        });

        // Row 2
        stats.slice(3, 6).forEach((st, i) => {
          ctx.fillText(`${st.val} ${st.name}`, startX + i * spacingX, 440);
        });

        // Rarity Indicator badge at bottom
        if (player.isRare) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1;
          ctx.fillRect(110, 470, 160, 24);
          ctx.strokeRect(110, 470, 160, 24);

          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('⭐ RARIDAD CELESTIAL ⭐', canvas.width / 2, 486);
        } else {
          ctx.font = '9px monospace';
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(`CROMO OFICIAL • COPA MUNDIAL`, canvas.width / 2, 486);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // 1. Scene setup for Album view slots
  useEffect(() => {
    if (!mountRef.current || openingPack) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070a13');
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 150);
    camera.position.set(0, 0, 40);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 25;
    controls.maxDistance = 65;
    controlsRef.current = controls;

    // Soft lights
    const amb = new THREE.AmbientLight('#ffffff', 0.82);
    scene.add(amb);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.95);
    dirLight.position.set(20, 25, 30);
    scene.add(dirLight);

    // Build the double album pages slots
    const slotsGroup = new THREE.Group();
    scene.add(slotsGroup);
    slotsGroupRef.current = slotsGroup;

    // Left Page sheet background plane
    const pageW = 16.5;
    const pageH = 21;
    const bookPageGeo = new THREE.PlaneGeometry(pageW, pageH);
    const bookPageMatLeft = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const leftPage = new THREE.Mesh(bookPageGeo, bookPageMatLeft);
    leftPage.position.set(-pageW / 2 - 0.1, 0, 0.01);
    slotsGroup.add(leftPage);

    // Right Page sheet background
    const bookPageMatRight = bookPageMatLeft.clone();
    const rightPage = new THREE.Mesh(bookPageGeo, bookPageMatRight);
    rightPage.position.set(pageW / 2 + 0.1, 0, 0.01);
    slotsGroup.add(rightPage);

    // Book spine / central separation lines
    const spineGeo = new THREE.CylinderGeometry(0.2, 0.2, pageH + 0.5, 12);
    const spineMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.5 });
    const spine = new THREE.Mesh(spineGeo, spineMat);
    slotsGroup.add(spine);

    // Render Stickers in grid slots
    // 3 slots on the left page, 3 on the right
    currentSpreadPlayers.forEach((player, idx) => {
      const isCollected = collectedIds.includes(player.id);
      
      // Card geometry (matching proportional sticker card mesh)
      const cW = 4.4;
      const cH = 6.2;
      const cardGeometry = new THREE.PlaneGeometry(cW, cH);
      
      const frontTex = drawCardTexture(player, isCollected, false);
      const cardMaterial = new THREE.MeshStandardMaterial({
        map: frontTex,
        roughness: isCollected ? 0.2 : 0.85,
        metalness: isCollected && player.isRare ? 0.6 : 0.1,
        transparent: true,
      });

      const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);

      // Fine-tune slot arrangements
      let xPos = 0;
      let yPos = 0;
      if (idx === 0) { xPos = -12; yPos = 5.2; }
      else if (idx === 1) { xPos = -4.5; yPos = 5.2; }
      else if (idx === 2) { xPos = -8.2; yPos = -4.2; }
      else if (idx === 3) { xPos = 4.5; yPos = 5.2; }
      else if (idx === 4) { xPos = 12; yPos = 5.2; }
      else if (idx === 5) { xPos = 8.2; yPos = -4.2; }

      cardMesh.position.set(xPos, yPos, 0.15);

      // Floating hover effect helper if collected
      cardMesh.name = `card_${player.id}`;
      slotsGroup.add(cardMesh);

      // Underlay slot outline helper (decorative box outline)
      const outlineGeo = new THREE.BoxGeometry(cW + 0.2, cH + 0.2, 0.02);
      const outlineMat = new THREE.MeshStandardMaterial({
        color: isCollected ? (player.isRare ? '#eab308' : '#334155') : '#1e293b',
        roughness: 0.6,
      });
      const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat);
      outlineMesh.position.set(xPos, yPos, 0.1);
      slotsGroup.add(outlineMesh);
    });

    // Main animation loops
    let animateId: number;
    const animate = () => {
      animateId = requestAnimationFrame(animate);
      
      // Floating hover animations for colleted items
      slotsGroup.children.forEach((child) => {
        if (child.name.startsWith('card_')) {
          const playerId = child.name.replace('card_', '');
          if (collectedIds.includes(playerId)) {
            child.position.z = 0.18 + Math.sin(Date.now() * 0.002 + child.position.x) * 0.05;
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [currentSpread, collectedIds, openingPack]);

  // 2. Setup 3D Scene in Inspect modal
  useEffect(() => {
    if (!inspectingPlayer || !inspectMountRef.current) return;

    const width = inspectMountRef.current.clientWidth;
    const height = inspectMountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#030712');
    inspectSceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);
    inspectCameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    inspectMountRef.current.innerHTML = '';
    inspectMountRef.current.appendChild(renderer.domElement);
    inspectRendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 22;
    inspectControlsRef.current = controls;

    // Ambient light
    const amb = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(amb);

    const dirLight1 = new THREE.DirectionalLight('#ffffff', 0.8);
    dirLight1.position.set(5, 5, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight('#eab308', 0.3); // Warm golden backlight reflection
    dirLight2.position.set(-5, -5, -10);
    scene.add(dirLight2);

    // Build unique 3D Card box (with actual depth thickness)
    const cardW = 3.6;
    const cardH = 5.1;
    const cardD = 0.08;
    const cardGeo = new THREE.BoxGeometry(cardW, cardH, cardD);

    // Materials: Front Face (0), Back Face (1), Sidewalls (2-5)
    const isCollected = collectedIds.includes(inspectingPlayer.id);
    const frontTex = drawCardTexture(inspectingPlayer, isCollected, false);
    const backTex = drawCardTexture(inspectingPlayer, isCollected, true);

    const materials = [
      new THREE.MeshStandardMaterial({ color: '#111827' }), // Right
      new THREE.MeshStandardMaterial({ color: '#111827' }), // Left
      new THREE.MeshStandardMaterial({ color: '#111827' }), // Top
      new THREE.MeshStandardMaterial({ color: '#111827' }), // Bottom
      new THREE.MeshStandardMaterial({ // Front face
        map: frontTex,
        roughness: isCollected ? 0.15 : 0.85,
        metalness: isCollected && inspectingPlayer.isRare ? 0.7 : 0.15,
      }),
      new THREE.MeshStandardMaterial({ // Back face
        map: backTex,
        roughness: isCollected ? 0.25 : 0.9,
        metalness: isCollected && inspectingPlayer.isRare ? 0.4 : 0.1,
      })
    ];

    const cardMesh = new THREE.Mesh(cardGeo, materials);
    scene.add(cardMesh);
    inspectCardMeshRef.current = cardMesh;

    // Particle field stars behind
    const starsGeo = new THREE.BufferGeometry();
    const starsCount = 100;
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 35;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: inspectingPlayer.isRare ? '#eab308' : '#2563eb',
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const starPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starPoints);

    // Inspect animation loops
    let animId: number;
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      // Light hover floating and slow spin rotation
      if (cardMesh) {
        cardMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.15;
        cardMesh.rotation.y += 0.006;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!inspectMountRef.current || !camera || !renderer) return;
      const w = inspectMountRef.current.clientWidth;
      const h = inspectMountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [inspectingPlayer]);

  // Pack Open Simulation Logic
  const handleOpenPack = () => {
    setOpeningPack(true);
    setPackStage('ripping');

    // Simulate epic 3-card reveal reward
    // Select 3 random players (ensure at least 1 rare card is likely to add high satisfaction)
    const availablePlayers = [...players];
    const reward: Player[] = [];

    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * availablePlayers.length);
      reward.push(availablePlayers[idx]);
      // Remove to prevent duplicate rewards in same single pack
      availablePlayers.splice(idx, 1);
    }

    setTimeout(() => {
      setPackOpenedReward(reward);
      setCurrentPackRewardIdx(0);
      setPackStage('revealed');

      // Sync stickers directly into collected database list
      const rewardedIds = reward.map((p) => p.id);
      const uniqueNewCollected = Array.from(new Set([...collectedIds, ...rewardedIds]));
      onCardsCollected(uniqueNewCollected);
    }, 1800); // Ripping sealed pack timing duration
  };

  const handleNextReward = () => {
    if (currentPackRewardIdx < 2) {
      setCurrentPackRewardIdx(currentPackRewardIdx + 1);
    } else {
      // Completed reveal view
      setOpeningPack(false);
      setPackStage('closed');
      setPackOpenedReward([]);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      
      {/* 3D PACK OPENING FLOATING OVERLAY VIEW */}
      {openingPack && (
        <div id="pack-opening-modal" className="fixed inset-0 z-50 bg-[#1a0209]/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#3d0515] to-[#1a0209] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            
            {/* RIPPING / TEARING CONSOLE */}
            {packStage === 'ripping' && (
              <div className="py-12 flex flex-col items-center gap-6">
                <div className="relative w-40 h-56 bg-gradient-to-tr from-[#EEB211] via-[#FFA500] to-yellow-300 rounded-2xl shadow-2xl p-1 flex items-center justify-center animate-bounce">
                  <div className="absolute inset-0 border-4 border-[#52071C] rounded-2xl" />
                  <Gift className="w-16 h-16 text-[#52071C]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white animate-pulse uppercase tracking-wider">¡Abriendo Sobre de Cromos!</h3>
                  <p className="text-xs text-white/60 font-mono uppercase tracking-wider">Rompiendo el sello de aluminio virtual...</p>
                </div>
              </div>
            )}

            {/* CARD REVEAL DISPLAY */}
            {packStage === 'revealed' && packOpenedReward.length > 0 && (
              <div className="w-full flex flex-col items-center gap-6 animate-fadeIn">
                <span className="text-xs font-mono font-bold text-[#EEB211] uppercase tracking-widest bg-[#EEB211]/10 px-3 py-1 rounded-full border border-[#EEB211]/20">
                  REVELADO {currentPackRewardIdx + 1} de 3
                </span>

                {/* Draw HD React stylized card projection mockup */}
                <div className={`relative w-64 h-90 rounded-2xl shadow-2xl transition-all duration-500 transform ${
                  packOpenedReward[currentPackRewardIdx].isRare 
                    ? 'bg-gradient-to-b from-[#EEB211] via-[#FFA500] to-[#ca8a04] p-1 border border-[#EEB211] scale-102 hover:rotate-2 text-white font-bold' 
                    : 'bg-gradient-to-b from-white/20 via-white/5 to-[#1a0209] p-1 border border-white/15 text-white'
                }`}>
                  {/* Glowing halo for rare */}
                  {packOpenedReward[currentPackRewardIdx].isRare && (
                    <div className="absolute -inset-1.5 bg-[#EEB211] opacity-25 blur-lg rounded-3xl animate-pulse" />
                  )}

                  <div className="absolute inset-0.5 bg-[#1d020a] rounded-2xl flex flex-col justify-between p-4 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{packOpenedReward[currentPackRewardIdx].flagUrl}</span>
                      <span className="text-xl font-black font-mono px-2 py-0.5 bg-black/60 rounded text-[#EEB211] border border-white/10">
                        {packOpenedReward[currentPackRewardIdx].rating}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      {/* Avatar design */}
                      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 shadow border-2 border-white/10" style={{ backgroundColor: packOpenedReward[currentPackRewardIdx].avatarColor }}>
                        <span className="text-3xl font-extrabold text-white">
                          {packOpenedReward[currentPackRewardIdx].name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold tracking-tight text-white uppercase">{packOpenedReward[currentPackRewardIdx].name}</h4>
                      <p className="text-[10px] text-white/50 font-mono mt-0.5 uppercase">{packOpenedReward[currentPackRewardIdx].club}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-y-1 gap-x-2 text-center text-[10px] font-mono border-t border-white/10 pt-2 text-white/70">
                      <div>
                        <span className="block text-white/40 text-[8px] uppercase font-bold">PAC</span>
                        {packOpenedReward[currentPackRewardIdx].stats.pac}
                      </div>
                      <div>
                        <span className="block text-white/40 text-[8px] uppercase font-bold">SHO</span>
                        {packOpenedReward[currentPackRewardIdx].stats.sho}
                      </div>
                      <div>
                        <span className="block text-white/40 text-[8px] uppercase font-bold">PAS</span>
                        {packOpenedReward[currentPackRewardIdx].stats.pas}
                      </div>
                      <div>
                        <span className="block text-white/40 text-[8px] uppercase font-bold">DRI</span>
                        {packOpenedReward[currentPackRewardIdx].stats.dri}
                      </div>
                      <div>
                        <span className="block text-white/40 text-[8px] uppercase font-bold">DEF</span>
                        {packOpenedReward[currentPackRewardIdx].stats.def}
                      </div>
                      <div>
                        <span className="block text-white/40 text-[8px] uppercase font-bold">PHY</span>
                        {packOpenedReward[currentPackRewardIdx].stats.phy}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="text-lg font-bold text-[#EEB211] leading-none uppercase tracking-wider">
                      {packOpenedReward[currentPackRewardIdx].isRare ? '⭐ ¡CROMO EXCLUSIVO DORADO! ⭐' : '⚽ ¡Nuevo Cromo Adquirido!'}
                    </h3>
                    <p className="text-xs text-white/50 font-mono mt-1">Registrado automáticamente en tu Colección Oficial Mundialista.</p>
                  </div>

                  <button
                    id="pack-next-btn"
                    onClick={handleNextReward}
                    className="w-full py-3 bg-[#EEB211] hover:bg-[#FFA500] text-[#52071C] font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-[#EEB211]/25 active:scale-98 transition-all"
                  >
                    {currentPackRewardIdx < 2 ? 'Siguiente Cromo' : 'Listo, Guardar en Álbum'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAILED 3D CARD SPECTATOR (INSPECTING VIEW MODAL) */}
      {inspectingPlayer && (
        <div id="card-inspect-modal" className="fixed inset-0 z-50 bg-[#1a0209]/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-gradient-to-b from-[#3d0515] to-[#1a0209] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px] md:h-[450px]">
            
            {/* 3D Canvas Spectator column */}
            <div className="flex-1 min-h-[250px] md:h-full relative overflow-hidden bg-black/40">
              <div ref={inspectMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              
              <div className="absolute bottom-4 left-4 pointer-events-none select-none bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white">
                <p className="text-[10px] font-mono text-white/40 leading-none uppercase font-bold">INTERACCIÓN 360°</p>
                <p className="text-xs font-bold mt-0.5 text-[#EEB211] uppercase tracking-wide">Arrastra para girar cromo y ver el reverso</p>
              </div>
            </div>

            {/* Profile Statistics details card info */}
            <div className="w-full md:w-[350px] p-6 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between bg-black/20 text-white overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[9px] font-mono tracking-widest text-[#EEB211] uppercase bg-black/30 px-2.5 py-1 rounded border border-white/10 font-bold">Jugador</span>
                  <button
                    id="card-inspect-close"
                    onClick={() => setInspectingPlayer(null)}
                    className="p-1 hover:bg-[#EEB211] hover:text-[#52071C] rounded-xl transition text-white/50 border border-transparent hover:border-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5 gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xl">{inspectingPlayer.flagUrl}</span>
                      <h2 className="text-base font-extrabold leading-tight text-white uppercase truncate">{inspectingPlayer.name}</h2>
                    </div>
                    <p className="text-[11px] text-white/50 font-mono mt-1 uppercase truncate">{inspectingPlayer.country} • {inspectingPlayer.club}</p>
                  </div>
                  
                  {/* 3D FIGURINE VIEWPORT */}
                  <div className="w-14 h-14 bg-black/65 border border-white/10 rounded-lg overflow-hidden shrink-0 relative shadow-inner">
                    <Player3DAvatar
                      country={inspectingPlayer.country}
                      name={inspectingPlayer.name}
                      position={inspectingPlayer.position}
                      number={inspectingPlayer.number}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-xl border border-white/10 font-sans">
                  <div>
                    <span className="text-[9px] font-mono text-white/40 uppercase block font-bold">Posición</span>
                    <span className="text-xs font-bold font-sans text-white/90">
                      {inspectingPlayer.position === 'POR' && '🧤 Portero / Guardameta'}
                      {inspectingPlayer.position === 'DEF' && '🛡️ Defensa Central'}
                      {inspectingPlayer.position === 'MED' && '📊 Mediocampista'}
                      {inspectingPlayer.position === 'DEL' && '🎯 Delantero Gol'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-white/40 uppercase block font-bold">Dorsal</span>
                    <span className="text-xs font-black font-mono text-[#EEB211]">CAMISETA #{inspectingPlayer.number}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono text-white/40 uppercase font-extrabold mb-2">Desglose de Estadísticas</h4>
                  <div className="space-y-2">
                    {/* Stat Rows */}
                    {[
                      { l: 'Ritmo (PAC)', v: inspectingPlayer.stats.pac },
                      { l: 'Tiro (SHO)', v: inspectingPlayer.stats.sho },
                      { l: 'Pase (PAS)', v: inspectingPlayer.stats.pas },
                      { l: 'Dribble (DRI)', v: inspectingPlayer.stats.dri },
                      { l: 'Defensa (DEF)', v: inspectingPlayer.stats.def },
                      { l: 'Físico (PHY)', v: inspectingPlayer.stats.phy },
                    ].map((stat, sIdx) => (
                      <div key={sIdx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-white/80">
                          <span>{stat.l}</span>
                          <span className="font-mono text-[#EEB211]">{stat.v}/99</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#EEB211] rounded-full" 
                            style={{ width: `${stat.v}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-mono text-white/40 flex items-center justify-between uppercase">
                <span>Colección Oficial 3D</span>
                <span className="text-[#EEB211] font-bold">Adquirido ✓</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE 3D STICKER ALBUM WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Controls Index Panel */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Caja de Sobres</h3>
            <p className="text-xs text-white/60">Abre nuevos packs de cromos virtuales para expandir y rellenar tu colección 3D del mundial.</p>
          </div>

          <button
            id="btn-claim-pack"
            onClick={handleOpenPack}
            className="w-full py-3 px-4 bg-[#EEB211] hover:bg-[#FFA500] text-[#52071C] text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#EEB211]/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
          >
            <Gift className="w-4 h-4" />
            <span>Reclamar Sobre (3 Cromos)</span>
          </button>

          <div className="h-px bg-white/10" />

          {/* SPREAD NAVIGATION CONSOLE */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-white/40 uppercase block font-bold tracking-wider">Selector de Secciones</span>
            
            <div className="flex flex-col gap-2">
              {[
                { label: '🌟 Superestrellas de Élite', idx: 0 },
                { label: '🪄 Magos del Mediocampo', idx: 1 },
                { label: '🛡️ Cerros Defensivos', idx: 2 }
              ].map((spreadItem) => (
                <button
                  id={`spread-selector-${spreadItem.idx}`}
                  key={spreadItem.idx}
                  onClick={() => setCurrentSpread(spreadItem.idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    currentSpread === spreadItem.idx
                      ? 'bg-[#EEB211]/15 text-[#EEB211] border-[#EEB211]/30'
                      : 'bg-black/20 text-white/60 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{spreadItem.label}</span>
                  <span className="font-mono text-[10px] text-white/40 uppercase">Pág. {spreadItem.idx * 2 + 1}-{spreadItem.idx * 2 + 2}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Quick Roster lists checklist */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-white/40 uppercase block font-bold tracking-wider">Lista de Check de Cromos</span>
            
            <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
              {currentSpreadPlayers.map((p) => {
                const collected = collectedIds.includes(p.id);
                return (
                  <div 
                    id={`checklist-item-${p.id}`}
                    key={p.id}
                    onClick={() => collected && setInspectingPlayer(p)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-bold border font-mono transition-colors ${
                      collected 
                        ? 'bg-black/40 border-white/10 text-white cursor-pointer hover:bg-white/10' 
                        : 'bg-black/10 border-transparent text-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{p.flagUrl}</span>
                      <span className="truncate max-w-[110px] uppercase">{p.name}</span>
                    </div>
                    <span>{collected ? '✅ Adquirido' : '❌ Falta'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Core 3D Interactive Album Stage column */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          
          {/* Main 3D Mounting viewport wrapper */}
          <div className="relative w-full h-[510px] bg-gradient-to-b from-[#1a0209] to-[#3d0515] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Float HUD guidelines */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-white font-sans pointer-events-none select-none">
              <span className="text-[9px] font-mono text-[#EEB211] tracking-wider font-bold uppercase">ÁLBUM DE CROMOS 3D</span>
              <p className="text-sm font-bold uppercase mt-0.5">Sección {currentSpread + 1}: {['Superestrellas', 'Mediocampistas', 'Defensores'][currentSpread]}</p>
            </div>

            {/* Quick action helper instructions overlay */}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white font-sans text-[10px] font-bold uppercase tracking-wider text-white/60 pointer-events-none select-none">
              💡 Arrastra el álbum con tu ratón en 3D para cambiar ángulos
            </div>
          </div>

          {/* Spread sheet footer quick action indicators */}
          <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white">
            <button
              id="album-page-prev"
              onClick={() => setCurrentSpread(Math.max(0, currentSpread - 1))}
              disabled={currentSpread === 0}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                currentSpread === 0 
                  ? 'bg-black/20 text-white/30 border-transparent cursor-not-allowed' 
                  : 'bg-black/40 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              ◀ Páginas Anteriores
            </button>

            <span className="text-xs font-mono text-white/50">Pág. {currentSpread * 2 + 1} - {currentSpread * 2 + 2} de 6</span>

            <button
              id="album-page-next"
              onClick={() => setCurrentSpread(Math.min(2, currentSpread + 1))}
              disabled={currentSpread === 2}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
                currentSpread === 2 
                  ? 'bg-black/20 text-white/30 border-transparent cursor-not-allowed' 
                  : 'bg-black/40 hover:bg-white/10 text-white border-white/10'
              }`}
            >
              Páginas Siguientes ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
