/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/personality-test/PDFGenerator.tsx
import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink, 
  Font 
} from '@react-pdf/renderer';
import { CompleteTestResult } from '@/types/database';
import { Language } from './PersonalityTestClient';

// Register fonts using TTF files with specific variants to prevent italic error
Font.register({
  family: 'Geist',
  fonts: [
    { src: '/fonts/Geist-Regular.ttf', fontWeight: 400, fontStyle: 'normal' },
    // Since you don't have an italic variant, use the regular font for italic styling
    { src: '/fonts/Geist-Regular.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: '/fonts/Geist-SemiBold.ttf', fontWeight: 600, fontStyle: 'normal' },
    { src: '/fonts/Geist-SemiBold.ttf', fontWeight: 600, fontStyle: 'italic' }
  ]
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Geist',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Geist',
    fontWeight: 600,
    color: '#4a61e2', // Your primary color
  },
  subheader: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    fontFamily: 'Geist',
    fontWeight: 600,
    color: '#4a61e2', // Your primary color
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  domainSection: {
    marginTop: 20,
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  domainHeader: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Geist',
    fontWeight: 600,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  scoreLabel: {
    fontFamily: 'Geist',
    fontWeight: 600,
  },
  barContainer: {
    height: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    width: '100%',
    marginVertical: 5,
  },
  scoreBar: {
    height: 15,
    backgroundColor: '#EFA8A8', // Your accent color
    borderRadius: 5,
  },
  label: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  italicNote: {
    fontSize: 10,
    fontStyle: 'normal', // Changed from 'italic' to avoid the error
    color: '#666',
  }
});

// Content translations
const content = {
  en: {
    title: 'Personality Assessment Results',
    summary: 'Summary of your personality assessment',
    domains: 'Your Personality Domains',
    score: 'Score',
    low: 'Low',
    high: 'High',
    generatedOn: 'Generated on',
    interpretationNote: 'Note: These results are based on self-reported data and should be interpreted as general insights about your personality tendencies. They are not a professional psychological assessment.',
    copyright: '',
  },
  de: {
    title: 'Persönlichkeitsfragebogen-Ergebnisse',
    summary: 'Zusammenfassung Ihrer Persönlichkeitseinschätzung',
    domains: 'Ihre Persönlichkeitsbereiche',
    score: 'Punktzahl',
    low: 'Niedrig',
    high: 'Hoch',
    generatedOn: 'Erstellt am',
    interpretationNote: 'Hinweis: Diese Ergebnisse basieren auf selbst gemeldeten Daten und sollten als allgemeine Einblicke in Ihre Persönlichkeitstendenzen interpretiert werden. Sie sind keine professionelle psychologische Bewertung.',
    copyright: '',
  }
};

// PDF Document component
const ResultsPDF = ({ testResults, language }: { testResults: CompleteTestResult, language: Language }) => {
  const t = content[language];
  const testName = language === 'en' ? testResults.test.name_en : testResults.test.name_de;
  const currentDate = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header section */}
        <View style={styles.section}>
          <Text style={styles.header}>{testName}</Text>
          <Text style={[styles.text, { textAlign: 'center' }]}>{t.summary}</Text>
          <Text style={[styles.text, { textAlign: 'center', fontSize: 10 }]}>
            {t.generatedOn}: {currentDate}
          </Text>
        </View>

        {/* Domain results section */}
        <View style={styles.section}>
          <Text style={styles.subheader}>{t.domains}</Text>
          
          {testResults.domainResults.map((result, index) => {
            const domainName = language === 'en' 
              ? result.domain.name_en 
              : result.domain.name_de;
            
            const domainDescription = language === 'en'
              ? result.domain.description_en
              : result.domain.description_de;
            
            return (
              <View key={index} style={styles.domainSection}>
                <Text style={styles.domainHeader}>{domainName}</Text>
                
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>{t.score}: </Text>
                  <Text>{result.score.toFixed(1)}%</Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View style={[styles.scoreBar, { width: `${result.score}%` }]} />
                </View>
                
                <View style={styles.label}>
                  <Text>{t.low}</Text>
                  <Text>{t.high}</Text>
                </View>
                
                <Text style={styles.text}>{domainDescription}</Text>
              </View>
            );
          })}
        </View>

        {/* Disclaimer section */}
        <View style={[styles.section, { marginTop: 'auto' }]}>
          <Text style={styles.italicNote}>
            {t.interpretationNote}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {t.copyright}
        </Text>
      </Page>
    </Document>
  );
};

// Component that renders the PDF download button
interface PDFDownloadButtonProps {
  testResults: CompleteTestResult;
  language: Language;
  buttonText: string;
  fileName?: string;
}

const PDFDownloadButton = ({ 
  testResults, 
  language, 
  buttonText,
  fileName = 'personality-results.pdf' 
}: PDFDownloadButtonProps) => (
  <PDFDownloadLink
    document={<ResultsPDF testResults={testResults} language={language} />}
    fileName={fileName}
    style={{
      textDecoration: 'none',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#4a61e2', // Your primary color
      color: 'white',
      borderRadius: '4px',
      display: 'inline-block',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontWeight: 500,
    }}
  >
    {({ blob, url, loading, error }) =>
      loading ? 'Loading document...' : buttonText
    }
  </PDFDownloadLink>
);

export default PDFDownloadButton;