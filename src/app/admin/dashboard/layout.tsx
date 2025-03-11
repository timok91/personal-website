// src/app/admin/dashboard/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-menu">
          <Link href="/admin/dashboard" className="menu-item">
            Dashboard
          </Link>
          <Link href="/admin/tests" className="menu-item">
            Tests
          </Link>
          <Link href="/admin/domains" className="menu-item">
            Domains
          </Link>
          <Link href="/admin/questions" className="menu-item">
            Questions
          </Link>
          <Link href="/admin/results" className="menu-item">
            Results
          </Link>
          <Link href="/admin/users" className="menu-item">
            Users
          </Link>
        </nav>
        <div className="sidebar-footer">
          <Link href="/api/admin/logout" className="logout-button">
            Logout
          </Link>
          <Link href="/" className="back-to-site">
            Back to Website
          </Link>
        </div>
      </aside>
      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}