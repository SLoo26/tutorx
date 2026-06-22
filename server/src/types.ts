export type Role = 'parent' | 'tutor' | 'admin';
export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'north_east';
export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** The payload we sign into the JWT and attach to each request. */
export interface AuthUser {
  id: number;
  role: Role;
  name: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
