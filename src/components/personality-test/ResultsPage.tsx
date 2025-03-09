'use client';

import React, { useState } from 'react';
import { Language, DemographicData } from './PersonalityTestClient';

interface ResultsPageProps {
  language: Language;
  responses: Record<string, number>;
  demographicData: DemographicData;
}

// This is a placeholder function to calculate scores based on responses
// In a real application, this would be a more sophisticated algorithm
const calculateScores = (responses: Record<string, number>): Record<string, number> => {
  // For demonstration, we'll create some random domain scores
  // In a real app, you would calculate these based on the actual responses
  return {
    'openness': Math.floor(Math.random() * 40) + 40, // Random score between 40-80
    'conscientiousness': Math.floor(Math.random() * 40) + 40,
    'extraversion': Math.floor(Math.random() * 40) + 40,
    'agreeableness': Math.floor(Math.random() * 40) + 40,
    'neuroticism': Math.floor(Math.random() * 40) + 40,
    'honesty-humility': Math.floor(Math.random() * 40) + 40,
  };
};

// Generate a PDF report (placeholder)
const generatePDF = (scores: Record<string, number>, language: Language) => {
  // In a real app, this would use react-pdf to generate a PDF
  // For now, we'll just alert that the PDF would be downloaded
  alert(language === 'en' 
    ? 'Your PDF report would be downloaded here.'
    : 'Ihr PDF-Bericht würde hier heruntergeladen werden.');
};

const ResultsPage: React.FC<ResultsPageProps> = ({ language, responses, demographicData }) => {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  
  // Calculate the domain scores
  const scores = calculateScores(responses);
  
  // Content for both languages
  const content = {
    en: {
      title: 'Your Personality Test Results',
      summary: 'Below are your scores across different personality domains. These scores reflect your responses to the assessment questions.',
      domainLabels: {
        'openness': 'Openness to Experience',
        'conscientiousness': 'Conscientiousness',
        'extraversion': 'Extraversion',
        'agreeableness': 'Agreeableness',
        'neuroticism': 'Neuroticism',
        'honesty-humility': 'Honesty-Humility'
      },
      domainDescriptions: {
        'openness': 'Reflects your tendency to be curious, creative, and open to new experiences. Higher scores suggest you enjoy exploring new ideas and engaging with artistic or intellectual pursuits.',
        'conscientiousness': 'Measures your tendency to be organized, responsible, and hardworking. Higher scores indicate you likely value planning, reliability, and self-discipline.',
        'extraversion': 'Indicates how outgoing, energetic, and sociable you tend to be. Higher scores suggest you gain energy from social interactions and enjoy being around others.',
        'agreeableness': 'Reflects your tendency to be compassionate, cooperative, and considerate of others. Higher scores suggest you value harmony and maintaining positive relationships.',
        'neuroticism': 'Measures your tendency to experience negative emotions like anxiety, anger, or depression. Higher scores suggest you may be more sensitive to stress and emotional stimuli.',
        'honesty-humility': 'Reflects your sincerity, fairness, and modesty. Higher scores suggest you value ethical behavior and avoid manipulating others for personal gain.'
      },
      downloadPDF: 'Download PDF Report',
      returnToStart: 'Take Another Test',
      newsletterTitle: 'Stay Updated',
      newsletterDescription: 'Subscribe to our newsletter to learn more about personality psychology and receive updates on new research.',
      emailPlaceholder: 'Enter your email address',
      subscribeButton: 'Subscribe',
      thankYouMessage: 'Thank you for subscribing!',
      low: 'Low',
      high: 'High',
      score: 'Score'
    },
    de: {
      title: 'Ihre Persönlichkeitstest-Ergebnisse',
      summary: 'Unten finden Sie Ihre Punktzahlen in verschiedenen Persönlichkeitsbereichen. Diese Werte spiegeln Ihre Antworten auf die Beurteilungsfragen wider.',
      domainLabels: {
        'openness': 'Offenheit für Erfahrungen',
        'conscientiousness': 'Gewissenhaftigkeit',
        'extraversion': 'Extraversion',
        'agreeableness': 'Verträglichkeit',
        'neuroticism': 'Neurotizismus',
        'honesty-humility': 'Ehrlichkeit-Bescheidenheit'
      },
      domainDescriptions: {
        'openness': 'Spiegelt Ihre Tendenz wider, neugierig und kreativ zu sein und für neue Erfahrungen offen zu sein. Höhere Punktzahlen deuten darauf hin, dass Sie es genießen, neue Ideen zu erkunden und sich mit künstlerischen oder intellektuellen Aktivitäten zu beschäftigen.',
        'conscientiousness': 'Misst Ihre Tendenz, organisiert, verantwortungsbewusst und fleißig zu sein. Höhere Punktzahlen weisen darauf hin, dass Sie Planung, Zuverlässigkeit und Selbstdisziplin schätzen.',
        'extraversion': 'Zeigt an, wie gesellig, energiegeladen und kontaktfreudig Sie tendenziell sind. Höhere Punktzahlen deuten darauf hin, dass Sie Energie aus sozialen Interaktionen gewinnen und gerne mit anderen zusammen sind.',
        'agreeableness': 'Spiegelt Ihre Tendenz wider, mitfühlend, kooperativ und rücksichtsvoll gegenüber anderen zu sein. Höhere Punktzahlen deuten darauf hin, dass Sie Harmonie und die Aufrechterhaltung positiver Beziehungen schätzen.',
        'neuroticism': 'Misst Ihre Tendenz, negative Emotionen wie Angst, Wut oder Depression zu erleben. Höhere Punktzahlen deuten darauf hin, dass Sie möglicherweise empfindlicher auf Stress und emotionale Reize reagieren.',
        'honesty-humility': 'Spiegelt Ihre Aufrichtigkeit, Fairness und Bescheidenheit wider. Höhere Punktzahlen deuten darauf hin, dass Sie ethisches Verhalten schätzen und es vermeiden, andere zu Ihrem persönlichen Vorteil zu manipulieren.'
      },
      downloadPDF: 'PDF-Bericht herunterladen',
      returnToStart: 'Einen weiteren Test machen',
      newsletterTitle: 'Bleiben Sie auf dem Laufenden',
      newsletterDescription: 'Abonnieren Sie unseren Newsletter, um mehr über Persönlichkeitspsychologie zu erfahren und Updates zu neuen Forschungsergebnissen zu erhalten.',
      emailPlaceholder: 'Geben Sie Ihre E-Mail-Adresse ein',
      subscribeButton: 'Abonnieren',
      thankYouMessage: 'Vielen Dank für Ihr Abonnement!',
      low: 'Niedrig',
      high: 'Hoch',
      score: 'Punktzahl'
    }
  };

  const t = content[language];
  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your API
    setNewsletterSubmitted(true);
  };
  
  return (
    <div className="test-results">
      <h2>{t.title}</h2>
      <p>{t.summary}</p>
      
      {/* Results visualization */}
      <div className="results-visualization">
        {Object.entries(scores).map(([domain, score]) => (
          <div key={domain} className="domain-result">
            <div className="domain-header">
              <h3>{t.domainLabels[domain as keyof typeof t.domainLabels]}</h3>
              <span className="domain-score">{t.score}: {score}</span>
            </div>
            
            <div className="score-bar">
              <div 
                className="score-fill"
                style={{ width: `${score}%` }}
              ></div>
            </div>
            
            <div className="scale-labels">
              <span>{t.low}</span>
              <span style={{ float: 'right' }}>{t.high}</span>
            </div>
            
            <p className="domain-description">
              {t.domainDescriptions[domain as keyof typeof t.domainDescriptions]}
            </p>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="result-actions">
        <button 
          className="result-button"
          onClick={() => generatePDF(scores, language)}
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
            <input 
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
            />
            <button type="submit">{t.subscribeButton}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;