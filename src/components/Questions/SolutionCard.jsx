// src/components/Questions/SolutionCard.jsx
import { formatCode } from '../../utils/helpers';

const SolutionCard = ({ solution, questionId, onDeleteSolution, darkMode }) => {
  return (
    <div className={`p-3 md:p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className={`text-md font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {solution.language}
        </h4>
        {onDeleteSolution && (
          <button
            onClick={() => onDeleteSolution(solution.id, questionId)}
            className={`text-sm ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'}`}
          >
            Delete
          </button>
        )}
      </div>
      {formatCode(solution.code, solution.language, darkMode)}
    </div>
  );
};

export default SolutionCard;