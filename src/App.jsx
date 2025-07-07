import { useState, useEffect } from 'react';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import './App.css';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [showAnswer, setShowAnswer] = useState({});
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    tags: [],
    solution: '',
    image_url: '',
    reference_link: '',
    is_active: false
  });
  const [newTag, setNewTag] = useState('');
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data: activeQuestions, error: activeError } = await supabase
          .from('questions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (activeError) throw activeError;

        setCurrentQuestions(activeQuestions || []);

        if (session) {
          const { data: allQuestions, error: allError } = await supabase
            .from('questions')
            .select('*')
            .order('created_at', { ascending: false });

          if (allError) throw allError;
          setQuestions(allQuestions || []);
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
      if (newQuestion.is_active) {
        await supabase
          .from('questions')
          .update({ is_active: false })
          .neq('id', editingQuestion?.id || '');
      }

      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update({ ...newQuestion, updated_at: new Date().toISOString() })
          .eq('id', editingQuestion.id);

        if (error) throw error;
        setAdminSuccess('Question updated successfully!');
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([newQuestion]);

        if (error) throw error;
        setAdminSuccess('Question added successfully!');
      }

      await refreshData();
      resetQuestionForm();
    } catch (error) {
      console.error('Error saving question:', error);
      setAdminError(error.message || 'Failed to save question');
    }
  };

  const toggleActiveStatus = async (questionId, currentStatus) => {
    try {
      setAdminError(null);
      setAdminSuccess(null);

      if (!currentStatus) {
        await supabase
          .from('questions')
          .update({ is_active: false })
          .eq('is_active', true);
      }

      const { error } = await supabase
        .from('questions')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) throw error;

      setAdminSuccess(`Question ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await refreshData();
    } catch (error) {
      console.error('Error toggling active status:', error);
      setAdminError(error.message || 'Failed to update question status');
    }
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const { data: activeQuestions, error: activeError } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      setCurrentQuestions(activeQuestions || []);

      const { data: allQuestions, error: allError } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (allError) throw allError;
      setQuestions(allQuestions || []);
    } catch (error) {
      console.error('Error refreshing data:', error.message);
      setAdminError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      title: '',
      description: '',
      difficulty: 'medium',
      tags: [],
      solution: '',
      image_url: '',
      reference_link: '',
      is_active: false
    });
    setEditingQuestion(null);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newQuestion.tags.includes(newTag.trim())) {
      setNewQuestion({
        ...newQuestion,
        tags: [...newQuestion.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewQuestion({
      ...newQuestion,
      tags: newQuestion.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setNewQuestion({
      title: question.title,
      description: question.description,
      difficulty: question.difficulty,
      tags: question.tags,
      solution: question.solution,
      image_url: question.image_url,
      reference_link: question.reference_link,
      is_active: question.is_active
    });
    setIsAdminPanelOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAdminSuccess('Question deleted successfully!');
      await refreshData();
    } catch (error) {
      setAdminError(error.message);
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tag) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800'
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatSolution = (solution) => {
    if (!solution) return null;
    const isMobile = window.innerWidth <= 668;
    const parts = solution.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeBlock = part.slice(3, -3).trim();
        let language = 'java';
        let codeContent = codeBlock;

        const firstLineBreak = codeBlock.indexOf('\n');
        if (firstLineBreak > 0) {
          const potentialLang = codeBlock.substring(0, firstLineBreak).trim().toLowerCase();
          const langMap = {
            'js': 'javascript',
            'javascript': 'javascript',
            'py': 'python',
            'python': 'python',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'c++': 'cpp',
            'ts': 'typescript',
            'typescript': 'typescript',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'bash': 'bash',
            'sh': 'bash'
          };

          if (langMap[potentialLang]) {
            language = langMap[potentialLang];
            codeContent = codeBlock.substring(firstLineBreak).trim();
          }
        }

        return (
          <div key={`code-${index}`} className="my-3">
            <div className="relative">
              {/* Language indicator */}
              <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-bl-md rounded-tr-md z-10">
                {language}
              </div>

              {/* Code block with responsive styling */}
              <div className={`overflow-x-auto bg-gray-800 rounded-md ${isMobile ? 'max-w-full' : ''}`}>
                <SyntaxHighlighter
                  language={language}
                  style={tomorrow}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: isMobile ? '0.525rem' : '0.875rem', // Smaller font on mobile
                    lineHeight: '1.5',
                    backgroundColor: '#1f2937', // bg-gray-800
                    overflowX: 'auto',
                    wordBreak: isMobile ? 'break-word' : 'normal' // Break words on mobile if needed
                  }}
                  wrapLongLines={isMobile} // Only wrap long lines on mobile
                  showLineNumbers={!isMobile} // Only show line numbers on desktop
                  lineNumberStyle={{
                    minWidth: '2.25em',
                    color: '#9ca3af', // text-gray-400
                    paddingRight: '1em',
                    userSelect: 'none'
                  }}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        );
      }

      return part.split('\n').map((line, lineIndex) => (
        <p key={`text-${index}-${lineIndex}`} className={`mb-3 ${isMobile ? 'text-xs' : 'text-sm md:text-base'}`}>
          {line || <br />}
        </p>
      ));
    });
  };

  const formatDescription = (description) => {
    if (!description) return null;
    return description.split('\n').map((line, index) => (
      <p key={index} className="mb-4">
        {line || <br />}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">DSA Daily</span>
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
        ) : currentQuestions.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-gray-900">Questions of the Day</h1>
            {currentQuestions.map((question) => (
              <div key={question.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="mb-3 md:mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{question.title}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      {question.tags.map((tag, index) => (
                        <span key={index} className={`px-2 py-1 text-xs font-semibold rounded-full ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
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

                  {question.reference_link && (
                    <div className="mt-3 md:mt-4">
                      <a
                        href={question.reference_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm md:text-base"
                      >
                        Question Link ↗
                      </a>
                    </div>
                  )}

                  <div className="mt-6 md:mt-8">
                    <button
                      onClick={() => toggleAnswer(question.id)}
                      className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
                    >
                      {showAnswer[question.id] ? 'Hide Answer' : 'Show Answer'}
                    </button>

                    {showAnswer[question.id] && (
                      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Solution</h3>
                        <div className="prose max-w-none text-gray-700 text-sm md:text-base">
                          {formatSolution(question.solution)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">No active questions found</h2>
            <p className="mt-2 text-gray-500">Check back later or login as admin to add questions.</p>
          </div>
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
                          value={newQuestion.difficulty}
                          onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                          Tags
                        </label>
                        <div className="mt-1 flex">
                          <input
                            id="tags"
                            name="tags"
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Add a tag and press Enter"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          >
                            Add
                          </button>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {newQuestion.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 inline-flex text-indigo-400 hover:text-indigo-500 focus:outline-none"
                              >
                                <span className="sr-only">Remove tag</span>
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="solution" className="block text-sm font-medium text-gray-700">
                          Solution (use ``` for code blocks)
                        </label>
                        <textarea
                          id="solution"
                          name="solution"
                          rows="4"
                          required
                          value={newQuestion.solution}
                          onChange={(e) => setNewQuestion({ ...newQuestion, solution: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Write your solution here. Wrap code in ``` for syntax highlighting."
                        />
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

                      <div>
                        <label htmlFor="reference_link" className="block text-sm font-medium text-gray-700">
                          Reference Link (optional)
                        </label>
                        <input
                          id="reference_link"
                          name="reference_link"
                          type="url"
                          value={newQuestion.reference_link}
                          onChange={(e) => setNewQuestion({ ...newQuestion, reference_link: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="https://example.com/reference-material"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          id="is_active"
                          name="is_active"
                          type="checkbox"
                          checked={newQuestion.is_active}
                          onChange={(e) => setNewQuestion({ ...newQuestion, is_active: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Set as current active question
                        </label>
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
                                  {question.is_active && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditQuestion(question)}
                                    className="text-xs sm:text-sm bg-white rounded-md text-indigo-600 hover:text-indigo-900 px-2 py-1"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => toggleActiveStatus(question.id, question.is_active)}
                                    className={`text-xs sm:text-sm bg-white rounded-md ${question.is_active ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'} px-2 py-1`}
                                  >
                                    {question.is_active ? 'Activate' : 'Deactivate'}
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
                                    {question.tags.map((tag, index) => (
                                      <span key={index} className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTagColor(tag)}`}>
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-2 sm:mt-0 flex items-center text-xs text-gray-500">
                                    <svg className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-xs">
                                      {new Date(question.created_at).toLocaleDateString()}
                                      {question.updated_at !== question.created_at && (
                                        <span> | Updated: {new Date(question.updated_at).toLocaleDateString()}</span>
                                      )}
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