import { Region } from '../types';

export const REGIONS: Region[] = ['north', 'south', 'east', 'west', 'central', 'north_east'];

export const REGION_LABEL: Record<Region, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
  north_east: 'North-East',
};

/** Rough Singapore geography used to award partial credit for nearby regions. */
const ADJACENT: Record<Region, Region[]> = {
  north: ['north_east', 'central', 'west'],
  north_east: ['north', 'east', 'central'],
  east: ['north_east', 'central'],
  central: ['north', 'north_east', 'east', 'south', 'west'],
  south: ['central', 'west'],
  west: ['north', 'central', 'south'],
};

export function regionRelation(a: Region | null, b: Region | null): 'same' | 'adjacent' | 'far' {
  if (!a || !b) return 'far';
  if (a === b) return 'same';
  return ADJACENT[a]?.includes(b) ? 'adjacent' : 'far';
}

/**
 * Best-effort map of a Singapore postal code's leading sector to a region.
 * Approximate only — users still pick their region explicitly in the UI.
 */
export function regionFromPostal(postal: string): Region | null {
  const sector = Number(String(postal ?? '').slice(0, 2));
  if (Number.isNaN(sector)) return null;
  if (sector >= 1 && sector <= 8) return 'central';
  if (sector >= 9 && sector <= 16) return 'south';
  if (sector >= 17 && sector <= 19) return 'east';
  if (sector >= 20 && sector <= 26) return 'central';
  if (sector >= 27 && sector <= 37) return 'north';
  if (sector >= 38 && sector <= 45) return 'east';
  if (sector >= 46 && sector <= 52) return 'east';
  if (sector >= 53 && sector <= 57) return 'north_east';
  if (sector >= 58 && sector <= 71) return 'central';
  if (sector >= 72 && sector <= 80) return 'north';
  if (sector >= 81 && sector <= 82) return 'north_east';
  return null;
}
