'use client';

import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import ConsentForm from './ConsentForm';
import DemographicsForm from './DemographicsForm';
import QuestionPage from './QuestionPage';
import ResultsPage from './ResultsPage';
import TestSelector from './TestSelector';
import { Test, CompleteTestResult, UserSession } from '@/types/database';
import * as api from '@/utils/api-client';

// Define the available languages
export type Language = 'en' | 'de';

// Define the main states for the test flow
type TestStage = 
  | 'language-selection'
  | 'test-selection'
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

export const PersonalityTestClient: React.FC = () => {
  // State for the current language
  const [language, setLanguage] = useState<Language>('en');
  
  // State for available tests
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  
  // State for the current stage of the test
  const [stage, setStage] = useState<TestStage>('language-selection');
  
  // State for session management
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for test responses
  const [responses, setResponses] = useState<Record<string, number>>({});
  
  // State for current question page (0-indexed)
  const [currentPage, setCurrentPage] = useState(0);
  
  // State for total pages of questions
  const [totalPages, setTotalPages] = useState(0);
  
  // State for test results
  const [results, setResults] = useState<CompleteTestResult | null>(null);

  // Handle language selection and session creation
  const handleLanguageSelect = async (selectedLanguage: Language) => {
    try {
      setIsLoading(true);
      setLanguage(selectedLanguage);
      
      // Create a session in the database
      const newSessionId = await api.createUserSession(selectedLanguage);
      setSessionId(newSessionId);
      
      console.log('Created new session with ID:', newSessionId);
      
      // Fetch available tests
      const tests = await api.getActiveTests(selectedLanguage);
      setAvailableTests(tests);
      
      // Always go to test selection if there's at least one test
      if (tests.length >= 1) {
        setStage('test-selection');
      } else {
        // No tests available
        setError('No tests are currently available. Please try again later.');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error in language selection:', err);
      setError('Failed to initialize test. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Handle test selection
  const handleTestSelect = (test: Test) => {
    setSelectedTest(test);
    setStage('consent');
  };
  
  // Handle consent form submission
  const handleConsentSubmit = (consented: boolean) => {
    if (consented) {
      setStage('demographics');
    } else {
      // If consent is not given, go back to the start
      setStage('language-selection');
    }
  };
  
  // Handle demographics form submission
  const handleDemographicsSubmit = async (data: DemographicData) => {
    try {
      setIsLoading(true);
      console.log('Demographic form submitted with data:', data);
      
      // Create an object with property names exactly matching the UserSession interface
      // Use snake_case for database consistency
      const sessionData = {
        age: Number(data.age),
        gender: data.gender,
        salary: data.salary || '',
        leadership: data.leadership,
        // Special handling for boolean conversion
        previously_taken: data.previouslyTaken === true
      };
      
      console.log('Formatted session data for API:', sessionData);
      
      // Update the session with demographic data
      await api.updateUserSession(sessionId, sessionData as Partial<UserSession>);
      
      // Reset responses when starting a new test
      setResponses({});
      setCurrentPage(0);
      setStage('questions');
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving demographics:', err);
      setError('Failed to save your information. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Handle question responses
  const handleResponseChange = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Handle navigation between question pages
  const handleNavigate = async (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else if (direction === 'next') {
      // Save responses for the current page
      if (Object.keys(responses).length > 0 && selectedTest) {
        try {
          await api.saveResponses(sessionId, selectedTest.id, responses);
          
          // Clear responses for the next page
          setResponses({});
          
          // If we're on the last page, calculate results
          if (currentPage >= totalPages - 1) {
            setIsLoading(true);
            
            // Calculate and fetch results
            const resultsData = await api.calculateAndSaveResults(
              sessionId,
              selectedTest.id
            );
            
            setResults(resultsData);
            setStage('results');
            setIsLoading(false);
          } else {
            // Otherwise, go to the next page
            setCurrentPage(prev => prev + 1);
          }
        } catch (err) {
          console.error('Error saving responses:', err);
          setError('Failed to save your responses. Please try again.');
        }
      } else {
        // If no responses, show error
        setError('Please answer all questions before continuing.');
      }
    }
  };
  
  // Dismiss error message
  const dismissError = () => {
    setError(null);
  };
  
  // Render different components based on the current stage
  return (
    <div className="personality-test-wrapper">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={dismissError}>Dismiss</button>
        </div>
      )}
      
      {stage === 'language-selection' && (
        <LanguageSelector 
          onSelect={handleLanguageSelect} 
          selectedLanguage={language}
        />
      )}
      
      {stage === 'test-selection' && (
        <TestSelector 
          language={language}
          tests={availableTests}
          onSelect={handleTestSelect}
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
      
      {stage === 'questions' && selectedTest && (
        <QuestionPage 
          language={language}
          testId={selectedTest.id}
          pageNumber={currentPage}
          responses={responses}
          onResponseChange={handleResponseChange}
          onNavigate={handleNavigate}
          setTotalPages={setTotalPages}
        />
      )}
      
      {stage === 'results' && results && (
        <ResultsPage 
          language={language}
          testResults={results}
          sessionId={sessionId}
        />
      )}
    </div>
  );
};

export default PersonalityTestClient;