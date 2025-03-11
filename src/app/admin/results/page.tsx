/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Breadcrumb from '@/components/admin/Breadcrumb';

interface ResultData {
  id: string;
  session_id: string;
  test_id: string;
  domain_id: string;
  facet_id?: string;
  score: number;
  created_at: string;
  test_name?: string;
  domain_name?: string;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const testIdFilter = searchParams.get('testId');
  
  const [results, setResults] = useState<ResultData[]>([]);
  const [tests, setTests] = useState<Record<string, any>>({});
  const [domains, setDomains] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedTestId, setSelectedTestId] = useState<string | null>(testIdFilter);
  const [availableTests, setAvailableTests] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // Fetch all tests for reference and filtering
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .order('name_en', { ascending: true });

        if (testsError) throw testsError;
        
        // Convert tests array to a lookup object
        const testsMap = (testsData || []).reduce((acc, test) => {
          acc[test.id] = test;
          return acc;
        }, {} as Record<string, any>);
        
        setTests(testsMap);
        setAvailableTests(testsData || []);

        // Fetch all domains for reference
        const { data: domainsData, error: domainsError } = await supabase
          .from('domains')
          .select('*');

        if (domainsError) throw domainsError;
        
        // Convert domains array to a lookup object
        const domainsMap = (domainsData || []).reduce((acc, domain) => {
          acc[domain.id] = domain;
          return acc;
        }, {} as Record<string, any>);
        
        setDomains(domainsMap);

        // Build the results query
        let query = supabase.from('results').select('*');
        
        // Apply test filter if specified
        if (testIdFilter) {
          query = query.eq('test_id', testIdFilter);
        }
        
        // Fetch the results
        const { data: resultsData, error: resultsError } = await query
          .order('created_at', { ascending: false })
          .limit(100); // Limit to 100 results for performance

        if (resultsError) throw resultsError;
        
        // Enrich results with test and domain names
        const enrichedResults = (resultsData || []).map(result => ({
          ...result,
          test_name: testsMap[result.test_id]?.name_en || 'Unknown Test',
          domain_name: domainsMap[result.domain_id]?.name_en || 'Unknown Domain'
        }));
        
        setResults(enrichedResults);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testIdFilter]);

  const handleTestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTestId(value || null);
    
    // Update the URL with the new filter
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set('testId', value);
    } else {
      url.searchParams.delete('testId');
    }
    window.history.pushState({}, '', url.toString());
    
    // Reload the page to apply filters
    window.location.href = url.toString();
  };

  if (loading) {
    return <div className="loading-state">Loading results...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Results" />
      
      <div className="page-header">
        <h1>Test Results</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filter-container">
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
      
      <div className="admin-table-container">
        {results.length === 0 ? (
          <div className="empty-state">
            <p>
              {selectedTestId 
                ? 'No results found for this test.'
                : 'No results found.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Test</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>
                    <Link href={`/admin/users/view/${result.session_id}`}>
                      {result.session_id.substring(0, 8)}...
                    </Link>
                  </td>
                  <td>{result.test_name}</td>
                  <td>{result.domain_name}</td>
                  <td>{result.score.toFixed(1)}%</td>
                  <td>{new Date(result.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}