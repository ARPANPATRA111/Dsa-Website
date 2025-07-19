// src/components/Questions/SolutionCard.jsx
import { useState } from 'react';
import { formatCode } from '../../utils/helpers';

const SolutionCard = ({ solution, questionId, onDeleteSolution, darkMode, onCodeClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(solution.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-3 md:p-4 rounded-lg border relative ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`text-md font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {solution.language}
        </h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCodeClick(solution.code, solution.language)}
            className={`text-sm px-2 py-1 rounded-md ${darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Expand
          </button>
          <button
            onClick={handleCopy}
            className={`text-sm px-2 py-1 rounded-md ${copied ? 'bg-green-500 text-white' : (darkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {onDeleteSolution && (
            <button
              onClick={() => onDeleteSolution(solution.id, questionId)}
              className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div onClick={() => onCodeClick(solution.code, solution.language)} className="cursor-pointer">
        {formatCode(solution.code, solution.language, darkMode)}
      </div>
    </div>
  );
};

export default SolutionCard;