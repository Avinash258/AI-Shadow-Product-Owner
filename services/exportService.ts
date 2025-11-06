import { UserStory } from '../types';

// Helper to escape CSV fields to handle commas, quotes, and newlines correctly.
const escapeCsvField = (field: any): string => {
  const stringField = String(field ?? '');
  if (/[",\n]/.test(stringField)) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

// Converts an array of story objects into a complete CSV string.
const convertToCsv = (data: Record<string, any>[], headers: string[]): string => {
  const headerRow = headers.map(escapeCsvField).join(',');
  const rows = data.map(item =>
    headers.map(header => escapeCsvField(item[header])).join(',')
  );
  return [headerRow, ...rows].join('\n');
};

// Triggers a file download in the browser.
const downloadCsv = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formats stories for Jira's CSV import format and triggers a download.
 * Uses Jira's markdown for rich text in the description.
 */
export const exportToJiraCsv = (stories: UserStory[]): void => {
  const jiraData = stories.map(story => {
    const description = [
      'h2. Acceptance Criteria',
      ...story.acceptanceCriteria.map(ac => `* ${ac}`),
      ...(story.dependencies.length > 0
        ? ['\nh2. Dependencies', ...story.dependencies.map(dep => `* ${dep}`)]
        : []),
    ].join('\n');

    return {
      'Summary': story.title,
      'Issue Type': 'Story',
      'Description': description,
      'Labels': `value:${story.businessValue} risk:${story.riskLevel}`,
    };
  });
  
  const headers = ['Summary', 'Issue Type', 'Description', 'Labels'];
  const csvContent = convertToCsv(jiraData, headers);
  downloadCsv(csvContent, 'jira-export-stories.csv');
};

/**
 * Formats stories for Azure DevOps' CSV import format and triggers a download.
 * Uses HTML for rich text in the description field.
 */
export const exportToAdoCsv = (stories: UserStory[]): void => {
  const adoData = stories.map(story => {
    const description = [
      '<h3>Acceptance Criteria</h3>',
      '<ul>',
      ...story.acceptanceCriteria.map(ac => `<li>${ac}</li>`),
      '</ul>',
      ...(story.dependencies.length > 0
        ? [
            '<h3>Dependencies</h3>',
            '<ul>',
            ...story.dependencies.map(dep => `<li>${dep}</li>`),
            '</ul>',
          ]
        : []),
    ].join('');

    return {
      'Work Item Type': 'User Story',
      'Title': story.title,
      'Description': description,
      'Tags': `Business Value: ${story.businessValue}; Risk Level: ${story.riskLevel}`,
    };
  });

  const headers = ['Work Item Type', 'Title', 'Description', 'Tags'];
  const csvContent = convertToCsv(adoData, headers);
  downloadCsv(csvContent, 'ado-export-stories.csv');
};
