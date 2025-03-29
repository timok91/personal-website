'use client';

import React, { useEffect, useState } from 'react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  minHeadings?: number; // Minimum headings required to show TOC
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  contentRef,
  className = '',
  minHeadings = 2 // Default to requiring at least 2 headings
}) => {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileVisible, setIsMobileVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Extract headings from content with retry logic for hydration
  useEffect(() => {
    const extractHeadings = () => {
      if (!contentRef.current) return false;

      // Get all headings (h2, h3, h4) from the content
      const elements = contentRef.current.querySelectorAll('h2, h3, h4');
      
      if (elements.length === 0) {
        return false; // No headings found yet
      }
      
      const items: TOCItem[] = [];
      
      elements.forEach((element) => {
        // Make sure each heading has an id
        if (!element.id) {
          const id = element.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `heading-${items.length}`;
          element.id = id;
        }
        
        items.push({
          id: element.id,
          text: element.textContent || '',
          level: parseInt(element.tagName.substring(1)) // Extract heading level number (2 for h2, etc)
        });
      });
      
      if (items.length > 0) {
        setHeadings(items);
        return true; // Success
      }
      
      return false; // No valid headings found
    };
    
    // Try to extract headings, and if unsuccessful, retry with exponential backoff
    const attemptExtraction = (attempt = 0) => {
      if (extractHeadings()) return; // Success
      
      if (attempt < 5) { // Limit retries to avoid infinite loops
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms
        const delay = Math.pow(2, attempt) * 100;
        setTimeout(() => attemptExtraction(attempt + 1), delay);
      }
    };
    
    attemptExtraction();
  }, [contentRef]);
  
  // Set up intersection observer to highlight active section
  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px', // Consider a heading "active" when it's in the top 20% of the viewport
        threshold: 0.1
      }
    );
    
    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });
    
    return () => observer.disconnect();
  }, [headings, contentRef]);
  
  // Scroll to section when clicked
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Scroll the element into view with smooth behavior
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveId(id);
      
      // On mobile, hide the TOC after clicking a link
      if (isMobile) {
        setIsMobileVisible(false);
      }
    }
  };
  
  // Don't render if not enough headings
  if (headings.length < minHeadings) return null;
  
  // Toggle mobile visibility
  const toggleMobileVisibility = () => {
    setIsMobileVisible(!isMobileVisible);
  };
  
  return (
    <>
      {isMobile && (
        <button 
          className="toc-mobile-toggle" 
          onClick={toggleMobileVisibility}
        >
          {isMobileVisible ? 'Hide Table of Contents' : 'Show Table of Contents'}
        </button>
      )}
      
      <div className={`toc-container ${className} ${isMobile && !isMobileVisible ? 'mobile-hidden' : ''}`}>
        <h2 className="toc-title">Table of Contents</h2>
        <nav className="toc-nav">
          <ul className="toc-list">
            {headings.map((heading) => (
              <li 
                key={heading.id} 
                className={`toc-item level-${heading.level} ${activeId === heading.id ? 'active' : ''}`}
              >
                <button 
                  onClick={() => scrollToSection(heading.id)}
                  className="toc-link"
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default TableOfContents;