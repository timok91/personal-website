// src/app/admin/layout.tsx
import type { Metadata } from 'next';
import '../../styles/admin.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Personality Tests',
  description: 'Admin dashboard for managing personality tests',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}