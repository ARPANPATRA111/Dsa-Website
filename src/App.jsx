// src/App.jsx
import { useState } from 'react';
import Header from './components/UI/Header';
import MobileMenu from './components/UI/MobileMenu';
import QuestionList from './components/Questions/QuestionList';
import LoginModal from './components/Auth/LoginModal';
import AdminPanel from './components/AdminPanel/AdminPanel';
import useQuestions from './hooks/useQuestions';
import CodeSnippetModal from './components/UI/CodeSnippetModal';
import Toast from './components/UI/Toast';

function App() {
  const [session, setSession] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [modalCode, setModalCode] = useState({ code: '', language: '', isOpen: false });

  const {
    questions,
    isLoading,
    categories,
    questionSolutions,
    searchTerm,
    selectedCategory,
    showCategoryMenu,
    setSearchTerm,
    setSelectedCategory,
    setShowCategoryMenu,
    refreshData,
    questionOfTheDay
  } = useQuestions(session);

  const handleSignOut = () => {
    setSession(null);
    setIsAdminPanelOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const openCodeModal = (code, language) => {
    setModalCode({ code, language, isOpen: true });
  };

  const closeCodeModal = () => {
    setModalCode({ code: '', language: '', isOpen: false });
  };

  const displayQuestions = session ? questions :
    questionOfTheDay ? [questionOfTheDay] : [];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
      <Header
        session={session}
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsAdminPanelOpen={setIsAdminPanelOpen}
        handleSignOut={handleSignOut}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <MobileMenu
        isMobileMenuOpen={isMobileMenuOpen}
        session={session}
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsAdminPanelOpen={setIsAdminPanelOpen}
        handleSignOut={handleSignOut}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        darkMode={darkMode}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {!session && questionOfTheDay && (
          <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Question of the Day
          </h1>
        )}
        <QuestionList
          isLoading={isLoading}
          questions={displayQuestions}
          categories={categories}
          questionSolutions={questionSolutions}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          showCategoryMenu={showCategoryMenu}
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          setShowCategoryMenu={setShowCategoryMenu}
          session={session}
          refreshData={refreshData}
          darkMode={darkMode}
          onCodeClick={openCodeModal}
        />
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        setIsOpen={setIsLoginModalOpen}
        setSession={setSession}
        darkMode={darkMode}
      />

      <AdminPanel
        isOpen={isAdminPanelOpen}
        setIsOpen={setIsAdminPanelOpen}
        questions={questions}
        categories={categories}
        refreshData={refreshData}
        session={session}
        darkMode={darkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setToast={setToast}
      />
      <CodeSnippetModal
        code={modalCode.code}
        language={modalCode.language}
        darkMode={darkMode}
        isOpen={modalCode.isOpen}
        onClose={closeCodeModal}
      />
    </div>
  );
}

export default App;