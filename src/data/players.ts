/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../types';

export const PLAYERS: Player[] = [
  {
    id: 'messi',
    name: 'Lionel Messi',
    country: 'Argentina',
    flagUrl: '🇦🇷',
    position: 'DEL',
    number: 10,
    club: 'Inter Miami CF',
    rating: 93,
    isRare: true,
    avatarColor: '#1e3a8a', // Albiceleste representation
    stats: { pac: 85, sho: 92, pas: 94, dri: 95, def: 35, phy: 68 }
  },
  {
    id: 'mbappe',
    name: 'Kylian Mbappé',
    country: 'Francia',
    flagUrl: '🇫🇷',
    position: 'DEL',
    number: 10,
    club: 'Real Madrid CF',
    rating: 91,
    isRare: true,
    avatarColor: '#0f172a', // French Blue
    stats: { pac: 97, sho: 90, pas: 80, dri: 92, def: 36, phy: 78 }
  },
  {
    id: 'ronaldo',
    name: 'Cristiano Ronaldo',
    country: 'Portugal',
    flagUrl: '🇵🇹',
    position: 'DEL',
    number: 7,
    club: 'Al Nassr FC',
    rating: 90,
    isRare: true,
    avatarColor: '#166534', // Portuguese Green
    stats: { pac: 81, sho: 91, pas: 78, dri: 80, def: 34, phy: 75 }
  },
  {
    id: 'bellingham',
    name: 'Jude Bellingham',
    country: 'Inglaterra',
    flagUrl: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    position: 'MED',
    number: 10,
    club: 'Real Madrid CF',
    rating: 88,
    isRare: true,
    avatarColor: '#ffffff', // White
    stats: { pac: 79, sho: 84, pas: 83, dri: 86, def: 78, phy: 82 }
  },
  {
    id: 'de-bruyne',
    name: 'Kevin De Bruyne',
    country: 'Bélgica',
    flagUrl: '🇧🇪',
    position: 'MED',
    number: 7,
    club: 'Manchester City',
    rating: 91,
    isRare: true,
    avatarColor: '#dc2626', // Belgian Red
    stats: { pac: 72, sho: 86, pas: 94, dri: 87, def: 65, phy: 78 }
  },
  {
    id: 'vinicius',
    name: 'Vinícius Júnior',
    country: 'Brasil',
    flagUrl: '🇧🇷',
    position: 'DEL',
    number: 7,
    club: 'Real Madrid CF',
    rating: 89,
    isRare: true,
    avatarColor: '#eab308', // Brazilian Yellow
    stats: { pac: 95, sho: 82, pas: 79, dri: 90, def: 29, phy: 68 }
  },
  {
    id: 'modric',
    name: 'Luka Modrić',
    country: 'Croacia',
    flagUrl: '🇭🇷',
    position: 'MED',
    number: 10,
    club: 'Real Madrid CF',
    rating: 87,
    isRare: false,
    avatarColor: '#991b1b', // Red-white checkers
    stats: { pac: 74, sho: 76, pas: 89, dri: 87, def: 72, phy: 66 }
  },
  {
    id: 'pedri',
    name: 'Pedri González',
    country: 'España',
    flagUrl: '🇪🇸',
    position: 'MED',
    number: 20,
    club: 'FC Barcelona',
    rating: 86,
    isRare: false,
    avatarColor: '#b91c1c', // Spanish Red
    stats: { pac: 76, sho: 72, pas: 87, dri: 88, def: 68, phy: 71 }
  },
  {
    id: 'musiala',
    name: 'Jamal Musiala',
    country: 'Alemania',
    flagUrl: '🇩🇪',
    position: 'MED',
    number: 10,
    club: 'FC Bayern München',
    rating: 86,
    isRare: false,
    avatarColor: '#27272a', // German Black
    stats: { pac: 84, sho: 78, pas: 81, dri: 91, def: 62, phy: 64 }
  },
  {
    id: 'vandijk',
    name: 'Virgil van Dijk',
    country: 'Países Bajos',
    flagUrl: '🇳🇱',
    position: 'DEF',
    number: 4,
    club: 'Liverpool FC',
    rating: 89,
    isRare: true,
    avatarColor: '#ea580c', // Oranje
    stats: { pac: 78, sho: 60, pas: 71, dri: 72, def: 89, phy: 86 }
  },
  {
    id: 'hakimi',
    name: 'Achraf Hakimi',
    country: 'Marruecos',
    flagUrl: '🇲🇦',
    position: 'DEF',
    number: 2,
    club: 'Paris Saint-Germain',
    rating: 84,
    isRare: false,
    avatarColor: '#9f1239', // Moroccan Dark Red
    stats: { pac: 92, sho: 75, pas: 80, dri: 81, def: 76, phy: 78 }
  },
  {
    id: 'courtois',
    name: 'Thibaut Courtois',
    country: 'Bélgica',
    flagUrl: '🇧🇪',
    position: 'POR',
    number: 1,
    club: 'Real Madrid CF',
    rating: 90,
    isRare: true,
    avatarColor: '#0c4a6e', // Goal keeper sky blue
    stats: { pac: 85, sho: 89, pas: 76, dri: 88, def: 46, phy: 90 }
  },
  {
    id: 'dibu',
    name: 'Emiliano Martínez',
    country: 'Argentina',
    flagUrl: '🇦🇷',
    position: 'POR',
    number: 23,
    club: 'Aston Villa FC',
    rating: 85,
    isRare: false,
    avatarColor: '#047857', // Albiceleste keeper green
    stats: { pac: 80, sho: 82, pas: 79, dri: 84, def: 42, phy: 83 }
  },
  {
    id: 'kane',
    name: 'Harry Kane',
    country: 'Inglaterra',
    flagUrl: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    position: 'DEL',
    number: 9,
    club: 'FC Bayern München',
    rating: 89,
    isRare: false,
    avatarColor: '#1e293b', // Navy Blue
    stats: { pac: 69, sho: 93, pas: 84, dri: 82, def: 47, phy: 83 }
  },
  {
    id: 'griezmann',
    name: 'Antoine Griezmann',
    country: 'Francia',
    flagUrl: '🇫🇷',
    position: 'DEL',
    number: 7,
    club: 'Atlético de Madrid',
    rating: 87,
    isRare: false,
    avatarColor: '#be123c', // Red Atlético
    stats: { pac: 80, sho: 84, pas: 86, dri: 86, def: 52, phy: 72 }
  },
  {
    id: 'lewandowski',
    name: 'Robert Lewandowski',
    country: 'Polonia',
    flagUrl: '🇵🇱',
    position: 'DEL',
    number: 9,
    club: 'FC Barcelona',
    rating: 88,
    isRare: false,
    avatarColor: '#e11d48', // Polish Red
    stats: { pac: 75, sho: 89, pas: 71, dri: 83, def: 44, phy: 81 }
  },
  {
    id: 'rodri',
    name: 'Rodri Hernández',
    country: 'España',
    flagUrl: '🇪🇸',
    position: 'MED',
    number: 16,
    club: 'Manchester City',
    rating: 90,
    isRare: true,
    avatarColor: '#451a03', // Spain Gold/Brown accent
    stats: { pac: 58, sho: 73, pas: 86, dri: 80, def: 88, phy: 85 }
  },
  {
    id: 'salah',
    name: 'Mohamed Salah',
    country: 'Egipto',
    flagUrl: '🇪🇬',
    position: 'DEL',
    number: 11,
    club: 'Liverpool FC',
    rating: 89,
    isRare: false,
    avatarColor: '#b91c1c', // Egyptian Red
    stats: { pac: 89, sho: 87, pas: 82, dri: 88, def: 45, phy: 74 }
  }
];
