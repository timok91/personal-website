'use client';

import React from 'react';
import { Language } from './PersonalityTestClient';

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
  selectedLanguage: Language;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, selectedLanguage }) => {
  // Content for both languages
  const content = {
    en: {
      title: 'Welcome to the Personality Assessment',
      description: 'Before we begin, please select your preferred language:',
      english: 'English',
      german: 'German'
    },
    de: {
      title: 'Willkommen zum Persönlichkeitsfragebogen',
      description: 'Bevor wir beginnen, wählen Sie bitte Ihre bevorzugte Sprache:',
      english: 'Englisch',
      german: 'Deutsch'
    }
  };

  // Use English initially for the language selection screen
  const t = content[selectedLanguage] || content.en;

  return (
    <div className="test-intro">
      <h2>{t.title}</h2>
      <p>{t.description}</p>
      
      <div className="language-selector">
        <button 
          className={`language-button ${selectedLanguage === 'en' ? 'active' : ''}`}
          onClick={() => onSelect('en')}
        >
          {t.english}
        </button>
        <button 
          className={`language-button ${selectedLanguage === 'de' ? 'active' : ''}`}
          onClick={() => onSelect('de')}
        >
          {t.german}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;