// src/components/Questions/QuestionCard.jsx
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
  darkMode,
  onCodeClick
}) => {
  if (!question?.id) return null;

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg`}>
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty, darkMode)}`}>
              {question.difficulty || 'Unknown'}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
              {getCategoryName(question.category_id)}
            </span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} break-words`}>
            {question.title || 'Untitled Question'}
          </h2>
        </div>

        <div className={`prose prose-sm sm:prose-base max-w-none ${darkMode ? 'prose-invert' : ''} break-words space-y-2`}>
          {formatDescription(question.description, darkMode)}
        </div>

        {question.image_url && (
          <div className="mt-6 flex justify-center">
            <img
              src={question.image_url}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border border-gray-200 object-contain"
              style={{ maxHeight: '300px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={() => toggleAnswer(question.id)}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none transition-all duration-300 transform hover:scale-105"
          >
            {showAnswer ? 'Hide Solutions' : 'Show Solutions'}
          </button>

          {showAnswer && (
            <div className="mt-6 space-y-4">
              <h3 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                Solutions
              </h3>
              {questionSolutions?.length > 0 ? (
                questionSolutions.map((solution, index) => (
                  solution && (
                    <SolutionCard
                      key={index}
                      solution={solution}
                      questionId={question.id}
                      onDeleteSolution={session ? onDeleteSolution : null}
                      darkMode={darkMode}
                      onCodeClick={onCodeClick} // And passed down to SolutionCard here
                    />
                  )
                ))
              ) : (
                <div className={`text-center py-6 px-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No solutions available for this question yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;