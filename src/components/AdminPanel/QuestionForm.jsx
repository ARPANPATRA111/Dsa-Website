// src/components/AdminPanel/QuestionForm.jsx
import { useState, useEffect } from 'react';  // Added useEffect import
import { supabase } from '../../config/supabase';
import SolutionForm from './SolutionForm';

const QuestionForm = ({ 
  categories, 
  editingQuestion, 
  setEditingQuestion, 
  setAdminError, 
  setAdminSuccess,
  refreshData
}) => {
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

  useEffect(() => {
    if (editingQuestion) {
      setNewQuestion({
        category_id: editingQuestion.category_id,
        title: editingQuestion.title,
        description: editingQuestion.description,
        difficulty: editingQuestion.difficulty,
        image_url: editingQuestion.image_url || ''
      });
    }
  }, [editingQuestion]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    try {
      let questionId;
      
      if (editingQuestion) {
        // Update existing question
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
        
      if (error) {
        if (error.code == 23505 || error.message?.includes('duplicate')) {
          setAdminError('Same languages Duplicate solution being added');
          setTimeout(() => {
            setAdminError(null);
          },5000)
        }
        throw error;
      }
      setAdminSuccess('Solution added successfully!');
      setTimeout(() => {
        setAdminSuccess(null);
      }, 3000); 
      setNewSolution({ language: 'JavaScript', code: '' });
      await refreshData();
    } catch (error) {
      console.error('Error adding solution:', error);
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

  return (
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

          <SolutionForm 
            newSolution={newSolution}
            setNewSolution={setNewSolution}
          />

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
  );
};

export default QuestionForm;