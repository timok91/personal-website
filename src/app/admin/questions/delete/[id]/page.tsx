'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Question, Domain, Test } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function DeleteQuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const questionId = params.id;
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch the question
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .single();
        
        if (questionError) throw new Error(questionError.message);
        if (!questionData) throw new Error('Question not found');
        
        setQuestion(questionData);
        
        // Fetch the test
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', questionData.test_id)
          .single();
        
        if (testError) throw new Error(testError.message);
        setTest(testData);
        
        // Fetch the domain
        const { data: domainData, error: domainError } = await supabase
          .from('domains')
          .select('*')
          .eq('id', questionData.domain_id)
          .single();
        
        if (domainError) throw new Error(domainError.message);
        setDomain(domainData);
        
      } catch (err) {
        console.error('Error fetching question data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load question data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [questionId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      
      const supabase = createClient();
      
      // Delete the question
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);
      
      if (deleteError) throw new Error(deleteError.message);
      
      // Redirect back to questions page
      router.push(`/admin/questions?testId=${question?.test_id}&domainId=${question?.domain_id}`);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete question');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading question data...</div>;
  }

  if (!question || !test || !domain) {
    return (
      <div className="error-state">
        <h1>Question not found</h1>
        <p>The requested question could not be found.</p>
        <Link href="/admin/questions" className="action-button">
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb currentPageName="Delete Questions" />

      <div className="page-header">
        <h1>Delete Question</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-form delete-confirmation">
        <div className="confirmation-message">
          <h2>Are you sure you want to delete this question?</h2>
          <p className="warning">This action cannot be undone.</p>
          
          <div className="question-details">
            <p><strong>Test:</strong> {test.name_en}</p>
            <p><strong>Domain:</strong> {domain.name_en}</p>
            <p><strong>Question (EN):</strong> {question.text_en}</p>
            <p><strong>Question (DE):</strong> {question.text_de}</p>
            <p><strong>Reverse-Keyed:</strong> {question.is_reverse_keyed ? 'Yes' : 'No'}</p>
            <p><strong>Display Order:</strong> {question.display_order}</p>
          </div>
        </div>

        <div className="form-actions">
          <Link href={`/admin/questions?testId=${question.test_id}&domainId=${question.domain_id}`} className="cancel-button">
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