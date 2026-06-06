/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: string;
  opened: number;
  architect: string;
  description: string;
  matches: string[];
  style: 'golden' | 'tent' | 'modern' | 'classic';
  primaryColor: string;
  secondaryColor: string;
  fieldColor?: string;
}

export interface PlayerStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export interface Player {
  id: string;
  name: string;
  country: string;
  flagUrl: string;
  position: 'POR' | 'DEF' | 'MED' | 'DEL';
  number: number;
  club: string;
  rating: number;
  isRare: boolean;
  avatarColor: string;
  stats: PlayerStats;
}

export interface AlbumState {
  collectedIds: string[];
}
