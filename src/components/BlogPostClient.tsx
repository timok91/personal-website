'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LatexRenderer from './LatexRenderer';
import TableOfContents from './TableOfContents';
import SocialShare from './SocialShare';
import 'katex/dist/katex.min.css';

interface BlogPostClientProps {
  title: string;
  date: string;
  content: string;
  tags?: string[];
}

export default function BlogPostClient({ title, date, content, tags }: BlogPostClientProps) {
  // Create a ref to the content div for the table of contents
  const contentRef = useRef<HTMLDivElement>(null);
  const [isContentReady, setIsContentReady] = useState(false);
  const [hasToc, setHasToc] = useState(false);
  const pathname = usePathname();
  
  // Get the full URL for sharing
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${pathname}`
    : '';

  // Add IDs to headings after content is rendered for the TOC
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Add IDs to headings
    const addIdsToHeadings = () => {
      const headings = contentRef.current?.querySelectorAll('h2, h3, h4');
      
      if (!headings || headings.length === 0) {
        // If no headings found immediately, try again after a short delay
        // This helps with hydration timing issues
        setTimeout(addIdsToHeadings, 100);
        return;
      }
      
      // Set hasToc based on whether we have enough headings (at least 2)
      setHasToc(headings.length >= 2);
      
      headings.forEach((heading, index) => {
        if (!heading.id) {
          const text = heading.textContent || '';
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `heading-${index}`;
          heading.id = id;
        }
      });
      
      setIsContentReady(true);
    };
    
    // Run our function
    addIdsToHeadings();
    
    // When page loads via direct URL, we need a small delay for hydration
    const timer = setTimeout(() => {
      if (!isContentReady) {
        addIdsToHeadings();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, isContentReady]);

  return (
    <div className="blog-post-container">
      <h1>{title}</h1>
      <p className="date">{date}</p>
      
      {tags && tags.length > 0 && (
        <div className="blog-post-tags">
          {tags.map(tag => (
            <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
              <span className="blog-post-tag">{tag}</span>
            </Link>
          ))}
        </div>
      )}
      
      <div className={`blog-post-layout ${!hasToc ? 'blog-post-layout-full' : ''}`}>
        {/* Only render TOC when content is ready and we have enough headings */}
        {isContentReady && hasToc && (
          <TableOfContents contentRef={contentRef} />
        )}
        
        <div className="blog-content" ref={contentRef}>
          <LatexRenderer content={content} />    
        </div>
      </div>
      
      {/* Add social sharing component */}
      <SocialShare 
        title={title}
        url={fullUrl}
        publishedDate={date}
      />
    </div>
  );
}