/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Stadium } from '../types';
import { Camera, RefreshCw, Sun, Moon, Info, Eye } from 'lucide-react';

interface StadiumRendererProps {
  stadium: Stadium;
}

export const StadiumRenderer: React.FC<StadiumRendererProps> = ({ stadium }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'aero' | 'field' | 'stands'>('aero');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isNight, setIsNight] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Keep references to animate or modify Three.js objects cleanly
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const structureGroupRef = useRef<THREE.Group | null>(null);
  const ballRef = useRef<THREE.Mesh | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Stadium hotspots definitions
  const hotspots = [
    { id: 'field', label: 'Campo de Juego', desc: 'Césped híbrido reforzado con fibras elásticas artificiales y riego inteligente subterráneo.' },
    { id: 'roof', label: 'Techo Retráctil', desc: 'Material de fibra de vidrio PTFE y acero de tensión para bloquear el calor radiante o regular ventilación.' },
    { id: 'screen', label: 'Pantalla Gigante 360°', desc: 'Paneles LED de alta fidelidad que transmiten información de juego y tomas interactivas.' }
  ];

  // Helper: Create stylized Canvas texture for soccer field markings
  const createFieldTexture = (fieldColor: string): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Grass background
      ctx.fillStyle = fieldColor || '#14532d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grass stripes (for realism)
      const numStripes = 15;
      const stripeWidth = canvas.width / numStripes;
      for (let i = 0; i < numStripes; i += 2) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(i * stripeWidth, 0, stripeWidth, canvas.height);
      }

      // Outer border margin
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Midline
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 30);
      ctx.lineTo(canvas.width / 2, canvas.height - 30);
      ctx.stroke();

      // Center circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 70, 0, 2 * Math.PI);
      ctx.stroke();

      // Center spot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Penalty areas
      // Left penalty box
      ctx.strokeRect(30, canvas.height / 2 - 140, 140, 280);
      ctx.strokeRect(30, canvas.height / 2 - 70, 50, 140);
      // Left penalty spot
      ctx.beginPath();
      ctx.arc(120, canvas.height / 2, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Right penalty box
      ctx.strokeRect(canvas.width - 170, canvas.height / 2 - 140, 140, 280);
      ctx.strokeRect(canvas.width - 80, canvas.height / 2 - 70, 50, 140);
      // Right penalty spot
      ctx.beginPath();
      ctx.arc(canvas.width - 120, canvas.height / 2, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Goal arcs
      ctx.beginPath();
      ctx.arc(120, canvas.height / 2, 60, -0.6, 0.6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(canvas.width - 120, canvas.height / 2, 60, Math.PI - 0.6, Math.PI + 0.6);
      ctx.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Helper: Create giant stylized soccer ball Canvas texture (World Cup classic Al Rihla pattern)
  const createBallTexture = (): THREE.Texture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base white
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add colorful triangular patterns and seams
      ctx.strokeStyle = '#d4d4d8';
      ctx.lineWidth = 3;
      // Draw hex outlines
      const stepX = canvas.width / 8;
      const stepY = canvas.height / 4;
      for (let i = 0; i <= 8; i++) {
        for (let j = 0; j <= 4; j++) {
          ctx.beginPath();
          ctx.arc(i * stepX + (j % 2) * (stepX / 2), j * stepY, 20, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      // Sleek vibrant lines of Al Rihla (gold, magenta, cyan streaks)
      ctx.fillStyle = '#fbbf24'; // Gold
      ctx.beginPath();
      ctx.moveTo(30, 40);
      ctx.bezierCurveTo(80, 10, 120, 110, 170, 50);
      ctx.bezierCurveTo(120, 70, 80, 120, 30, 40);
      ctx.fill();

      ctx.fillStyle = '#ec4899'; // Magenta
      ctx.beginPath();
      ctx.moveTo(200, 150);
      ctx.bezierCurveTo(240, 100, 300, 240, 350, 170);
      ctx.bezierCurveTo(300, 190, 250, 250, 200, 150);
      ctx.fill();

      ctx.fillStyle = '#06b6d4'; // Cyan
      ctx.beginPath();
      ctx.moveTo(360, 60);
      ctx.bezierCurveTo(400, 10, 440, 110, 490, 40);
      ctx.bezierCurveTo(440, 60, 400, 120, 360, 60);
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Setup Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Dimensions
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Create scene with soft atmospheric coloring
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isNight ? '#0B0F19' : '#F0F4F8');
    scene.fog = new THREE.FogExp2(isNight ? '#0B0F19' : '#F0F4F8', 0.015);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    applyCameraPreset('aero');

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Clear mount element and append
    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground level
    controls.minDistance = 15;
    controls.maxDistance = 120;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.0;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(
      isNight ? '#1E293B' : '#E2E8F0',
      isNight ? 0.4 : 0.8
    );
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(
      isNight ? '#D9F2FF' : '#FFFDF2',
      isNight ? 0.6 : 1.2
    );
    dirLight.position.set(30, 60, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 200;
    const offset = 40;
    dirLight.shadow.camera.left = -offset;
    dirLight.shadow.camera.right = offset;
    dirLight.shadow.camera.top = offset;
    dirLight.shadow.camera.bottom = -offset;
    scene.add(dirLight);
    directionalLightRef.current = dirLight;

    // Add extra warm spotlights at night to make it gorgeous
    if (isNight) {
      const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'];
      for (let i = 0; i < 4; i++) {
        const spot = new THREE.SpotLight(colors[i], 5, 80, Math.PI / 4, 0.5, 1);
        const angle = (i * Math.PI) / 2 + Math.PI / 4;
        spot.position.set(Math.cos(angle) * 35, 25, Math.sin(angle) * 35);
        spot.target.position.set(0, 0, 0);
        scene.add(spot);
        scene.add(spot.target);
      }
    }

    // Build static pitch and world grid
    const gridHelper = new THREE.GridHelper(200, 50, '#1E293B', '#1E293B');
    gridHelper.position.y = -0.51;
    scene.add(gridHelper);

    // Dynamic stadium structures group
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);
    structureGroupRef.current = structureGroup;

    // Float soccer ball at center
    const ballGeometry = new THREE.SphereGeometry(1.6, 24, 24);
    const ballMaterial = new THREE.MeshStandardMaterial({
      map: createBallTexture(),
      roughness: 0.15,
      metalness: 0.1,
    });
    const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballMesh.position.set(0, 12, 0);
    ballMesh.castShadow = true;
    scene.add(ballMesh);
    ballRef.current = ballMesh;

    // Floating dynamic ring around soccer ball
    const ringGeo = new THREE.RingGeometry(3.5, 3.8, 30);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#eab308',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ballMesh.add(ringMesh);

    // Initial Stadium Build
    buildStadium();

    // Animation loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      // Rotate Soccer Ball
      if (ballMesh) {
        ballMesh.rotation.y += 0.01;
        ballMesh.rotation.x += 0.003;
        ballMesh.position.y = 12 + Math.sin(Date.now() * 0.0015) * 0.6;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
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
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [stadium.id, isNight]); // Re-render when selected stadium or day/night mode changes

  // Synchronize auto-rotate controls flag
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Procedural Stadium Construction based on style
  const buildStadium = () => {
    const scene = sceneRef.current;
    const group = structureGroupRef.current;
    if (!scene || !group) return;

    // Clean previous objects in group
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const primaryColor = new THREE.Color(stadium.primaryColor);
    const secondaryColor = new THREE.Color(stadium.secondaryColor);

    // 1. CELESTIAL field pitch plane
    const pitchWidth = 44;
    const pitchLength = 30;
    const pitchGeo = new THREE.PlaneGeometry(pitchWidth, pitchLength);
    const pitchMat = new THREE.MeshStandardMaterial({
      map: createFieldTexture(stadium.fieldColor || '#14532d'),
      roughness: 0.85,
      metalness: 0.1,
    });
    const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
    pitchMesh.rotation.x = -Math.PI / 2;
    pitchMesh.position.y = -0.48;
    pitchMesh.receiveShadow = true;
    group.add(pitchMesh);

    // 2. Goal nets
    const createGoal = (posX: number) => {
      const goalGroup = new THREE.Group();
      
      // Posts (white cylinder)
      const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
      
      const leftPost = new THREE.Mesh(postGeo, postMat);
      leftPost.position.set(0, 1.25, -2);
      goalGroup.add(leftPost);

      const rightPost = new THREE.Mesh(postGeo, postMat);
      rightPost.position.set(0, 1.25, 2);
      goalGroup.add(rightPost);

      const crossbarGeo = new THREE.CylinderGeometry(0.12, 0.12, 4, 8);
      const crossbar = new THREE.Mesh(crossbarGeo, postMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(0, 2.5, 0);
      goalGroup.add(crossbar);

      // Simple net backing (wireframe box)
      const netGeo = new THREE.BoxGeometry(1.2, 2.5, 4.2);
      const netMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const net = new THREE.Mesh(netGeo, netMat);
      net.position.set(-0.6 * Math.sign(posX), 1.25, 0);
      goalGroup.add(net);

      goalGroup.position.set(posX, 0, 0);
      return goalGroup;
    };
    group.add(createGoal(-21));
    group.add(createGoal(21));

    // 3. HIGH-DETAIL SEATING STREAKS & SECTIONS (Tribunas de Asientos Exclusivas)
    const createStands = () => {
      const standsGroup = new THREE.Group();

      // Lower Bowl Seating: 5 steps of concentric rings
      const lowerTiersCount = 5;
      for (let i = 0; i < lowerTiersCount; i++) {
        const factor = i / lowerTiersCount;
        const radBottom = 23 + factor * 5;
        const radTop = 23 + (factor + 0.1) * 5;
        const tierHeight = 0.8;
        const tierY = 0.1 + i * tierHeight;

        // Custom segment-based geometry to simulate gangways/staircases between seating blocks
        const segmentCount = 8;
        const segmentAngle = (Math.PI * 2) / segmentCount;
        const gapAngle = 0.08; // gap representing stairs

        for (let s = 0; s < segmentCount; s++) {
          const startAngle = s * segmentAngle + gapAngle;
          const endAngle = (s + 1) * segmentAngle - gapAngle;

          const seatingGeo = new THREE.CylinderGeometry(
            radTop,
            radBottom,
            tierHeight,
            24,
            1,
            true,
            startAngle,
            endAngle - startAngle
          );

          // Alternating colors in different sectors for ultra-realism
          const sectorColor = s % 2 === 0 ? primaryColor : secondaryColor;
          const seatingMat = new THREE.MeshStandardMaterial({
            color: sectorColor,
            roughness: 0.6,
            metalness: 0.25,
            side: THREE.DoubleSide
          });

          const seatBlock = new THREE.Mesh(seatingGeo, seatingMat);
          seatBlock.position.y = tierY;
          seatBlock.receiveShadow = true;
          seatBlock.castShadow = true;
          standsGroup.add(seatBlock);
        }
      }

      // Upper Bowl Seating: 6 separate stepped rings
      const upperTiersCount = 6;
      for (let i = 0; i < upperTiersCount; i++) {
        const factor = i / upperTiersCount;
        const radBottom = 29 + factor * 6;
        const radTop = 29 + (factor + 0.15) * 6;
        const tierHeight = 1.0;
        const tierY = 4.2 + i * tierHeight;

        const segmentCount = 10;
        const segmentAngle = (Math.PI * 2) / segmentCount;
        const gapAngle = 0.06;

        for (let s = 0; s < segmentCount; s++) {
          const startAngle = s * segmentAngle + gapAngle;
          const endAngle = (s + 1) * segmentAngle - gapAngle;

          const seatingGeo = new THREE.CylinderGeometry(
            radTop,
            radBottom,
            tierHeight,
            24,
            1,
            true,
            startAngle,
            endAngle - startAngle
          );

          // Colored patterns
          let finalColor = secondaryColor.clone();
          if (i % 2 === 1) {
            finalColor = new THREE.Color('#ffffff'); // White accent rings
          } else if (s % 3 === 0) {
            finalColor = primaryColor.clone();
          }

          const seatingMat = new THREE.MeshStandardMaterial({
            color: finalColor,
            roughness: 0.65,
            metalness: 0.2,
            side: THREE.DoubleSide
          });

          const seatBlock = new THREE.Mesh(seatingGeo, seatingMat);
          seatBlock.position.y = tierY;
          seatBlock.receiveShadow = true;
          seatBlock.castShadow = true;
          standsGroup.add(seatBlock);
        }
      }

      // 3B. ADD COLOURED SPECTATOR SPECKLES inside stands
      const fanColors = [process.env.GEMINI_API_KEY ? '#FFD700' : '#faea7b', '#ee3333', '#1e40af', '#ffffff', '#22c55e', '#a855f7'];
      const crowdPointsCount = 200;
      const pointsGeo = new THREE.BufferGeometry();
      const pointsPos = new Float32Array(crowdPointsCount * 3);
      const pointsColor = new Float32Array(crowdPointsCount * 3);

      for (let i = 0; i < crowdPointsCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const isUpper = Math.random() > 0.45;
        const radius = isUpper ? (29 + Math.random() * 5.5) : (23 + Math.random() * 4.5);
        const y = isUpper ? (4.5 + Math.random() * 5) : (0.3 + Math.random() * 3.5);

        pointsPos[i * 3] = Math.cos(angle) * radius;
        pointsPos[i * 3 + 1] = y;
        pointsPos[i * 3 + 2] = Math.sin(angle) * radius;

        const rgb = new THREE.Color(fanColors[Math.floor(Math.random() * fanColors.length)]);
        pointsColor[i * 3] = rgb.r;
        pointsColor[i * 3 + 1] = rgb.g;
        pointsColor[i * 3 + 2] = rgb.b;
      }

      pointsGeo.setAttribute('position', new THREE.BufferAttribute(pointsPos, 3));
      pointsGeo.setAttribute('color', new THREE.BufferAttribute(pointsColor, 3));
      const pointsMat = new THREE.PointsMaterial({
        size: 0.45,
        vertexColors: true,
        transparent: true,
        opacity: 0.95
      });
      const crowdPoints = new THREE.Points(pointsGeo, pointsMat);
      standsGroup.add(crowdPoints);

      return standsGroup;
    };
    group.add(createStands());

    // 3C. INTERIOR PROP: 4 Corner Flags (Banderas de córner)
    const createCornerFlag = (x: number, z: number) => {
      const flagGroup = new THREE.Group();
      
      // White flag post cylinder
      const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6);
      const poleMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 0.7;
      flagGroup.add(pole);

      // Yellow neon flag blade triangle box
      const bladeGeo = new THREE.BoxGeometry(0.35, 0.25, 0.02);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        roughness: 0.8,
        metalness: 0.1
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0.18, 1.2, 0);
      flagGroup.add(blade);

      flagGroup.position.set(x, -0.48, z);
      return flagGroup;
    };
    group.add(createCornerFlag(-21.5, -14.5));
    group.add(createCornerFlag(21.5, -14.5));
    group.add(createCornerFlag(-21.5, 14.5));
    group.add(createCornerFlag(21.5, 14.5));

    // 3D. INTERIOR PROP: Team Dugouts & Benches (Banquillos de técnicos)
    const createDugout = (zSign: number) => {
      const dugout = new THREE.Group();

      // Dugout translucent canopy canopy
      const canopyGeo = new THREE.CylinderGeometry(1.5, 1.5, 6, 12, 1, true, 0, Math.PI);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: '#0f172a',
        transparent: true,
        opacity: 0.65,
        roughness: 0.2,
        metalness: 0.8,
        side: THREE.DoubleSide
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.rotation.x = Math.PI / 2;
      canopy.rotation.z = Math.PI / 2;
      canopy.position.set(0, 0.8, 0);
      dugout.add(canopy);

      // Add miniature bench seats inside
      for (let s = -2; s <= 2; s += 1.2) {
        const seatBoxGeo = new THREE.BoxGeometry(0.8, 0.5, 0.6);
        const seatBoxMat = new THREE.MeshStandardMaterial({
          color: zSign > 0 ? primaryColor : secondaryColor,
          roughness: 0.5
        });
        const seatBox = new THREE.Mesh(seatBoxGeo, seatBoxMat);
        seatBox.position.set(s, 0.25, -0.2);
        dugout.add(seatBox);
      }

      dugout.position.set(0, -0.48, zSign * 15.5);
      dugout.rotation.y = zSign > 0 ? 0 : Math.PI;
      return dugout;
    };
    group.add(createDugout(1));
    group.add(createDugout(-1));

    // 3E. COLLOSAL EXTERIOR STADIUM FLOODLIGHT TOWERS (4 Torres Gigantes de Iluminación)
    const createFloodlightTower = (posX: number, posZ: number, rotY: number) => {
      const tower = new THREE.Group();

      // Metallic steel truss frame (main column)
      const columnGeo = new THREE.CylinderGeometry(0.4, 0.8, 18, 6);
      const columnMat = new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.3,
        metalness: 0.8
      });
      const column = new THREE.Mesh(columnGeo, columnMat);
      column.position.y = 9;
      column.receiveShadow = true;
      column.castShadow = true;
      tower.add(column);

      // Diagonal cross beams
      for (let b = 0; b < 4; b++) {
        const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 4);
        const beamMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.7 });
        const beam1 = new THREE.Mesh(beamGeo, beamMat);
        beam1.rotation.z = Math.PI / 4;
        beam1.position.set(0, 3 + b * 4, 0);
        tower.add(beam1);

        const beam2 = beam1.clone();
        beam2.rotation.z = -Math.PI / 4;
        tower.add(beam2);
      }

      // Top Rectangular LED Light Array Grid Board
      const boardGeo = new THREE.BoxGeometry(4.2, 2.5, 0.5);
      const boardMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 });
      const board = new THREE.Mesh(boardGeo, boardMat);
      board.position.set(0, 18, 0);
      board.rotation.x = Math.PI / 10; // angled down to field center
      tower.add(board);

      // Draw rows of glowing emissive LED bulbs on front plate
      for (let row = -0.8; row <= 0.8; row += 0.8) {
        for (let col = -1.6; col <= 1.6; col += 0.8) {
          const bulbGeo = new THREE.SphereGeometry(0.24, 8, 8);
          const bulbMat = new THREE.MeshBasicMaterial({
            color: isNight ? '#ffffff' : '#fef08a'
          });
          const bulb = new THREE.Mesh(bulbGeo, bulbMat);
          bulb.position.set(col, 18 + row, 0.3);
          tower.add(bulb);
        }
      }

      tower.position.set(posX, 0, posZ);
      tower.rotation.y = rotY;
      return tower;
    };

    // Place 4 corner towers slightly offset far back behind seating bowls
    group.add(createFloodlightTower(-31, -22, Math.PI / 4));
    group.add(createFloodlightTower(31, -22, -Math.PI / 4));
    group.add(createFloodlightTower(-31, 22, (Math.PI * 3) / 4));
    group.add(createFloodlightTower(31, 22, -(Math.PI * 3) / 4));

    // 3F. SUSPENDED 4-SIDED JUMBO SCOREBOARD (Marcador suspendido en 3D en el centro)
    const createScoreboard = () => {
      const scoreboard = new THREE.Group();

      // Support trusses descending from the heavens
      const support1Geo = new THREE.CylinderGeometry(0.06, 0.06, 12, 4);
      const supportMat = new THREE.MeshBasicMaterial({ color: '#475569' });
      
      const sup1 = new THREE.Mesh(support1Geo, supportMat);
      sup1.position.set(-2, 6, -2);
      sup1.rotation.x = Math.PI / 12;
      scoreboard.add(sup1);

      const sup2 = sup1.clone();
      sup2.position.set(2, 6, -2);
      scoreboard.add(sup2);

      const sup3 = sup1.clone();
      sup3.position.set(-2, 6, 2);
      scoreboard.add(sup3);

      const sup4 = sup1.clone();
      sup4.position.set(2, 6, 2);
      scoreboard.add(sup4);

      // Core scoreboard box
      const boxGeo = new THREE.BoxGeometry(4.4, 2.8, 4.4);
      const boxMat = new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.1,
        metalness: 0.8
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 0;
      scoreboard.add(box);

      // Glow indicators / neon edges around scoreboard
      const glowRingGeo = new THREE.TorusGeometry(3.1, 0.1, 8, 30);
      const glowRingMat = new THREE.MeshBasicMaterial({ color: '#EEB211' });
      const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
      glowRing.rotation.x = Math.PI / 2;
      glowRing.position.y = -1.45;
      scoreboard.add(glowRing);

      // High-resolution Canvas texture rendering for the Scoreboard Sides
      const createScoreTextTexture = (teamA: string, teamB: string, score: string) => {
        const cv = document.createElement('canvas');
        cv.width = 256;
        cv.height = 128;
        const cx = cv.getContext('2d');
        if (cx) {
          cx.fillStyle = '#0f172a';
          cx.fillRect(0, 0, cv.width, cv.height);

          cx.strokeStyle = '#EEB211';
          cx.lineWidth = 4;
          cx.strokeRect(4, 4, cv.width - 8, cv.height - 8);

          cx.font = 'bold 16px monospace';
          cx.fillStyle = '#94a3b8';
          cx.textAlign = 'center';
          cx.fillText('COPA MUNDIAL FIFA', cv.width / 2, 28);

          // Team labels
          cx.font = 'black 24px sans-serif';
          cx.fillStyle = '#ffffff';
          cx.fillText(teamA, 60, 68);
          cx.fillText(teamB, cv.width - 60, 68);

          // Score text
          cx.font = 'bold 32px monospace';
          cx.fillStyle = '#EEB211';
          cx.fillText(score, cv.width / 2, 72);

          cx.font = 'bold 14px monospace';
          cx.fillStyle = '#22c55e';
          cx.fillText("MIN 90' LIVE", cv.width / 2, 108);
        }
        const tex = new THREE.CanvasTexture(cv);
        return tex;
      };

      const matA = new THREE.MeshStandardMaterial({ map: createScoreTextTexture('ARG', 'BRA', '1-0') });
      const matB = new THREE.MeshStandardMaterial({ map: createScoreTextTexture('ESP', 'FRA', '2-2') });

      const subMaterials = [
        matA, // Right (positive X)
        matA, // Left (negative X)
        new THREE.MeshStandardMaterial({ color: '#1e293b' }), // Top
        new THREE.MeshStandardMaterial({ color: '#1e293b' }), // Bottom
        matB, // Front (positive Z)
        matB  // Back (negative Z)
      ];

      const screens = new THREE.Mesh(boxGeo, subMaterials);
      scoreboard.add(screens);

      scoreboard.position.y = 15; // hangs over central zone
      return scoreboard;
    };
    group.add(createScoreboard());

    // 4. EXTERIOR ARCHITECTURE PRESETS (Exclusive design styles)
    if (stadium.style === 'golden') {
      // Golden Bowl (Lusail) styling - textured rings and golden cladding
      const bowlHeight = 10;
      const ringCount = 14;
      for (let i = 0; i < ringCount; i++) {
        const factor = i / ringCount;
        const rad = 28 + Math.sin(factor * Math.PI) * 12;
        const width = 0.55;
        const torusGeo = new THREE.TorusGeometry(rad, width, 8, 48);
        const torusMat = new THREE.MeshStandardMaterial({
          color: primaryColor,
          roughness: 0.1,
          metalness: 0.95,
        });
        const ring = new THREE.Mesh(torusGeo, torusMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.5 + factor * bowlHeight;
        ring.castShadow = true;
        group.add(ring);
      }

      // Metallic supporting truss pillars on the outside facade
      for (let j = 0; j < 16; j++) {
        const theta = (j * Math.PI * 2) / 16;
        const pillarGeo = new THREE.CylinderGeometry(0.2, 0.4, 11, 4);
        const pillarMat = new THREE.MeshStandardMaterial({ color: '#b45309', metalness: 0.8 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(Math.cos(theta) * 31, 5, Math.sin(theta) * 31);
        pillar.rotation.z = Math.cos(theta) * 0.1;
        pillar.rotation.x = -Math.sin(theta) * 0.1;
        group.add(pillar);
      }

      // Elegant LED screens hovering over stands
      const screenGeo = new THREE.BoxGeometry(11, 3.5, 0.4);
      const screenMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
      const ledScreen = new THREE.Mesh(screenGeo, screenMat);
      ledScreen.position.set(0, 14, -22);
      group.add(ledScreen);

    } else if (stadium.style === 'tent') {
      // Bedouin fold tents (Al Bayt) - dynamic red striped peaks
      const tentCount = 16;
      for (let i = 0; i < tentCount; i++) {
        const theta = (i * Math.PI * 2) / tentCount;
        const tentGeo = new THREE.ConeGeometry(5, 12, 4);
        const tentMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? primaryColor : '#ffffff',
          roughness: 0.9,
          metalness: 0.05,
          flatShading: true,
        });
        const tent = new THREE.Mesh(tentGeo, tentMat);
        tent.position.set(Math.cos(theta) * 32, 5.5, Math.sin(theta) * 32);
        tent.rotation.y = -theta + Math.PI / 4;
        tent.castShadow = true;
        group.add(tent);

        // Solid tension cables pinning tents to ground
        const cablePoints = [
          new THREE.Vector3(Math.cos(theta) * 31, 10, Math.sin(theta) * 31),
          new THREE.Vector3(Math.cos(theta) * 36, -0.2, Math.sin(theta) * 36)
        ];
        const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
        const cableGeo = new THREE.TubeGeometry(cableCurve, 10, 0.09, 4, false);
        const cableMat = new THREE.MeshBasicMaterial({ color: '#d1d5db' });
        const cable = new THREE.Mesh(cableGeo, cableMat);
        group.add(cable);
      }

      // Large connecting outer curtain walls
      const wallGeo = new THREE.CylinderGeometry(34, 34, 8, 16, 1, true);
      const wallMat = new THREE.MeshStandardMaterial({
        color: '#1c1917',
        roughness: 0.9,
        side: THREE.BackSide,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.y = 3.5;
      group.add(wall);

    } else if (stadium.style === 'modern') {
      // Historical twin metal beams crossing (Khalifa)
      const archPoints: THREE.Vector3[] = [];
      const steps = 30;
      const span = 42;
      const peakY = 17;
      for (let i = 0; i <= steps; i++) {
        const pct = i / steps;
        const norm = (pct * 2) - 1; // -1 to 1
        const x = norm * span;
        const y = (1 - norm * norm) * peakY;
        archPoints.push(new THREE.Vector3(x, y, -5));
      }
      
      const curve = new THREE.CatmullRomCurve3(archPoints);
      const tubeGeo1 = new THREE.TubeGeometry(curve, 44, 0.48, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: secondaryColor,
        roughness: 0.3,
        metalness: 0.88,
      });
      
      const arch1 = new THREE.Mesh(tubeGeo1, tubeMat);
      arch1.castShadow = true;
      group.add(arch1);

      // Twin arch behind it
      const arch2 = arch1.clone();
      arch2.position.z = 10;
      group.add(arch2);

      // Extra steel rib lines linking arches representing structural safety
      for (let l = -18; l <= 18; l += 6) {
        const connectorPoints = [
          new THREE.Vector3(l, (1 - (l/span)*(l/span)) * peakY, -5),
          new THREE.Vector3(l, (1 - (l/span)*(l/span)) * peakY, 5)
        ];
        const conCurve = new THREE.CatmullRomCurve3(connectorPoints);
        const conGeo = new THREE.TubeGeometry(conCurve, 2, 0.15, 6, false);
        const conMesh = new THREE.Mesh(conGeo, tubeMat);
        group.add(conMesh);
      }

      // Sleek bright ring light roof opening
      const ringGeo = new THREE.TorusGeometry(32, 0.8, 8, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.2,
        metalness: 0.7,
      });
      const roofRing = new THREE.Mesh(ringGeo, ringMat);
      roofRing.rotation.x = Math.PI / 2;
      roofRing.position.y = 9;
      roofRing.castShadow = true;
      group.add(roofRing);

    } else if (stadium.style === 'classic') {
      // Sailing vessel curves (Al Janoub) - asymmetrical curvy layered shells
      const shellCount = 8;
      for (let i = 0; i < shellCount; i++) {
        const theta = (i * Math.PI * 2) / shellCount;
        const shellGeo = new THREE.SphereGeometry(32, 12, 12, theta, 0.5, 0, Math.PI / 2);
        const shellMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? primaryColor : secondaryColor,
          roughness: 0.15,
          metalness: 0.4,
          side: THREE.DoubleSide,
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.rotation.z = Math.PI / 2;
        shell.position.y = -6;
        shell.castShadow = true;
        group.add(shell);
      }
    }
  };

  // Adjust camera preset coordinates smoothly
  const applyCameraPreset = (view: 'aero' | 'field' | 'stands') => {
    setCameraView(view);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera) return;

    if (view === 'aero') {
      // High helicopter overview
      camera.position.set(0, 48, 48);
      if (controls) {
        controls.target.set(0, 3, 0);
      }
    } else if (view === 'field') {
      // Player on the ground view looking up
      camera.position.set(-15, 1.5, 5);
      if (controls) {
        controls.target.set(0, 10, 0);
      }
    } else if (view === 'stands') {
      // In the middle of the crowd overlooking the stadium
      camera.position.set(24, 9, -24);
      if (controls) {
        controls.target.set(0, 5, 0);
      }
    }
    if (controls) {
      controls.update();
    }
  };

  // Handle auto rotate state modifications
  const toggleRotation = () => {
    setAutoRotate(!autoRotate);
  };

  const toggleDayNight = () => {
    setIsNight(!isNight);
  };

  return (
    <div id={`stadium-3d-${stadium.id}`} className="relative w-full h-[620px] bg-gradient-to-b from-[#1a0209] to-[#3d0515] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">
      
      {/* 3D Canvas Canvas mounting container */}
      <div className="flex-1 h-[420px] md:h-full relative overflow-hidden">
        
        {/* Render Canvas anchor */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />Requested action completed

        {/* Floating Top Title Overlay */}
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-white select-none pointer-events-none">
          <span className="text-[10px] font-mono tracking-wider text-[#EEB211] uppercase font-bold">COPA MUNDIAL PROCEDURAL 3D</span>
          <h2 className="text-lg font-bold tracking-tight uppercase">{stadium.name}</h2>
          <p className="text-xs text-white/60 font-mono mt-0.5">{stadium.city}, Catar</p>
        </div>

        {/* Ambient Controls Left Overlay */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            id="stadium-btn-rotate"
            onClick={toggleRotation}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
              autoRotate 
                ? 'bg-[#EEB211] text-[#52071C] border-[#EEB211] shadow-lg shadow-[#EEB211]/20'
                : 'bg-black/30 text-white/80 border-white/10 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span>Rotación</span>
          </button>

          <button
            id="stadium-btn-daynight"
            onClick={toggleDayNight}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-black/30 hover:bg-black/55 text-white/80 border border-white/10 hover:text-white transition-all"
          >
            {isNight ? <Sun className="w-3.5 h-3.5 text-[#EEB211]" /> : <Moon className="w-3.5 h-3.5 text-[#EEB211]" />}
            <span>{isNight ? 'Modo Día' : 'Modo Noche'}</span>
          </button>
        </div>

        {/* Presets Right Floating Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <div className="text-[9px] font-mono text-white/40 px-2 pb-1.5 border-b border-white/10 uppercase font-bold text-center">
            Cámara 3D
          </div>
          
          <button
            id="preset-cam-aero"
            onClick={() => applyCameraPreset('aero')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs leading-none font-bold uppercase transition-all ${
              cameraView === 'aero'
                ? 'bg-[#EEB211]/25 text-[#EEB211] border border-[#EEB211]/30'
                : 'text-white/60 hover:text-white border border-transparent'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Aérea</span>
          </button>

          <button
            id="preset-cam-field"
            onClick={() => applyCameraPreset('field')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs leading-none font-bold uppercase transition-all ${
              cameraView === 'field'
                ? 'bg-[#EEB211]/25 text-[#EEB211] border border-[#EEB211]/30'
                : 'text-white/60 hover:text-white border border-transparent'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Campo</span>
          </button>

          <button
            id="preset-cam-stands"
            onClick={() => applyCameraPreset('stands')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs leading-none font-bold uppercase transition-all ${
              cameraView === 'stands'
                ? 'bg-[#EEB211]/25 text-[#EEB211] border border-[#EEB211]/30'
                : 'text-white/60 hover:text-white border border-transparent'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Gradas</span>
          </button>
        </div>

        {/* Hotspot triggers overlay */}
        <div className="absolute bottom-4 right-4 flex gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10">
          <span className="text-[10px] font-mono font-bold text-white/40 mr-1.5 self-center uppercase">Puntos:</span>
          {hotspots.map((p) => (
            <button
              id={`hotspot-trigger-${p.id}`}
              key={p.id}
              onClick={() => setSelectedHotspot(selectedHotspot === p.id ? null : p.id)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                selectedHotspot === p.id 
                  ? 'bg-[#EEB211] text-[#52071C] shadow'
                  : 'bg-black/20 hover:bg-white/10 text-white/70'
              }`}
            >
              {p.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Side Metadata Profile Card */}
      <div className="w-full md:w-[350px] bg-black/20 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between overflow-y-auto">
        
        {/* Architectural profile contents */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <span className="bg-black/30 text-white/50 font-mono text-[9px] px-2 py-1 rounded border border-white/10 tracking-widest uppercase font-bold">Ficha Técnica</span>
            <span className="font-mono text-sm text-[#EEB211] font-bold">🏟️ 3D MODEL</span>
          </div>

          <div className="space-y-4 font-sans">
            <div>
              <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Nombre Oficial</span>
              <p className="text-base text-white font-black uppercase">{stadium.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Ciudad</span>
                <p className="text-sm font-bold text-white/80">{stadium.city}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Capacidad</span>
                <p className="text-sm font-black text-[#EEB211]">{stadium.capacity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Inauguración</span>
                <p className="text-sm font-bold text-white/80">{stadium.opened}</p>
              </div>
              <div>
                <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Arquitectura</span>
                <p className="text-sm text-white/80 truncate font-semibold">{stadium.architect}</p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-white/40 block uppercase font-bold">Estilo de Fachada 3D</span>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-black/30 border border-white/10 text-[#EEB211]">
                {stadium.style === 'golden' && '💠 Cuenco Dorado Tradicional (Lusail)'}
                {stadium.style === 'tent' && '⛺ Carpa Nómada Ribeteada (Al Bayt)'}
                {stadium.style === 'modern' && '⚔️ Estructura Arco y Viga Acero (Khalifa)'}
                {stadium.style === 'classic' && '⛵ Cascos y Velas Aerodinámicas (Al Janoub)'}
              </span>
            </div>

            {/* Selected hotspot detail overlay */}
            {selectedHotspot && (
              <div className="bg-[#EEB211]/10 border border-[#EEB211]/25 rounded-xl p-3 animate-fadeIn">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-[#EEB211] uppercase">🔍 {hotspots.find((h) => h.id === selectedHotspot)?.label}</h4>
                  <button onClick={() => setSelectedHotspot(null)} className="text-[9px] font-mono text-white/40 hover:text-white border border-white/10 px-1.5 rounded uppercase font-bold">Cerrar</button>
                </div>
                <p className="text-xs text-white/80 leading-normal">
                  {hotspots.find((h) => h.id === selectedHotspot)?.desc}
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] font-mono text-white/40 block uppercase font-bold mb-1">Descripción de Obra</span>
              <p className="text-xs text-white/60 leading-relaxed text-justify">{stadium.description}</p>
            </div>
          </div>
        </div>

        {/* Historical Matches roster footer */}
        <div className="p-6 bg-black/40 border-t border-white/10">
          <span className="text-[10px] font-mono text-white/40 block uppercase font-bold mb-2">Partidos Destacados</span>
          <ul className="space-y-1.5">
            {stadium.matches.map((m, idx) => (
              <li key={idx} className="text-[11px] text-white/80 leading-snug flex items-start gap-1.5">
                <span className="text-[#EEB211] mt-0.5">🔹</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
