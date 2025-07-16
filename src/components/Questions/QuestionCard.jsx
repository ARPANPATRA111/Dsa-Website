import SolutionCard from './SolutionCard';
import { formatDescription } from '../../utils/helpers';

const QuestionCard = ({
  question = {},
  showAnswer = false,
  toggleAnswer = () => {},
  questionSolutions = [],
  getDifficultyColor = () => '',
  getCategoryName = () => '',
  session,
  onDeleteSolution,
  darkMode
}) => {
  if (!question?.id) return null;

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
      <div className="p-3 sm:p-4 md:p-6">
        <div className="mb-2 sm:mb-3 md:mb-4">
          <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} break-words`}>
            {question.title || 'Untitled Question'}
          </h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              getDifficultyColor(question.difficulty)
            }`}>
              {question.difficulty || 'Unknown'}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {getCategoryName(question.category_id)}
            </span>
          </div>
        </div>

        <div className={`mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base break-words space-y-2`}>
          {formatDescription(question.description, darkMode)}
        </div>

        {question.image_url && (
          <div className="mt-3 sm:mt-4 md:mt-6 flex justify-center">
            <img
              src={question.image_url}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border border-gray-200 object-contain"
              style={{ maxHeight: '250px', width: '100%' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="mt-4 sm:mt-6 md:mt-8">
          <button
            onClick={() => toggleAnswer(question.id)}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none transition"
          >
            {showAnswer ? 'Hide Solutions' : 'Show Solutions'}
          </button>

          {showAnswer && questionSolutions?.length > 0 && (
            <div className="mt-3 sm:mt-4 md:mt-6 space-y-3 sm:space-y-4">
              <h3 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Solutions
              </h3>
              {questionSolutions.map((solution, index) => (
                solution && (
                  <SolutionCard 
                    key={index}
                    solution={solution}
                    questionId={question.id}
                    onDeleteSolution={session ? onDeleteSolution : null}
                    darkMode={darkMode}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;