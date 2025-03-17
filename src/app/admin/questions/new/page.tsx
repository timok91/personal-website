/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Test, Domain, Facet } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

// Inner component that uses search params
function NewQuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedTestId = searchParams.get('testId');
  const preSelectedDomainId = searchParams.get('domainId');
  
  const [tests, setTests] = useState<Test[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [facets, setFacets] = useState<Facet[]>([]);
  const [filteredFacets, setFilteredFacets] = useState<Facet[]>([]);
  
  const [formData, setFormData] = useState({
    test_id: preSelectedTestId || '',
    domain_id: preSelectedDomainId || '',
    facet_id: '',
    text_en: '',
    text_de: '',
    is_reverse_keyed: false,
    display_order: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [testsLoading, setTestsLoading] = useState(true);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [facetsLoading, setFacetsLoading] = useState(false);
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
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setTestsLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Fetch domains when test changes
  useEffect(() => {
    const fetchDomains = async () => {
      if (!formData.test_id) {
        setDomains([]);
        setFilteredDomains([]);
        return;
      }
      
      try {
        setDomainsLoading(true);
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from('domains')
          .select('*')
          .eq('test_id', formData.test_id)
          .order('display_order', { ascending: true });
        
        if (fetchError) throw new Error(fetchError.message);
        setDomains(data || []);
        setFilteredDomains(data || []);
        
        // If we have domains and a pre-selected domain ID, get the highest display order
        if (data && data.length > 0 && preSelectedDomainId) {
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .select('display_order')
            .eq('domain_id', preSelectedDomainId)
            .order('display_order', { ascending: false })
            .limit(1);
            
          if (!questionError && questionData && questionData.length > 0) {
            setFormData(prev => ({
              ...prev,
              display_order: (questionData[0].display_order || 0) + 1
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching domains:', err);
        setError('Failed to load domains. Please try again.');
      } finally {
        setDomainsLoading(false);
      }
    };

    fetchDomains();
  }, [formData.test_id, preSelectedDomainId]);

  // Fetch facets when domain changes
  useEffect(() => {
    const fetchFacets = async () => {
      if (!formData.domain_id) {
        setFacets([]);
        setFilteredFacets([]);
        return;
      }
      
      try {
        setFacetsLoading(true);
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from('facets')
          .select('*')
          .eq('domain_id', formData.domain_id)
          .order('display_order', { ascending: true });
        
        if (fetchError) throw new Error(fetchError.message);
        setFacets(data || []);
        setFilteredFacets(data || []);
      } catch (err) {
        console.error('Error fetching facets:', err);
        setError('Failed to load facets. Please try again.');
      } finally {
        setFacetsLoading(false);
      }
    };

    fetchFacets();
  }, [formData.domain_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'display_order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // If test_id changes, reset domain_id and facet_id
    if (name === 'test_id') {
      setFormData(prev => ({ 
        ...prev, 
        domain_id: '', 
        facet_id: '' 
      }));
    }
    
    // If domain_id changes, reset facet_id
    if (name === 'domain_id') {
      setFormData(prev => ({ 
        ...prev, 
        facet_id: '' 
      }));
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
      
      if (!formData.domain_id) {
        throw new Error('Please select a domain');
      }
      
      if (!formData.text_en.trim() || !formData.text_de.trim()) {
        throw new Error('Question text is required in both languages');
      }

      const supabase = createClient();
      // Create the data to be submitted
      const submitData = {
        ...formData,
        // If facet_id is empty string, set it to null instead
        facet_id: formData.facet_id || null
      };

      const { data, error: supabaseError } = await supabase
        .from('questions')
        .insert([submitData])
        .select();

      if (supabaseError) throw new Error(supabaseError.message);
      
      // Redirect to the questions list page, filtered by the domain
      router.push(`/admin/questions?testId=${formData.test_id}&domainId=${formData.domain_id}`);
    } catch (err) {
      console.error('Error creating question:', err);
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb currentPageName="New Questions" />

      <div className="page-header">
        <h1>Create New Question</h1>
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
          <label htmlFor="domain_id">Domain</label>
          <select
            id="domain_id"
            name="domain_id"
            value={formData.domain_id}
            onChange={handleChange}
            required
            disabled={domainsLoading || filteredDomains.length === 0 || !formData.test_id}
          >
            <option value="">Select a domain</option>
            {filteredDomains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name_en}
              </option>
            ))}
          </select>
          {domainsLoading && <div className="field-loading">Loading domains...</div>}
          {!domainsLoading && formData.test_id && filteredDomains.length === 0 && (
            <div className="field-error">
              No domains available for this test. Please create a domain first.
            </div>
          )}
        </div>

        <div className="form-row">
          <label htmlFor="facet_id">Facet (Optional)</label>
          <select
            id="facet_id"
            name="facet_id"
            value={formData.facet_id}
            onChange={handleChange}
            disabled={facetsLoading || filteredFacets.length === 0 || !formData.domain_id}
          >
            <option value="">No Facet</option>
            {filteredFacets.map((facet) => (
              <option key={facet.id} value={facet.id}>
                {facet.name_en}
              </option>
            ))}
          </select>
          {facetsLoading && <div className="field-loading">Loading facets...</div>}
        </div>

        <div className="form-row">
          <label htmlFor="text_en">Question Text (English)</label>
          <textarea
            id="text_en"
            name="text_en"
            value={formData.text_en}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>

        <div className="form-row">
          <label htmlFor="text_de">Question Text (German)</label>
          <textarea
            id="text_de"
            name="text_de"
            value={formData.text_de}
            onChange={handleChange}
            required
            rows={3}
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
            The order in which this question will appear in the test.
          </div>
        </div>

        <div className="form-row checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_reverse_keyed"
              checked={formData.is_reverse_keyed}
              onChange={handleChange}
            />
            Reverse-Keyed Question
          </label>
          <div className="field-help">
            If checked, responses to this question will be reverse-scored when calculating results.
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/questions" className="cancel-button">
            Cancel
          </Link>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading || !formData.test_id || !formData.domain_id}
          >
            {loading ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Main component with Suspense boundary
export default function NewQuestionPage() {
  return (
    <Suspense fallback={<div className="loading-state">Loading...</div>}>
      <NewQuestionContent />
    </Suspense>
  );
}