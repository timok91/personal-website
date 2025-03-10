'use client';

import React, { useState } from 'react';
import { Language, DemographicData } from './PersonalityTestClient';

interface DemographicsFormProps {
  language: Language;
  onSubmit: (data: DemographicData) => void;
}

const DemographicsForm: React.FC<DemographicsFormProps> = ({ language, onSubmit }) => {
  // Initial demographics state
  const [demographics, setDemographics] = useState<DemographicData>({
    age: '',
    gender: '',
    salary: '',
    leadership: '',
    previouslyTaken: false
  });
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Content for both languages
  const content = {
    en: {
      title: 'Demographic Information',
      description: 'Please provide the following demographic information for research purposes. This data helps us improve our test and understand different demographic patterns.',
      ageLabel: 'Age Group',
      ageOptions: [
        { value: '', label: 'Select your age group' },
        { value: 'under18', label: 'Under 18' },
        { value: '18-24', label: '18-24' },
        { value: '25-34', label: '25-34' },
        { value: '35-44', label: '35-44' },
        { value: '45-54', label: '45-54' },
        { value: '55-64', label: '55-64' },
        { value: '65plus', label: '65 and above' }
      ],
      genderLabel: 'Gender',
      genderOptions: [
        { value: '', label: 'Select your gender' },
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'non-binary', label: 'Non-binary' },
        { value: 'other', label: 'Other' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
      ],
      salaryLabel: 'Annual Income (Optional)',
      salaryOptions: [
        { value: '', label: 'Prefer not to say' },
        { value: 'under25k', label: 'Under €25,000' },
        { value: '25k-50k', label: '€25,000 - €50,000' },
        { value: '50k-75k', label: '€50,000 - €75,000' },
        { value: '75k-100k', label: '€75,000 - €100,000' },
        { value: 'over100k', label: 'Over €100,000' }
      ],
      leadershipLabel: 'Do you hold a leadership position?',
      leadershipOptions: [
        { value: '', label: 'Select an option' },
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ],
      previousLabel: 'Have you taken this test before?',
      continueButton: 'Continue to Test',
      errorAge: 'Please select your age group',
      errorGender: 'Please select your gender',
      errorLeadership: 'Please indicate whether you hold a leadership position'
    },
    de: {
      title: 'Demografische Informationen',
      description: 'Bitte geben Sie die folgenden demografischen Informationen für Forschungszwecke an. Diese Daten helfen uns, unseren Test zu verbessern und verschiedene demografische Muster zu verstehen.',
      ageLabel: 'Altersgruppe',
      ageOptions: [
        { value: '', label: 'Wählen Sie Ihre Altersgruppe' },
        { value: 'under18', label: 'Unter 18' },
        { value: '18-24', label: '18-24' },
        { value: '25-34', label: '25-34' },
        { value: '35-44', label: '35-44' },
        { value: '45-54', label: '45-54' },
        { value: '55-64', label: '55-64' },
        { value: '65plus', label: '65 und älter' }
      ],
      genderLabel: 'Geschlecht',
      genderOptions: [
        { value: '', label: 'Wählen Sie Ihr Geschlecht' },
        { value: 'female', label: 'Weiblich' },
        { value: 'male', label: 'Männlich' },
        { value: 'non-binary', label: 'Nicht-binär' },
        { value: 'other', label: 'Andere' },
        { value: 'prefer-not-to-say', label: 'Keine Angabe' }
      ],
      salaryLabel: 'Jährliches Einkommen (Optional)',
      salaryOptions: [
        { value: '', label: 'Keine Angabe' },
        { value: 'under25k', label: 'Unter 25.000€' },
        { value: '25k-50k', label: '25.000€ - 50.000€' },
        { value: '50k-75k', label: '50.000€ - 75.000€' },
        { value: '75k-100k', label: '75.000€ - 100.000€' },
        { value: 'over100k', label: 'Über 100.000€' }
      ],
      leadershipLabel: 'Haben Sie eine Führungsposition?',
      leadershipOptions: [
        { value: '', label: 'Wählen Sie eine Option' },
        { value: 'yes', label: 'Ja' },
        { value: 'no', label: 'Nein' }
      ],
      previousLabel: 'Haben Sie diesen Test schon einmal gemacht?',
      continueButton: 'Weiter zum Test',
      errorAge: 'Bitte wählen Sie Ihre Altersgruppe',
      errorGender: 'Bitte wählen Sie Ihr Geschlecht',
      errorLeadership: 'Bitte geben Sie an, ob Sie eine Führungsposition innehaben'
    }
  };

  const t = content[language];
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const target = e.target as HTMLInputElement; // Type assertion
    const { name, value, type, checked } = target;
    
    if (type === 'checkbox') {
      console.log(`Checkbox ${name} changed to: ${checked}`);
      setDemographics(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setDemographics(prev => ({
        ...prev,
        [name]: value
      }));
    }
   
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!demographics.age) {
      newErrors.age = t.errorAge;
    }
    
    if (!demographics.gender) {
      newErrors.gender = t.errorGender;
    }
    
    if (!demographics.leadership) {
      newErrors.leadership = t.errorLeadership;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Log the data being submitted
      console.log('Submitting demographic data:', demographics);
      console.log('Previously taken value:', demographics.previouslyTaken);
      
      // Make a copy to ensure we're passing a clean object
      const dataToSubmit = {
        ...demographics,
        previouslyTaken: demographics.previouslyTaken === true // Explicit boolean conversion
      };
      
      onSubmit(dataToSubmit);
    }
  };
  
  return (
    <div className="test-intro">
      <h2>{t.title}</h2>
      <p>{t.description}</p>
      
      <form onSubmit={handleSubmit} className="demographics-form">
        <div className="form-group">
          <label htmlFor="age">{t.ageLabel}</label>
          <select 
            id="age"
            name="age"
            value={demographics.age}
            onChange={handleChange}
            className={errors.age ? 'error' : ''}
          >
            {t.ageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.age && <p className="error-message" style={{ color: 'red' }}>{errors.age}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="gender">{t.genderLabel}</label>
          <select 
            id="gender"
            name="gender"
            value={demographics.gender}
            onChange={handleChange}
            className={errors.gender ? 'error' : ''}
          >
            {t.genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender && <p className="error-message" style={{ color: 'red' }}>{errors.gender}</p>}
        </div>
        
        <div className="form-group">
          <label htmlFor="salary">{t.salaryLabel}</label>
          <select 
            id="salary"
            name="salary"
            value={demographics.salary}
            onChange={handleChange}
          >
            {t.salaryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="leadership">{t.leadershipLabel}</label>
          <select 
            id="leadership"
            name="leadership"
            value={demographics.leadership}
            onChange={handleChange}
            className={errors.leadership ? 'error' : ''}
          >
            {t.leadershipOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.leadership && <p className="error-message" style={{ color: 'red' }}>{errors.leadership}</p>}
        </div>
        
        <div className="form-group consent-checkbox">
          <input 
            type="checkbox" 
            id="previouslyTaken"
            name="previouslyTaken"
            checked={demographics.previouslyTaken}
            onChange={(e) => {
              // Special handling for checkbox with console logging for debugging
              const isChecked = e.target.checked;
              console.log('Previously taken checkbox changed:', isChecked);
              setDemographics(prev => ({
                ...prev,
                previouslyTaken: isChecked
              }));
            }}
          />
          <label htmlFor="previouslyTaken">{t.previousLabel}</label>
        </div>
        
        <div className="navigation-buttons">
          <button type="submit" className="nav-button">
            {t.continueButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DemographicsForm;