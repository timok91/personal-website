'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function NewTestPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name_en: '',
    name_de: '',
    description_en: '',
    description_de: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name_en.trim() || !formData.name_de.trim()) {
        throw new Error('Test name is required in both languages');
      }

      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error: supabaseError } = await supabase
        .from('tests')
        .insert([formData])
        .select();

      if (supabaseError) throw new Error(supabaseError.message);
      
      // Redirect to the test list page
      router.push('/admin/tests');
    } catch (err) {
      console.error('Error creating test:', err);
      setError(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb currentPageName="New Test" />

      <div className="page-header">
        <h1>Create New Test</h1>
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
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Test'}
          </button>
        </div>
      </form>
    </div>
  );
}