
import React from 'react';
import { UserStory, BusinessValue, RiskLevel } from '../types';

interface StoryCardProps {
  story: UserStory;
}

const getBadgeClass = (type: 'value' | 'risk', level: BusinessValue | RiskLevel): string => {
  const baseClasses = 'text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full';
  if (type === 'value') {
    switch (level) {
      case 'High': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'Medium': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'Low': return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
      default: return '';
    }
  } else { // risk
    switch (level) {
      case 'High': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      case 'Medium': return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300`;
      case 'Low': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
      default: return '';
    }
  }
};

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6 mb-4 transition-shadow hover:shadow-lg">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
           <span className={getBadgeClass('value', story.businessValue)}>Value: {story.businessValue}</span>
           <span className={getBadgeClass('risk', story.riskLevel)}>Risk: {story.riskLevel}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{story.title}</h3>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Acceptance Criteria</h4>
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
          {story.acceptanceCriteria.map((ac, index) => (
            <li key={index}>{ac}</li>
          ))}
        </ul>
      </div>

      {story.dependencies && story.dependencies.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Dependencies</h4>
          <div className="flex flex-wrap gap-2">
            {story.dependencies.map((dep, index) => (
              <span key={index} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium px-3 py-1 rounded-md">
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCard;
