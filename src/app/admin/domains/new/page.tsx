'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Test } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

// Wrapper component to use search params inside Suspense
function NewDomainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedTestId = searchParams.get('testId');
  
  const [tests, setTests] = useState<Test[]>([]);
  const [formData, setFormData] = useState({
    test_id: preSelectedTestId || '',
    name_en: '',
    name_de: '',
    description_en: '',
    description_de: '',
    display_order: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setTestsLoading(true);
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from('tests')
          .select('*')
          .order('name_en', { ascending: true });
        
        if (fetchError) throw new Error(fetchError.message);
        setTests(data || []);
        
        // If a test is pre-selected, get its highest display order
        if (preSelectedTestId) {
          const { data: domainData, error: domainError } = await supabase
            .from('domains')
            .select('display_order')
            .eq('test_id', preSelectedTestId)
            .order('display_order', { ascending: false })
            .limit(1);
            
          if (!domainError && domainData && domainData.length > 0) {
            setFormData(prev => ({
              ...prev,
              display_order: (domainData[0].display_order || 0) + 1
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, [preSelectedTestId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (name === 'display_order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.test_id) {
        throw new Error('Please select a test');
      }
      
      if (!formData.name_en.trim() || !formData.name_de.trim()) {
        throw new Error('Domain name is required in both languages');
      }

      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error: supabaseError } = await supabase
        .from('domains')
        .insert([formData])
        .select();

      if (supabaseError) throw new Error(supabaseError.message);
      
      // Redirect to the domains list page, filtered by the test
      router.push(`/admin/domains?testId=${formData.test_id}`);
    } catch (err) {
      console.error('Error creating domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to create domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb currentPageName="New Domain" />

      <div className="page-header">
        <h1>Create New Domain</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="test_id">Test</label>
          <select
            id="test_id"
            name="test_id"
            value={formData.test_id}
            onChange={handleChange}
            required
            disabled={testsLoading || tests.length === 0}
          >
            <option value="">Select a test</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name_en}
              </option>
            ))}
          </select>
          {testsLoading && <div className="field-loading">Loading tests...</div>}
          {!testsLoading && tests.length === 0 && (
            <div className="field-error">
              No tests available. Please create a test first.
            </div>
          )}
        </div>

        <div className="form-row">
          <label htmlFor="name_en">Name (English)</label>
          <input
            type="text"
            id="name_en"
            name="name_en"
            value={formData.name_en}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="name_de">Name (German)</label>
          <input
            type="text"
            id="name_de"
            name="name_de"
            value={formData.name_de}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <label htmlFor="description_en">Description (English)</label>
          <textarea
            id="description_en"
            name="description_en"
            value={formData.description_en}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="description_de">Description (German)</label>
          <textarea
            id="description_de"
            name="description_de"
            value={formData.description_de}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="display_order">Display Order</label>
          <input
            type="number"
            id="display_order"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            min="1"
            required
          />
          <div className="field-help">
            The order in which this domain will appear in the test.
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/domains" className="cancel-button">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading || tests.length === 0}
          >
            {loading ? 'Creating...' : 'Create Domain'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Main component with Suspense boundary
export default function NewDomainPage() {
  return (
    <Suspense fallback={<div className="loading-state">Loading...</div>}>
      <NewDomainContent />
    </Suspense>
  );
}