'use client';

import React from 'react';
import Link from 'next/link';
import LatexRenderer from './LatexRenderer';
import 'katex/dist/katex.min.css';

interface BlogPostClientProps {
  title: string;
  date: string;
  content: string;
  tags?: string[];
}

export default function BlogPostClient({ title, date, content, tags }: BlogPostClientProps) {
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
      
      <LatexRenderer content={content} />    
    </div>
  );
}