'use client';

import React, { useState } from 'react';
import { Language } from './PersonalityTestClient';
import { CompleteTestResult } from '@/types/database';
import * as api from '@/utils/api-client'; // Changed from @/utils/api to @/utils/api-client

interface ResultsPageProps {
  language: Language;
  testResults: CompleteTestResult;
  sessionId: string;
}

// Generate a PDF report
const generatePDF = async (testResults: CompleteTestResult, language: Language) => {
  // TODO: Implement PDF generation with react-pdf
  alert(language === 'en' 
    ? 'Your PDF report would be downloaded here.'
    : 'Ihr PDF-Bericht würde hier heruntergeladen werden.');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ResultsPage: React.FC<ResultsPageProps> = ({ language, testResults, sessionId }) => {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Content for both languages
  const content = {
    en: {
      title: 'Your Personality Test Results',
      summary: 'Below are your scores across different personality domains. These scores reflect your responses to the assessment questions.',
      downloadPDF: 'Download PDF Report',
      returnToStart: 'Take Another Test',
      newsletterTitle: 'Stay Updated',
      newsletterDescription: 'Subscribe to our newsletter to learn more about personality psychology and receive updates on new research.',
      emailPlaceholder: 'Enter your email address',
      subscribeButton: 'Subscribe',
      submittingButton: 'Subscribing...',
      thankYouMessage: 'Thank you for subscribing!',
      errorMessage: 'Failed to subscribe. Please try again.',
      alreadySubscribed: 'This email is already subscribed.',
      low: 'Low',
      high: 'High',
      score: 'Score'
    },
    de: {
      title: 'Ihre Persönlichkeitstest-Ergebnisse',
      summary: 'Unten finden Sie Ihre Punktzahlen in verschiedenen Persönlichkeitsbereichen. Diese Werte spiegeln Ihre Antworten auf die Beurteilungsfragen wider.',
      downloadPDF: 'PDF-Bericht herunterladen',
      returnToStart: 'Einen weiteren Test machen',
      newsletterTitle: 'Bleiben Sie auf dem Laufenden',
      newsletterDescription: 'Abonnieren Sie unseren Newsletter, um mehr über Persönlichkeitspsychologie zu erfahren und Updates zu neuen Forschungsergebnissen zu erhalten.',
      emailPlaceholder: 'Geben Sie Ihre E-Mail-Adresse ein',
      subscribeButton: 'Abonnieren',
      submittingButton: 'Wird abonniert...',
      thankYouMessage: 'Vielen Dank für Ihr Abonnement!',
      errorMessage: 'Abonnieren fehlgeschlagen. Bitte versuchen Sie es erneut.',
      alreadySubscribed: 'Diese E-Mail ist bereits abonniert.',
      low: 'Niedrig',
      high: 'Hoch',
      score: 'Punktzahl'
    }
  };

  const t = content[language];
  
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Use the API function to subscribe to the newsletter
      await api.subscribeToNewsletter(emailInput);
      
      setNewsletterSubmitted(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      // Check if it's a duplicate email error
      const errorMessage = err instanceof Error && err.message.includes('duplicate') 
        ? t.alreadySubscribed 
        : t.errorMessage;
      
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  // Use test name and description from the test results
  const testName = language === 'en' 
    ? testResults.test.name_en 
    : testResults.test.name_de;
  
  return (
    <div className="test-results">
      <h2>{testName} - {t.title}</h2>
      <p>{t.summary}</p>
      
      {/* Results visualization */}
      <div className="results-visualization">
        {testResults.domainResults.map((result) => {
          const domainName = language === 'en' 
            ? result.domain.name_en 
            : result.domain.name_de;
          
          const domainDescription = language === 'en'
            ? result.domain.description_en
            : result.domain.description_de;
          
          return (
            <div key={result.domain.id} className="domain-result">
              <div className="domain-header">
                <h3>{domainName}</h3>
                <span className="domain-score">{t.score}: {result.score.toFixed(1)}</span>
              </div>
              
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
              
              <div className="scale-labels">
                <span>{t.low}</span>
                <span style={{ float: 'right' }}>{t.high}</span>
              </div>
              
              <p className="domain-description">
                {domainDescription}
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Actions */}
      <div className="result-actions">
        <button 
          className="result-button"
          onClick={() => generatePDF(testResults, language)}
        >
          {t.downloadPDF}
        </button>
        <a href="/personality-test" className="result-button">
          {t.returnToStart}
        </a>
      </div>
      
      {/* Newsletter signup */}
      <div className="newsletter-section">
        <h3>{t.newsletterTitle}</h3>
        <p>{t.newsletterDescription}</p>
        
        {newsletterSubmitted ? (
          <p className="thank-you">{t.thankYouMessage}</p>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
            <input 
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.submittingButton : t.subscribeButton}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;