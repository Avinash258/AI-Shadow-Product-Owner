import React, { useState, useCallback } from 'react';
import { generateProductBacklog, getClarification } from './services/geminiService';
import { exportToJiraCsv, exportToAdoCsv } from './services/exportService';
import { UserStory } from './types';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';

const App: React.FC = () => {
  const [epicText, setEpicText] = useState<string>('');
  const [knowledgeBaseText, setKnowledgeBaseText] = useState<string>('');
  const [generatedStories, setGeneratedStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState<string | null>(null);
  const [isClarifying, setIsClarifying] = useState<boolean>(false);
  const [exportingTo, setExportingTo] = useState<'jira' | 'ado' | null>(null);


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

  const handleExport = useCallback(async (type: 'jira' | 'ado') => {
    setExportingTo(type);
    
    // Simulate an async operation to provide better UX for the loading state.
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (type === 'jira') {
        exportToJiraCsv(generatedStories);
      } else {
        exportToAdoCsv(generatedStories);
      }
    } catch (err) {
      alert(`Export failed: ${err instanceof Error ? err.message : 'An unknown error occurred.'}`);
    } finally {
      setExportingTo(null);
    }
  }, [generatedStories]);


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
            isLoading={isLoading}
          />
          <OutputPanel
            stories={generatedStories}
            isLoading={isLoading}
            error={error}
            onClarify={handleClarify}
            clarificationAnswer={clarificationAnswer}
            isClarifying={isClarifying}
            onExportJira={() => handleExport('jira')}
            onExportAdo={() => handleExport('ado')}
            exportingTo={exportingTo}
          />
        </main>

        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>This is a prototype demonstrating AI-assisted product ownership. Always review and refine generated content.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
