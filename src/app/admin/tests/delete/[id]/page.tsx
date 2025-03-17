'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Test } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function DeleteTestPage() {
  // Use Next.js hooks to access params
  const params = useParams();
  const testId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const router = useRouter();
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainCount, setDomainCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [responseCount, setResponseCount] = useState(0);

  useEffect(() => {
    const fetchTestAndRelatedData = async () => {
      if (!testId) return;
      
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch the test
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single();
        
        if (testError) throw new Error(testError.message);
        if (!testData) throw new Error('Test not found');
        
        setTest(testData);
        
        // Count domains
        const { count: domainCountData, error: domainError } = await supabase
          .from('domains')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId);
          
        if (domainError) throw new Error(domainError.message);
        setDomainCount(domainCountData || 0);
        
        // Count questions
        const { count: questionCountData, error: questionError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId);
          
        if (questionError) throw new Error(questionError.message);
        setQuestionCount(questionCountData || 0);
        
        // Count responses
        const { count: responseCountData, error: responseError } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId);
          
        if (responseError) throw new Error(responseError.message);
        setResponseCount(responseCountData || 0);
      } catch (err) {
        console.error('Error fetching test data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndRelatedData();
  }, [testId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      
      const supabase = createClient();
      
      // Delete associated results first (if any)
      await supabase
        .from('results')
        .delete()
        .eq('test_id', testId);
      
      // Delete associated responses (if any)
      await supabase
        .from('responses')
        .delete()
        .eq('test_id', testId);
      
      // Delete associated questions (if any)
      await supabase
        .from('questions')
        .delete()
        .eq('test_id', testId);
      
      // Delete associated facets (via domains) (if any)
      const { data: domains } = await supabase
        .from('domains')
        .select('id')
        .eq('test_id', testId);
      
      if (domains && domains.length > 0) {
        const domainIds = domains.map(domain => domain.id);
        
        await supabase
          .from('facets')
          .delete()
          .in('domain_id', domainIds);
      }
      
      // Delete associated domains (if any)
      await supabase
        .from('domains')
        .delete()
        .eq('test_id', testId);
      
      // Finally, delete the test
      const { error: deleteError } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);
      
      if (deleteError) throw new Error(deleteError.message);
      
      // Redirect back to tests page
      router.push('/admin/tests');
    } catch (err) {
      console.error('Error deleting test:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete test');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading test data...</div>;
  }

  if (!test) {
    return (
      <div className="error-state">
        <h1>Test not found</h1>
        <p>The requested test could not be found.</p>
        <Link href="/admin/tests" className="action-button">
          Back to Tests
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb currentPageName="Delete Tests" />

      <div className="page-header">
        <h1>Delete Test</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-form delete-confirmation">
        <div className="confirmation-message">
          <h2>Are you sure you want to delete this test?</h2>
          <p className="warning">This action cannot be undone.</p>
          
          <div className="test-details">
            <p><strong>Test Name (EN):</strong> {test.name_en}</p>
            <p><strong>Test Name (DE):</strong> {test.name_de}</p>
            <p><strong>Status:</strong> {test.active ? 'Active' : 'Inactive'}</p>
            <p><strong>Created:</strong> {new Date(test.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="related-data">
            <h3>Related Data to be Deleted:</h3>
            <ul>
              <li>{domainCount} domain{domainCount !== 1 ? 's' : ''}</li>
              <li>{questionCount} question{questionCount !== 1 ? 's' : ''}</li>
              <li>{responseCount} user response{responseCount !== 1 ? 's' : ''}</li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/tests" className="cancel-button">
            Cancel
          </Link>
          <button 
            type="button" 
            className="delete-button" 
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}