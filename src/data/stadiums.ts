/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stadium } from '../types';

export const STADIUMS: Stadium[] = [
  {
    id: 'azteca',
    name: 'Estadio Azteca',
    city: 'Ciudad de México (México)',
    capacity: '83,264',
    opened: 1966,
    architect: 'Pedro Ramírez Vázquez',
    description: 'El legendario coloso hace historia al convertirse en el primer estadio en albergar tres Copas del Mundo (1970, 1986, 2026). Famoso por su inigualable acústica e importancia histórica, es la catedral que vio coronarse a Pelé y Maradona, y albergará el Partido Inaugural del torneo.',
    matches: [
      'México vs Rival (Partido Inaugural)',
      'Fase de Grupos (Grupo A)',
      'Ronda de Dieciseisavos de Final',
      'Octavos de Final de la Copa del Mundo'
    ],
    style: 'classic',
    primaryColor: '#15803d', // Mexican emerald green
    secondaryColor: '#cbd5e1', // Silver trims
    fieldColor: '#1d5a2d'
  },
  {
    id: 'sofi',
    name: 'Estadio SoFi',
    city: 'Inglewood, Los Ángeles (EE. UU.)',
    capacity: '70,240',
    opened: 2020,
    architect: 'HKS, Inc.',
    description: 'Una maravilla arquitectónica de miles de millones de dólares que cuenta con una gigantesca cubierta translúcida esculpida de etileno-tetrafluoroetileno (ETFE) y una colosal pantalla LED infinitamente curva de doble cara. Será una de las sedes estelares de la Selección de EE. UU.',
    matches: [
      'Estados Unidos vs Rival (Debut Norteamericano)',
      'Fase de Grupos (Grupo D)',
      'Ronda de Dieciseisavos de Final',
      'Cuartos de Final (Partidazo Clave)'
    ],
    style: 'golden',
    primaryColor: '#d97706', // Golden highlights
    secondaryColor: '#1e3a8a', // Deep ocean blue
    fieldColor: '#1e5429'
  },
  {
    id: 'metlife',
    name: 'Estadio MetLife',
    city: 'East Rutherford, Nueva York / Nueva Jersey (EE. UU.)',
    capacity: '82,500',
    opened: 2010,
    architect: 'HOK, EwingCole',
    description: 'El colosal templo deportivo elegido para albergar la Gran Final de la Copa Mundial de la FIFA 2026. Con un diseño neutral de lamas de aluminio suspendidas y luces LED de color ajustable, representa la escala metropolitana y la magnificencia de Nueva York.',
    matches: [
      'Fase de Grupos (Grupo E)',
      'Ronda de Dieciseisavos de Final',
      'Ronda de Octavos de Final',
      'La Gran Final de la Copa Mundial 2026'
    ],
    style: 'modern',
    primaryColor: '#2563eb', // Cool futuristic blue
    secondaryColor: '#475569', // Structural steel gray
    fieldColor: '#276231'
  },
  {
    id: 'bc-place',
    name: 'Estadio BC Place',
    city: 'Vancouver (Canadá)',
    capacity: '54,500',
    opened: 1983,
    architect: 'Studio Phillips Barratt (Renovado en 2011)',
    description: 'La joya de la costa oeste canadiense posee la estructura soportada por cables de tracción más grande del planeta. Cuenta con un innovador techo retráctil automatizado que corona el recinto de Vancouver como una guirnalda de velas inflables, brindando luz natural y protección climática.',
    matches: [
      'Canadá vs Rival (Debut Canadiense)',
      'Fase de Grupos (Grupo B)',
      'Ronda de Dieciseisavos de Final',
      'Octavos de Final de la Copa del Mundo'
    ],
    style: 'tent',
    primaryColor: '#be123c', // Canadian flag crimson red
    secondaryColor: '#ffffff', // Translucent white canvas
    fieldColor: '#2b6537'
  }
];
