import React, { useState, useCallback } from 'react';
import { generateProductBacklog, getClarification } from './services/geminiService';
import { exportToJiraApi, exportToAdoApi, importFromJiraApi, importFromAdoApi } from './services/apiService';
import { UserStory, ImportFormData } from './types';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import ExportModal, { ExportFormData } from './components/ExportModal';
import ImportModal from './components/ImportModal';
import VideoInfoModal from './components/VideoInfoModal';


const App: React.FC = () => {
  const [epicText, setEpicText] = useState<string>('');
  const [knowledgeBaseText, setKnowledgeBaseText] = useState<string>('');
  const [generatedStories, setGeneratedStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState<string | null>(null);
  const [isClarifying, setIsClarifying] = useState<boolean>(false);

  const [exportModalConfig, setExportModalConfig] = useState<{ type: 'jira' | 'ado', isOpen: boolean }>({ type: 'jira', isOpen: false });
  const [exportState, setExportState] = useState<{ status: 'idle' | 'loading' | 'error' | 'success', message: string }>({ status: 'idle', message: '' });

  const [importModalConfig, setImportModalConfig] = useState<{ type: 'jira' | 'ado', isOpen: boolean }>({ type: 'jira', isOpen: false });
  const [importState, setImportState] = useState<{ status: 'idle' | 'loading' | 'error' | 'success', message: string }>({ status: 'idle', message: '' });

  const [isVideoInfoModalOpen, setIsVideoInfoModalOpen] = useState<boolean>(false);


  const handleGenerateStories = useCallback(async () => {
    if (!epicText.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeneratedStories([]);
    setClarificationAnswer(null);

    try {
      const storiesFromApi = await generateProductBacklog(epicText, knowledgeBaseText);
      const storiesWithIds = storiesFromApi.map((story, index) => ({
        ...story,
        id: `story-${Date.now()}-${index}`,
      }));
      setGeneratedStories(storiesWithIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [epicText, knowledgeBaseText]);
  
  const handleClarify = useCallback(async (question: string) => {
      setIsClarifying(true);
      setClarificationAnswer(null);
      try {
        const answer = await getClarification(generatedStories, knowledgeBaseText, question);
        setClarificationAnswer(answer);
      } catch (err) {
         setClarificationAnswer(err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred during clarification.');
      } finally {
        setIsClarifying(false);
      }
  }, [generatedStories, knowledgeBaseText]);
  
  // --- EXPORT LOGIC ---
  const openExportModal = (type: 'jira' | 'ado') => {
    setExportModalConfig({ type, isOpen: true });
    setExportState({ status: 'idle', message: '' });
  };

  const closeExportModal = () => {
    setExportModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleApiExport = async (formData: ExportFormData) => {
    setExportState({ status: 'loading', message: `Exporting ${generatedStories.length} stories...` });
    try {
      let result;
      if (exportModalConfig.type === 'jira') {
        result = await exportToJiraApi(formData, generatedStories);
      } else {
        result = await exportToAdoApi(formData, generatedStories);
      }
      setExportState({ status: 'success', message: result.message });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during export.';
      setExportState({ status: 'error', message: errorMessage });
    }
  };

  // --- IMPORT LOGIC ---
  const openImportModal = (type: 'jira' | 'ado') => {
    setImportModalConfig({ type, isOpen: true });
    setImportState({ status: 'idle', message: '' });
  };

  const closeImportModal = () => {
    setImportModalConfig(prev => ({ ...prev, isOpen: false }));
  };
  
  const handleApiImport = async (formData: ImportFormData) => {
    setImportState({ status: 'loading', message: 'Fetching data...'});
    try {
        let resultText;
        if (importModalConfig.type === 'jira') {
            resultText = await importFromJiraApi(formData);
        } else {
            resultText = await importFromAdoApi(formData);
        }
        setKnowledgeBaseText(prev => `${prev}\n\n--- IMPORTED FROM ${importModalConfig.type.toUpperCase()} ---\n${resultText}`);
        setImportState({ status: 'success', message: 'Successfully imported data into Knowledge Base!' });
        setTimeout(closeImportModal, 1500); // Close modal after success message
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during import.';
        setImportState({ status: 'error', message: errorMessage });
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight sm:text-5xl">
            AI Shadow Product Owner
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Convert epics into a well-defined backlog with user stories, acceptance criteria, and strategic tags—powered by Gemini.
          </p>
        </header>

        <main className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
          <InputPanel
            epicText={epicText}
            setEpicText={setEpicText}
            knowledgeBaseText={knowledgeBaseText}
            setKnowledgeBaseText={setKnowledgeBaseText}
            onGenerate={handleGenerateStories}
            isLoading={isLoading || exportState.status === 'loading' || importState.status === 'loading'}
            onOpenImportModal={openImportModal}
            onOpenVideoInfoModal={() => setIsVideoInfoModalOpen(true)}
          />
          <OutputPanel
            stories={generatedStories}
            isLoading={isLoading}
            error={error}
            onClarify={handleClarify}
            clarificationAnswer={clarificationAnswer}
            isClarifying={isClarifying}
            onExportJira={() => openExportModal('jira')}
            onExportAdo={() => openExportModal('ado')}
            isExporting={exportState.status === 'loading'}
          />
        </main>

        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>This is a prototype demonstrating AI-assisted product ownership. Always review and refine generated content.</p>
        </footer>
      </div>

      {exportModalConfig.isOpen && (
        <ExportModal
          type={exportModalConfig.type}
          onClose={closeExportModal}
          onSubmit={handleApiExport}
          exportState={exportState}
          storyCount={generatedStories.length}
        />
      )}

      {importModalConfig.isOpen && (
        <ImportModal
          type={importModalConfig.type}
          onClose={closeImportModal}
          onSubmit={handleApiImport}
          importState={importState}
        />
      )}

      {isVideoInfoModalOpen && (
        <VideoInfoModal onClose={() => setIsVideoInfoModalOpen(false)} />
      )}
    </div>
  );
};

export default App;