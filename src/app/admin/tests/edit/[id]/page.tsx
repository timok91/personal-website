/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Test } from '@/types/database';
import Breadcrumb from '@/components/admin/Breadcrumb';


export default function EditTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const testId = params.id;
  
  const [formData, setFormData] = useState<Omit<Test, 'id' | 'created_at' | 'updated_at'>>({
    name_en: '',
    name_de: '',
    description_en: '',
    description_de: '',
    active: true
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data, error: fetchError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single();
        
        if (fetchError) throw new Error(fetchError.message);
        if (!data) throw new Error('Test not found');
        
         
        // Set form data from the fetched test
        const { id, created_at, updated_at, ...testData } = data;
        setFormData(testData);
      } catch (err) {
        console.error('Error fetching test:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test');
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
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
      if (!formData.name_en.trim() || !formData.name_de.trim()) {
        throw new Error('Test name is required in both languages');
      }

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('tests')
        .update(formData)
        .eq('id', testId);

      if (updateError) throw new Error(updateError.message);
      
      // Redirect to the test list page
      router.push('/admin/tests');
    } catch (err) {
      console.error('Error updating test:', err);
      setError(err instanceof Error ? err.message : 'Failed to update test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading test data...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Edit Tests" />

      <div className="page-header">
        <h1>Edit Test</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
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

        <div className="form-row checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            Active (available to users)
          </label>
        </div>

        <div className="form-actions">
          <Link href="/admin/tests" className="cancel-button">
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