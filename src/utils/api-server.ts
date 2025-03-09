import { cookies } from 'next/headers';
import { createClient } from './supabase/server';
import {
  Test,
  Domain,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Facet,
  Question,
  UserSession,
  Result
} from '../types/database';

// Helper to get Supabase client
const getSupabase = () => {
  const cookieStore = cookies();
  return createClient(cookieStore);
};

// Interface for newsletter subscriptions
interface NewsletterSubscription {
  id: string;
  email: string;
  consent_given: boolean;
  consent_date: string;
  created_at: string;
}

// Test management (admin operations)
export const createTest = async (test: Omit<Test, 'id' | 'created_at' | 'updated_at'>): Promise<Test> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tests')
      .insert(test)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
};

export const updateTest = async (id: string, test: Partial<Test>): Promise<Test> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tests')
      .update(test)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
};

export const deleteTest = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
};

// Domain management
export const createDomain = async (domain: Omit<Domain, 'id' | 'created_at' | 'updated_at'>): Promise<Domain> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('domains')
      .insert(domain)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating domain:', error);
    throw error;
  }
};

export const updateDomain = async (id: string, domain: Partial<Domain>): Promise<Domain> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('domains')
      .update(domain)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating domain:', error);
    throw error;
  }
};

export const deleteDomain = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting domain:', error);
    throw error;
  }
};

// Question management
export const createQuestion = async (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>): Promise<Question> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

export const updateQuestion = async (id: string, question: Partial<Question>): Promise<Question> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('questions')
      .update(question)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Result analytics (admin operations)
export const getTestResults = async (testId: string): Promise<Result[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('test_id', testId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching test results:', error);
    throw error;
  }
};

export const getAverageScoresByDomain = async (testId: string): Promise<{domain_id: string, avg_score: number}[]> => {
  try {
    const supabase = getSupabase();
    
    // Use a direct SQL query to calculate averages
    const { data, error } = await supabase.rpc('get_average_scores_by_domain', {
      test_id_param: testId
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error calculating average scores:', error);
    throw error;
  }
};

// User session management (admin operations)
export const getUserSessions = async (limit = 100, offset = 0): Promise<UserSession[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
};

export const getUserSessionById = async (sessionId: string): Promise<UserSession | null> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching user session:', error);
    throw error;
  }
};

export const deleteUserSession = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user session:', error);
    throw error;
  }
};

// Newsletter subscription management (admin operations)
export const getNewsletterSubscriptions = async (limit = 100, offset = 0): Promise<NewsletterSubscription[]> => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    throw error;
  }
};

export const deleteNewsletterSubscription = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting newsletter subscription:', error);
    throw error;
  }
};

// Function to create a database stored procedure for average scores if needed
export const createAverageScoreFunction = async (): Promise<void> => {
  try {
    const supabase = getSupabase();
    
    // SQL to create the function
    const query = `
      CREATE OR REPLACE FUNCTION get_average_scores_by_domain(test_id_param UUID)
      RETURNS TABLE (domain_id UUID, avg_score DECIMAL) AS $$
      BEGIN
        RETURN QUERY
        SELECT r.domain_id, AVG(r.score)::DECIMAL(5,2) as avg_score
        FROM results r
        WHERE r.test_id = test_id_param
        GROUP BY r.domain_id
        ORDER BY avg_score DESC;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error } = await supabase.rpc('run_sql', { sql: query });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating average score function:', error);
    throw error;
  }
};

// Function to import test data (for admin/seeding purposes)
export interface TestImportData {
  test: Omit<Test, 'id' | 'created_at' | 'updated_at'>;
  domains: Array<Omit<Domain, 'id' | 'test_id' | 'created_at' | 'updated_at'>>;
  questions: Array<{
    domain_index: number;
    facet_id?: string;
    text_en: string;
    text_de: string;
    is_reverse_keyed: boolean;
  }>;
}

export const importTestData = async (data: TestImportData): Promise<string> => {
  try {
    const supabase = getSupabase();
    
    // Insert test
    const { data: testData, error: testError } = await supabase
      .from('tests')
      .insert(data.test)
      .select('*')
      .single();
    
    if (testError) throw testError;
    const testId = testData.id;
    
    // Insert domains
    const domainsWithTestId = data.domains.map(domain => ({
      ...domain,
      test_id: testId
    }));
    
    const { data: domainData, error: domainError } = await supabase
      .from('domains')
      .insert(domainsWithTestId)
      .select('*');
    
    if (domainError) throw domainError;
    
    // Map domains to their indices for question insertion
    const domainIdMap = new Map<number, string>();
    domainData.forEach((domain, index) => {
      domainIdMap.set(index, domain.id);
    });
    
    // Insert questions
    const questionsWithIds = data.questions.map((question, index) => ({
      test_id: testId,
      domain_id: domainIdMap.get(question.domain_index) || '',
      facet_id: question.facet_id,
      text_en: question.text_en,
      text_de: question.text_de,
      is_reverse_keyed: question.is_reverse_keyed,
      display_order: index + 1
    }));
    
    const { error: questionError } = await supabase
      .from('questions')
      .insert(questionsWithIds);
    
    if (questionError) throw questionError;
    
    return testId;
  } catch (error) {
    console.error('Error importing test data:', error);
    throw error;
  }
};