'use client';

import React, { useEffect, useState } from 'react';
import { Language } from './PersonalityTestClient';
import { Question } from '@/types/database';
import * as api from '@/utils/api-client'; // Changed from @/utils/api to @/utils/api-client

interface QuestionPageProps {
  language: Language;
  testId: string;
  pageNumber: number;
  responses: Record<string, number>;
  onResponseChange: (questionId: string, value: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  setTotalPages: (pages: number) => void;
}

const QuestionPage: React.FC<QuestionPageProps> = ({ 
  language, 
  testId,
  pageNumber, 
  responses, 
  onResponseChange, 
  onNavigate,
  setTotalPages
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localTotalPages, setLocalTotalPages] = useState(1);
  
  // Fetch questions from the database
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Use the API function to get questions for this page
        const questionsData = await api.getQuestionsForPage(testId, pageNumber, language);
        
        setQuestions(questionsData.questions);
        setLocalTotalPages(questionsData.totalPages);
        setTotalPages(questionsData.totalPages);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [testId, pageNumber, language, setTotalPages]);
  
  // Content for both languages
  const content = {
    en: {
      title: 'Personality Assessment',
      pageLabel: 'Page',
      of: 'of',
      instructionsTitle: 'Instructions',
      instructions: 'Please rate your agreement with each statement using the scale below. Think about how you typically behave and answer spontaneously. There are no "right" or "wrong" answers. Your results will be consistent and coherently interpretable only if you answer honestly.',
      scaleLabels: [
        'Strongly Disagree',
        'Disagree',
        'Somewhat Disagree',
        'Slightly Disagree',
        'Slightly Agree',
        'Somewhat Agree',
        'Agree',
        'Strongly Agree'
      ],
      previousButton: 'Previous',
      nextButton: 'Next',
      completeButton: 'Complete Test',
      loading: 'Loading questions...',
      error: 'Error loading questions: ',
      allQuestionsNote: 'Please answer all questions to continue'
    },
    de: {
      title: 'Persönlichkeitsfragebogen',
      pageLabel: 'Seite',
      of: 'von',
      instructionsTitle: 'Anleitung',
      instructions: 'Bitte bewerten Sie Ihre Zustimmung zu jeder Aussage anhand der folgenden Skala. Denken Sie daran, wie Sie sich typischerweise verhalten und antworten Sie spontan. Es gibt keine "richtigen" oder "falschen" Antworten. Nur wenn Sie ehrlich antworten, sind Ihre Ergebnisse konsistent und schlüssig interpretierbar.',
      scaleLabels: [
        'Stimme überhaupt nicht zu',
        'Stimme nicht zu',
        'Stimme eher nicht zu',
        'Stimme leicht nicht zu',
        'Stimme leicht zu',
        'Stimme eher zu',
        'Stimme zu',
        'Stimme voll zu'
      ],
      previousButton: 'Zurück',
      nextButton: 'Weiter',
      completeButton: 'Test abschließen',
      loading: 'Fragen werden geladen...',
      error: 'Fehler beim Laden der Fragen: ',
      allQuestionsNote: 'Bitte beantworten Sie alle Fragen, um fortzufahren'
    }
  };

  const t = content[language];
  
  const isLastPage = pageNumber === localTotalPages - 1;
  const progress = ((pageNumber + 1) / localTotalPages) * 100;
  
  // Check if all questions on the page are answered
  const areAllQuestionsAnswered = questions.every(question => 
    responses[question.id] !== undefined
  );
  
  // Handle loading and error states
  if (loading) {
    return <div className="loading-state">{t.loading}</div>;
  }
  
  if (error) {
    return <div className="error-state">{t.error} {error}</div>;
  }
  
  return (
    <div className="question-page">
      <h2>{t.title}</h2>
      
      <div className="progress-container">
        <p>
          {t.pageLabel} {pageNumber + 1} {t.of} {localTotalPages}
        </p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="instructions">
        <h3>{t.instructionsTitle}</h3>
        <p>{t.instructions}</p>
      </div>
      
      <form>
        <ul className="question-list">
          {questions.map((question) => (
            <li key={question.id} className="question-item">
              <p className="question-text">
                {language === 'en' ? question.text_en : question.text_de}
              </p>
              
              <div className="likert-scale">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((value) => (
                <div key={value} className="scale-option">
                  <input
                    type="radio"
                    id={`${question.id}-${value}`}
                    name={question.id}
                    value={value}
                    checked={responses[question.id] === value}
                    onChange={() => onResponseChange(question.id, value)}
                  />
                  <label htmlFor={`${question.id}-${value}`}>{value}</label>
                  {[1, 4, 5, 8].includes(value) ? (
                    <span className="scale-label">
                      {value === 1 
                        ? t.scaleLabels[0] 
                        : value === 4 
                        ? t.scaleLabels[3] 
                        : value === 5 
                        ? t.scaleLabels[4] 
                        : t.scaleLabels[7]
                      }
                    </span>
                  ) : null}
                </div>
              ))}
              </div>
            </li>
          ))}
        </ul>
        
        {!areAllQuestionsAnswered && (
          <div className="validation-message">
            {t.allQuestionsNote}
          </div>
        )}
        
        <div className="navigation-buttons">
          <button 
            type="button" 
            className="nav-button" 
            onClick={() => onNavigate('prev')}
            disabled={pageNumber === 0}
          >
            {t.previousButton}
          </button>
          <button 
            type="button" 
            className="nav-button" 
            onClick={() => onNavigate('next')}
            disabled={!areAllQuestionsAnswered}
          >
            {isLastPage ? t.completeButton : t.nextButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionPage;