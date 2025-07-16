import { useState } from 'react';
import { supabase } from '../../config/supabase';
import QuestionCard from './QuestionCard';
import CategoryFilter from '../UI/CategoryFilter';
import SearchBar from '../UI/SearchBar';
import Loader from '../UI/Loader';

const QuestionList = ({
  isLoading,
  questions = [],
  categories = [],
  questionSolutions = {},
  searchTerm,
  selectedCategory,
  showCategoryMenu,
  setSearchTerm,
  setSelectedCategory,
  setShowCategoryMenu,
  session,
  setAdminError,
  setAdminSuccess,
  refreshData,
  darkMode
}) => {
  const [showAnswer, setShowAnswer] = useState({});

  const toggleAnswer = (questionId) => {
    setShowAnswer(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch ((difficulty || '').toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.category_name || 'Uncategorized';
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
      setTimeout(() => setAdminSuccess(null), 3000);
      await refreshData();
    } catch (error) {
      setAdminError(error.message);
    }
  };

  const toggleCategoryMenu = () => {
    setShowCategoryMenu(!showCategoryMenu);
  };

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setShowCategoryMenu(false);
  };

  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  if (isLoading) {
    return <Loader darkMode={darkMode} />;
  }

  return (
    <>
      {session && (
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3 md:gap-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Questions</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              showCategoryMenu={showCategoryMenu}
              toggleCategoryMenu={toggleCategoryMenu}
              selectCategory={selectCategory}
              clearCategoryFilter={clearCategoryFilter}
              getCategoryName={getCategoryName}
              darkMode={darkMode}
            />
            
            <SearchBar 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              darkMode={darkMode}
            />
          </div>
        </div>
      )}

      {questions?.length > 0 ? (
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {questions.map((question) => (
            question && (
              <QuestionCard 
                key={question.id}
                question={question}
                showAnswer={showAnswer[question.id]}
                toggleAnswer={toggleAnswer}
                questionSolutions={questionSolutions[question.id]}
                getDifficultyColor={getDifficultyColor}
                getCategoryName={getCategoryName}
                session={session}
                onDeleteSolution={handleDeleteSolution}
                darkMode={darkMode}
              />
            )
          ))}
        </div>
      ) : (
        <div className={`text-center py-6 sm:py-8 md:py-12 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
            No questions found
          </h2>
          <p className="mt-2 text-sm sm:text-base">
            {selectedCategory 
              ? `No questions in ${getCategoryName(selectedCategory)} category`
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      )}
    </>
  );
};

export default QuestionList;