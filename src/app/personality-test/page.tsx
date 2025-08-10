import React from 'react';
import { PersonalityTestClient } from '../../components/personality-test/PersonalityTestClient';

export default function PersonalityTestPage() {
  return (
    <div className="personality-test-container">
      <h1>Personality Assessment</h1>
      <PersonalityTestClient />
    </div>
  );
}