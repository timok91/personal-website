'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Domain, Test } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function EditDomainPage() {
  // Use Next.js hooks to access params
  const params = useParams();
  const domainId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  
  const router = useRouter();
  
  const [tests, setTests] = useState<Test[]>([]);
  const [formData, setFormData] = useState<Omit<Domain, 'id' | 'created_at' | 'updated_at'>>({
    test_id: '',
    name_en: '',
    name_de: '',
    description_en: '',
    description_de: '',
    display_order: 1
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!domainId) return;
      
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch the domain
        const { data: domainData, error: domainError } = await supabase
          .from('domains')
          .select('*')
          .eq('id', domainId)
          .single();
        
        if (domainError) throw new Error(domainError.message);
        if (!domainData) throw new Error('Domain not found');
        
        // Fetch all tests
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*')
          .order('name_en', { ascending: true });
        
        if (testsError) throw new Error(testsError.message);
        setTests(testsData || []);
        
        // Set form data from the fetched domain
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, ...domainFields } = domainData;
        setFormData(domainFields);
      } catch (err) {
        console.error('Error fetching domain data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load domain');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [domainId]);

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
    setSubmitting(true);
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
      const { error: updateError } = await supabase
        .from('domains')
        .update(formData)
        .eq('id', domainId);

      if (updateError) throw new Error(updateError.message);
      
      // Redirect to the domains list page, filtered by the test
      router.push(`/admin/domains?testId=${formData.test_id}`);
    } catch (err) {
      console.error('Error updating domain:', err);
      setError(err instanceof Error ? err.message : 'Failed to update domain');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading domain data...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Edit Domains" />
      <div className="page-header">
        <h1>Edit Domain</h1>
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
          >
            <option value="">Select a test</option>
            {tests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name_en}
              </option>
            ))}
          </select>
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
          <Link href={`/admin/domains?testId=${formData.test_id}`} className="cancel-button">
            Cancel
          </Link>
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}