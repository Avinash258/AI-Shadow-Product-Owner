import React from 'react';
import { XIcon, VideoCameraIcon } from './icons';

interface VideoInfoModalProps {
  onClose: () => void;
}

const VideoInfoModal: React.FC<VideoInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
            <VideoCameraIcon />
            <span className="ml-2">Using Meeting Recordings</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <XIcon />
          </button>
        </div>
        
        <div className="p-6 space-y-4 text-slate-600 dark:text-slate-300">
            <p>
                To get the best results from your meeting recordings, you should use a text transcript as the source for the Knowledge Base.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Recommended Workflow:</h3>
                <ol className="list-decimal list-inside space-y-2">
                    <li>
                        <strong>Generate a Transcript:</strong> Use your meeting software (like Microsoft Teams, Zoom, or Google Meet) to automatically generate a transcript of your recording.
                    </li>
                    <li>
                        <strong>Save as a Text File:</strong> Copy the full transcript and save it as a simple text file (e.g., <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono">meeting_notes.txt</code>).
                    </li>
                    <li>
                        <strong>Upload the Transcript:</strong> Close this window and use the "Upload Doc/Transcript" button to upload your new text file. The AI will use it as context to generate stories.
                    </li>
                </ol>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                This process ensures the AI receives the highest quality information from your discussion, leading to more accurate and relevant user stories.
            </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
                Got It
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoInfoModal;