import React, { useState, useMemo } from 'react';
import { LoadingSpinner, XIcon } from './icons';

export interface ExportFormData {
  // Common
  url?: string;
  orgUrl?: string;
  project?: string;
  projectKey?: string;
  token?: string;
  // Jira specific
  email?: string;
  issueType?: string;
  // ADO specific
  workItemType?: string;
}

interface ExportModalProps {
  type: 'jira' | 'ado';
  onClose: () => void;
  onSubmit: (formData: ExportFormData) => void;
  exportState: {
    status: 'idle' | 'loading' | 'error' | 'success';
    message: string;
  };
  storyCount: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ type, onClose, onSubmit, exportState, storyCount }) => {
  const [formData, setFormData] = useState<ExportFormData>(
    type === 'jira'
      ? { url: '', email: '', token: '', projectKey: '', issueType: 'Story' }
      : { orgUrl: '', project: '', token: '', workItemType: 'User Story' }
  );

  const isFormValid = useMemo(() => {
    if (type === 'jira') {
      return formData.url && formData.email && formData.token && formData.projectKey && formData.issueType;
    } else { // ado
      return formData.orgUrl && formData.project && formData.token && formData.workItemType;
    }
  }, [formData, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(formData);
    }
  };

  const isIdle = exportState.status === 'idle';
  const isLoading = exportState.status === 'loading';

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Export to {type === 'jira' ? 'Jira' : 'Azure DevOps'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <XIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {isIdle || isLoading ? (
            <div className="p-6 space-y-4">
              {type === 'jira' ? (
                <>
                  <InputField label="Jira URL" name="url" value={formData.url} onChange={handleChange} placeholder="https://your-domain.atlassian.net" required disabled={isLoading}/>
                  <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your-email@example.com" required disabled={isLoading}/>
                  <InputField label="API Token" name="token" type="password" value={formData.token} onChange={handleChange} helpLink="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/" required disabled={isLoading}/>
                  <InputField label="Project Key" name="projectKey" value={formData.projectKey} onChange={handleChange} placeholder="e.g., PROJ" required disabled={isLoading}/>
                  <InputField label="Issue Type" name="issueType" value={formData.issueType} onChange={handleChange} placeholder="e.g., Story" required disabled={isLoading}/>
                </>
              ) : (
                <>
                  <InputField label="Organization URL" name="orgUrl" value={formData.orgUrl} onChange={handleChange} placeholder="https://dev.azure.com/your-org" required disabled={isLoading}/>
                  <InputField label="Project Name" name="project" value={formData.project} onChange={handleChange} placeholder="Your Project Name" required disabled={isLoading}/>
                  <InputField label="Personal Access Token (PAT)" name="token" type="password" value={formData.token} onChange={handleChange} helpLink="https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate" required disabled={isLoading}/>
                  <InputField label="Work Item Type" name="workItemType" value={formData.workItemType} onChange={handleChange} placeholder="e.g., User Story" required disabled={isLoading}/>
                </>
              )}
               <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                Note: Your instance may need to be configured to accept requests from this application (CORS). Credentials are not stored.
              </p>
            </div>
          ) : (
             <div className="p-6 text-center">
                {exportState.status === 'success' && (
                    <div className="text-green-600 dark:text-green-400">
                        <h3 className="font-bold text-lg mb-2">Success!</h3>
                        <p>{exportState.message}</p>
                    </div>
                )}
                 {exportState.status === 'error' && (
                    <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Export Failed</h3>
                        <p className="text-sm">{exportState.message}</p>
                    </div>
                )}
            </div>
          )}

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
             {isIdle || isLoading ? (
                <>
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={!isFormValid || isLoading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center">
                        {isLoading && <LoadingSpinner />}
                        {isLoading ? exportState.message : `Export ${storyCount} Stories`}
                    </button>
                </>
            ) : (
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700">Close</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};


// Fix: Added a props interface for InputField to make placeholder and helpLink optional, resolving TypeScript errors.
interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helpLink?: string;
  required?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type = 'text', value, onChange, placeholder, helpLink, required, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-slate-800 dark:text-slate-200 disabled:opacity-50"
        />
        {helpLink && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                <a href={helpLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    How to create an {name === 'token' ? (label.includes('API') ? 'API Token' : 'Access Token') : '...'}?
                </a>
            </p>
        )}
    </div>
);

export default ExportModal;