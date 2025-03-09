'use client';

import React, { useMemo } from 'react';
import { Language } from './PersonalityTestClient';

interface QuestionPageProps {
  language: Language;
  pageNumber: number;
  responses: Record<string, number>;
  onResponseChange: (questionId: string, value: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

// This would come from your database in a real application
// For demonstration, we'll use placeholder questions
const getQuestionsForPage = (pageNumber: number, language: Language): Array<{ id: string; text: string }> => {
  // This function would fetch questions from your database
  // We'll use placeholder questions here
  const questionsMap = {
    en: [
      // Page 1
      [
        { id: 'q1', text: 'I often feel anxious in social situations.' },
        { id: 'q2', text: 'I find it easy to stick to a routine.' },
        { id: 'q3', text: 'I often feel overwhelmed with emotions.' },
        { id: 'q4', text: 'I enjoy being the center of attention.' },
        { id: 'q5', text: 'I prefer having a wide circle of acquaintances to a small group of close friends.' },
        { id: 'q6', text: 'I tend to focus on present realities rather than future possibilities.' },
        { id: 'q7', text: 'I value logic over feelings when making important decisions.' },
        { id: 'q8', text: 'I prefer to have things decided and settled rather than open and undetermined.' },
        { id: 'q9', text: 'I often find myself pursuing new interests and hobbies.' },
        { id: 'q10', text: 'I am generally cautious and careful rather than spontaneous and risky.' }
      ],
      // Page 2
      [
        { id: 'q11', text: 'I prefer to work on my own rather than in a team.' },
        { id: 'q12', text: 'I find it difficult to let go of negative emotions.' },
        { id: 'q13', text: 'I tend to be organized and methodical.' },
        { id: 'q14', text: 'I often think about the deeper meaning of things.' },
        { id: 'q15', text: 'I find it easy to empathize with others.' },
        { id: 'q16', text: 'I prefer practical skills over theoretical concepts.' },
        { id: 'q17', text: 'I am often the first to speak in a group setting.' },
        { id: 'q18', text: 'I find it difficult to stick to schedules.' },
        { id: 'q19', text: 'I often find myself planning for the future.' },
        { id: 'q20', text: 'I prefer to keep my options open rather than committing to a specific plan.' }
      ],
      // Additional pages would follow the same pattern
    ],
    de: [
      // Page 1 in German
      [
        { id: 'q1', text: 'Ich fühle mich oft ängstlich in sozialen Situationen.' },
        { id: 'q2', text: 'Es fällt mir leicht, mich an eine Routine zu halten.' },
        { id: 'q3', text: 'Ich fühle mich oft von Emotionen überwältigt.' },
        { id: 'q4', text: 'Ich genieße es, im Mittelpunkt zu stehen.' },
        { id: 'q5', text: 'Ich ziehe einen großen Bekanntenkreis einer kleinen Gruppe enger Freunde vor.' },
        { id: 'q6', text: 'Ich konzentriere mich eher auf gegenwärtige Realitäten als auf zukünftige Möglichkeiten.' },
        { id: 'q7', text: 'Bei wichtigen Entscheidungen schätze ich Logik mehr als Gefühle.' },
        { id: 'q8', text: 'Ich ziehe es vor, wenn Dinge entschieden und geregelt sind, anstatt offen und unbestimmt.' },
        { id: 'q9', text: 'Ich verfolge oft neue Interessen und Hobbys.' },
        { id: 'q10', text: 'Ich bin generell vorsichtig und bedächtig statt spontan und risikofreudig.' }
      ],
      // Page 2 in German
      [
        { id: 'q11', text: 'Ich arbeite lieber alleine als im Team.' },
        { id: 'q12', text: 'Es fällt mir schwer, negative Emotionen loszulassen.' },
        { id: 'q13', text: 'Ich bin tendenziell organisiert und methodisch.' },
        { id: 'q14', text: 'Ich denke oft über die tiefere Bedeutung der Dinge nach.' },
        { id: 'q15', text: 'Es fällt mir leicht, mit anderen mitzufühlen.' },
        { id: 'q16', text: 'Ich bevorzuge praktische Fähigkeiten gegenüber theoretischen Konzepten.' },
        { id: 'q17', text: 'In einer Gruppe ergreife ich oft als Erster das Wort.' },
        { id: 'q18', text: 'Es fällt mir schwer, mich an Zeitpläne zu halten.' },
        { id: 'q19', text: 'Ich plane oft für die Zukunft.' },
        { id: 'q20', text: 'Ich halte mir lieber meine Optionen offen, anstatt mich auf einen bestimmten Plan festzulegen.' }
      ],
      // Additional pages would follow the same pattern
    ]
  };
  
  // Return the questions for the current page, or an empty array if page doesn't exist
  return (questionsMap[language]?.[pageNumber] || []);
};

const QuestionPage: React.FC<QuestionPageProps> = ({ language, pageNumber, responses, onResponseChange, onNavigate }) => {
  const questions = useMemo(() => getQuestionsForPage(pageNumber, language), [pageNumber, language]);
  
  // Content for both languages
  const content = {
    en: {
      title: 'Personality Assessment',
      pageLabel: 'Page',
      of: 'of',
      instructionsTitle: 'Instructions',
      instructions: 'Please rate your agreement with each statement using the scale below.',
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
      completeButton: 'Complete Test'
    },
    de: {
      title: 'Persönlichkeitsbeurteilung',
      pageLabel: 'Seite',
      of: 'von',
      instructionsTitle: 'Anweisungen',
      instructions: 'Bitte bewerten Sie Ihre Zustimmung zu jeder Aussage anhand der folgenden Skala.',
      scaleLabels: [
        'Stimme überhaupt nicht zu',
        'Stimme nicht zu',
        'Stimme eher nicht zu',
        'Stimme wenig zu',
        'Stimme etwas zu',
        'Stimme eher zu',
        'Stimme zu',
        'Stimme voll zu'
      ],
      previousButton: 'Zurück',
      nextButton: 'Weiter',
      completeButton: 'Test abschließen'
    }
  };

  const t = content[language];
  
  // For demonstration purposes, we'll assume there are 12 pages of questions
  const totalPages = 12;
  const isLastPage = pageNumber === totalPages - 1;
  
  const progress = ((pageNumber + 1) / totalPages) * 100;
  
  return (
    <div className="question-page">
      <h2>{t.title}</h2>
      
      <div className="progress-container">
        <p>
          {t.pageLabel} {pageNumber + 1} {t.of} {totalPages}
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
              <p className="question-text">{question.text}</p>
              
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
                    {value === 1 || value === 8 ? (
                      <span className="scale-label">
                        {value === 1 ? t.scaleLabels[0] : t.scaleLabels[7]}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
        
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
          >
            {isLastPage ? t.completeButton : t.nextButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionPage;