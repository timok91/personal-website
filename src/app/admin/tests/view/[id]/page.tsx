'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Test, Domain, Question } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function ViewTestPage({ params }: { params: { id: string } }) {
  const testId = params.id;
  
  const [test, setTest] = useState<Test | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats
  const [responseCount, setResponseCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);

  useEffect(() => {
    const fetchTestData = async () => {
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
        
        // Fetch domains
        const { data: domainData, error: domainError } = await supabase
          .from('domains')
          .select('*')
          .eq('test_id', testId)
          .order('display_order', { ascending: true });
        
        if (domainError) throw new Error(domainError.message);
        setDomains(domainData || []);
        
        // Fetch questions
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .select('*')
          .eq('test_id', testId)
          .order('display_order', { ascending: true });
        
        if (questionError) throw new Error(questionError.message);
        setQuestions(questionData || []);
        
        // Get response stats
        const { count: responseCountData, error: responseError } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('test_id', testId);
        
        if (responseError) throw new Error(responseError.message);
        setResponseCount(responseCountData || 0);
        
        // Get completed tests count (estimate by counting distinct session_ids in results)
        const { data: completedData, error: completedError } = await supabase
          .from('results')
          .select('session_id')
          .eq('test_id', testId);
        
        if (completedError) throw new Error(completedError.message);
        
        // Count unique session IDs
        const uniqueSessions = new Set();
        completedData?.forEach(result => uniqueSessions.add(result.session_id));
        setCompletedCount(uniqueSessions.size);
        
      } catch (err) {
        console.error('Error fetching test data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  if (loading) {
    return <div className="loading-state">Loading test details...</div>;
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
      <Breadcrumb currentPageName="View Tests" />

      <div className="page-header">
        <h1>Test Details</h1>
        <div className="header-actions">
          <Link href={`/admin/tests/edit/${testId}`} className="action-button">
            Edit Test
          </Link>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="test-details-container">
        <div className="test-info admin-table-container">
          <h2>{test.name_en} / {test.name_de}</h2>
          <div className="status-badge-container">
            <span className={`status-badge ${test.active ? 'active' : 'inactive'}`}>
              {test.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="test-meta">
            <p><strong>Created:</strong> {new Date(test.created_at).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> {new Date(test.updated_at).toLocaleDateString()}</p>
            <p><strong>Total Responses:</strong> {responseCount}</p>
            <p><strong>Completed Tests:</strong> {completedCount}</p>
          </div>
          
          <div className="test-descriptions">
            <div className="description-section">
              <h3>English Description</h3>
              <p>{test.description_en || 'No description available'}</p>
            </div>
            <div className="description-section">
              <h3>German Description</h3>
              <p>{test.description_de || 'No description available'}</p>
            </div>
          </div>
        </div>
        
        <div className="domain-section admin-table-container">
          <div className="section-header">
            <h2>Domains ({domains.length})</h2>
            <Link href={`/admin/domains/new?testId=${testId}`} className="action-button small">
              Add Domain
            </Link>
          </div>
          
          {domains.length === 0 ? (
            <div className="empty-state">
              <p>No domains found for this test.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Name (EN)</th>
                  <th>Name (DE)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td>{domain.display_order}</td>
                    <td>{domain.name_en}</td>
                    <td>{domain.name_de}</td>
                    <td>
                      <div className="table-actions">
                        <Link 
                          href={`/admin/domains/edit/${domain.id}`}
                          className="action-icon edit"
                          title="Edit domain"
                        >
                          ✏️
                        </Link>
                        <Link 
                          href={`/admin/domains/view/${domain.id}`}
                          className="action-icon view"
                          title="View domain details"
                        >
                          👁️
                        </Link>
                        <Link 
                          href={`/admin/domains/delete/${domain.id}`}
                          className="action-icon delete"
                          title="Delete domain"
                        >
                          🗑️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="questions-section admin-table-container">
          <div className="section-header">
            <h2>Questions ({questions.length})</h2>
            <Link href={`/admin/questions/new?testId=${testId}`} className="action-button small">
              Add Question
            </Link>
          </div>
          
          {questions.length === 0 ? (
            <div className="empty-state">
              <p>No questions found for this test.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Question (EN)</th>
                  <th>Domain</th>
                  <th>Reverse Keyed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => {
                  // Find the domain for this question
                  const domain = domains.find(d => d.id === question.domain_id);
                  
                  return (
                    <tr key={question.id}>
                      <td>{question.display_order}</td>
                      <td>{question.text_en}</td>
                      <td>{domain ? domain.name_en : 'Unknown'}</td>
                      <td>{question.is_reverse_keyed ? 'Yes' : 'No'}</td>
                      <td>
                        <div className="table-actions">
                          <Link 
                            href={`/admin/questions/edit/${question.id}`}
                            className="action-icon edit"
                            title="Edit question"
                          >
                            ✏️
                          </Link>
                          <Link 
                            href={`/admin/questions/delete/${question.id}`}
                            className="action-icon delete"
                            title="Delete question"
                          >
                            🗑️
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}