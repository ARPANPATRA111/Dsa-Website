// src/components/AdminPanel/QuestionList.jsx
import { formatDate } from '../../utils/helpers';
import { supabase } from '../../config/supabase';

const QuestionList = ({ 
  questions = [], 
  categories,
  searchTerm, 
  setSearchTerm, 
  setEditingQuestion,
  refreshData,
  darkMode,
  setToast,
}) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.category_name : 'Uncategorized';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800';
      case 'medium': return darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800';
      case 'hard': return darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await supabase
        .from('dsa_code_solutions')
        .delete()
        .eq('question_id', id);

      const { error } = await supabase
        .from('dsa_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: 'Question deleted successfully!', type: 'success' });
      await refreshData();
    } catch (error) {
      setToast({ title: 'Error', message: error.message, type: 'error' });
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`block w-full border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
        />
      </div>

      <div className={`shadow overflow-hidden rounded-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <ul className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {questions.length > 0 ? (
            questions.map((question) => (
              <li key={question.id}>
                <div className={`px-4 py-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {question.title}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className={`text-sm rounded-md px-2 py-1 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className={`text-sm rounded-md px-2 py-1 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                          {getCategoryName(question.category_id)}
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg className={`flex-shrink-0 mr-1.5 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p>
                          Scheduled for <time dateTime={question.scheduled_date}>{formatDate(question.scheduled_date)}</time>
                        </p>
                      </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className={`px-4 py-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No questions found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QuestionList;