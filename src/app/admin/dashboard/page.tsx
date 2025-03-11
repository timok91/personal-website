'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    tests: '--',
    domains: '--',
    questions: '--',
    users: '--'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch test count
        const { count: testCount, error: testError } = await supabase
          .from('tests')
          .select('*', { count: 'exact', head: true });
        
        if (testError) throw testError;
        
        // Fetch domain count
        const { count: domainCount, error: domainError } = await supabase
          .from('domains')
          .select('*', { count: 'exact', head: true });
        
        if (domainError) throw domainError;
        
        // Fetch question count
        const { count: questionCount, error: questionError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true });
        
        if (questionError) throw questionError;
        
        // Fetch user session count
        const { count: userCount, error: userError } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Update the counts
        setCounts({
          tests: testCount?.toString() || '0',
          domains: domainCount?.toString() || '0',
          questions: questionCount?.toString() || '0',
          users: userCount?.toString() || '0'
        });
      } catch (err) {
        console.error('Error fetching dashboard counts:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  return (
    <div className="dashboard-overview">
      <h1>Dashboard</h1>
      <p>Welcome to the Personality Test Admin Panel</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Tests</h3>
          <p className="stat-count">{loading ? '--' : counts.tests}</p>
          <Link href="/admin/tests" className="card-link">
            Manage Tests
          </Link>
        </div>
        
        <div className="stat-card">
          <h3>Domains</h3>
          <p className="stat-count">{loading ? '--' : counts.domains}</p>
          <Link href="/admin/domains" className="card-link">
            Manage Domains
          </Link>
        </div>
        
        <div className="stat-card">
          <h3>Questions</h3>
          <p className="stat-count">{loading ? '--' : counts.questions}</p>
          <Link href="/admin/questions" className="card-link">
            Manage Questions
          </Link>
        </div>
        
        <div className="stat-card">
          <h3>Users</h3>
          <p className="stat-count">{loading ? '--' : counts.users}</p>
          <Link href="/admin/users" className="card-link">
            View Users
          </Link>
        </div>
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link href="/admin/tests/new" className="action-button">
            Create New Test
          </Link>
          <Link href="/admin/questions/new" className="action-button">
            Add New Question
          </Link>
          <Link href="/admin/results" className="action-button">
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}