import { Day, Region } from '../api/types';

export const REGION_LABEL: Record<Region, string> = {
  north: 'North',
  south: 'South',
  east: 'East',
  west: 'West',
  central: 'Central',
  north_east: 'North-East',
};

export const DAY_LABEL: Record<Day, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export const EDUCATION_LABEL: Record<string, string> = {
  o_level: 'O-Level',
  a_level: 'A-Level',
  poly: 'Poly Diploma',
  undergraduate: 'Undergraduate',
  graduate: 'Graduate',
  postgraduate: 'Postgraduate',
};

export const DOC_TYPE_LABEL: Record<string, string> = {
  o_level_cert: 'O-Level Certificate',
  a_level_cert: 'A-Level Certificate',
  poly_cert: 'Poly Diploma',
  degree_cert: 'Degree Certificate',
  transcript: 'Transcript',
  resume: 'Resume',
  other: 'Other',
};

export const regionLabel = (r?: Region | null) => (r ? REGION_LABEL[r] : '—');
export const dayLabel = (d?: Day | null) => (d ? DAY_LABEL[d] : '');
export const eduLabel = (e?: string | null) => (e ? EDUCATION_LABEL[e] ?? e : '');
export const formatTime = (t?: string | null) => (t ? t.slice(0, 5) : '');
export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-SG');

export function timeAgo(iso: string): string {
  const then = new Date(iso.replace(' ', 'T')).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (Number.isNaN(mins)) return '';
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
