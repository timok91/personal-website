// Types for the database schema
export interface Test {
    id: string;
    name_en: string;
    name_de: string;
    description_en: string;
    description_de: string;
    active: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface Domain {
    id: string;
    test_id: string;
    name_en: string;
    name_de: string;
    description_en: string;
    description_de: string;
    display_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Facet {
    id: string;
    domain_id: string;
    name_en: string;
    name_de: string;
    description_en: string;
    description_de: string;
    display_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Question {
    id: string;
    test_id: string;
    domain_id: string;
    facet_id?: string;
    text_en: string;
    text_de: string;
    is_reverse_keyed: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserSession {
    id: string;  // UUID Primary Key
    session_id: string; // UNIQUE Text field
    language: 'en' | 'de';
    age_group?: string;
    gender?: string;
    salary?: string;
    leadership?: string;
    previously_taken: boolean;
    created_at: string;
  }
  
  export interface Response {
    id: string;
    session_id: string; // UUID referencing user_sessions.id
    test_id: string;
    question_id: string;
    response_value: number;
    created_at: string;
  }
  
  export interface Result {
    id: string;
    session_id: string; // UUID referencing user_sessions.id
    test_id: string;
    domain_id: string;
    facet_id?: string;
    score: number; // DECIMAL(5,2)
    created_at: string;
  }
  
  export interface NewsletterSubscription {
    id: string;
    email: string;
    consent_given: boolean;
    consent_date: string;
    created_at: string;
  }
  
  // Types for API responses
  export interface QuestionsPageData {
    questions: Question[];
    currentPage: number;
    totalPages: number;
  }
  
  export interface TestResult {
    domain: Domain;
    score: number;
    facetScores?: { facet: Facet; score: number }[];
  }
  
  export interface CompleteTestResult {
    test: Test;
    domainResults: TestResult[];
    sessionId: string;
  }