// src/app/admin/tests/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Test } from '@/types/database';
import { createClient } from '@/utils/supabase/client';
import Breadcrumb from '@/components/admin/Breadcrumb';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error } = await supabase
          .from('tests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setTests(data || []);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('tests')
        .update({ active: !currentState })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setTests(prev => prev.map(test => 
        test.id === id ? { ...test, active: !test.active } : test
      ));
    } catch (err) {
      console.error('Error toggling test status:', err);
      setError('Failed to update test status. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-state">Loading tests...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Tests" />
      
      <div className="page-header">
        <h1>Manage Tests</h1>
        <Link href="/admin/tests/new" className="action-button">
          Create New Test
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-table-container">
        {tests.length === 0 ? (
          <div className="empty-state">
            <p>No tests found. Create your first test to get started.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name (EN)</th>
                <th>Name (DE)</th>
                <th>Status</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.name_en}</td>
                  <td>{test.name_de}</td>
                  <td>
                    <button
                      className={`status-badge ${test.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(test.id, test.active)}
                    >
                      {test.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>{new Date(test.created_at).toLocaleDateString()}</td>
                  <td>{new Date(test.updated_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <Link 
                        href={`/admin/tests/edit/${test.id}`}
                        className="action-icon edit"
                        title="Edit test"
                      >
                        ✏️
                      </Link>
                      <Link 
                        href={`/admin/tests/view/${test.id}`}
                        className="action-icon view"
                        title="View test details"
                      >
                        👁️
                      </Link>
                      <Link 
                        href={`/admin/tests/delete/${test.id}`}
                        className="action-icon delete"
                        title="Delete test"
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