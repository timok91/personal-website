import React from 'react';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import supersub from 'remark-supersub';
import Link from 'next/link';
import { promises as fs } from 'fs';
import publicationsData from '../../../../data/publications.json';

// Define the Publication interface with an optional abstractFile property
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

// Cast the imported JSON data to an array of Publication objects
const publications = publicationsData as Publication[];

// This function tells Next.js which static pages to generate
export async function generateStaticParams() {
  return publications.map((_, index) => ({ id: index.toString() }));
}

// Process markdown to HTML asynchronously
async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await remark()
      .use(supersub)  
      .use(html)
      .process(markdown);
    return result.toString();
  }
  catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

// Define a specific interface for params
interface AbstractPageParams {
  params: { id: string } | Promise<{ id: string }>;
}

// Using a flexible type signature for better Next.js compatibility
export default async function AbstractPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: AbstractPageParams | any
): Promise<React.ReactElement> {
  try {
    // Use type assertion for TypeScript
    const { params } = props as { params: { id: string } | Promise<{ id: string }> };
    
    // Await params to satisfy Next.js dynamic parameter requirements
    const resolvedParams = await Promise.resolve(params);
    const publicationId = parseInt(resolvedParams.id);
    const publication = publications[publicationId];
    
    if (!publication) {
      return (
        <div className="abstract-container">
          <h1>Publication Not Found</h1>
          <p>Sorry, we couldn&apos;t find the publication you&apos;re looking for.</p>
          <Link href="/publications">Back to Publications</Link>
        </div>
      );
    }
    
    // Use the optional abstractFile property if it exists, or default to an empty string.
    const abstractFilePath = publication.abstractFile || "";
    const fullPath = path.join(process.cwd(), 'public', abstractFilePath);
    
    let abstractContent = "";
    let fileExists = false;
    
    try {
      // Check if the file is accessible
      await fs.access(fullPath);
      fileExists = true;
      const rawContent = await fs.readFile(fullPath, 'utf8');
      abstractContent = await markdownToHtml(rawContent);
    } catch (error) {
      console.error("File access/read error:", error);
      fileExists = false;
    }
    
    return (
      <div className="abstract-container">
        <h1>{publication.title}</h1>
        <p className="authors">{publication.authors}</p>
        <p className="venue">
          {publication.venue}, {publication.year}
        </p>
       
        <div className="abstract-content">
          <h2>Abstract</h2>
          {fileExists ? (
            <div dangerouslySetInnerHTML={{ __html: abstractContent }} />
          ) : (
            <p>Abstract file not found: {abstractFilePath}</p>
          )}
        </div>
       
        <Link href="/publications" className="button">
          Back to Publications
        </Link>
      </div>
    );
  } catch (error) {
    console.error("Error in abstract page:", error);
    return (
      <div className="abstract-container">
        <h1>Error Loading Abstract</h1>
        <p>Something went wrong while loading this abstract.</p>
        <Link href="/publications" className="button">
          Back to Publications
        </Link>
      </div>
    );
  }
}