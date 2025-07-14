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
  session
}) => {
  const [adminError, setAdminError] = useState(null);
  const [adminSuccess, setAdminSuccess] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-2">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="p-2 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 md:mb-6 gap-2">
            <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setEditingQuestion(null);
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            <QuestionForm 
              categories={categories}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
              setAdminError={setAdminError}
              setAdminSuccess={setAdminSuccess}
              refreshData={refreshData}
            />
            
            <QuestionList 
              questions={questions}
              categories={categories}
              questionSolutions={questionSolutions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setEditingQuestion={setEditingQuestion}
              refreshData={refreshData}
              setAdminError={setAdminError}
              setAdminSuccess={setAdminSuccess}
              session={session}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;