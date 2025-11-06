
import React, { useState } from 'react';
import { UserStory } from '../types';
import StoryCard from './StoryCard';
import { LoadingSpinner, ChatBubbleIcon, SendIcon, SparklesIcon } from './icons';

interface OutputPanelProps {
  stories: UserStory[];
  isLoading: boolean;
  error: string | null;
  onClarify: (question: string) => Promise<void>;
  clarificationAnswer: string | null;
  isClarifying: boolean;
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  stories,
  isLoading,
  error,
  onClarify,
  clarificationAnswer,
  isClarifying,
}) => {
  const [question, setQuestion] = useState('');

  const handleClarify = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onClarify(question);
      setQuestion('');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
          <LoadingSpinner />
          <h3 className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-200">Generating Backlog...</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The AI Shadow PO is analyzing your request.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center p-8 h-full text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p><strong>Error:</strong> {error}</p>
        </div>
      );
    }
    
    if (stories.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-full">
            <SparklesIcon />
            <h3 className="mt-2 text-xl font-semibold text-slate-800 dark:text-slate-100">AI Shadow PO is ready</h3>
            <p className="mt-1 text-slate-600 dark:text-slate-400">Enter an epic or business requirement on the left to generate user stories.</p>
        </div>
      );
    }

    return (
        <div className="overflow-y-auto h-full pr-2">
            {stories.map(story => (
                <StoryCard key={story.id} story={story} />
            ))}
        </div>
    );
  };

  return (
    <div className="md:w-2/3 w-full flex flex-col bg-slate-100 dark:bg-slate-900/50 p-6 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800 min-h-[60rem] md:min-h-0">
      <div className="flex-grow overflow-hidden relative">
        {renderContent()}
      </div>
      
      {stories.length > 0 && (
        <div className="flex-shrink-0 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center">
                <ChatBubbleIcon />
                Ask for Clarification
            </h3>
            {clarificationAnswer && (
                <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-slate-700 dark:text-slate-200">
                    <p className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1">AI Assistant:</p>
                    <p className="whitespace-pre-wrap">{clarificationAnswer}</p>
                </div>
            )}
            <form onSubmit={handleClarify} className="flex items-center space-x-2">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What is the main goal of the 'Tier System' story?"
                    className="flex-grow p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-slate-800 dark:text-slate-200"
                    disabled={isClarifying}
                />
                <button
                    type="submit"
                    disabled={isClarifying || !question.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors duration-200"
                >
                    {isClarifying ? <LoadingSpinner/> : <SendIcon/>}
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default OutputPanel;
