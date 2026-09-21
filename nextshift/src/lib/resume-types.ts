export type ExperienceKind =
  | 'work'
  | 'volunteer'
  | 'school'
  | 'club'
  | 'leadership'
  | 'project'
  | 'other';

export type ExperienceEntry = {
  id: string;
  kind: ExperienceKind;
  raw: string[];
  dates?: string;
};

export type EducationItem = {
  school: string;
  location?: string;
  graduation?: string;
  details?: string;
};

export type RoleItem = {
  id: string;
  title: string;
  organization?: string;
  dates?: string;
  bullets: string[];
};

export type ResumeDocument = {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  summary?: string;
  education: EducationItem[];
  experience: RoleItem[];
  projects: RoleItem[];
  leadership: RoleItem[];
  volunteer: RoleItem[];
  skills: string[];
};

export type ResumeStep =
  | { id: 'name' }
  | { id: 'address' }
  | { id: 'email' }
  | { id: 'phone' }
  | { id: 'goal' }
  | { id: 'education' }
  | { id: 'education_more' }
  | { id: 'category'; kind: ExperienceKind }
  | { id: 'dates'; kind: ExperienceKind; draftId: string }
  | { id: 'followup'; kind: ExperienceKind; draftId: string; round: number }
  | { id: 'another'; kind: ExperienceKind }
  | { id: 'traits' }
  | { id: 'done' };

export type ResumeSession = {
  name: string;
  address: string;
  email: string;
  phone: string;
  goal: string;
  educationRaw: string;
  educationExtra: string;
  traitsRaw: string;
  experiences: ExperienceEntry[];
  step: ResumeStep;
  optional: boolean;
};
