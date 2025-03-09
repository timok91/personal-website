'use client';

import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import ConsentForm from './ConsentForm';
import DemographicsForm from './DemographicsForm';
import QuestionPage from './QuestionPage';
import ResultsPage from './ResultsPage';

// Define the available languages
export type Language = 'en' | 'de';

// Define the main states for the test flow
type TestStage = 
  | 'language-selection'
  | 'consent'
  | 'demographics'
  | 'questions'
  | 'results';

// Define the demographic data structure
export interface DemographicData {
  age: string;
  gender: string;
  salary?: string;
  leadership: string;
  previouslyTaken: boolean;
}

// This component would typically fetch test data from an API
// For now, we'll use placeholder data
export const PersonalityTestClient: React.FC = () => {
  // State for the current language
  const [language, setLanguage] = useState<Language>('en');
  
  // State for the current stage of the test
  const [stage, setStage] = useState<TestStage>('language-selection');
  
  // State for consent
  const [consentGiven, setConsentGiven] = useState(false);
  
  // State for demographic data
  const [demographicData, setDemographicData] = useState<DemographicData>({
    age: '',
    gender: '',
    salary: '',
    leadership: '',
    previouslyTaken: false
  });
  
  // State for test responses
  const [responses, setResponses] = useState<Record<string, number>>({});
  
  // State for current question page (0-indexed)
  const [currentPage, setCurrentPage] = useState(0);
  
  // Function to handle language selection
  const handleLanguageSelect = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setStage('consent');
  };
  
  // Function to handle consent form submission
  const handleConsentSubmit = (consented: boolean) => {
    setConsentGiven(consented);
    if (consented) {
      setStage('demographics');
    }
  };
  
  // Function to handle demographics form submission
  const handleDemographicsSubmit = (data: DemographicData) => {
    setDemographicData(data);
    setStage('questions');
  };
  
  // Function to handle question responses
  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Function to handle navigation between question pages
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next') {
      // In a real app, you would check if all questions on the current page are answered
      setCurrentPage(prev => prev + 1);
      
      // If we've reached the end of the questions, show results
      // This is a placeholder condition - would be based on actual question count
      if (currentPage >= 11) { // 12 pages total (0-11)
        setStage('results');
      }
    }
  };
  
  // Render different components based on the current stage
  return (
    <div className="personality-test-wrapper">
      {stage === 'language-selection' && (
        <LanguageSelector 
          onSelect={handleLanguageSelect} 
          selectedLanguage={language}
        />
      )}
      
      {stage === 'consent' && (
        <ConsentForm 
          language={language} 
          onSubmit={handleConsentSubmit}
        />
      )}
      
      {stage === 'demographics' && (
        <DemographicsForm 
          language={language} 
          onSubmit={handleDemographicsSubmit}
        />
      )}
      
      {stage === 'questions' && (
        <QuestionPage 
          language={language}
          pageNumber={currentPage}
          responses={responses}
          onResponseChange={handleResponseChange}
          onNavigate={handleNavigate}
        />
      )}
      
      {stage === 'results' && (
        <ResultsPage 
          language={language}
          responses={responses}
          demographicData={demographicData}
        />
      )}
    </div>
  );
};

export default PersonalityTestClient;