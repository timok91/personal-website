'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Breadcrumb from '@/components/admin/Breadcrumb';

interface UserSession {
  id: string;
  session_id: string;
  language: 'en' | 'de';
  age_group?: string;
  gender?: string;
  salary?: string;
  leadership?: string;
  previously_taken: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 20;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Get total count
        const { count, error: countError } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true });
          
        if (countError) throw countError;
        setTotalCount(count || 0);
        
        // Fetch users with pagination
        const from = page * perPage;
        const to = from + perPage - 1;
        
        const { data, error: fetchError } = await supabase
          .from('user_sessions')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);
          
        if (fetchError) throw fetchError;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [page]);
  
  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if ((page + 1) * perPage < totalCount) {
      setPage(page + 1);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading users...</div>;
  }

  return (
    <div>
      <Breadcrumb currentPageName="Users" />
      
      <div className="page-header">
        <h1>User Sessions</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No user sessions found.</p>
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Language</th>
                  <th>Demographics</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.session_id.substring(0, 8)}...</td>
                    <td>{user.language.toUpperCase()}</td>
                    <td>
                      {user.age_group ? (
                        <>
                          {user.age_group} · {user.gender} · 
                          {user.leadership === 'yes' ? 'Leader' : 'Non-leader'}
                        </>
                      ) : (
                        'Not provided'
                      )}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <Link 
                          href={`/admin/users/view/${user.session_id}`}
                          className="action-icon view"
                          title="View user details"
                        >
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="pagination-controls">
              <button 
                onClick={handlePreviousPage} 
                disabled={page === 0}
                className="pagination-button"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {Math.ceil(totalCount / perPage)}
                ({totalCount} users total)
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={(page + 1) * perPage >= totalCount}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}