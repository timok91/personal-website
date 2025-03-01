'use client';

import { useState } from 'react';
import Link from 'next/link';
import publications from '../../data/publications.json';
import PosterModal from '../../components/PosterModal';

interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: number;
  pdf?: string;
  doi?: string;
  code?: string;
  poster?: string;
  abstractFile?: string;
}

export default function Publications() {
  // State to track which poster is currently being displayed
  const [activePoster, setActivePoster] = useState<{index: number, path: string, title: string} | null>(null);
  
  // Function to open the poster modal
  const openPoster = (index: number, path: string, title: string) => {
    setActivePoster({index, path, title});
  };
  
  // Function to close the poster modal
  const closePoster = () => {
    setActivePoster(null);
  };
  
  return (
    <div className="publications-container">
      <h1>Academic Publications</h1>
      
      <div className="publications-list">
        {publications.map((pub: Publication, index: number) => (
          <div key={index} className="publication-item">
            <h3>{pub.title}</h3>
            <p className="authors">{pub.authors}</p>
            <p className="venue">{pub.venue}, {pub.year}</p>
            
            <div className="links">
              {/* Conditional rendering for PDF link */}
              {pub.pdf && (
                <a 
                  href={`/papers/${pub.pdf}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="publication-link"
                >
                  PDF
                </a>
              )}
              
              {/* Conditional rendering for DOI link */}
              {pub.doi && (
                <a 
                  href={`https://doi.org/${pub.doi}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="publication-link"
                >
                  DOI
                </a>
              )}
              
              {/* Conditional rendering for Code link */}
              {pub.code && (
                <a 
                  href={pub.code} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="publication-link"
                >
                  Code
                </a>
              )}
              
              {/* Conditional rendering for Poster button */}
              {pub.poster && (
                <button 
                  className="publication-link button-link"
                  onClick={() => openPoster(index, pub.poster!, pub.title)}
                  aria-label={`View poster for ${pub.title}`}
                >
                  Poster
                </button>
              )}
              
              {/* Conditional rendering for Abstract link */}
              {pub.abstractFile && (
                <Link 
                  href={`/publications/abstract/${index}`}
                  className="publication-link"
                >
                  Abstract
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Render the poster modal only when a poster is active */}
      {activePoster && (
        <PosterModal
          isOpen={!!activePoster}
          posterPath={activePoster.path}
          title={activePoster.title}
          onClose={closePoster}
        />
      )}
    </div>
  );
}