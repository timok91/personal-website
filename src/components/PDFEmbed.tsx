'use client';

import Link from 'next/link';
import React from 'react';

interface PDFEmbedProps {
  pdfUrl: string;
}

export default function PDFEmbed({ pdfUrl }: PDFEmbedProps) {
  return (
    <div className="pdf-embed">
      <div className="pdf-container">
        <iframe
          src={`${pdfUrl}#view=FitH`}
          width="100%"
          height="600px"
          style={{ 
            border: 'none', 
            borderRadius: '4px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}
          title="Resume PDF"
        />
      </div>
      
      <div className="pdf-download">
        <Link href={pdfUrl} download className="button">
          Download PDF
        </Link>
      </div>
    </div>
  );
}