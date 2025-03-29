'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function LatexRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Process block formulas
    let processedContent = content;
    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    
    processedContent = processedContent.replace(blockRegex, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false
        });
        return `<div class="latex-block">${rendered}</div>`;
      } catch (e) {
        console.error('LaTeX error:', e);
        return match;
      }
    });
    
    // Process inline formulas
    const inlineRegex = /\$([^\$]+?)\$/g;
    
    processedContent = processedContent.replace(inlineRegex, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false
        });
        return `<span class="latex-inline">${rendered}</span>`;
      } catch (e) {
        console.error('LaTeX error:', e);
        return match;
      }
    });
    
    // Set the processed content
    containerRef.current.innerHTML = processedContent;
  }, [content]);

  return (
    <div className="blog-content" ref={containerRef}>
      {/* Content will be rendered here */}
    </div>
  );
}