// src/App.jsx
import { useState } from 'react';
import { supabase } from './config/supabase';
import { ADMIN_CREDENTIALS } from './utils/auth';
import Header from './components/UI/Header';
import MobileMenu from './components/UI/MobileMenu';
import QuestionList from './components/Questions/QuestionList';
import LoginModal from './components/Auth/LoginModal';
import AdminPanel from './components/AdminPanel/AdminPanel';
import useQuestions from './hooks/useQuestions';

function App() {
  const [session, setSession] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    questions,
    filteredQuestions,
    isLoading,
    categories,
    questionSolutions,
    searchTerm,
    selectedCategory,
    showCategoryMenu,
    setSearchTerm,
    setSelectedCategory,
    setShowCategoryMenu,
    refreshData
  } = useQuestions(session);

  const handleSignOut = () => {
    setSession(null);
    setIsAdminPanelOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        session={session}
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsAdminPanelOpen={setIsAdminPanelOpen}
        handleSignOut={handleSignOut}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <MobileMenu 
        isMobileMenuOpen={isMobileMenuOpen}
        session={session}
        setIsLoginModalOpen={setIsLoginModalOpen}
        setIsAdminPanelOpen={setIsAdminPanelOpen}
        handleSignOut={handleSignOut}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <QuestionList 
          isLoading={isLoading}
          questions={filteredQuestions}
          categories={categories}
          questionSolutions={questionSolutions}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          showCategoryMenu={showCategoryMenu}
          setSearchTerm={setSearchTerm}
          setSelectedCategory={setSelectedCategory}
          setShowCategoryMenu={setShowCategoryMenu}
          session={session}
        />
      </main>

      <LoginModal 
        isOpen={isLoginModalOpen}
        setIsOpen={setIsLoginModalOpen}
        setSession={setSession}
        adminCredentials={ADMIN_CREDENTIALS}
      />

      <AdminPanel 
        isOpen={isAdminPanelOpen}
        setIsOpen={setIsAdminPanelOpen}
        questions={filteredQuestions}
        categories={categories}
        questionSolutions={questionSolutions}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        refreshData={refreshData}
        session={session}
      />
    </div>
  );
}

export default App;