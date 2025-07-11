// src/components/Questions/QuestionCard.jsx
import SolutionCard from './SolutionCard';
import { formatDescription } from '../../utils/helpers';

const QuestionCard = ({
  question,
  showAnswer,
  toggleAnswer,
  questionSolutions,
  getDifficultyColor,
  getCategoryName,
  session
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 md:p-6">
        <div className="mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{question.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {getCategoryName(question.category_id)}
            </span>
          </div>
        </div>

        <div className="prose max-w-none mt-3 md:mt-4 text-gray-700 text-sm md:text-base">
          {formatDescription(question.description)}
        </div>

        {question.image_url && (
          <div className="mt-4 md:mt-6">
            <img
              src={question.image_url}
              alt="Question illustration"
              className="max-w-full h-auto rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="mt-6 md:mt-8">
          <button
            onClick={() => toggleAnswer(question.id)}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            {showAnswer ? 'Hide Solutions' : 'Show Solutions'}
          </button>

          {showAnswer && questionSolutions && (
            <div className="mt-4 md:mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Solutions</h3>
              {questionSolutions.map((solution, index) => (
                <SolutionCard 
                  key={index}
                  solution={solution}
                  questionId={question.id}
                  session={session}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;