import { useState, useEffect } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import './App.css';
import CodeHighlight from './CodeHighlight';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME,
  password: import.meta.env.VITE_ADMIN_PASS
};

function App() {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showAnswer, setShowAnswer] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    category_id: '',
    title: '',
    description: '',
    difficulty: 'Medium',
    image_url: ''
  });
  const [newSolution, setNewSolution] = useState({
    language: 'JavaScript',
    code: ''
  });
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [questionSolutions, setQuestionSolutions] = useState({});
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('dsa_categories')
          .select('*')
          .order('created_at', { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch all questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('dsa_questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
        setFilteredQuestions(questionsData || []);

        // Fetch solutions for all questions
        if (questionsData && questionsData.length > 0) {
          const questionIds = questionsData.map(q => q.id);
          const { data: solutions, error: solutionsError } = await supabase
            .from('dsa_code_solutions')
            .select('*')
            .in('question_id', questionIds);

          if (solutionsError) throw solutionsError;

          // Map solutions to questions
          const solutionsMap = {};
          solutions.forEach(solution => {
            if (!solutionsMap[solution.question_id]) {
              solutionsMap[solution.question_id] = [];
            }
            solutionsMap[solution.question_id].push(solution);
          });
          setQuestionSolutions(solutionsMap);
        }

      } catch (error) {
        console.error('Error fetching data:', error.message);
        setAdminError('Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Filter questions based on search term and selected category
  useEffect(() => {
    let filtered = questions;
    
    if (selectedCategory) {
      filtered = filtered.filter(question => question.category_id === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
        throw new Error('Invalid admin credentials');
      }

      setSession({ isAdmin: true });
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = () => {
    setSession(null);
    setIsAdminPanelOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleAnswer = (questionId) => {
    setShowAnswer(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    try {
      let questionId;
      
      if (editingQuestion) {
        // Update existing question (without updated_at)
        const { data, error } = await supabase
          .from('dsa_questions')
          .update(newQuestion)
          .eq('id', editingQuestion.id)
          .select();

        if (error) throw error;
        setAdminSuccess('Question updated successfully!');
        setTimeout(() => {
          setAdminSuccess(null);
        }, 3000); 
        questionId = editingQuestion.id;
      } else {
        // Insert new question
        const { data, error } = await supabase
          .from('dsa_questions')
          .insert([newQuestion])
          .select();

        if (error) throw error;
        setAdminSuccess('Question added successfully!');
        setTimeout(() => {
          setAdminSuccess(null);
        }, 3000); 
        questionId = data[0].id;
      }

      // Add solution if provided
      if (newSolution.code.trim()) {
        await addSolutionToQuestion(questionId);
      }

      await refreshData();
      resetQuestionForm();
    } catch (error) {
      console.error('Error saving question:', error);
      setAdminError(error.message || 'Failed to save question');
    }
  };

  const addSolutionToQuestion = async (questionId) => {
    if (!newSolution.code.trim()) {
      setAdminError('Solution code cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('dsa_code_solutions')
        .insert([{
          question_id: questionId,
          language: newSolution.language,
          code: newSolution.code
        }]);

      if (error) throw error;
      setAdminSuccess('Solution added successfully!');
      setTimeout(() => {
        setAdminSuccess(null);
      }, 3000); 
      setNewSolution({ language: 'JavaScript', code: '' });
      await refreshData();
    } catch (error) {
      console.error('Error adding solution:', error);
      setAdminError(error.message || 'Failed to add solution');
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('dsa_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('dsa_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Fetch solutions for all questions
      if (questionsData && questionsData.length > 0) {
        const questionIds = questionsData.map(q => q.id);
        const { data: solutions, error: solutionsError } = await supabase
          .from('dsa_code_solutions')
          .select('*')
          .in('question_id', questionIds);

        if (solutionsError) throw solutionsError;

        // Map solutions to questions
        const solutionsMap = {};
        solutions.forEach(solution => {
          if (!solutionsMap[solution.question_id]) {
            solutionsMap[solution.question_id] = [];
          }
          solutionsMap[solution.question_id].push(solution);
        });
        setQuestionSolutions(solutionsMap);
      }
    } catch (error) {
      console.error('Error refreshing data:', error.message);
      setAdminError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      category_id: '',
      title: '',
      description: '',
      difficulty: 'Medium',
      image_url: ''
    });
    setNewSolution({
      language: 'JavaScript',
      code: ''
    });
    setEditingQuestion(null);
  };

  const handleEditQuestion = async (question) => {
    setEditingQuestion(question);
    setNewQuestion({
      category_id: question.category_id,
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      image_url: question.image_url || ''
    });

    // Fetch solutions for this question
    const { data: solutions, error } = await supabase
      .from('dsa_code_solutions')
      .select('*')
      .eq('question_id', question.id);

    if (!error && solutions && solutions.length > 0) {
      setQuestionSolutions(prev => ({
        ...prev,
        [question.id]: solutions
      }));
    }

    setIsAdminPanelOpen(true);
    setIsMobileMenuOpen(false);
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
      
      // Update solutions state
      setQuestionSolutions(prev => {
        const updated = { ...prev };
        if (updated[questionId]) {
          updated[questionId] = updated[questionId].filter(s => s.id !== solutionId);
          if (updated[questionId].length === 0) {
            delete updated[questionId];
          }
        }
        return updated;
      });
    } catch (error) {
      setAdminError(error.message);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.category_name : 'Uncategorized';
  };

const formatCode = (code, language) => {
  if (!code) return null;
  const isMobile = window.innerWidth <= 668;

  return (
    <div className="my-3 w-full overflow-hidden">
      <div className="relative">
        <div className="w-full bg-gray-800 rounded-md p-1">
          <div className="overflow-auto max-w-full">
            <CodeHighlight 
              codeString={code} 
              language={language.toLowerCase()}
              isMobile={isMobile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

  const formatDescription = (description) => {
    if (!description) return null;
    return description.split('\n').map((line, index) => (
      <p key={index} className="mb-4">
        {line || <br />}
      </p>
    ));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">DSA Questions</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {session ? (
                <>
                  <button
                    onClick={() => setIsAdminPanelOpen(true)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                  >
                    Admin Panel
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none"
                >
                  Admin Login
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1 px-4">
            {session ? (
              <>
                <button
                  onClick={() => {
                    setIsAdminPanelOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Admin Panel
                </button>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Questions</h1>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter */}
                <div className="relative">
                  <button
                    onClick={toggleCategoryMenu}
                    className="flex items-center justify-between w-full md:w-48 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    {selectedCategory ? getCategoryName(selectedCategory) : 'Filter by Category'}
                    <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showCategoryMenu && (
                    <div className="absolute z-10 mt-1 w-full md:w-48 bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <button
                        onClick={clearCategoryFilter}
                        className={`block w-full text-left px-4 py-2 text-sm ${!selectedCategory ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => selectCategory(category.id)}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedCategory === category.id ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {category.category_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {filteredQuestions.length > 0 ? (
              <div className="space-y-4 md:space-y-6">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="bg-white shadow rounded-lg overflow-hidden">
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
                          {showAnswer[question.id] ? 'Hide Solutions' : 'Show Solutions'}
                        </button>

                        {showAnswer[question.id] && questionSolutions[question.id] && (
                          <div className="mt-4 md:mt-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Solutions</h3>
                            {questionSolutions[question.id].map((solution, index) => (
                              <div key={index} className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-md font-medium text-gray-700">{solution.language}</h4>
                                  {session && (
                                    <button
                                      onClick={() => handleDeleteSolution(solution.id, question.id)}
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                {formatCode(solution.code, solution.language)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700">No questions found</h2>
                <p className="mt-2 text-gray-500">
                  {selectedCategory 
                    ? `No questions in ${getCategoryName(selectedCategory)} category`
                    : 'Try adjusting your search or filter'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Admin Login</h3>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-2">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
                <button
                  onClick={() => {
                    setIsAdminPanelOpen(false);
                    resetQuestionForm();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {adminError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {adminError}
                </div>
              )}

              {adminSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                  {adminSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Question Form */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                    <h4 className="text-md font-medium text-gray-900 mb-3 md:mb-4">
                      {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h4>

                    <form onSubmit={handleAddQuestion} className="space-y-3 md:space-y-4">
                      <div>
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="category_id"
                          name="category_id"
                          required
                          value={newQuestion.category_id}
                          onChange={(e) => setNewQuestion({ ...newQuestion, category_id: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.category_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Question Title
                        </label>
                        <input
                          id="title"
                          name="title"
                          type="text"
                          required
                          value={newQuestion.title}
                          onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Question Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows="4"
                          required
                          value={newQuestion.description}
                          onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                          Difficulty Level
                        </label>
                        <select
                          id="difficulty"
                          name="difficulty"
                          required
                          value={newQuestion.difficulty}
                          onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                          Image URL (optional)
                        </label>
                        <input
                          id="image_url"
                          name="image_url"
                          type="url"
                          value={newQuestion.image_url}
                          onChange={(e) => setNewQuestion({ ...newQuestion, image_url: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                      </div>

                      {/* Solution Form (always shown) */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Solution</h5>
                        <div className="space-y-2">
                          <div>
                            <label htmlFor="language" className="block text-xs font-medium text-gray-700">
                              Language
                            </label>
                            <select
                              id="language"
                              name="language"
                              value={newSolution.language}
                              onChange={(e) => setNewSolution({ ...newSolution, language: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                            >
                              <option value="JavaScript">JavaScript</option>
                              <option value="Python">Python</option>
                              <option value="Java">Java</option>
                              <option value="C++">C++</option>
                              <option value="C">C</option>
                              <option value="TypeScript">TypeScript</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="code" className="block text-xs font-medium text-gray-700">
                              Code
                            </label>
                            <textarea
                              id="code"
                              name="code"
                              rows="4"
                              value={newSolution.code}
                              onChange={(e) => setNewSolution({ ...newSolution, code: e.target.value })}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 md:space-x-3">
                        {editingQuestion && (
                          <button
                            type="button"
                            onClick={resetQuestionForm}
                            className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                          {editingQuestion ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Questions List */}
                <div className="lg:col-span-2">
                  <div className="mb-3 md:mb-4">
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>

                  <div className="bg-white shadow overflow-hidden rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {filteredQuestions.length > 0 ? (
                        filteredQuestions.map((question) => (
                          <li key={question.id}>
                            <div className="px-3 py-3 sm:px-4 sm:py-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center mb-2 sm:mb-0">
                                  <p className="text-sm font-medium text-indigo-600 truncate">
                                    {question.title}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditQuestion(question)}
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
                                      {new Date(question.created_at).toLocaleDateString()}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;