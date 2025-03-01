'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Important: This needs to be set up correctly
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setError(null);
  }

  function onLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again later.');
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  return (
    <div className="pdf-viewer">
      {error ? (
        <div className="pdf-error">
          <p>{error}</p>
          <p>You can still <Link href={pdfUrl} download className="button">download the PDF</Link></p>
        </div>
      ) : (
        <>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onLoadError}
            loading={<p>Loading PDF...</p>}
          >
            {numPages && (
              <Page 
                pageNumber={pageNumber} 
                width={window.innerWidth > 800 ? 800 : window.innerWidth - 40}
              />
            )}
          </Document>
          
          {numPages && (
            <div className="pdf-controls">
              <button 
                onClick={previousPage} 
                disabled={pageNumber <= 1}
                className="pdf-control-btn"
              >
                Previous
              </button>
              <p>
                Page {pageNumber} of {numPages}
              </p>
              <button 
                onClick={nextPage} 
                disabled={pageNumber >= numPages}
                className="pdf-control-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      <div className="pdf-download">
        <Link href={pdfUrl} download className="button">
          Download PDF
        </Link>
      </div>
    </div>
  );
}