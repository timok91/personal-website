'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Question, Test, Domain, Facet } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const testIdFilter = searchParams.get('testId');
  const domainIdFilter = searchParams.get('domainId');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Record<string, Test>>({});
  const [domains, setDomains] = useState<Record<string, Domain>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [facets, setFacets] = useState<Record<string, Facet>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedTestId, setSelectedTestId] = useState<string | null>(testIdFilter);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(domainIdFilter);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [availableDomains, setAvailableDomains] = useState<Domain[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch all tests for reference
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .order('name_en', { ascending: true });

        if (testsError) throw testsError;
        
        // Convert tests array to a lookup object
        const testsMap = (testsData || []).reduce((acc, test) => {
          acc[test.id] = test;
          return acc;
        }, {} as Record<string, Test>);
        
        setTests(testsMap);
        setAvailableTests(testsData || []);

        // Fetch all domains for reference
        let domainsQuery = supabase.from('domains').select('*');
        
        if (testIdFilter) {
          domainsQuery = domainsQuery.eq('test_id', testIdFilter);
        }
        
        const { data: domainsData, error: domainsError } = await domainsQuery
          .order('display_order', { ascending: true });

        if (domainsError) throw domainsError;
        
        // Convert domains array to a lookup object
        const domainsMap = (domainsData || []).reduce((acc, domain) => {
          acc[domain.id] = domain;
          return acc;
        }, {} as Record<string, Domain>);
        
        setDomains(domainsMap);
        setAvailableDomains(domainsData || []);
        
        // Fetch all facets for reference
        let facetsQuery = supabase.from('facets').select('*');
        
        if (domainIdFilter) {
          facetsQuery = facetsQuery.eq('domain_id', domainIdFilter);
        } else if (testIdFilter) {
          // If test filter is applied but no domain filter, get facets for all domains of the test
          const testDomainIds = domainsData
            ?.filter(domain => domain.test_id === testIdFilter)
            .map(domain => domain.id) || [];
            
          if (testDomainIds.length > 0) {
            facetsQuery = facetsQuery.in('domain_id', testDomainIds);
          }
        }
        
        const { data: facetsData, error: facetsError } = await facetsQuery;

        if (facetsError) throw facetsError;
        
        // Convert facets array to a lookup object
        const facetsMap = (facetsData || []).reduce((acc, facet) => {
          acc[facet.id] = facet;
          return acc;
        }, {} as Record<string, Facet>);
        
        setFacets(facetsMap);

        // Build the questions query
        let query = supabase.from('questions').select('*');
        
        // Apply test filter if specified
        if (testIdFilter) {
          query = query.eq('test_id', testIdFilter);
        }
        
        // Apply domain filter if specified
        if (domainIdFilter) {
          query = query.eq('domain_id', domainIdFilter);
        }
        
        // Fetch the questions
        const { data: questionsData, error: questionsError } = await query
          .order('display_order', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testIdFilter, domainIdFilter]);

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTestId(value || null);
    setSelectedDomainId(null); // Reset domain filter when test changes
    
    // Update the URL with the new filter
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('testId', value);
      url.searchParams.delete('domainId');
    } else {
      url.searchParams.delete('testId');
      url.searchParams.delete('domainId');
    }
    window.history.pushState({}, '', url.toString());
    
    // Reload the page to apply filters
    window.location.href = url.toString();
  };
  
  const handleDomainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedDomainId(value || null);
    
    // Update the URL with the new filter
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('domainId', value);
      // Keep the testId parameter if it exists
      if (selectedTestId) {
        url.searchParams.set('testId', selectedTestId);
      }
    } else {
      url.searchParams.delete('domainId');
      // Keep the testId parameter if it exists
      if (selectedTestId) {
        url.searchParams.set('testId', selectedTestId);
      }
    }
    window.history.pushState({}, '', url.toString());
    
    // Reload the page to apply filters
    window.location.href = url.toString();
  };

  if (loading) {
    return <div className="loading-state">Loading questions...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Questions" />

      <div className="page-header">
        <h1>Manage Questions</h1>
        <Link href="/admin/questions/new" className="action-button">
          Create New Question
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="test-filter">Filter by Test:</label>
            <select 
              id="test-filter" 
              value={selectedTestId || ''} 
              onChange={handleTestChange}
              className="filter-select"
            >
              <option value="">All Tests</option>
              {availableTests.map(test => (
                <option key={test.id} value={test.id}>
                  {test.name_en}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="domain-filter">Filter by Domain:</label>
            <select 
              id="domain-filter" 
              value={selectedDomainId || ''} 
              onChange={handleDomainChange}
              className="filter-select"
              disabled={!selectedTestId}
            >
              <option value="">All Domains</option>
              {availableDomains
                .filter(domain => !selectedTestId || domain.test_id === selectedTestId)
                .map(domain => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name_en}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="admin-table-container">
        {questions.length === 0 ? (
          <div className="empty-state">
            <p>
              {selectedTestId 
                ? (selectedDomainId 
                  ? 'No questions found for this domain.' 
                  : 'No questions found for this test.')
                : 'No questions found.'}
            </p>
            <p>Create your first question to get started.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Domain</th>
                <th>Question (EN)</th>
                <th>Reverse</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id}>
                  <td>{tests[question.test_id]?.name_en || 'Unknown Test'}</td>
                  <td>{domains[question.domain_id]?.name_en || 'Unknown Domain'}</td>
                  <td>{question.text_en}</td>
                  <td>{question.is_reverse_keyed ? 'Yes' : 'No'}</td>
                  <td>{question.display_order}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}