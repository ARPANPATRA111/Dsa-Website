// src/hooks/useQuestions.js
import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const useQuestions = (session) => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [questionSolutions, setQuestionSolutions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};

export default useQuestions;