'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Inner component that uses useSearchParams
function LoginContent() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('from') || '/admin/dashboard';

  useEffect(() => {
    // Check if already logged in by making a simple request to the admin API
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        if (response.ok) {
          // Already logged in, redirect to the target page
          router.push(redirectUrl);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // Not logged in, continue with login form
        console.log('Not authenticated');
      }
    };

    checkAuth();
  }, [redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter the admin password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Send the password to the login API route
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      
      // Redirect to the original target page or dashboard
      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <h1>Admin Login</h1>
      
      <form onSubmit={handleSubmit} className="admin-login-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="password">Admin Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>
        
        <button 
          type="submit" 
          className="login-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="back-link">
        <Link href="/">Back to Website</Link>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AdminLogin() {
  return (
    <Suspense fallback={<div className="loading-state">Preparing login form...</div>}>
      <LoginContent />
    </Suspense>
  );
}