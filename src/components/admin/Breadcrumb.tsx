// src/components/admin/Breadcrumb.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbProps {
  currentPageName?: string;
}

export default function Breadcrumb({ currentPageName }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Generate path segments for breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  
  return (
    <div className="breadcrumb">
      <Link href="/admin/dashboard" className="breadcrumb-home">
        Dashboard
      </Link>
      
      {segments.length > 1 && segments[0] === 'admin' && (
        <>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {currentPageName || segments[1].charAt(0).toUpperCase() + segments[1].slice(1)}
          </span>
        </>
      )}
    </div>
  );
}