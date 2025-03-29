'use client';

import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
}

export default function LatexRenderer({ content }: LatexRendererProps) {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    // Process block formulas
    let htmlContent = content;
    const blockRegex = /\$\$([\s\S]*?)\$\$/g;
    
    htmlContent = htmlContent.replace(blockRegex, (match, formula) => {
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
    
    htmlContent = htmlContent.replace(inlineRegex, (match, formula) => {
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
    
    // Update the state with processed content
    setProcessedContent(htmlContent);
  }, [content]);

  // Render the processed content using dangerouslySetInnerHTML
  return (
    <div 
      className="blog-processed-content"
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
}