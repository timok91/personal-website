import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import {
  Test,
  Domain,
  Facet,
  Question,
  UserSession,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Response as TestResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Result,
  QuestionsPageData,
  TestResult,
  CompleteTestResult
} from '../types/database'; 

// Constants
const QUESTIONS_PER_PAGE = 10;

// Helper to get Supabase client
const getSupabase = () => {
  const cookieStore = cookies();
  return createClient(cookieStore);
};

// Session management
export const createUserSession = async (
  language: 'en' | 'de',
  sessionId = uuidv4()
): Promise<string> => {
  try {
    const supabase = getSupabase();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        session_id: sessionId,
        language
      })
      .select('id')
      .single();

    if (error) throw error;
    return sessionId;
  } catch (error) {
    console.error('Error creating user session:', error);
    throw error;
  }
};

export const updateUserSession = async (
  sessionId: string,
  data: Partial<UserSession>
): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('user_sessions')
      .update(data)
      .eq('session_id', sessionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user session:', error);
    throw error;
  }
};

// Test management
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getActiveTests = async (language: 'en' | 'de'): Promise<Test[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active tests:', error);
    throw error;
  }
};

export const getTestById = async (testId: string): Promise<Test> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching test by ID:', error);
    throw error;
  }
};

export const getDomainsForTest = async (testId: string): Promise<Domain[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('test_id', testId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching domains for test:', error);
    throw error;
  }
};

export const getFacetsForDomain = async (domainId: string): Promise<Facet[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('facets')
      .select('*')
      .eq('domain_id', domainId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching facets for domain:', error);
    throw error;
  }
};

// Question management
export const getQuestionsForPage = async (
  testId: string,
  page: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: 'en' | 'de'
): Promise<QuestionsPageData> => {
  try {
    const supabase = getSupabase();
    
    // Get the total number of questions to calculate total pages
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId);

    if (countError) throw countError;
    
    const totalPages = Math.ceil((count || 0) / QUESTIONS_PER_PAGE);
    const startAt = page * QUESTIONS_PER_PAGE;
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('display_order', { ascending: true })
      .range(startAt, startAt + QUESTIONS_PER_PAGE - 1);

    if (error) throw error;

    return {
      questions: data || [],
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching questions for page:', error);
    throw error;
  }
};

// Response management
export const saveResponses = async (
  sessionId: string,
  testId: string,
  responses: Record<string, number>
): Promise<void> => {
  try {
    const supabase = getSupabase();
    const responsesToInsert = Object.entries(responses).map(([questionId, value]) => ({
      session_id: sessionId,
      test_id: testId,
      question_id: questionId,
      response_value: value
    }));

    const { error } = await supabase
      .from('responses')
      .insert(responsesToInsert);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving responses:', error);
    throw error;
  }
};

// Results calculation and storage
export const calculateAndSaveResults = async (
  sessionId: string,
  testId: string
): Promise<CompleteTestResult> => {
  try {
    const supabase = getSupabase();
    
    // Get the test
    const test = await getTestById(testId);
    
    // Get all domains for the test
    const domains = await getDomainsForTest(testId);
    
    // Get all responses
    const { data: responses, error: responseError } = await supabase
      .from('responses')
      .select('*, questions(*)')
      .eq('session_id', sessionId)
      .eq('test_id', testId);

    if (responseError) throw responseError;
    
    // Initialize results
    const domainResults: TestResult[] = [];
    
    // Calculate scores for each domain
    for (const domain of domains) {
      // Filter responses for this domain
      const domainResponses = responses?.filter(
        (response) => (response.questions as Question).domain_id === domain.id
      );
      
      if (!domainResponses || domainResponses.length === 0) continue;
      
      // Calculate the score
      let totalScore = 0;
      
      for (const response of domainResponses) {
        const question = response.questions as Question;
        const value = response.response_value;
        
        // Handle reverse keyed questions
        if (question.is_reverse_keyed) {
          totalScore += (9 - value); // 8-point scale: 8 becomes 1, 7 becomes 2, etc.
        } else {
          totalScore += value;
        }
      }
      
      // Calculate percentage score (0-100)
      const maxPossibleScore = domainResponses.length * 8; // 8 is the max value on our scale
      const percentageScore = (totalScore / maxPossibleScore) * 100;
      
      // Save to database
      const { error: insertError } = await supabase
        .from('results')
        .insert({
          session_id: sessionId,
          test_id: testId,
          domain_id: domain.id,
          score: percentageScore
        });
      
      if (insertError) throw insertError;
      
      // Add to results array
      domainResults.push({
        domain,
        score: percentageScore
      });
      
      // TODO: Calculate facet scores if needed in the future
    }
    
    return {
      test,
      domainResults,
      sessionId
    };
  } catch (error) {
    console.error('Error calculating and saving results:', error);
    throw error;
  }
};

// Newsletter subscription
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        consent_given: true
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};