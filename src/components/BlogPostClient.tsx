'use client';

import React from 'react';

interface BlogPostClientProps {
  title: string;
  date: string;
  content: string;
}

export default function BlogPostClient({ title, date, content }: BlogPostClientProps) {
  return (
    <div className="blog-post-container">
      <h1>{title}</h1>
      <p className="date">{date}</p>
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}