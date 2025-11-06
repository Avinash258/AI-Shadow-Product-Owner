
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
