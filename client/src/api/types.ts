export type Role = 'parent' | 'tutor' | 'admin';
export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'north_east';
export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface User {
  id: number;
  role: Role;
  name: string;
  email: string;
  phone?: string | null;
  postal_code?: string | null;
  region?: Region | null;
}

export interface Subject {
  id?: number;
  subject: string;
  level: string;
  grade?: string | null;
  is_verified: boolean | number;
}

export interface Slot {
  id?: number;
  day_of_week: Day;
  start_time: string;
  end_time: string;
}

export interface ScoreLine {
  key: string;
  label: string;
  points: number;
  max: number;
  note: string;
}

export interface TutorCard {
  tutor_id: number;
  display_name: string;
  initials: string;
  region: Region | null;
  headline: string | null;
  bio: string | null;
  highest_education: string;
  institution: string | null;
  years_experience: number;
  rate_min: number;
  rate_max: number;
  teaching_style: string | null;
  is_verified: boolean;
  subjects: Subject[];
  availability: Slot[];
  rating: { average: number; count: number };
}

export interface Match {
  match_id: number;
  tutor_id: number;
  score: number;
  score_breakdown: ScoreLine[];
  parent_decision: 'pending' | 'like' | 'pass';
  tutor_decision: 'pending' | 'like' | 'pass';
  status: string;
  chat_enabled: boolean;
  has_job: boolean;
  tutor: TutorCard | null;
}

export interface TuitionRequest {
  id: number;
  student_level: string;
  subject: string;
  second_subject?: string | null;
  postal_code: string;
  region: Region;
  budget_per_hour: number;
  preferred_day?: Day | null;
  preferred_time?: string | null;
  lessons_per_week: number;
  hours_per_lesson: number;
  notes?: string | null;
  status: string;
  created_at: string;
  match_count?: number;
  liked_count?: number;
}

export interface Job {
  id: number;
  match_id: number;
  subject: string;
  hourly_rate: number;
  lessons_per_week: number;
  hours_per_lesson: number;
  first_month_value: number;
  platform_fee: number;
  tutor_payout: number;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  status: 'active' | 'completed' | 'cancelled';
  confirmed_at: string;
  reviewed: boolean;
  your_side: 'parent' | 'tutor';
  counterparty: {
    role: string;
    name: string;
    email: string;
    phone: string;
    postal_code: string;
    region: Region;
  };
}

export interface ChatMessage {
  id: number;
  match_id: number;
  sender_id: number;
  sender_role: 'parent' | 'tutor';
  message_type: 'greeting' | 'preset_question' | 'preset_answer' | 'free';
  body: string;
  created_at: string;
}

export interface Meta {
  regions: { value: Region; label: string }[];
  days: { value: Day; label: string }[];
  education: { value: string; label: string }[];
  levels: string[];
  subjects: string[];
  greetings: string[];
  presetQuestions: { key: string; text: string }[];
  feeRate: number;
}
