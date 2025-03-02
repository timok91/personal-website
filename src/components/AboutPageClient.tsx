'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface AboutPageClientProps {
  title: string;
  content: string;
}

export default function AboutPageClient({ title, content }: AboutPageClientProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Process the HTML content to find sections that should be expandable
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Find all h3 elements inside the content div
    const h3Elements = contentRef.current.querySelectorAll('h3');
    
    // Create a map to store state and avoid re-renders
    const sectionStates = new Map<string, boolean>();
    
    const handleToggleSection = (id: string) => {
      // Get the current state from our map
      const isExpanded = sectionStates.get(id) || false;
      // Update our local state map
      sectionStates.set(id, !isExpanded);
      
      // Get the header and content elements
      const header = document.getElementById(id);
      const content = document.getElementById(`content-${id}`);
      
      if (header && content) {
        // Toggle content visibility based on our local state
        if (isExpanded) {
          content.classList.add('collapsed');
          content.classList.remove('expanded');
          
          // Update indicator
          const indicator = header.querySelector('.expand-indicator');
          if (indicator) indicator.innerHTML = '+';
        } else {
          content.classList.remove('collapsed');
          content.classList.add('expanded');
          
          // Update indicator
          const indicator = header.querySelector('.expand-indicator');
          if (indicator) indicator.innerHTML = '−';
          
          // Smooth scroll to the section
          header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };
    
    h3Elements.forEach((h3, index) => {
      // Create a unique ID for each section
      const id = `section-${index}`;
      h3.id = id;
      
      // Clean up any previous event listeners (for hot reloading)
      const clone = h3.cloneNode(true) as HTMLHeadingElement;
      if (h3.parentNode) {
        h3.parentNode.replaceChild(clone, h3);
      }
      
      // Add a class to make it identifiable
      clone.classList.add('expandable-header');
      
      // Add expand/collapse indicator (if not already present)
      let indicator = clone.querySelector('.expand-indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'expand-indicator';
        indicator.innerHTML = '+';
        clone.appendChild(indicator);
      }
      
      // Make heading clickable
      clone.style.cursor = 'pointer';
      clone.addEventListener('click', () => handleToggleSection(id));
      
      // Find content to collapse (all elements until next h2 or h3)
      let currentElement = clone.nextElementSibling as Element | null;
      const contentElements: Element[] = [];
      
      while (currentElement && 
             !currentElement.matches('h2') && 
             !currentElement.matches('h3')) {
        contentElements.push(currentElement);
        currentElement = currentElement.nextElementSibling;
      }
      
      // Check if a wrapper already exists
      const existingWrapper = document.getElementById(`content-${id}`);
      if (existingWrapper) {
        // If a wrapper already exists, don't create a new one
        return;
      }
      
      // Create a wrapper div for the content
      const wrapperDiv = document.createElement('div');
      wrapperDiv.className = 'expandable-content collapsed';
      wrapperDiv.id = `content-${id}`;
      
      // Move the content elements into the wrapper
      contentElements.forEach(element => {
        wrapperDiv.appendChild(element.cloneNode(true));
      });
      
      // Remove the original content elements
      contentElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // Insert the wrapper after the h3
      clone.insertAdjacentElement('afterend', wrapperDiv);
      
      // Initialize state
      sectionStates.set(id, false);
    });
    
    // Clean up function
    return () => {
      // Remove event handlers if needed
      h3Elements.forEach((h3, index) => {
        const id = `section-${index}`;
        const header = document.getElementById(id);
        if (header) {
          // Clone and replace to remove event listeners
          const clone = header.cloneNode(true);
          if (header.parentNode) {
            header.parentNode.replaceChild(clone, header);
          }
        }
      });
    };
  }, [content]); // Only re-run when content changes

  return (
    <div className="about-container">
      <h1>{title || "About Me"}</h1>
      
      <div className="about-intro">
        <div className="about-profile-image">
          <Image 
            src="/images/profile.png" 
            alt="Profile photo" 
            width={200} 
            height={200}
            quality={90} 
            className="about-photo"
          />
        </div>
      </div>
      
      <div 
        ref={contentRef} 
        className="about-content" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
}