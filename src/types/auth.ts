export type AppRole = 'hr_office' | 'team_lead' | 'director_of_engineering';

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  role: AppRole | null;
  profile: UserProfile | null;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  hr_office: 'HR Office',
  team_lead: 'Team Lead',
  director_of_engineering: 'Director of Engineering',
};

export const canManageProcesses = (role: AppRole | null): boolean => {
  return role === 'hr_office';
};

export const canManageCandidates = (role: AppRole | null): boolean => {
  return role === 'hr_office' || role === 'team_lead';
};

export const isViewOnly = (role: AppRole | null): boolean => {
  return role === 'director_of_engineering';
};

export const isHrOffice = (role: AppRole | null): boolean => {
  return role === 'hr_office';
};
