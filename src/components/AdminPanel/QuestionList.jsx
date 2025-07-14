// src/components/AdminPanel/QuestionList.jsx
import { formatDate } from '../../utils/helpers';
import { supabase } from '../../config/supabase';

const QuestionList = ({ 
  questions, 
  categories,
  questionSolutions, 
  searchTerm, 
  setSearchTerm, 
  setEditingQuestion,
  refreshData,
  setAdminError,
  setAdminSuccess
}) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.category_name : 'Uncategorized';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      // First delete solutions (due to foreign key constraint)
      await supabase
        .from('dsa_code_solutions')
        .delete()
        .eq('question_id', id);

      // Then delete the question
      const { error } = await supabase
        .from('dsa_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAdminSuccess('Question deleted successfully!');
      setTimeout(() => {
        setAdminSuccess(null);
      }, 3000); 
      await refreshData();
    } catch (error) {
      setAdminError(error.message);
    }
  };

  const handleDeleteSolution = async (solutionId, questionId) => {
    if (!window.confirm('Are you sure you want to delete this solution?')) return;

    try {
      const { error } = await supabase
        .from('dsa_code_solutions')
        .delete()
        .eq('id', solutionId);

      if (error) throw error;
      setAdminSuccess('Solution deleted successfully!');
      setTimeout(() => {
        setAdminSuccess(null);
      }, 3000); 
      
      await refreshData();
    } catch (error) {
      setAdminError(error.message);
    }
  };

  return (
    <div className="lg:col-span-2 w-full">
      <div className="mb-2 sm:mb-3 md:mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-2 sm:px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
      </div>

      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions.length > 0 ? (
            questions.map((question) => (
              <li key={question.id}>
                <div className="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {question.title}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="text-xs sm:text-sm bg-white rounded-md text-indigo-600 hover:text-indigo-900 px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="text-xs sm:text-sm bg-white rounded-md text-red-600 hover:text-red-900 px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getCategoryName(question.category_id)}
                        </span>
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-xs text-gray-500">
                        <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs">
                          {formatDate(question.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 text-center text-gray-500 text-sm">
              No questions found. Add a new question to get started.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QuestionList;