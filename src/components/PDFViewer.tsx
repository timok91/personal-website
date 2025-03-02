'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
// Note: This needs to be done before the Document/Page components are used
const setPdfWorker = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
};

// Dynamically import Document and Page components
const Document = dynamic(
  () => import('react-pdf').then((mod) => {
    setPdfWorker();
    return mod.Document;
  }),
  {
    loading: () => <div className="pdf-loading">Loading PDF viewer...</div>,
    ssr: false
  }
);

const Page = dynamic(
  () => import('react-pdf').then((mod) => mod.Page),
  {
    loading: () => <div className="pdf-loading">Loading PDF page...</div>,
    ssr: false
  }
);

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [viewerWidth, setViewerWidth] = useState<number>(800);

  // Set up responsive width
  useEffect(() => {
    const handleResize = () => {
      setViewerWidth(window.innerWidth > 800 ? 800 : window.innerWidth - 40);
    };
    
    // Set initial width
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <div className="pdf-document-container">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onLoadError}
              loading={<div className="pdf-loading-document">Loading PDF document...</div>}
            >
              {numPages ? (
                <Page 
                  pageNumber={pageNumber} 
                  width={viewerWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={true}
                />
              ) : null}
            </Document>
          </div>
          
          {numPages && (
            <div className="pdf-controls">
              <button 
                onClick={previousPage} 
                disabled={pageNumber <= 1}
                className="pdf-control-btn"
                aria-label="Previous page"
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
                aria-label="Next page"
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