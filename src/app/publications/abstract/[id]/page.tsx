import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';
import publications from '../../../../data/publications.json';
import Link from 'next/link';

// This function tells Next.js which static pages to generate
export async function generateStaticParams() {
  return publications
    .map((_, index) => ({ id: index.toString() }));
}

// Process markdown to HTML
async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export default async function AbstractPage({ params }: { params: { id: string } }) {
  try {
    const publicationId = parseInt(params.id);
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
   
    const abstractFilePath = publication.abstractFile || "";
    const fullPath = path.join(process.cwd(), 'public', abstractFilePath);
   
    let abstractContent = "";
    let fileExists = false;
   
    try {
      fileExists = fs.existsSync(fullPath);
      if (fileExists) {
        const rawContent = fs.readFileSync(fullPath, 'utf8');
        // Convert markdown to HTML
        abstractContent = await markdownToHtml(rawContent);
      }
    } catch (error) {
      console.error("File read error:", error);
    }
   
    return (
      <div className="abstract-container">
        <h1>{publication.title}</h1>
        <p className="authors">{publication.authors}</p>
        <p className="venue">{publication.venue}, {publication.year}</p>
       
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