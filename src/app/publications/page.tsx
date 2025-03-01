'use client';

import { useState, useCallback } from 'react';
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
  const [activePoster, setActivePoster] = useState<{
    index: number;
    path: string;
    title: string;
  } | null>(null);

  // Memoize functions to avoid unnecessary re-renders
  const openPoster = useCallback((index: number, path: string, title: string) => {
    setActivePoster({ index, path, title });
  }, []);

  const closePoster = useCallback(() => {
    setActivePoster(null);
  }, []);

  return (
    <div className="publications-container">
      <h1>Academic Publications</h1>
      <div className="publications-list">
        {publications.map((pub: Publication, index: number) => (
          <div key={index} className="publication-item">
            <h3>{pub.title}</h3>
            <p className="authors">{pub.authors}</p>
            <p className="venue">
              {pub.venue}, {pub.year}
            </p>
            <div className="links">
              {pub.pdf && (
                <Link
                  href={`/papers/${pub.pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="publication-link"
                >
                  PDF
                </Link>
              )}
              {pub.doi && (
                <Link
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="publication-link"
                >
                  DOI
                </Link>
              )}
              {pub.code && (
                <Link
                  href={pub.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="publication-link"
                >
                  Code
                </Link>
              )}
              {pub.poster && (
                <button
                  className="publication-link button-link"
                  onClick={() => openPoster(index, pub.poster!, pub.title)}
                  aria-label={`View poster for ${pub.title}`}
                >
                  Poster
                </button>
              )}
              {pub.abstractFile && (
                <Link href={`/publications/abstract/${index}`} className="publication-link">
                  Abstract
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      {activePoster && (
        <PosterModal
          isOpen={true}
          posterPath={activePoster.path}
          title={activePoster.title}
          onClose={closePoster}
        />
      )}
    </div>
  );
}
