/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Award, 
  Compass, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  CheckCircle,
  Shield,
  Activity,
  Globe
} from 'lucide-react';

interface Player3DAvatarProps {
  country: string;
  name: string;
  position: string;
  number: number;
}

export const Player3DAvatar: React.FC<Player3DAvatarProps> = ({ country, name, position, number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth || 110;
    const height = containerRef.current.clientHeight || 110;

    const scene = new THREE.Scene();
    scene.background = null; // transparent background

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // keep focus neat
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0.6, 0);

    // Soft lights
    const ambLight = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.85);
    dirLight.position.set(4, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Group for entire model
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    // 1. TURF CIRCLE BASE (Plataforma de césped)
    const turfGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 24);
    const turfMat = new THREE.MeshStandardMaterial({
      color: '#166534', // lush dark turf
      roughness: 0.85,
      metalness: 0.1,
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.position.y = -0.075;
    turf.receiveShadow = true;
    playerGroup.add(turf);

    // White field marking circle on turf
    const markGeo = new THREE.TorusGeometry(0.8, 0.02, 6, 24);
    const markMat = new THREE.MeshBasicMaterial({ color: 'rgba(255, 255, 255, 0.5)' });
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.rotation.x = Math.PI / 2;
    mark.position.y = 0.01;
    playerGroup.add(mark);

    // 2. PLAYER AVATAR STRUCTURAL ASSEMBLY
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0.1;
    playerGroup.add(bodyGroup);

    // Shirt & Shorts Colors based on country
    let shirtColor = '#cbd5e1'; // Default white
    let stripesColor: string | null = null;
    let shortsColor = '#1e3a8a'; // Default blue
    let socksColor = '#ffffff';

    const normalizedCountry = country.toLowerCase();
    if (normalizedCountry.includes('arg')) {
      shirtColor = '#38bdf8'; // Sky blue
      stripesColor = '#ffffff'; // White stripes
      shortsColor = '#0f172a'; // Navy/Black shorts
      socksColor = '#38bdf8';
    } else if (normalizedCountry.includes('bra')) {
      shirtColor = '#eab308'; // Yellow
      shortsColor = '#1d4ed8'; // Blue shorts
      socksColor = '#059669'; // Green socks
    } else if (normalizedCountry.includes('esp')) {
      shirtColor = '#be0e13'; // Red
      shortsColor = '#1e3a8a'; // Blue shorts
      socksColor = '#eab308'; // Yellow socks
    } else if (normalizedCountry.includes('fra')) {
      shirtColor = '#0f2c59'; // Deep Navy Blue
      shortsColor = '#ffffff'; // White shorts
      socksColor = '#be0e13'; // Red socks
    } else if (normalizedCountry.includes('méx') || normalizedCountry.includes('mex')) {
      shirtColor = '#047857'; // Green
      shortsColor = '#ffffff'; // White shorts
      socksColor = '#be0e13'; // Red socks
    } else if (normalizedCountry.includes('ee') || normalizedCountry.includes('usa')) {
      shirtColor = '#ffffff'; // White
      shortsColor = '#1e3a8a'; // Blue shorts
      socksColor = '#ffffff';
    } else if (normalizedCountry.includes('can')) {
      shirtColor = '#be0e13'; // Red
      shortsColor = '#ffffff';
      socksColor = '#be0e13';
    }

    // Torso/Shirt Geometry
    let torsoMat: THREE.Material;
    if (stripesColor) {
      // Procedural striped canvas texture
      const cv = document.createElement('canvas');
      cv.width = 64;
      cv.height = 64;
      const cntx = cv.getContext('2d');
      if (cntx) {
        cntx.fillStyle = shirtColor;
        cntx.fillRect(0, 0, 64, 64);
        cntx.fillStyle = stripesColor;
        cntx.fillRect(16, 0, 16, 64);
        cntx.fillRect(48, 0, 16, 64);
      }
      const stripesTex = new THREE.CanvasTexture(cv);
      torsoMat = new THREE.MeshStandardMaterial({
        map: stripesTex,
        roughness: 0.4,
      });
    } else {
      torsoMat = new THREE.MeshStandardMaterial({
        color: shirtColor,
        roughness: 0.4,
      });
    }

    const torsoGeo = new THREE.CylinderGeometry(0.3, 0.25, 0.75, 12);
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.65;
    torso.castShadow = true;
    bodyGroup.add(torso);

    // Shorts/Hips Box
    const hipsGeo = new THREE.BoxGeometry(0.52, 0.22, 0.36);
    const hipsMat = new THREE.MeshStandardMaterial({ color: shortsColor, roughness: 0.6 });
    const hips = new THREE.Mesh(hipsGeo, hipsMat);
    hips.position.y = 0.3;
    hips.castShadow = true;
    bodyGroup.add(hips);

    // Head (Sphere)
    const skinTones = ['#f5cbd2', '#ebd1b1', '#9e7041', '#854d0e', '#f3d9c2'];
    // pick a skin tone deterministically based on name hash
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const skinTone = skinTones[hash % skinTones.length];

    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.6 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.15;
    head.castShadow = true;
    bodyGroup.add(head);

    // Hair Piece (styled depending on hash)
    const hairStyle = hash % 3;
    const hairColors = ['#451a03', '#1c1917', '#ca8a04', '#78350f'];
    const hairColor = hairColors[hash % hairColors.length];

    const hairGeo = new THREE.SphereGeometry(0.25, 12, 12, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.18;
    hair.rotation.x = Math.PI / 24;
    bodyGroup.add(hair);

    // Add spike hair parts if matching specific style
    if (hairStyle === 1) {
      const spikesGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
      const spike = new THREE.Mesh(spikesGeo, hairMat);
      spike.position.set(0, 1.42, 0.05);
      spike.rotation.x = -Math.PI / 8;
      bodyGroup.add(spike);
    }

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.5 });
    const sleeveMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.4 });

    const createArm = (sideSign: number) => {
      const armGroup = new THREE.Group();
      
      // sleeve top
      const sleeveGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.22, 8);
      const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
      sleeve.position.y = 0.35;
      armGroup.add(sleeve);

      const bareArm = new THREE.Mesh(armGeo, armMat);
      bareArm.position.y = 0.08;
      armGroup.add(bareArm);

      armGroup.position.set(sideSign * 0.42, 0.85, 0);
      armGroup.rotation.z = sideSign * -0.15; // angled down nicely
      return armGroup;
    };
    const leftArmGroup = createArm(-1);
    const rightArmGroup = createArm(1);
    bodyGroup.add(leftArmGroup);
    bodyGroup.add(rightArmGroup);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8);
    const sockMat = new THREE.MeshStandardMaterial({ color: socksColor, roughness: 0.6 });

    const createLeg = (sideSign: number) => {
      const legGroup = new THREE.Group();

      // Thigh shorts extension
      const thighGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.18, 8);
      const thigh = new THREE.Mesh(thighGeo, hipsMat);
      thigh.position.y = 0.2;
      legGroup.add(thigh);

      // Bare knee slot
      const kneeGeo = new THREE.CylinderGeometry(0.085, 0.08, 0.15, 8);
      const knee = new THREE.Mesh(kneeGeo, armMat);
      knee.position.y = 0.045;
      legGroup.add(knee);

      // Sock
      const bareLeg = new THREE.Mesh(legGeo, sockMat);
      bareLeg.position.y = -0.22;
      legGroup.add(bareLeg);

      // Boot (cleat)
      const bootColors = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#000000'];
      const bootColor = bootColors[hash % bootColors.length];
      const bootGeo = new THREE.BoxGeometry(0.13, 0.1, 0.26);
      const bootMat = new THREE.MeshStandardMaterial({ color: bootColor, metalness: 0.5 });
      const boot = new THREE.Mesh(bootGeo, bootMat);
      boot.position.set(0, -0.45, 0.06);
      legGroup.add(boot);

      legGroup.position.set(sideSign * 0.16, 0.12, 0);
      return legGroup;
    };
    const leftLeg = createLeg(-1);
    const rightLeg = createLeg(1);
    bodyGroup.add(leftLeg);
    bodyGroup.add(rightLeg);

    // Floating miniature World Cup ball next to player
    const ballGeometry = new THREE.SphereGeometry(0.24, 12, 12);
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = 32;
    ballCanvas.height = 32;
    const bCtx = ballCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#ffffff';
      bCtx.fillRect(0, 0, 32, 32);
      bCtx.fillStyle = '#111827';
      bCtx.fillRect(6, 6, 8, 8);
      bCtx.fillRect(18, 18, 8, 8);
    }
    const ballTex = new THREE.CanvasTexture(ballCanvas);
    const ballMaterial = new THREE.MeshStandardMaterial({
      map: ballTex,
      roughness: 0.15,
    });
    const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
    ballMesh.position.set(0.68, 0.25, 0.5);
    ballMesh.castShadow = true;
    bodyGroup.add(ballMesh);

    // Ambient floating animation loop
    let animId: number;
    const startTime = Date.now();
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = (Date.now() - startTime) * 0.002;
      
      // Floating breath
      bodyGroup.position.y = 0.08 + Math.sin(elapsed) * 0.035;
      
      // Ball spinning and revolving around player
      ballMesh.rotation.y += 0.02;
      ballMesh.rotation.x += 0.005;
      ballMesh.position.set(
        Math.cos(elapsed * 0.8) * 0.8,
        0.2 + Math.sin(elapsed * 1.5) * 0.15,
        Math.sin(elapsed * 0.8) * 0.8
      );

      // ARM swing
      leftArmGroup.rotation.x = Math.sin(elapsed) * 0.15;
      rightArmGroup.rotation.x = -Math.sin(elapsed) * 0.15;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
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
  }, [country, name, position, number]);

  return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};

// Types inside the file style definition
interface Match {
  id: string;
  date: string; // ISO string format e.g., "2026-06-11T18:00:00Z"
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  stadium: string;
  city: string;
  group: string;
}

interface TeamLineup {
  id: string;
  country: string;
  flag: string;
  formation: string;
  color: string;
  winOdds: string;
  keyPlayer: string;
  players: {
    name: string;
    pos: string;
    x: number; // percentage width
    y: number; // percentage height
    number: number;
    description: string;
    rating: number;
  }[];
}

interface Trivia {
  id: number;
  title: string;
  fact: string;
  category: 'Catar 2022' | 'Historial' | 'Goles' | 'Curiosidad';
  badge: string;
}

// 2026 FIFA World Cup starts on June 11, 2026 (right matching our current system mock context!)
const KEY_MATCHES: Match[] = [
  {
    id: 'm1',
    date: '2026-06-11T18:00:00Z',
    homeTeam: 'México',
    homeFlag: '🇲🇽',
    awayTeam: 'Oponente A',
    awayFlag: '🛡️',
    stadium: 'Estadio Azteca',
    city: 'CDMX',
    group: 'Grupo A (Inaugural)',
  },
  {
    id: 'm2',
    date: '2026-06-11T21:00:00Z',
    homeTeam: 'EE. UU.',
    homeFlag: '🇺🇸',
    awayTeam: 'Oponente B',
    awayFlag: '🛡️',
    stadium: 'Estadio SoFi',
    city: 'Los Ángeles',
    group: 'Grupo D',
  },
  {
    id: 'm3',
    date: '2026-06-12T17:00:00Z',
    homeTeam: 'Canadá',
    homeFlag: '🇨🇦',
    awayTeam: 'Oponente C',
    awayFlag: '🛡️',
    stadium: 'Estadio BC Place',
    city: 'Vancouver',
    group: 'Grupo B',
  },
  {
    id: 'm4',
    date: '2026-06-13T15:00:00Z',
    homeTeam: 'Argentina',
    homeFlag: '🇦🇷',
    awayTeam: 'Oponente D',
    awayFlag: '🛡️',
    stadium: 'Estadio MetLife',
    city: 'NY/NJ',
    group: 'Grupo G',
  },
  {
    id: 'm5',
    date: '2026-06-14T19:00:00Z',
    homeTeam: 'España',
    homeFlag: '🇪🇸',
    awayTeam: 'Oponente E',
    awayFlag: '🛡️',
    stadium: 'Estadio SoFi',
    city: 'Los Ángeles',
    group: 'Grupo C',
  },
  {
    id: 'm6',
    date: '2026-06-15T20:00:00Z',
    homeTeam: 'Francia',
    homeFlag: '🇫🇷',
    awayTeam: 'Oponente F',
    awayFlag: '🛡️',
    stadium: 'Estadio MetLife',
    city: 'NY/NJ',
    group: 'Grupo H',
  },
  {
    id: 'm7',
    date: '2026-06-16T22:30:00Z',
    homeTeam: 'Brasil',
    homeFlag: '🇧🇷',
    awayTeam: 'Oponente G',
    awayFlag: '🛡️',
    stadium: 'Estadio BC Place',
    city: 'Vancouver',
    group: 'Grupo F',
  },
];

const PROBABILITY_CHART = [
  { country: 'Argentina', flag: '🇦🇷', prob: 15.4, fact: 'Campeón defensor, racha invicta en clasificación, el "Last Dance" de Messi con la albiceleste.' },
  { country: 'Brasil', flag: '🇧🇷', prob: 14.8, fact: 'Jóvenes estrellas desequilibrantes (Vinícius Jr., Rodrygo) y una defensa de nivel élite.' },
  { country: 'Francia', flag: '🇫🇷', prob: 13.9, fact: 'Mbappé en su apogeo físico y un medio dinámico con Camavinga y Tchouaméni.' },
  { country: 'España', flag: '🇪🇸', prob: 12.5, fact: 'Vigentes reyes de la Euro 2024. Posesión total de balón y las bandas explosivas de Yamal y Williams.' },
  { country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', prob: 11.2, fact: 'Poderío ofensivo liderado por Bellingham y Harry Kane con extrema profundidad de banquillo.' },
  { country: 'Portugal', flag: '🇵🇹', prob: 9.2, fact: 'Último torneo de Cristiano Ronaldo arropado por un mediocampo creador masivo (Bruno, Bernardo).' },
  { country: 'Alemania', flag: '🇩🇪', prob: 8.5, fact: 'Estructura vertical potente bajo la magia creativa de Musiala y Florian Wirtz.' },
  { country: 'Otros', flag: '🌍', prob: 14.5, fact: 'Uruguay, Italia, Países Bajos, Bélgica, y los anfitriones con factor campo.' },
];

const TEAM_LINEUPS: TeamLineup[] = [
  {
    id: 'arg',
    country: 'Argentina',
    flag: '🇦🇷',
    formation: '4-3-3',
    color: '#00afec',
    winOdds: '15.4% (Favorito #1)',
    keyPlayer: 'Lionel Messi (Inter Miami)',
    players: [
      { name: 'E. Martínez', pos: 'POR', x: 50, y: 88, number: 23, description: 'Especialista en penales y el cerrojo absoluto del arco albiceleste.', rating: 92 },
      { name: 'N. Molina', pos: 'LD', x: 82, y: 72, number: 26, description: 'Carrilero veloz con proyección constante en ataque por banda derecha.', rating: 84 },
      { name: 'C. Romero', pos: 'DFC', x: 62, y: 74, number: 13, description: 'Central agresivo con corte quirúrgico y dominio aéreo indiscutible.', rating: 90 },
      { name: 'N. Otamendi', pos: 'DFC', x: 38, y: 74, number: 19, description: 'Líder vocal veterano con garra indomable y colocación sólida.', rating: 85 },
      { name: 'N. Tagliafico', pos: 'LI', x: 18, y: 72, number: 3, description: 'Lateral táctico de excelente recuperación y despliegue por izquierda.', rating: 83 },
      { name: 'R. De Paul', pos: 'MC', x: 74, y: 52, number: 7, description: 'El motor todoterreno del mediocampo, infatigable en la presión.', rating: 88 },
      { name: 'Enzo Fernández', pos: 'MCD', x: 50, y: 58, number: 24, description: 'Distribuidor virtuoso de transiciones con visión espacial increíble.', rating: 89 },
      { name: 'A. Mac Allister', pos: 'MC', x: 26, y: 52, number: 20, description: 'Volante mixto inteligente que pisa el área y crea enlaces limpios.', rating: 89 },
      { name: 'Lionel Messi', pos: 'ED', x: 80, y: 25, number: 10, description: 'El capitán eterno, creador de juego y goleador con precisión celestial.', rating: 97 },
      { name: 'Julián Álvarez', pos: 'DC', x: 50, y: 18, number: 9, description: 'Presionador incansable, movilidad estelar de arrastre y definición letal.', rating: 88 },
      { name: 'N. González', pos: 'EI', x: 20, y: 25, number: 15, description: 'Extremo potente que da amplitud, desborde físico y juego defensivo.', rating: 82 }
    ]
  },
  {
    id: 'bra',
    country: 'Brasil',
    flag: '🇧🇷',
    formation: '4-2-3-1',
    color: '#eeb211',
    winOdds: '14.8% (Favorito #2)',
    keyPlayer: 'Vinicius Jr. (Real Madrid)',
    players: [
      { name: 'Alisson Becker', pos: 'POR', x: 50, y: 88, number: 1, description: 'Posicionamiento perfecto, mano a mano impecable y juego de pies de clase mundial.', rating: 90 },
      { name: 'Danilo', pos: 'LD', x: 82, y: 72, number: 2, description: 'Defensa disciplinado que equilibra las subidas con solidez táctica.', rating: 81 },
      { name: 'Marquinhos', pos: 'DFC', x: 62, y: 74, number: 4, description: 'El gran capitán de la zaga, veloz para las coberturas de espaldas.', rating: 88 },
      { name: 'G. Magalhães', pos: 'DFC', x: 38, y: 74, number: 14, description: 'Imponente muro de la zaga, cabeceador letal a balón parado.', rating: 87 },
      { name: 'Guilherme Arana', pos: 'LI', x: 18, y: 72, number: 16, description: 'Lateral izquierdo de proyección ofensiva y centros filosos en velocidad.', rating: 80 },
      { name: 'B. Guimarães', pos: 'MCD', x: 62, y: 58, number: 5, description: 'Eje del equipo, combina dureza física con gran criterio de pase largo.', rating: 89 },
      { name: 'João Gomes', pos: 'MCD', x: 38, y: 58, number: 15, description: 'Contención combativo excelente en la asfixia del rival.', rating: 82 },
      { name: 'Raphinha', pos: 'ED', x: 80, y: 35, number: 11, description: 'Extremo dinámico que trabaja duro la banda y posee un zurdazo fenomenal.', rating: 86 },
      { name: 'Lucas Paquetá', pos: 'MCO', x: 50, y: 40, number: 8, description: 'Ingenioso socio que descompone líneas con pases sutiles sin mirar.', rating: 84 },
      { name: 'Vinicius Jr.', pos: 'EI', x: 20, y: 35, number: 7, description: 'Velocidad de rayo, regates hipnóticos que abren defensas herméticas.', rating: 94 },
      { name: 'Rodrygo Silva', pos: 'DC', x: 50, y: 18, number: 10, description: 'Delantero multifuncional de frialdad quirúrgica en el área chica.', rating: 89 }
    ]
  },
  {
    id: 'esp',
    country: 'España',
    flag: '🇪🇸',
    formation: '4-3-3',
    color: '#be0e13',
    winOdds: '12.5% (Favorito #4)',
    keyPlayer: 'Rodri Hernández (Man City)',
    players: [
      { name: 'Unai Simón', pos: 'POR', x: 50, y: 88, number: 23, description: 'Gran reflejos rápidos bajo los tres palos y salida ágil con juego raso.', rating: 87 },
      { name: 'Dani Carvajal', pos: 'LD', x: 82, y: 72, number: 2, description: 'Instinto ganador de múltiples finales, duro, con anticipación de acero.', rating: 89 },
      { name: 'R. Le Normand', pos: 'DFC', x: 62, y: 74, number: 3, description: 'Defensor rudo y de gran colocación perfecto para neutralizar puntas.', rating: 84 },
      { name: 'Aymeric Laporte', pos: 'DFC', x: 38, y: 74, number: 14, description: 'Salida limpia con pie zurdo exquisito y gran sentido posicional.', rating: 86 },
      { name: 'M. Cucurella', pos: 'LI', x: 18, y: 72, number: 24, description: 'Energía incansable por carril izquierdo de marca incesante y carisma.', rating: 85 },
      { name: 'Rodri Hernández', pos: 'MCD', x: 50, y: 58, number: 16, description: 'El mejor mediocentro del planeta. Metrónomo absoluto, balance táctico.', rating: 96 },
      { name: 'Pedri González', pos: 'MC', x: 65, y: 50, number: 20, description: 'El cerebro del tiquitaca moderno, administra espacios como un veterano.', rating: 90 },
      { name: 'Fabián Ruiz', pos: 'MC', x: 35, y: 50, number: 8, description: 'Llegador de área con gran potencia de disparo lejano y elegancia.', rating: 87 },
      { name: 'Lamine Yamal', pos: 'ED', x: 80, y: 25, number: 19, description: 'La joven maravilla mundial de regate desequilibrante, velocidad y gol.', rating: 93 },
      { name: 'Álvaro Morata', pos: 'DC', x: 50, y: 18, number: 7, description: 'Ariete de juego asociativo excelente para abrir espacios arrastrando defensas.', rating: 83 },
      { name: 'Nico Williams', pos: 'EI', x: 20, y: 25, number: 17, description: 'Poderosa zancada imparable por banda izquierda y centros en carrera.', rating: 88 }
    ]
  },
  {
    id: 'fra',
    country: 'Francia',
    flag: '🇫🇷',
    formation: '4-3-3',
    color: '#0f2c59',
    winOdds: '13.9% (Favorito #3)',
    keyPlayer: 'Kylian Mbappé (Real Madrid)',
    players: [
      { name: 'Mike Maignan', pos: 'POR', x: 50, y: 88, number: 16, description: 'Reflejos increíbles y liderazgo de voz que comanda la defensa con puño férreo.', rating: 89 },
      { name: 'Jules Koundé', pos: 'LD', x: 82, y: 72, number: 5, description: 'Impala en banda, polivalente central reconvertido a lateral con marca férrea.', rating: 86 },
      { name: 'Upamecano', pos: 'DFC', x: 62, y: 74, number: 4, description: 'Físico superdotado en duelos cara a cara con velocidad de cobertura.', rating: 85 },
      { name: 'William Saliba', pos: 'DFC', x: 38, y: 74, number: 17, description: 'Zaguero de aplomo total, defiende sin cometer faltas con clase majestuosa.', rating: 91 },
      { name: 'Theo Hernández', pos: 'LI', x: 18, y: 72, number: 22, description: 'Una moto desbocada en banda izquierda, potencia ofensiva descomunal.', rating: 87 },
      { name: 'N\'Golo Kanté', pos: 'MC', x: 50, y: 58, number: 13, description: 'El imán infinito del balón, pulmón inagotable que aparece en todos lados.', rating: 88 },
      { name: 'A. Tchouaméni', pos: 'MC', x: 65, y: 50, number: 8, description: 'Ancla táctica que intercepta balones y asiste en largo con gran visión.', rating: 86 },
      { name: 'Antoine Griezmann', pos: 'MC', x: 35, y: 50, number: 7, description: 'El cerebro estratégico del equipo, sacrificio defensivo y asistidor top.', rating: 89 },
      { name: 'O. Dembélé', pos: 'ED', x: 80, y: 25, number: 11, description: 'Ambidextro impredecible con giros rápidos y regate vertiginoso por derecha.', rating: 86 },
      { name: 'Kylian Mbappé', pos: 'DC', x: 50, y: 18, number: 10, description: 'Goleador letal y velocista inalcanzable, define partidos en centésimas.', rating: 96 },
      { name: 'Bradley Barcola', pos: 'EI', x: 20, y: 25, number: 25, description: 'Extremo vertiginoso, agudo regateador de la nueva generación francesa.', rating: 83 }
    ]
  }
];

const WORLD_CUP_TRIVIA: Trivia[] = [
  {
    id: 1,
    title: 'La Final Épica de Catar 2022',
    fact: 'Fue catalogada como la mejor final de la historia. Un infarto de 3-3 entre Argentina y Francia que culminó en tanda de penales consagrando a Messi.',
    category: 'Catar 2022',
    badge: '🏆 Histórico'
  },
  {
    id: 2,
    title: 'Pentacampeón del Mundo',
    fact: 'Brasil sigue siendo el máximo ganador histórico de los Mundiales con 5 títulos (1958, 1962, 1970, 1994, 2002), ninguno ganado en su propio país.',
    category: 'Historial',
    badge: '🇧🇷 5 Estrellas'
  },
  {
    id: 3,
    title: 'Máximo Goleador de los Mundiales',
    fact: 'El alemán Miroslav Klose tiene el récord con 16 goles totales (repartidos en 4 mundiales), superando al Fenómeno Ronaldo que se plantó en 15.',
    category: 'Goles',
    badge: '⚽ 16 Goles'
  },
  {
    id: 4,
    title: 'El Gol más Rápido anotado',
    fact: 'Hakan Şükür de Turquía tardó solo 10.8 segundos en anotarle a Corea del Sur en el partido del tercer lugar del Mundial de Corea y Japón 2002.',
    category: 'Goles',
    badge: '⚡ 10.8 Seg'
  },
  {
    id: 5,
    title: 'Más Partidos de la Historia',
    fact: 'Lionel Messi rompió el récord total tras disputar 26 partidos en Mundiales de la FIFA, superando al legendario defensor alemán Lothar Matthäus (25).',
    category: 'Historial',
    badge: '🇦🇷 26 Juegos'
  },
  {
    id: 6,
    title: 'Anfitriones Conjuntos 2026',
    fact: 'La edición de 2026 será la primera vez en la historia que tres naciones co-organicen la Copa (Canadá, México y EE. UU.) y la primera expandida a 48 equipos.',
    category: 'Curiosidad',
    badge: '🌎 3 Países'
  }
];

export const StatsRenderer: React.FC = () => {
  const [selectedTeamTab, setSelectedTeamTab] = useState<string>('arg');
  const [activePlayerIndex, setActivePlayerIndex] = useState<number | null>(null);
  const [useLocalTime, setUseLocalTime] = useState<boolean>(true);
  const [triviaPage, setTriviaPage] = useState<number>(0);
  const [oddsInspect, setOddsInspect] = useState<string | null>(null);

  const activeTeam = TEAM_LINEUPS.find(t => t.id === selectedTeamTab) || TEAM_LINEUPS[0];
  const selectedPlayer = activePlayerIndex !== null ? activeTeam.players[activePlayerIndex] : null;

  // Auto-cycles trivia cards every 10 seconds unless manually scrolled
  useEffect(() => {
    const timer = setInterval(() => {
      setTriviaPage((prev) => (prev + 1) % WORLD_CUP_TRIVIA.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const formatMatchTime = (isoString: string) => {
    const date = new Date(isoString);
    if (useLocalTime) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    // Formatter for UTC time
    const matches = isoString.match(/T(\d{2}):(\d{2})/);
    const day = date.getUTCDate();
    const months = ['Enero', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthName = months[date.getUTCMonth()];
    return `${matches ? matches[1] + ':' + matches[2] : ''} UTC (Jun ${day})`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans auto-rows-[minmax(180px,auto)]">
      
      {/* 1. SECTOR PROBABILIDAD (COPA FAVORITAS) - (Grid: 5 de anchos) */}
      <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-[#EEB211]/5 rounded-full blur-2xl group-hover:bg-[#EEB211]/10 transition-all duration-500"></div>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 px-2.5 rounded-lg text-[9px] font-mono tracking-widest text-[#EEB211] bg-[#EEB211]/10 border border-[#EEB211]/20 font-bold uppercase">Predicciones Live</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#EEB211] animate-pulse" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white uppercase font-sans">PROBABILIDAD DE CAMPEÓN 2026</h3>
          <p className="text-xs text-white/50 mt-1 mb-5 leading-normal">
            Análisis algorítmico global basado en rendimiento reciente de Eliminatorias, títulos históricos, localía de estadios y ausencias por lesión.
          </p>

          <div className="space-y-3.5">
            {PROBABILITY_CHART.map((c) => (
              <div 
                key={c.country} 
                className="space-y-1 cursor-pointer"
                onClick={() => setOddsInspect(oddsInspect === c.country ? null : c.country)}
              >
                <div className="flex justify-between items-center text-xs font-bold text-white/95">
                  <div className="flex items-center gap-1.5 hover:text-[#EEB211] transition-colors">
                    <span className="text-sm">{c.flag}</span>
                    <span>{c.country}</span>
                    {oddsInspect === c.country && (
                      <span className="text-[9px] font-mono font-normal text-[#EEB211] ml-1 uppercase">(Mostrar info)</span>
                    )}
                  </div>
                  <span className="font-mono text-[#EEB211] text-sm font-black">{c.prob}%</span>
                </div>
                <div className="w-full h-2 bg-black/45 rounded-full overflow-hidden relative border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.prob * 5}%` }} // Adjusted multiplier for aesthetic spacing
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#EEB211] to-[#ca8a04] rounded-full shadow-[0_0_8px_rgba(238,178,17,0.3)]" 
                  />
                </div>
                
                {/* Expander de análisis */}
                <AnimatePresence>
                  {oddsInspect === c.country && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-black/30 border border-white/10 rounded-xl p-3 text-[11px] text-white/80 leading-normal font-sans"
                    >
                      <h5 className="font-black text-[#EEB211] text-[10px] uppercase mb-1">Análisis de la Selección:</h5>
                      {c.fact}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-white/40">
          <span>Actualizado: Junio 2026</span>
          <span className="text-[#EEB211] font-bold">Algoritmo FIFA v4.12</span>
        </div>
      </div>

      {/* 2. PIZARRA TÁCTICA DE ALINEACIONES - (Grid: 7 de anchos, toma gran parte) */}
      <div className="lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
        <div>
          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 px-2.5 rounded-lg text-[9px] font-mono tracking-widest text-[#EEB211] bg-[#EEB211]/10 border border-[#EEB211]/20 font-bold uppercase">Pizarra Táctica</span>
                <Users className="w-3.5 h-3.5 text-[#EEB211] animate-spin-slow" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white uppercase font-sans">SISTEMA & POSIBLES ALINEACIONES</h3>
            </div>

            {/* Selection Selector pills */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 self-stretch md:self-auto gap-0.5 overflow-x-auto">
              {TEAM_LINEUPS.map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    setSelectedTeamTab(team.id);
                    setActivePlayerIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedTeamTab === team.id
                      ? 'bg-[#EEB211] text-[#52071C] font-black shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {team.flag} {team.country}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/50 mb-4 leading-normal">
            Formación prevista: <span className="text-white font-bold">{activeTeam.formation}</span>. Clave de ataque guiada por <span className="text-[#EEB211] font-bold">{activeTeam.keyPlayer}</span>. Pulsa sobre cualquier jugador del campo de juego a continuación para abrir la ficha técnica y evaluar su rol.
          </p>

          {/* RENDERING THE FUTBOL GROUND PITCH GRID */}
          <div className="relative w-full h-[320px] bg-gradient-to-b from-[#1b2b1a] to-[#121c11] rounded-2xl overflow-hidden border border-white/10 shadow-inner flex flex-col justify-end p-2 select-none group">
            {/* Field Lines design mock */}
            <div className="absolute inset-x-2 top-0 bottom-2 border border-white/10 rounded-t-xl overflow-hidden pointer-events-none">
              <div className="absolute inset-x-0 top-1/2 h-px bg-white/10"></div>
              {/* Center Circle */}
              <div className="absolute left-1/2 top-1/2 -ml-16 -mt-16 w-32 h-32 rounded-full border border-white/10"></div>
              {/* Penalty area */}
              <div className="absolute left-1/4 right-1/4 bottom-0 h-20 border-t border-x border-white/10 rounded-t-lg"></div>
              {/* Goal keeper tiny area */}
              <div className="absolute left-1/3 right-1/3 bottom-0 h-6 border-t border-x border-white/10"></div>
              {/* Grid texture for football grass */}
              <div className="absolute inset-0 bg-repeat bg-linear-to-b from-transparent to-green-950/20 opacity-40"></div>
            </div>

            {/* Title mark of country */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/5 font-black text-6xl tracking-widest pointer-events-none text-center select-none">
              {activeTeam.country.toUpperCase()}
            </div>

            {/* Interactive Player Circles mapped accurately via tactical coordinates */}
            {activeTeam.players.map((plr, index) => {
              const isSelected = activePlayerIndex === index;
              return (
                <button
                  id={`tactical-player-${index}`}
                  key={plr.name}
                  onClick={() => setActivePlayerIndex(activePlayerIndex === index ? null : index)}
                  className="absolute w-10 h-10 -ml-5 -mt-5 rounded-full outline-hidden flex items-center justify-center transition-all duration-300 select-none z-10"
                  style={{ 
                    left: `${plr.x}%`, 
                    top: `${plr.y}%`,
                  }}
                >
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all ${
                    isSelected 
                      ? 'bg-[#EEB211] text-[#52071C] border-[#EEB211] scale-120 font-black shadow-[0_0_12px_#EEB211]' 
                      : 'bg-black/80 hover:bg-white/10 text-white border-white/20 hover:scale-110 shadow-lg'
                  }`}>
                    <span className="text-[11px] font-mono font-bold leading-none">{plr.number}</span>
                    
                    {/* Position Label Tag */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded bg-black/90 border border-white/10 text-[7px] font-bold text-white/90 scale-90 whitespace-nowrap font-mono tracking-tighter shadow uppercase">
                      {plr.pos}
                    </div>
                  </div>

                  {/* Player Last Name Hover tooltip */}
                  <div className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black border border-white/10 text-[9px] text-white/95 whitespace-nowrap transition-all duration-200 shadow ${
                    isSelected ? 'opacity-100' : 'opacity-0 scale-75 pointer-events-none group-hover:opacity-80'
                  }`}>
                    {plr.name}
                  </div>
                </button>
              );
            })}

            {/* Small stadium active sensor */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] border border-white/10 text-white/60 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
              SISTEMA PREFERIDO: {activeTeam.formation}
            </div>
          </div>

          {/* EXPANDED PLAYER DETAILED DESCRIPTION CARD (Dynamic slot) */}
          <AnimatePresence mode="wait">
            {selectedPlayer ? (
              <motion.div
                key={selectedPlayer.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 bg-gradient-to-r from-black/40 to-black/20 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn"
              >
                <div className="space-y-1.5 flex-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center font-mono text-xs font-bold text-[#EEB211]">#{selectedPlayer.number}</span>
                    <h4 className="text-base font-black text-white uppercase tracking-tight">{selectedPlayer.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-[#EEB211] bg-[#EEB211]/15 border border-[#EEB211]/25 font-mono">{selectedPlayer.pos}</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed text-justify pr-2">{selectedPlayer.description}</p>
                </div>

                {/* 3D AVATAR VIEWPORT IN TECHNICAL SHEET */}
                <div className="w-full sm:w-28 sm:h-28 h-28 bg-black/45 border border-white/10 rounded-xl overflow-hidden relative shadow-inner shrink-0 self-center">
                  <Player3DAvatar
                    country={activeTeam.country}
                    name={selectedPlayer.name}
                    position={selectedPlayer.pos}
                    number={selectedPlayer.number}
                  />
                  <div className="absolute right-1 bottom-1 text-[7px] font-mono font-bold text-[#EEB211] uppercase bg-black/60 px-1 py-0.5 rounded pointer-events-none tracking-tighter border border-white/10">
                    Figurín 3D
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex items-center gap-3.5 bg-black/40 p-3 rounded-xl border border-white/10 justify-between">
                  <div className="text-right select-none">
                    <span className="text-[9px] font-mono text-white/40 block leading-none uppercase">Rating Gral</span>
                    <span className="text-xl font-black text-[#EEB211] font-mono leading-none">{selectedPlayer.rating}</span>
                  </div>
                  <button 
                    onClick={() => setActivePlayerIndex(null)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase rounded-lg border border-white/10 transition-all font-mono"
                  >
                    Ocultar
                  </button>
                </div>
              </motion.div>
            ) : (
              <div id="no-player-selected" className="mt-4 bg-black/10 border border-white/5 rounded-2xl p-4 text-center text-xs text-white/40 py-8 select-none font-sans flex flex-col items-center justify-center gap-1.5">
                <Compass className="w-5 h-5 text-white/20 animate-spin-slow" />
                <span>¿Quieres evaluar a los campeones? Pincha un número en el campo interactivo para ver su ficha.</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. CALENDARIO DE PARTIDOS COPA 2026 - (Grid: 8 de ancho para que se lea perfecto horizontal) */}
      <div className="lg:col-span-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 px-2.5 rounded-lg text-[9px] font-mono tracking-widest text-[#EEB211] bg-[#EEB211]/10 border border-[#EEB211]/20 font-bold uppercase">Calendario Oficial</span>
                <Calendar className="w-3.5 h-3.5 text-[#EEB211]" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white uppercase font-sans">PARTIDOS DESTACADOS MUNDIAL 2026</h3>
              <p className="text-xs text-white/50 mt-0.5">La Copa Mundial empieza la próxima semana (11 de Junio, 2026). Próximos cruces previstos:</p>
            </div>

            {/* Timezone Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 select-none">
              <button
                onClick={() => setUseLocalTime(true)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  useLocalTime
                    ? 'bg-[#EEB211] text-[#52071C] font-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                Hora Local
              </button>
              <button
                onClick={() => setUseLocalTime(false)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                  !useLocalTime
                    ? 'bg-[#EEB211] text-[#52071C] font-black'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3" />
                Hora UTC
              </button>
            </div>
          </div>

          {/* Roster match table */}
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {KEY_MATCHES.map((match) => (
              <div 
                id={`match-row-${match.id}`}
                key={match.id} 
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 rounded-2xl bg-black/25 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all gap-4 text-xs font-sans group"
              >
                {/* Left Side: Game details / Group Tag */}
                <div className="flex flex-col items-start gap-1 justify-center sm:min-w-[120px]">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[#EEB211] uppercase tracking-wider font-mono">
                    {match.group}
                  </span>
                  
                  <div className="flex items-center gap-1 text-[10px] text-white/50 font-mono mt-0.5">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatMatchTime(match.date)}</span>
                  </div>
                </div>

                {/* Center Side: Duel Teams represent */}
                <div className="flex-1 flex items-center justify-center gap-3 font-semibold text-sm select-none text-white font-sans">
                  {/* Home Team */}
                  <div className="flex-1 flex items-center justify-end gap-2 text-right">
                    <span className="truncate max-w-[100px] sm:max-w-none">{match.homeTeam}</span>
                    <span className="text-xl bg-white/5 p-1 rounded border border-white/10 shrink-0 w-8 h-8 flex items-center justify-center">{match.homeFlag}</span>
                  </div>

                  {/* VS Middle Badge */}
                  <span className="px-2.5 py-1 rounded-lg bg-[#52071C] border border-white/10 text-[9px] font-mono text-[#EEB211] font-black z-10 select-none shadow">
                    VS
                  </span>

                  {/* Away Team */}
                  <div className="flex-1 flex items-center justify-start gap-2 text-left">
                    <span className="text-xl bg-white/5 p-1 rounded border border-white/10 shrink-0 w-8 h-8 flex items-center justify-center">{match.awayFlag}</span>
                    <span className="truncate max-w-[100px] sm:max-w-none">{match.awayTeam}</span>
                  </div>
                </div>

                {/* Right Side: Venue info */}
                <div className="flex items-center gap-1.5 sm:min-w-[150px] justify-start sm:justify-end text-white/60 font-mono text-[10px]">
                  <MapPin className="w-3.5 h-3.5 text-[#EEB211] shrink-0" />
                  <div className="truncate text-left sm:text-right">
                    <span className="block font-bold text-white/80">{match.stadium}</span>
                    <span className="block text-[8px] text-white/40 uppercase">{match.city}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[9px] font-mono text-white/30 tracking-widest mt-4 uppercase border-t border-white/10 pt-3">
          ⚽ FIFA World Cup 2026 • 16 sedes coordinadas por husos horarios norteamericanos
        </div>
      </div>

      {/* 4. TRIVIA & CURIOSIDADES - (Grid: 4 de ancho, para que encaje como bento cuadrado) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-[#8A1538] to-[#EEB211] rounded-3xl p-1 shadow-2xl relative overflow-hidden group">
        <div className="w-full h-full bg-[#52071C] rounded-[22px] flex flex-col justify-between p-5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start z-10 select-none mb-3">
            <span className="p-1 px-2.5 rounded-lg text-[9px] font-mono tracking-widest text-[#EEB211] bg-[#EEB211]/20 border border-[#EEB211]/30 font-bold uppercase">Datos Mundiales</span>
            <Award className="w-6 h-6 text-[#EEB211]/45" />
          </div>

          {/* Slider dynamic space */}
          <div className="flex-1 flex flex-col justify-center min-h-[160px] relative">
            <AnimatePresence mode="wait">
              {WORLD_CUP_TRIVIA.map((item, idx) => {
                if (idx !== triviaPage) return null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-2.5"
                  >
                    <span className="inline-block px-2 py-0.5 rounded text-[8px] font-mono text-[#52071C] bg-[#EEB211] font-bold uppercase shadow">
                      {item.badge}
                    </span>
                    <h4 className="text-lg font-black leading-tight text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-white/85 leading-relaxed text-justify">{item.fact}</p>
                    <span className="block text-[8px] font-mono text-white/40 tracking-wider uppercase font-bold">Categoría: {item.category}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-4 border-t border-white/15 pt-3 z-10">
            {/* Dots navigation marker */}
            <div className="flex gap-1">
              {WORLD_CUP_TRIVIA.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setTriviaPage(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === triviaPage ? 'bg-[#EEB211] w-3' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <button 
              id="btn-next-trivia"
              onClick={() => setTriviaPage((triviaPage + 1) % WORLD_CUP_TRIVIA.length)}
              className="text-[9px] font-mono font-bold text-[#EEB211] hover:text-white uppercase tracking-widest flex items-center gap-1 border border-[#EEB211]/20 rounded px-2 py-0.5 bg-black/20"
            >
              Próximo
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
