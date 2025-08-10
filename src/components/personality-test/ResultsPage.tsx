// src/components/personality-test/ResultsPage.tsx
'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Language } from './PersonalityTestClient';
import { CompleteTestResult } from '@/types/database';
import * as api from '@/utils/api-client';
import { formatWithLineBreaks } from '@/utils/text-formatting';
import RadarChart from './RadarChart';

// Dynamically import the PDF generator to reduce initial bundle size
const PDFDownloadButton = lazy(() => import('./PDFGenerator'));

interface ResultsPageProps {
  language: Language;
  testResults: CompleteTestResult;
  sessionId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ResultsPage: React.FC<ResultsPageProps> = ({ language, testResults, sessionId }) => {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPdfComponentLoaded, setIsPdfComponentLoaded] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  
  // Content for both languages
  const content = {
    en: {
      title: 'Your Personality Assessment Results',
      summary: 'Below are your scores across different personality domains. These scores reflect your responses to the assessment questions.',
      downloadPDF: 'Download PDF Report',
      preparingPDF: 'Preparing PDF...',
      loadingPDF: 'Loading PDF Generator...',
      returnToStart: 'Take Another Assessment',
      newsletterTitle: 'Stay Updated',
      newsletterDescription: 'Subscribe to my newsletter to learn more about psychology and receive updates on new research.',
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
      title: 'Ihre Persönlichkeitsfragebogen-Ergebnisse',
      summary: 'Unten finden Sie Ihre Punktzahlen in verschiedenen Persönlichkeitsbereichen. Diese Werte spiegeln Ihre Antworten auf die Beurteilungsfragen wider.',
      downloadPDF: 'PDF-Bericht herunterladen',
      preparingPDF: 'PDF wird vorbereitet...',
      loadingPDF: 'PDF-Generator wird geladen...',
      returnToStart: 'Einen weiteren Fragebogen ausfüllen',
      newsletterTitle: 'Bleiben Sie auf dem Laufenden',
      newsletterDescription: 'Abonnieren Sie meinen Newsletter, um mehr über Psychologie zu erfahren und Updates zu neuen Forschungsergebnissen zu erhalten.',
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
  
  useEffect(() => {
  // Scroll to top when results page loads
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); 

  // Preload the PDF component when the page is visible
  useEffect(() => {
    // Use a small delay to not block the initial render
    const timer = setTimeout(() => {
      setIsPdfLoading(true);
      
      // Create a dynamic import to load the component
      import('./PDFGenerator')
        .then(() => {
          setIsPdfComponentLoaded(true);
          setIsPdfLoading(false);
        })
        .catch(err => {
          console.error('Failed to preload PDF component:', err);
          setIsPdfLoading(false);
        });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
      <div className="radar-chart-container">
        <h3>{language === 'en' ? 'Profile Overview' : 'Profilübersicht'}</h3>
        <RadarChart 
          results={testResults.domainResults} 
          language={language}
        />
      </div>

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
              
              <div className="domain-description">
                {formatWithLineBreaks(domainDescription)}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Actions */}
      <div className="result-actions">
        {isPdfLoading ? (
          <button className="result-button" disabled>{t.loadingPDF}</button>
        ) : isPdfComponentLoaded ? (
          <Suspense fallback={<button className="result-button" disabled>{t.preparingPDF}</button>}>
            <PDFDownloadButton 
              testResults={testResults} 
              language={language}
              buttonText={t.downloadPDF}
              fileName={`${testName.replace(/\s+/g, '-').toLowerCase()}-results.pdf`}
            />
          </Suspense>
        ) : (
          <button 
            className="result-button"
            onClick={() => {
              setIsPdfLoading(true);
              // Manually trigger the import
              import('./PDFGenerator')
                .then(() => {
                  setIsPdfComponentLoaded(true);
                  setIsPdfLoading(false);
                })
                .catch(err => {
                  console.error('Failed to load PDF component:', err);
                  setIsPdfLoading(false);
                });
            }}
          >
            {t.downloadPDF}
          </button>
        )}
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