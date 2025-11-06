export type BusinessValue = 'High' | 'Medium' | 'Low';
export type RiskLevel = 'High' | 'Medium' | 'Low';

export interface UserStory {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  businessValue: BusinessValue;
  riskLevel: RiskLevel;
  dependencies: string[];
}

export interface ImportFormData {
  // Common
  url?: string;
  orgUrl?: string;
  project?: string;
  projectKey?: string;
  token?: string;
  query?: string;
  // Jira specific
  email?: string;
  // ADO specific
}
