'use client';

import React, { useState } from 'react';
import { Language } from './PersonalityTestClient';

interface ConsentFormProps {
  language: Language;
  onSubmit: (consented: boolean) => void;
}

const ConsentForm: React.FC<ConsentFormProps> = ({ language, onSubmit }) => {
  const [consent, setConsent] = useState(false);
  
  // Content for both languages
  const content = {
    en: {
      title: 'Data Privacy Consent',
      description: 'Before taking the test, please read and agree to our data privacy terms:',
      consentText: `
        <p><strong>Data Usage:</strong> Your responses will be stored anonymously and used for research purposes. No personally identifiable information will be collected.</p>
        <p><strong>Data Retention:</strong> Anonymized data will be retained for 10 years for research purposes.</p>
        <p><strong>Demographics:</strong> We collect basic demographic information (age, gender, optional salary information, and leadership status) solely for research analysis.</p>
        <p><strong>Privacy Protection:</strong> We do not store personal identifiers (IP addresses, names, or emails) that could link your responses to you.</p>
      `,
      consentCheckbox: 'I have read and agree to the terms of data usage described above.',
      continueButton: 'Continue',
      backButton: 'Back',
      errorMessage: 'You must agree to the consent terms to continue.'
    },
    de: {
      title: 'Datenschutz-Einwilligung',
      description: 'Bevor Sie den Test durchführen, lesen und akzeptieren Sie bitte unsere Datenschutzbestimmungen:',
      consentText: `
        <p><strong>Datennutzung:</strong> Ihre Antworten werden anonym gespeichert und für Forschungszwecke verwendet. Es werden keine personenidentifizierenden Informationen erfasst.</p>
        <p><strong>Datenspeicherung:</strong> Anonymisierte Daten werden für 10 Jahre zu Forschungszwecken aufbewahrt.</p>
        <p><strong>Demografische Daten:</strong> Wir erheben grundlegende demografische Informationen (Alter, Geschlecht, optionale Gehaltsinformationen und Führungsposition) ausschließlich für Forschungsanalysen.</p>
        <p><strong>Datenschutz:</strong> Wir speichern keine persönlichen Identifikatoren (IP-Adressen, Namen oder E-Mails), die Ihre Antworten mit Ihnen in Verbindung bringen könnten.</p>
      `,
      consentCheckbox: 'Ich habe die oben beschriebenen Bedingungen zur Datennutzung gelesen und stimme ihnen zu.',
      continueButton: 'Fortfahren',
      backButton: 'Zurück',
      errorMessage: 'Sie müssen den Datenschutzbestimmungen zustimmen, um fortzufahren.'
    }
  };

  const t = content[language];
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError(t.errorMessage);
      return;
    }
    onSubmit(true);
  };

  return (
    <div className="test-intro">
      <h2>{t.title}</h2>
      <p>{t.description}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="consent-form" dangerouslySetInnerHTML={{ __html: t.consentText }} />
        
        <div className="consent-checkbox">
          <input 
            type="checkbox" 
            id="consent-checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (e.target.checked) setError('');
            }}
          />
          <label htmlFor="consent-checkbox">{t.consentCheckbox}</label>
        </div>
        
        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
        
        <div className="navigation-buttons">
          <button 
            type="button" 
            className="nav-button" 
            onClick={() => onSubmit(false)}
          >
            {t.backButton}
          </button>
          <button type="submit" className="nav-button">
            {t.continueButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsentForm;