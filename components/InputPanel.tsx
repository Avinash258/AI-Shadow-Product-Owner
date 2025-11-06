import React, { useRef, useState } from 'react';
import { LoadingSpinner, SparklesIcon, DocumentTextIcon, LightBulbIcon, UploadIcon, XCircleIcon, JiraIcon, AdoIcon, VideoCameraIcon } from './icons';

interface InputPanelProps {
  epicText: string;
  setEpicText: (text: string) => void;
  knowledgeBaseText: string;
  setKnowledgeBaseText: (text: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onOpenImportModal: (type: 'jira' | 'ado') => void;
  onOpenVideoInfoModal: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  epicText,
  setEpicText,
  knowledgeBaseText,
  setKnowledgeBaseText,
  onGenerate,
  isLoading,
  onOpenImportModal,
  onOpenVideoInfoModal
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (readEvent) => {
      setKnowledgeBaseText(readEvent.target?.result as string);
    };
    reader.onerror = () => {
        alert(`Error reading file: ${file.name}`);
        setFileName(null);
        setKnowledgeBaseText('');
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset to allow re-uploading the same file
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    setFileName(null);
    setKnowledgeBaseText('');
  }


  return (
    <div className="md:w-1/3 w-full flex flex-col space-y-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col">
        <label htmlFor="epic" className="mb-2 font-semibold text-slate-700 dark:text-slate-200 flex items-center">
          <DocumentTextIcon />
          Epic / Business Requirement
        </label>
        <textarea
          id="epic"
          value={epicText}
          onChange={(e) => setEpicText(e.target.value)}
          placeholder="e.g., As a retail company, we want to build a customer loyalty program to increase customer retention and lifetime value."
          className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-slate-800 dark:text-slate-200"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="knowledge" className="font-semibold text-slate-700 dark:text-slate-200 flex items-center">
                <LightBulbIcon />
                Knowledge Base (Optional)
            </label>
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleUploadClick}
                    disabled={isLoading}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Upload Doc/Transcript"
                >
                    <UploadIcon />
                </button>
                 <button
                    onClick={onOpenVideoInfoModal}
                    disabled={isLoading}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Upload Video"
                >
                    <VideoCameraIcon />
                </button>
                 <button
                    onClick={() => onOpenImportModal('jira')}
                    disabled={isLoading}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Import from Jira"
                >
                    <JiraIcon />
                </button>
                 <button
                    onClick={() => onOpenImportModal('ado')}
                    disabled={isLoading}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Import from Azure DevOps"
                >
                    <AdoIcon />
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.json,.csv,.html,.js,.ts,.css"
            />
        </div>

        {fileName && (
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-2 rounded-md mb-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="truncate pr-2">{fileName}</span>
                <button 
                    onClick={handleClearFile} 
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label="Remove file"
                >
                    <XCircleIcon />
                </button>
            </div>
        )}

        <textarea
          id="knowledge"
          value={knowledgeBaseText}
          onChange={(e) => setKnowledgeBaseText(e.target.value)}
          placeholder="Paste relevant documents, meeting transcripts, domain notes, or import from Jira/ADO..."
          className="w-full h-64 p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-slate-800 dark:text-slate-200"
          disabled={isLoading}
        />
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isLoading || !epicText.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon />
            <span className="ml-2">Generate Stories</span>
          </>
        )}
      </button>
    </div>
  );
};

export default InputPanel;