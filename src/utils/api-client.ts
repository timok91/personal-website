import { v4 as uuidv4 } from 'uuid';
import { createClient } from './supabase/client';
import {
  Test,
  Domain,
  Facet,
  Question,
  UserSession,
  QuestionsPageData,
  TestResult,
  CompleteTestResult
} from '../types/database'; 

// Constants
const QUESTIONS_PER_PAGE = 10;

// Helper to check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock data for client-side rendering when Supabase is not available
const MOCK_TESTS: Test[] = [
  {
    id: '1',
    name_en: 'Big Five Personality Test',
    name_de: 'Big Five Persönlichkeitstest',
    description_en: 'Measure your personality across five major dimensions.',
    description_de: 'Messen Sie Ihre Persönlichkeit anhand von fünf wichtigen Dimensionen.',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_DOMAINS: Domain[] = [
  {
    id: '1',
    test_id: '1',
    name_en: 'Openness',
    name_de: 'Offenheit',
    description_en: 'Openness reflects your willingness to embrace new ideas and experiences.',
    description_de: 'Offenheit spiegelt Ihre Bereitschaft wider, neue Ideen und Erfahrungen anzunehmen.',
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    test_id: '1',
    name_en: 'Conscientiousness',
    name_de: 'Gewissenhaftigkeit',
    description_en: 'Conscientiousness reflects your tendency to be organized, responsible, and hardworking.',
    description_de: 'Gewissenhaftigkeit spiegelt Ihre Tendenz wider, organisiert, verantwortungsbewusst und fleißig zu sein.',
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    test_id: '1',
    domain_id: '1',
    text_en: 'I enjoy trying new activities.',
    text_de: 'Ich genieße es, neue Aktivitäten auszuprobieren.',
    is_reverse_keyed: false,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    test_id: '1',
    domain_id: '1',
    text_en: 'I prefer familiar routines over new experiences.',
    text_de: 'Ich bevorzuge vertraute Routinen gegenüber neuen Erfahrungen.',
    is_reverse_keyed: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Session management
export const createUserSession = async (
  language: 'en' | 'de',
  sessionId = uuidv4()
): Promise<string> => {
  try {
    const supabase = createClient();
    
    // Create the session
     
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        session_id: sessionId,
        language,
        previously_taken: false // Explicitly initialize as false
      })
      .select('id');
    
    if (error) {
      // Handle potential unique constraint violation
      if (error.code === '23505') {
        console.log('Session ID already exists, using existing session');
      } else {
        console.error('Error creating user session:', error);
      }
    }
    
    // Store session data if creation was successful
    if (data && data.length > 0) {
      if (isBrowser) {
        localStorage.setItem('personality_test_session', sessionId);
        localStorage.setItem('personality_test_language', language);
        localStorage.setItem('personality_test_session_id', data[0].id);
      }
      return sessionId;
    }
    
    // Try to get the session ID from the database
    try {
      const { data: sessionData } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .limit(1);
      
      if (sessionData && sessionData.length > 0) {
        if (isBrowser) {
          localStorage.setItem('personality_test_session', sessionId);
          localStorage.setItem('personality_test_language', language);
          localStorage.setItem('personality_test_session_id', sessionData[0].id);
        }
      }
    } catch (sessionError) {
      console.error('Error fetching session data:', sessionError);
    }
    
    // Store in localStorage for future use
    if (isBrowser) {
      localStorage.setItem('personality_test_session', sessionId);
      localStorage.setItem('personality_test_language', language);
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error in createUserSession:', error);
    
    // Fallback to using local storage
    if (isBrowser) {
      localStorage.setItem('personality_test_session', sessionId);
      localStorage.setItem('personality_test_language', language);
    }
    
    return sessionId;
  }
};

// Helper function to get user session ID
const getUserSessionId = async (sessionId: string): Promise<string> => {
  // First try to get from localStorage for performance
  if (isBrowser) {
    const storedId = localStorage.getItem('personality_test_session_id');
    if (storedId) {
      console.log('Using session ID from localStorage:', storedId);
      return storedId;
    }
  }
  
  try {
    console.log('Fetching session ID from Supabase for session_id:', sessionId);
    const supabase = createClient();
    
    // First, try to get the session by session_id
    const { data, error } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1);
    
    if (error) {
      console.error('Error fetching session by session_id:', error);
      throw new Error(`Error fetching session: ${error.message}`);
    }
    
    // If no session found, create one
    if (!data || data.length === 0) {
      console.log('No session found, creating a new one for session_id:', sessionId);
      // Create a new session with minimal data
      const language = isBrowser ? localStorage.getItem('personality_test_language') || 'en' : 'en';
      
      // Set the seed values for a new session
      const sessionData = {
        session_id: sessionId,
        language,
        previously_taken: false // Default to false for new sessions
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('user_sessions')
        .insert(sessionData)
        .select('id');
      
      if (insertError || !newData || newData.length === 0) {
        console.error('Could not create session:', insertError);
        throw new Error(`Could not create session: ${insertError?.message || 'Unknown error'}`);
      }
      
      const newSessionId = newData[0].id;
      console.log('Created new session with ID:', newSessionId);
      
      if (isBrowser) {
        localStorage.setItem('personality_test_session_id', newSessionId);
      }
      
      return newSessionId;
    }
    
    // Session found - store for future use
    const dbSessionId = data[0].id;
    console.log('Found existing session with ID:', dbSessionId);
    
    if (isBrowser) {
      localStorage.setItem('personality_test_session_id', dbSessionId);
    }
    
    return dbSessionId;
  } catch (error) {
    console.error('Failed to get user session ID:', error);
    
    // The fallback approach is problematic because it creates a non-existent ID
    // Instead, create a real session in the database as a fallback
    try {
      console.log('Attempting to create fallback session for:', sessionId);
      const supabase = createClient();
      const language = isBrowser ? localStorage.getItem('personality_test_language') || 'en' : 'en';
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          language,
          previously_taken: false
        })
        .select('id');
      
      if (error || !data || data.length === 0) {
        console.error('Failed to create fallback session:', error);
        // Only as a last resort, use a local UUID
        const fallbackId = uuidv4();
        console.log('Using local fallback UUID as last resort:', fallbackId);
        if (isBrowser) {
          localStorage.setItem('personality_test_session_id', fallbackId);
        }
        return fallbackId;
      }
      
      const newId = data[0].id;
      console.log('Created fallback session with ID:', newId);
      if (isBrowser) {
        localStorage.setItem('personality_test_session_id', newId);
      }
      return newId;
    } catch (fallbackError) {
      console.error('Complete failure in session management:', fallbackError);
      const emergencyId = uuidv4();
      if (isBrowser) {
        localStorage.setItem('personality_test_session_id', emergencyId);
      }
      return emergencyId;
    }
  }
};

export const updateUserSession = async (
  sessionId: string,
  data: Partial<UserSession>
): Promise<void> => {
  try {
    // First, get the actual database ID using the helper function
    const userSessionId = await getUserSessionId(sessionId);
    
    // Clean up object for database update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedData: Record<string, any> = {};
    
    // Handle each field explicitly to ensure proper naming and types
    if (data.age !== undefined) formattedData.age = Number(data.age);
    if (data.gender !== undefined) formattedData.gender = data.gender;
    if (data.salary !== undefined) formattedData.salary = data.salary;
    if (data.leadership !== undefined) formattedData.leadership = data.leadership;
    
    // Handle previously_taken explicitly - ensure it's a proper boolean value
    if ('previously_taken' in data) {
      // Direct property name (snake_case)
      formattedData.previously_taken = data.previously_taken === true;
    } else if ('previouslyTaken' in data) {
      // Camel case property name - handle type conversion safely
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (data as any).previouslyTaken;
      formattedData.previously_taken = value === true;
    }
    
    console.log('Updating session with formatted data:', formattedData);
    console.log('Using session ID:', userSessionId);
    
    const supabase = createClient();
    
    // Update using the database ID, not the session_id string
    const { data: updatedData, error } = await supabase
      .from('user_sessions')
      .update(formattedData)
      .eq('id', userSessionId)
      .select(); // Add select to get the updated data for verification
    
    if (error) {
      console.error('Error updating user session:', error);
      // Try alternative approach - update by session_id instead of id
      const { error: altError } = await supabase
        .from('user_sessions')
        .update(formattedData)
        .eq('session_id', sessionId);
      
      if (altError) {
        console.error('Alternative update also failed:', altError);
        
        // Fallback to localStorage
        if (isBrowser) {
          localStorage.setItem(`personality_test_${sessionId}_data`, JSON.stringify(formattedData));
        }
      } else {
        console.log('Update succeeded using session_id instead of id');
      }
    } else {
      console.log('Successfully updated user session:', updatedData);
    }
  } catch (error) {
    console.error('Error in updateUserSession:', error);
    
    // Fallback to localStorage
    if (isBrowser) {
      localStorage.setItem(`personality_test_${sessionId}_data`, JSON.stringify(data));
    }
  }
};

// Test management
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getActiveTests = async (language: 'en' | 'de'): Promise<Test[]> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || MOCK_TESTS;
  } catch (error) {
    console.error('Error fetching active tests:', error);
    // Return mock data in case of error
    return MOCK_TESTS;
  }
};

export const getTestById = async (testId: string): Promise<Test> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching test by ID:', error);
    // Return mock test
    return MOCK_TESTS.find(test => test.id === testId) || MOCK_TESTS[0];
  }
};

export const getDomainsForTest = async (testId: string): Promise<Domain[]> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('test_id', testId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching domains for test:', error);
    // Return mock domains
    return MOCK_DOMAINS.filter(domain => domain.test_id === testId);
  }
};

export const getFacetsForDomain = async (domainId: string): Promise<Facet[]> => {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('facets')
      .select('*')
      .eq('domain_id', domainId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching facets for domain:', error);
    return [];
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
    const supabase = createClient();
    
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
      totalPages: totalPages || 1
    };
  } catch (error) {
    console.error('Error fetching questions for page:', error);
    // Return mock questions
    const mockQuestions = MOCK_QUESTIONS.filter(question => question.test_id === testId);
    const totalPages = Math.ceil(mockQuestions.length / QUESTIONS_PER_PAGE);
    const startAt = page * QUESTIONS_PER_PAGE;
    const endAt = startAt + QUESTIONS_PER_PAGE;
    
    return {
      questions: mockQuestions.slice(startAt, endAt),
      currentPage: page,
      totalPages: totalPages || 1
    };
  }
};

// Response management
export const saveResponses = async (
  sessionId: string,
  testId: string,
  responses: Record<string, number>
): Promise<void> => {
  try {
    // Get the user_session id using our helper function
    const userSessionId = await getUserSessionId(sessionId);
    
    // Prepare the responses with the user_session id
    const responsesToInsert = Object.entries(responses).map(([questionId, value]) => ({
      session_id: userSessionId, // Use the UUID from user_sessions.id
      test_id: testId,
      question_id: questionId,
      response_value: value
    }));
    
    const supabase = createClient();
    const { error } = await supabase
      .from('responses')
      .insert(responsesToInsert);

    if (error) {
      console.error('Error saving responses to Supabase:', error);
      // Save to localStorage as fallback
      if (isBrowser) {
        const existingResponses = JSON.parse(localStorage.getItem(`personality_test_${sessionId}_responses`) || '{}');
        localStorage.setItem(`personality_test_${sessionId}_responses`, JSON.stringify({
          ...existingResponses,
          ...responses
        }));
      }
    }
  } catch (error) {
    console.error('Error saving responses:', error);
    // Save to localStorage as fallback
    if (isBrowser) {
      const existingResponses = JSON.parse(localStorage.getItem(`personality_test_${sessionId}_responses`) || '{}');
      localStorage.setItem(`personality_test_${sessionId}_responses`, JSON.stringify({
        ...existingResponses,
        ...responses
      }));
    }
  }
};

// Results calculation and storage
export const calculateAndSaveResults = async (
  sessionId: string,
  testId: string
): Promise<CompleteTestResult> => {
  // If not in browser environment, return mock data
  if (!isBrowser) {
    return {
      test: MOCK_TESTS[0],
      domainResults: MOCK_DOMAINS.map(domain => ({
        domain,
        score: 75 // Default score
      })),
      sessionId
    };
  }
  
  try {
    const supabase = createClient();
    
    // Get the test
    const test = await getTestById(testId);
    
    // Get all domains for the test
    const domains = await getDomainsForTest(testId);
    
    // Get the user_session id using our helper function
    const userSessionId = await getUserSessionId(sessionId);
    
    // Get all responses with their associated questions
    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .select(`
        *,
        questions (*)
      `)
      .eq('session_id', userSessionId) // Use the UUID
      .eq('test_id', testId);

    if (responseError) throw responseError;
    
    const responses = responseData || [];
    
    // Initialize results
    const domainResults: TestResult[] = [];
    
    // Calculate scores for each domain
    for (const domain of domains) {
      // Filter responses for this domain
      const domainResponses = responses.filter(
        (response) => (response.questions as Question).domain_id === domain.id
      );
      
      if (!domainResponses || domainResponses.length === 0) {
        // Add a default score for domains without responses
        domainResults.push({
          domain,
          score: 50 // Default score for domains without responses
        });
        continue;
      }
      
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
          session_id: userSessionId, // Use the UUID
          test_id: testId,
          domain_id: domain.id,
          score: percentageScore
        });
      
      if (insertError) {
        console.error('Error saving results to Supabase:', insertError);
        // Save to localStorage as fallback
        if (isBrowser) {
          const resultsKey = `personality_test_${sessionId}_results`;
          const existingResults = JSON.parse(localStorage.getItem(resultsKey) || '[]');
          existingResults.push({
            domain_id: domain.id,
            score: percentageScore
          });
          localStorage.setItem(resultsKey, JSON.stringify(existingResults));
        }
      }
      
      // Add to results array
      domainResults.push({
        domain,
        score: percentageScore
      });
    }
    
    return {
      test,
      domainResults,
      sessionId
    };
  } catch (error) {
    console.error('Error calculating and saving results:', error);
    
    // Fallback: Generate mock results
    const test = await getTestById(testId);
    const domains = await getDomainsForTest(testId);
    
    const domainResults: TestResult[] = domains.map(domain => ({
      domain,
      score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
    }));
    
    return {
      test,
      domainResults,
      sessionId
    };
  }
};

// Newsletter subscription
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email,
        consent_given: true,
        consent_date: new Date().toISOString()
      });

    if (error) {
      if (error.message?.includes('duplicate')) {
        throw new Error('Email is already subscribed to the newsletter');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};