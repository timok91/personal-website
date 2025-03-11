/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

interface UserResult {
  id: string;
  test_id: string;
  domain_id: string;
  score: number;
  created_at: string;
  test_name?: string;
  domain_name?: string;
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const sessionId = params.id;
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<Record<string, any>>({});
  const [domains, setDomains] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch user session
        const { data: userData, error: userError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();
          
        if (userError) throw userError;
        setUser(userData);
        
        // Get test and domain info for reference
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*');
          
        if (testsError) throw testsError;
        
        const testsMap = (testsData || []).reduce((acc, test) => {
          acc[test.id] = test;
          return acc;
        }, {} as Record<string, any>);
        
        setTests(testsMap);
        
        const { data: domainsData, error: domainsError } = await supabase
          .from('domains')
          .select('*');
          
        if (domainsError) throw domainsError;
        
        const domainsMap = (domainsData || []).reduce((acc, domain) => {
          acc[domain.id] = domain;
          return acc;
        }, {} as Record<string, any>);
        
        setDomains(domainsMap);
        
        // Fetch results for this user
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .eq('session_id', userData.id) // Use the database ID (UUID), not the session_id
          .order('created_at', { ascending: false });
          
        if (resultsError) throw resultsError;
        
        // Enrich results with test and domain names
        const enrichedResults = (resultsData || []).map(result => ({
          ...result,
          test_name: testsMap[result.test_id]?.name_en || 'Unknown Test',
          domain_name: domainsMap[result.domain_id]?.name_en || 'Unknown Domain'
        }));
        
        setResults(enrichedResults);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [sessionId]);

  if (loading) {
    return <div className="loading-state">Loading user data...</div>;
  }

  if (!user) {
    return (
      <div className="error-state">
        <h1>User Not Found</h1>
        <p>The requested user session could not be found.</p>
        <Link href="/admin/users" className="action-button">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb currentPageName="User Details" />
      
      <div className="page-header">
        <h1>User Session Details</h1>
        <Link href="/admin/users" className="action-button">
          Back to Users
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-card user-details">
        <h2>Session Information</h2>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Session ID:</span>
            <span className="detail-value">{user.session_id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Language:</span>
            <span className="detail-value">{user.language.toUpperCase()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{new Date(user.created_at).toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Previously Taken:</span>
            <span className="detail-value">{user.previously_taken ? 'Yes' : 'No'}</span>
          </div>
        </div>
        
        <h3>Demographics</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Age Group:</span>
            <span className="detail-value">{user.age_group || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gender:</span>
            <span className="detail-value">{user.gender || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Leadership:</span>
            <span className="detail-value">{user.leadership || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Salary Range:</span>
            <span className="detail-value">{user.salary || 'Not provided'}</span>
          </div>
        </div>
      </div>
      
      <div className="admin-card">
        <h2>Test Results</h2>
        {results.length === 0 ? (
          <div className="empty-state">
            <p>No test results found for this user.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Test</th>
                <th>Domain</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
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