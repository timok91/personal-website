'use client';

import React, { useState } from 'react';

interface SocialShareProps {
  title: string;
  url: string;
  authorName?: string;  // For academic citations
  publishedDate?: string; // For academic citations
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  title, 
  url, 
  authorName = 'Timo Krug',
  publishedDate
}) => {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  // Format date for citation
  const formattedDate = publishedDate 
    ? new Date(publishedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    
  // Year for citation
  const year = publishedDate 
    ? new Date(publishedDate).getFullYear()
    : new Date().getFullYear();
  
  // Generate citation text
  const academicCitation = `${authorName} (${year}). ${title}. Retrieved ${formattedDate}, from ${url}`;
  
  // Handle sharing to different platforms
  const handleShare = (platform: string) => {
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this article: ${url}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };
  
  // Copy link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess('Link');
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };
  
  // Copy citation to clipboard
  const copyCitation = () => {
    navigator.clipboard.writeText(academicCitation).then(() => {
      setCopySuccess('Citation');
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };
  
  // Show tooltip
  const showTooltip = (tooltipName: string) => {
    setActiveTooltip(tooltipName);
  };
  
  // Hide tooltip
  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="social-share">
      <div className="share-title">Share this article</div>
      <div className="share-buttons">
        {/* Twitter/X Share */}
        <button 
          className="share-button twitter" 
          onClick={() => handleShare('twitter')}
          onMouseEnter={() => showTooltip('twitter')}
          onMouseLeave={hideTooltip}
          aria-label="Share on Twitter/X"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
          {activeTooltip === 'twitter' && <span className="tooltip">Share on Twitter/X</span>}
        </button>
        
        {/* LinkedIn Share */}
        <button 
          className="share-button linkedin" 
          onClick={() => handleShare('linkedin')}
          onMouseEnter={() => showTooltip('linkedin')}
          onMouseLeave={hideTooltip}
          aria-label="Share on LinkedIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect x="2" y="9" width="4" height="12"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
          {activeTooltip === 'linkedin' && <span className="tooltip">Share on LinkedIn</span>}
        </button>
        
        {/* Facebook Share */}
        <button 
          className="share-button facebook" 
          onClick={() => handleShare('facebook')}
          onMouseEnter={() => showTooltip('facebook')}
          onMouseLeave={hideTooltip}
          aria-label="Share on Facebook"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
          </svg>
          {activeTooltip === 'facebook' && <span className="tooltip">Share on Facebook</span>}
        </button>
        
        {/* Email Share */}
        <button 
          className="share-button email" 
          onClick={() => handleShare('email')}
          onMouseEnter={() => showTooltip('email')}
          onMouseLeave={hideTooltip}
          aria-label="Share via Email"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          {activeTooltip === 'email' && <span className="tooltip">Share via Email</span>}
        </button>
        
        {/* Copy Link */}
        <button 
          className="share-button link" 
          onClick={copyLink}
          onMouseEnter={() => showTooltip('link')}
          onMouseLeave={hideTooltip}
          aria-label="Copy Link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {activeTooltip === 'link' && <span className="tooltip">Copy Link</span>}
        </button>
        
        {/* Copy Citation */}
        <button 
          className="share-button citation" 
          onClick={copyCitation}
          onMouseEnter={() => showTooltip('citation')}
          onMouseLeave={hideTooltip}
          aria-label="Copy Academic Citation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          {activeTooltip === 'citation' && <span className="tooltip">Copy Academic Citation</span>}
        </button>
      </div>
      
      {copySuccess && (
        <div className="copy-success">
          {copySuccess} copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default SocialShare;