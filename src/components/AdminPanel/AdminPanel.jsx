// src/components/AdminPanel/AdminPanel.jsx
import { useState } from 'react';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';

const AdminPanel = ({ 
  isOpen, 
  setIsOpen, 
  questions, 
  categories, 
  questionSolutions, 
  searchTerm, 
  setSearchTerm,
  refreshData,
  session,
  setAdminError,
  setAdminSuccess,
  darkMode
}) => {
  const [adminError, setLocalAdminError] = useState(null);
  const [adminSuccess, setLocalAdminSuccess] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [scheduledDates, setScheduledDates] = useState([]);

  const handleError = (error) => {
    setLocalAdminError(error);
    setAdminError(error);
  };

  const handleSuccess = (message) => {
    setLocalAdminSuccess(message);
    setAdminSuccess(message);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-2 ">
      <div className={`mt-5 mb-5 rounded-lg shadow-xl w-full max-w-6xl hide-scrollbar max-h-[95vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>        
        <div className="p-2 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-2">
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Panel
            </h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setEditingQuestion(null);
              }}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {adminError && (
            <div className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'}`}>
              {adminError}
            </div>
          )}

          {adminSuccess && (
            <div className={`mb-4 p-3 rounded-md text-sm ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-50 text-green-700'}`}>
              {adminSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            <QuestionForm 
              categories={categories}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
              setAdminError={handleError}
              setAdminSuccess={handleSuccess}
              refreshData={refreshData}
              darkMode={darkMode}
              scheduledDates={scheduledDates}
            />
            
            <QuestionList 
              questions={questions}
              categories={categories}
              questionSolutions={questionSolutions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setEditingQuestion={setEditingQuestion}
              refreshData={refreshData}
              setAdminError={handleError}
              setAdminSuccess={handleSuccess}
              session={session}
              darkMode={darkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;