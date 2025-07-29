// src/components/AdminPanel/QuestionForm.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import SolutionForm from './SolutionForm';

const QuestionForm = ({
  categories,
  editingQuestion,
  setEditingQuestion,
  refreshData,
  darkMode,
  onClose,
  setToast,
}) => {
  const [newQuestion, setNewQuestion] = useState({
    category_id: '',
    title: '',
    description: '',
    difficulty: 'Medium',
    image_url: '',
    scheduled_date: ''
  });
  const [newSolution, setNewSolution] = useState({
    language: 'Java',
    code: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [occupiedDates, setOccupiedDates] = useState([]);

  useEffect(() => {
    const fetchScheduledDates = async () => {
      const { data, error } = await supabase
        .from('dsa_questions')
        .select('scheduled_date');
      if (data) {
        setOccupiedDates(data.map(q => q.scheduled_date));
      }
    };
    fetchScheduledDates();
  }, []);

  useEffect(() => {
    const getNextAvailableDate = () => {
        let nextDate = new Date();
        const existingDates = new Set(occupiedDates);
        
        while (existingDates.has(nextDate.toISOString().split('T')[0])) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        return nextDate.toISOString().split('T')[0];
    };

    if (editingQuestion) {
      setNewQuestion({
        category_id: editingQuestion.category_id,
        title: editingQuestion.title,
        description: editingQuestion.description,
        difficulty: editingQuestion.difficulty,
        image_url: editingQuestion.image_url || '',
        scheduled_date: editingQuestion.scheduled_date ? new Date(editingQuestion.scheduled_date).toISOString().split('T')[0] : ''
      });
    } else {
        setNewQuestion(prev => ({ ...prev, scheduled_date: getNextAvailableDate() }));
    }
  }, [editingQuestion, occupiedDates]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (occupiedDates.includes(newQuestion.scheduled_date) && (!editingQuestion || editingQuestion.scheduled_date !== newQuestion.scheduled_date)) {
        setToast({ message: 'This date is already scheduled.', type: 'error' });
        setIsLoading(false);
        return;
    }

    try {
      if (editingQuestion) {
        const { error } = await supabase
          .from('dsa_questions')
          .update(newQuestion)
          .eq('id', editingQuestion.id);

        if (error) throw error;
        setToast({ message: 'Question updated successfully!', type: 'success' });
      } else {
        const { data, error } = await supabase
          .from('dsa_questions')
          .insert([newQuestion])
          .select();

        if (error) throw error;
        setToast({ message: 'Question added successfully!', type: 'success' });
        
        if (newSolution.code.trim()) {
          await addSolutionToQuestion(data[0].id);
        }
      }

      await refreshData();
      resetQuestionForm();
      onClose();

    } catch (error) {
      setToast({ message: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addSolutionToQuestion = async (questionId) => {
    try {
        const { error } = await supabase
            .from('dsa_code_solutions')
            .insert([{ question_id: questionId, ...newSolution }]);
        if (error) throw error;
    } catch (error) {
        setToast({ message: `Failed to add solution: ${error.message}`, type: 'error' });
    }
  };


  const resetQuestionForm = () => {
    setNewQuestion({
      category_id: '',
      title: '',
      description: '',
      difficulty: 'Medium',
      image_url: '',
      scheduled_date: ''
    });
    setNewSolution({
      language: 'JavaScript',
      code: ''
    });
    setEditingQuestion(null);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
      <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
        {editingQuestion ? 'Edit Question' : 'Add New Question'}
      </h4>

      <form onSubmit={handleAddQuestion} className="space-y-4">
        <div>
           <label htmlFor="category_id" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
             Category
           </label>
           <select
             id="category_id"
             name="category_id"
             required
             value={newQuestion.category_id}
             onChange={(e) => setNewQuestion({ ...newQuestion, category_id: e.target.value })}
             className={`mt-1 block w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
           >
             <option value="">Select a category</option>
             {categories.map(category => (
               <option key={category.id} value={category.id}>{category.category_name}</option>
             ))}
           </select>
         </div>

        <div>
           <label htmlFor="scheduled_date" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
             Scheduled Date
           </label>
           <input
             id="scheduled_date"
             name="scheduled_date"
             type="date"
             required
             value={newQuestion.scheduled_date}
             onChange={(e) => setNewQuestion({ ...newQuestion, scheduled_date: e.target.value })}
             className={`mt-1 block w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
           />
           {occupiedDates.includes(newQuestion.scheduled_date) && (!editingQuestion || editingQuestion.scheduled_date !== newQuestion.scheduled_date) &&
                <p className="text-red-500 text-xs mt-1">This date is already scheduled.</p>
           }
         </div>

         <div>
           <label htmlFor="title" className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
             Question Title
           </label>
           <input
             id="title"
             name="title"
             type="text"
             required
             value={newQuestion.title}
             onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
             className={`mt-1 block w-full ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'border-gray-300'} border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
           />
         </div>

         <div>
           <label htmlFor="description" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
             Question Description
           </label>
           <textarea
             id="description"
             name="description"
             rows="4"
             required
             value={newQuestion.description}
             onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
             className={`mt-1 block w-full ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'border-gray-300'} border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
           />
         </div>

         <div>
           <label htmlFor="difficulty" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
             Difficulty Level
           </label>
           <select
             id="difficulty"
             name="difficulty"
             required
             value={newQuestion.difficulty}
             onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
             className={`mt-1 block w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
           >
             <option value="Easy">Easy</option>
             <option value="Medium">Medium</option>
             <option value="Hard">Hard</option>
           </select>
         </div>

         <div>
           <label htmlFor="image_url" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
             Image URL (optional)
           </label>
           <input
             id="image_url"
             name="image_url"
             type="url"
             value={newQuestion.image_url}
             onChange={(e) => setNewQuestion({ ...newQuestion, image_url: e.target.value })}
             className={`mt-1 block w-full ${darkMode ? 'bg-gray-900 border-gray-600 text-white' : 'border-gray-300'} border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm`}
           />
         </div>

        <SolutionForm
          newSolution={newSolution}
          setNewSolution={setNewSolution}
          darkMode={darkMode}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${darkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-white hover:bg-gray-50'} focus:outline-none`}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none flex items-center"
            disabled={isLoading}
          >
            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>}
            {editingQuestion ? 'Update Question' : 'Add Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;