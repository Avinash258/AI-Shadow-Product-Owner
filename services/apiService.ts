import { UserStory, ImportFormData } from '../types';
import { ExportFormData } from '../components/ExportModal';

// --- JIRA API EXPORT ---

// Converts plain text description to Jira's Atlassian Document Format (ADF)
const toAdf = (story: UserStory) => {
  const content = [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Acceptance Criteria' }],
    },
    {
      type: 'bulletList',
      content: story.acceptanceCriteria.map(ac => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: ac }] }],
      })),
    },
  ];

  if (story.dependencies && story.dependencies.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Dependencies' }],
    });
    content.push({
      type: 'bulletList',
      content: story.dependencies.map(dep => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: dep }] }],
      })),
    });
  }

  return {
    version: 1,
    type: 'doc',
    content,
  };
};

export const exportToJiraApi = async (
  config: ExportFormData,
  stories: UserStory[]
): Promise<{ message: string }> => {
  const { url, email, token, projectKey, issueType } = config;
  const endpoint = `${url.replace(/\/$/, '')}/rest/api/3/issue/bulk`;
  
  const body = {
    issueUpdates: stories.map(story => ({
      fields: {
        summary: story.title,
        issuetype: { name: issueType },
        project: { key: projectKey },
        description: toAdf(story),
        labels: [`value-${story.businessValue}`, `risk-${story.riskLevel}`],
      },
    })),
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${email}:${token}`)}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessages = errorData.errors?.join(', ') || errorData.errorMessages?.join(', ');
    throw new Error(`Jira API Error (${response.status}): ${errorMessages || response.statusText}`);
  }

  return { message: `Successfully created ${stories.length} issues in Jira project ${projectKey}.` };
};


// --- AZURE DEVOPS API EXPORT ---

// Converts plain text description to HTML for ADO
const toHtmlDescription = (story: UserStory): string => {
  const acHtml = `<h3>Acceptance Criteria</h3><ul>${story.acceptanceCriteria.map(ac => `<li>${ac}</li>`).join('')}</ul>`;
  const depHtml = (story.dependencies && story.dependencies.length > 0)
    ? `<h3>Dependencies</h3><ul>${story.dependencies.map(dep => `<li>${dep}</li>`).join('')}</ul>`
    : '';
  return acHtml + depHtml;
};

export const exportToAdoApi = async (
  config: ExportFormData,
  stories: UserStory[]
): Promise<{ message: string }> => {
  const { orgUrl, project, token, workItemType } = config;
  
  const createWorkItem = async (story: UserStory) => {
    const endpoint = `${orgUrl.replace(/\/$/, '')}/${encodeURIComponent(project)}/_apis/wit/workitems/$${encodeURIComponent(workItemType)}?api-version=7.1`;
    
    const body = [
      { op: "add", path: "/fields/System.Title", value: story.title },
      { op: "add", path: "/fields/System.Description", value: toHtmlDescription(story) },
      { op: "add", path: "/fields/System.Tags", value: `Business Value: ${story.businessValue}; Risk Level: ${story.riskLevel}` },
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`:${token}`)}`,
        'Content-Type': 'application/json-patch+json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ADO API Error (${response.status}): ${errorData.message || response.statusText}`);
    }
    return response.json();
  };

  // ADO doesn't have a bulk create, so we send requests in parallel.
  await Promise.all(stories.map(createWorkItem));

  return { message: `Successfully created ${stories.length} work items in ADO project ${project}.` };
};


// --- JIRA API IMPORT ---
const formatJiraAdfToString = (description: any): string => {
    if (!description || !description.content) return '';
    let text = '';
    description.content.forEach((node: any) => {
        if (node.content) {
            node.content.forEach((textNode: any) => {
                if (textNode.text) text += textNode.text + ' ';
            });
        }
        text += '\n';
    });
    return text.replace(/<[^>]*>/g, '').trim();
};


export const importFromJiraApi = async (config: ImportFormData): Promise<string> => {
    const { url, email, token, query } = config;
    const endpoint = `${url.replace(/\/$/, '')}/rest/api/3/search?jql=${encodeURIComponent(query || '')}&fields=summary,description,comment`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${btoa(`${email}:${token}`)}`,
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Jira API Error (${response.status}): ${errorData.errorMessages?.join(', ') || response.statusText}`);
    }

    const data = await response.json();
    if (!data.issues || data.issues.length === 0) {
        return "No issues found for the given JQL query.";
    }

    return data.issues.map((issue: any) => {
        const descriptionText = issue.fields.description ? formatJiraAdfToString(issue.fields.description) : 'No description.';
        const commentsText = issue.fields.comment?.comments?.map((c: any) => `Comment: ${formatJiraAdfToString(c.body)}`).join('\n') || '';
        return `Issue: ${issue.key}\nTitle: ${issue.fields.summary}\nDescription: ${descriptionText}\n${commentsText}`;
    }).join('\n\n---\n\n');
};

// --- AZURE DEVOPS API IMPORT ---
const stripHtml = (html: string) => {
  if(!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

export const importFromAdoApi = async (config: ImportFormData): Promise<string> => {
    const { orgUrl, project, token, query } = config;
    const wiqlEndpoint = `${orgUrl.replace(/\/$/, '')}/${encodeURIComponent(project)}/_apis/wit/wiql?api-version=7.1`;

    const wiqlResponse = await fetch(wiqlEndpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(`:${token}`)}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    if (!wiqlResponse.ok) {
        const errorData = await wiqlResponse.json().catch(() => ({}));
        throw new Error(`ADO API Error (${wiqlResponse.status}) executing WIQL: ${errorData.message || wiqlResponse.statusText}`);
    }

    const wiqlResult = await wiqlResponse.json();
    const workItemIds = wiqlResult.workItems.map((item: any) => item.id);

    if (workItemIds.length === 0) {
        return "No work items found for the given WIQL query.";
    }

    const fields = ['System.Title', 'System.Description', 'System.History'];
    const workItemsEndpoint = `${orgUrl.replace(/\/$/, '')}/_apis/wit/workitemsbatch?api-version=7.1`;
    const workItemsResponse = await fetch(workItemsEndpoint, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(`:${token}`)}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: workItemIds, fields }),
    });
    
    if (!workItemsResponse.ok) {
        const errorData = await workItemsResponse.json().catch(() => ({}));
        throw new Error(`ADO API Error (${workItemsResponse.status}) fetching work items: ${errorData.message || workItemsResponse.statusText}`);
    }

    const workItemsData = await workItemsResponse.json();
    return workItemsData.value.map((item: any) => {
        const fields = item.fields;
        const description = stripHtml(fields['System.Description'] || 'No description.');
        const history = stripHtml(fields['System.History'] || 'No history.');
        return `Work Item: ${item.id}\nTitle: ${fields['System.Title']}\nDescription: ${description}\nDiscussion: ${history}`;
    }).join('\n\n---\n\n');
};
