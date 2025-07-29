// src/hooks/useQuestions.js
import { useState, useEffect, useCallback } from 'react';
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
  const [questionOfTheDay, setQuestionOfTheDay] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('dsa_categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      let { data: questionsData, error: questionsError } = await supabase
        .from('dsa_questions')
        .select('*')
        .order('scheduled_date', { ascending: true, nullsLast: true });

      if (questionsError) throw questionsError;

      // --- Rescheduling Logic ---
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      const pastQuestions = questionsData.filter(q => q.scheduled_date && new Date(q.scheduled_date) < today);

      if (session && pastQuestions.length > 0) {
        const allDates = new Set(questionsData.map(q => q.scheduled_date).filter(Boolean));
        
        let lastDate;
        const scheduledQuestions = questionsData.filter(q => q.scheduled_date);
        if (scheduledQuestions.length > 0) {
            lastDate = new Date(Math.max(...scheduledQuestions.map(q => new Date(q.scheduled_date))));
        } else {
            lastDate = new Date();
            lastDate.setDate(lastDate.getDate() - 1);
        }

        const updatePromises = pastQuestions.map(question => {
            let nextDate = new Date(lastDate.setDate(lastDate.getDate() + 1));
            while (allDates.has(nextDate.toISOString().split('T')[0])) {
                nextDate.setDate(nextDate.getDate() + 1);
            }
            const newScheduledDate = nextDate.toISOString().split('T')[0];
            allDates.add(newScheduledDate);
            
            const questionIndex = questionsData.findIndex(q => q.id === question.id);
            if (questionIndex !== -1) {
                questionsData[questionIndex].scheduled_date = newScheduledDate;
            }
            
            return supabase.from('dsa_questions').update({ scheduled_date: newScheduledDate }).eq('id', question.id);
        });

        await Promise.all(updatePromises);
        questionsData.sort((a, b) => (a.scheduled_date && b.scheduled_date) ? new Date(a.scheduled_date) - new Date(b.scheduled_date) : a.scheduled_date ? -1 : 1);
      }
      // --- End Rescheduling ---

      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
      fetchSolutionsAndSetQOTD(questionsData);

    } catch (error) {
      console.error('Error fetching data:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const fetchSolutionsAndSetQOTD = async (questionsData) => {
    if (!questionsData || questionsData.length === 0) return;

    const questionIds = questionsData.map(q => q.id);
    const { data: solutions } = await supabase.from('dsa_code_solutions').select('*').in('question_id', questionIds);

    const solutionsMap = {};
    if (solutions) {
      solutions.forEach(solution => {
        if (!solutionsMap[solution.question_id]) solutionsMap[solution.question_id] = [];
        solutionsMap[solution.question_id].push(solution);
      });
    }
    setQuestionSolutions(solutionsMap);

    const todayStr = new Date().toISOString().split('T')[0];
    const qotd = questionsData.find(q => q.scheduled_date === todayStr);
    setQuestionOfTheDay(qotd);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = questions;
    
    if (selectedCategory) {
      filtered = filtered.filter(question => question.category_id === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory]);

  return {
    questions: filteredQuestions,
    isLoading,
    categories,
    questionSolutions,
    searchTerm,
    selectedCategory,
    showCategoryMenu,
    questionOfTheDay,
    setSearchTerm,
    setSelectedCategory,
    setShowCategoryMenu,
    refreshData: fetchData
  };
};

export default useQuestions;