'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Domain, Test } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

// Inner component that uses search params
function DomainsContent() {
  const searchParams = useSearchParams();
  const testIdFilter = searchParams.get('testId');
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [tests, setTests] = useState<Record<string, Test>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(testIdFilter);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        // First fetch all the tests for reference
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

        // Build the query
        let query = supabase.from('domains').select('*');
        
        // Apply test filter if specified
        if (testIdFilter) {
          query = query.eq('test_id', testIdFilter);
        }
        
        // Fetch the domains
        const { data: domainsData, error: domainsError } = await query
          .order('display_order', { ascending: true });

        if (domainsError) throw domainsError;
        setDomains(domainsData || []);
      } catch (err) {
        console.error('Error fetching domains:', err);
        setError('Failed to load domains. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
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
    
    // Reload domains with the new filter
    setLoading(true);
    const fetchFilteredDomains = async () => {
      try {
        const supabase = createClient();
        let query = supabase.from('domains').select('*');
        
        if (value) {
          query = query.eq('test_id', value);
        }
        
        const { data, error: domainsError } = await query
          .order('display_order', { ascending: true });
          
        if (domainsError) throw domainsError;
        setDomains(data || []);
      } catch (err) {
        console.error('Error fetching filtered domains:', err);
        setError('Failed to load domains. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilteredDomains();
  };

  if (loading) {
    return <div className="loading-state">Loading domains...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Domains" />

      <div className="page-header">
        <h1>Manage Domains</h1>
        <Link href="/admin/domains/new" className="action-button">
          Create New Domain
        </Link>
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
        {domains.length === 0 ? (
          <div className="empty-state">
            <p>
              {selectedTestId 
                ? 'No domains found for this test. Create your first domain to get started.' 
                : 'No domains found. Create your first domain to get started.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Name (EN)</th>
                <th>Name (DE)</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={domain.id}>
                  <td>{tests[domain.test_id]?.name_en || 'Unknown Test'}</td>
                  <td>{domain.name_en}</td>
                  <td>{domain.name_de}</td>
                  <td>{domain.display_order}</td>
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
    </div>
  );
}

// Main component with Suspense boundary
export default function DomainsPage() {
  return (
    <Suspense fallback={<div className="loading-state">Loading domains...</div>}>
      <DomainsContent />
    </Suspense>
  );
}