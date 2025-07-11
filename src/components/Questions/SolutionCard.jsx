// src/components/Questions/SolutionCard.jsx
import { formatCode } from '../../utils/helpers';

const SolutionCard = ({ solution, questionId, session }) => {
  return (
    <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-medium text-gray-700">{solution.language}</h4>
        {session && (
          <button
            onClick={() => handleDeleteSolution(solution.id, questionId)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      {formatCode(solution.code, solution.language)}
    </div>
  );
};

export default SolutionCard;