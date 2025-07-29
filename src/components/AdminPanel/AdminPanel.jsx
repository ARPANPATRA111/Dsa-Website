// src/components/AdminPanel/AdminPanel.jsx
import { useState } from 'react';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';

const AdminPanel = ({
  isOpen,
  setIsOpen,
  questions,
  categories,
  refreshData,
  session,
  darkMode,
  searchTerm,
  setSearchTerm,
  setToast,
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const openFormModal = (question = null) => {
    setEditingQuestion(question);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setEditingQuestion(null);
    setIsFormModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className={`rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Admin Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={() => openFormModal()}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              Add New Question
            </button>
          </div>

          <QuestionList
            questions={questions}
            categories={categories}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setEditingQuestion={openFormModal}
            refreshData={refreshData}
            session={session}
            darkMode={darkMode}
            setToast={setToast}
          />
        </div>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <QuestionForm
              categories={categories}
              editingQuestion={editingQuestion}
              setEditingQuestion={setEditingQuestion}
              refreshData={refreshData}
              darkMode={darkMode}
              onClose={closeFormModal}
              setToast={setToast}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;