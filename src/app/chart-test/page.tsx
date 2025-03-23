// src/app/chart-test/page.tsx
'use client';

import React, { useState } from 'react';
import RadarChart from '@/components/personality-test/RadarChart';
import { TestResult } from '@/types/database';

export default function ChartTestPage() {
  // This is mock test data - you can adjust these values to test different scenarios
  const [mockData, setMockData] = useState<TestResult[]>([
    {
      domain: {
        id: '1',
        test_id: '1',
        name_en: 'Openness to Experience',
        name_de: 'Offenheit für Erfahrungen',
        description_en: 'Openness to experience describes a dimension of cognitive style...',
        description_de: 'Offenheit für Erfahrungen beschreibt eine Dimension des kognitiven Stils...',
        display_order: 1,
        created_at: '',
        updated_at: ''
      },
      score: 68.8
    },
    {
      domain: {
        id: '2',
        test_id: '1',
        name_en: 'Conscientiousness',
        name_de: 'Gewissenhaftigkeit',
        description_en: 'Conscientiousness concerns how much a person considers others...',
        description_de: 'Gewissenhaftigkeit bezieht sich darauf, wie sehr eine Person andere berücksichtigt...',
        display_order: 2,
        created_at: '',
        updated_at: ''
      },
      score: 58.3
    },
    {
      domain: {
        id: '3',
        test_id: '1',
        name_en: 'Extraversion',
        name_de: 'Extraversion',
        description_en: 'Extraversion is characterized by pronounced engagement with the external world...',
        description_de: 'Extraversion zeichnet sich durch eine ausgeprägte Auseinandersetzung mit der äußeren Welt aus...',
        display_order: 3,
        created_at: '',
        updated_at: ''
      },
      score: 50.0
    },
    {
      domain: {
        id: '4',
        test_id: '1',
        name_en: 'Agreeableness',
        name_de: 'Verträglichkeit',
        description_en: 'Agreeableness reflects individual differences in concern with cooperation and social harmony...',
        description_de: 'Verträglichkeit spiegelt individuelle Unterschiede im Bemühen um Kooperation und soziale Harmonie wider...',
        display_order: 4,
        created_at: '',
        updated_at: ''
      },
      score: 58.3
    },
    {
      domain: {
        id: '5',
        test_id: '1',
        name_en: 'Neuroticism',
        name_de: 'Neurotizismus',
        description_en: 'Neuroticism refers to the tendency to experience negative emotions...',
        description_de: 'Neurotizismus bezieht sich auf die Tendenz, negative Emotionen zu erleben...',
        display_order: 5,
        created_at: '',
        updated_at: ''
      },
      score: 66.7
    }
  ]);

  const [language, setLanguage] = useState<'en' | 'de'>('de');

  // Basic controls for adjusting domain values
  const updateScore = (index: number, newScore: number) => {
    const updatedData = [...mockData];
    updatedData[index] = {
      ...updatedData[index],
      score: Math.min(100, Math.max(0, newScore))
    };
    setMockData(updatedData);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Radar Chart Test Page</h1>
      
      <div className="mb-6">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Switch to {language === 'en' ? 'German' : 'English'}
        </button>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Adjust Domain Scores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockData.map((result, index) => (
            <div key={index} className="border p-4 rounded">
              <p className="font-medium">{language === 'en' ? result.domain.name_en : result.domain.name_de}</p>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={result.score} 
                onChange={(e) => updateScore(index, Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between">
                <span>{result.score.toFixed(1)}%</span>
                <div>
                  <button 
                    onClick={() => updateScore(index, result.score - 5)}
                    className="bg-gray-200 px-2 py-1 rounded mr-2"
                  >
                    -5
                  </button>
                  <button 
                    onClick={() => updateScore(index, result.score + 5)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="radar-chart-container border p-8 rounded bg-gray-50">
        <h3>{language === 'en' ? 'Profile Overview' : 'Profilübersicht'}</h3>
        <RadarChart results={mockData} language={language} />
      </div>
    </div>
  );
}