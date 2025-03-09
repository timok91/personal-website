'use client';

import React from 'react';
import { Language } from './PersonalityTestClient';
import { Test } from '@/types/database';

interface TestSelectorProps {
  language: Language;
  tests: Test[];
  onSelect: (test: Test) => void;
}

const TestSelector: React.FC<TestSelectorProps> = ({ language, tests, onSelect }) => {
  // Content for both languages
  const content = {
    en: {
      title: 'Choose a Personality Test',
      description: 'Please select one of the available personality tests:',
      noTests: 'No tests are currently available. Please check back later.',
      selectButton: 'Select'
    },
    de: {
      title: 'Wählen Sie einen Persönlichkeitstest',
      description: 'Bitte wählen Sie einen der verfügbaren Persönlichkeitstests:',
      noTests: 'Derzeit sind keine Tests verfügbar. Bitte schauen Sie später wieder vorbei.',
      selectButton: 'Auswählen'
    }
  };

  const t = content[language];

  if (tests.length === 0) {
    return (
      <div className="test-intro">
        <h2>{t.title}</h2>
        <p>{t.noTests}</p>
      </div>
    );
  }

  return (
    <div className="test-intro">
      <h2>{t.title}</h2>
      <p>{t.description}</p>
      
      <div className="test-selection">
        {tests.map((test) => (
          <div key={test.id} className="test-card" onClick={() => onSelect(test)}>
            <h3>{language === 'en' ? test.name_en : test.name_de}</h3>
            <p>{language === 'en' ? test.description_en : test.description_de}</p>
            <button className="nav-button">{t.selectButton}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestSelector;