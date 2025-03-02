import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import supersub from 'remark-supersub';
import remarkGfm from 'remark-gfm';
import ResumeClient from '../../components/ResumeClient';

export const revalidate = 3600; // Revalidate every hour

// Process markdown content to HTML asynchronously
async function processMarkdown(content: string): Promise<string> {
  try {
    const processedContent = await remark()
      .use(supersub)
      .use(remarkGfm) // Add GitHub Flavored Markdown support
      .use(html, { 
        sanitize: false // Don't sanitize to allow custom HTML
      })
      .process(content);
    return processedContent.toString();
  } catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

export default async function ResumePage(): Promise<React.ReactElement> {
  try {
    // Path to the resume content file
    const resumeContentPath = path.join(process.cwd(), 'src', 'content', 'resume.mdx');
    
    // Check if file exists
    let htmlContent = '';
    let title = 'Resume';
    
    try {
      await fs.promises.access(resumeContentPath);
      // Read and process the content
      const fileContent = await fs.promises.readFile(resumeContentPath, 'utf8');
      const { content, data } = matter(fileContent);
      htmlContent = await processMarkdown(content);
      title = data.title as string || 'Resume';
    } catch (error) {
      // If file doesn't exist, we'll just use an empty content string
      // and continue with the PDF viewer
      console.log('Resume content file not found, using PDF only');
    }

    // Pass both the markdown content and PDF URL to the client component
    return <ResumeClient title={title} content={htmlContent} pdfUrl="/resume.pdf" />;
  } catch (error) {
    console.error('Error loading resume page:', error);
    return (
      <div className="resume-container">
        <h1>Error Loading Resume</h1>
        <p>There was an error loading the resume content.</p>
      </div>
    );
  }
}