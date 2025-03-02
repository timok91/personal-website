import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import supersub from 'remark-supersub';
import remarkGfm from 'remark-gfm';
import AboutPageClient from '../../components/AboutPageClient';

export const revalidate = 3600; // Revalidate every hour

// Process markdown content to HTML asynchronously
async function processMarkdown(content: string): Promise<string> {
  try {
    const processedContent = await remark()
      .use(supersub)
      .use(remarkGfm) // Add GitHub Flavored Markdown support for tables, etc.
      .use(html, { sanitize: false }) // Don't sanitize to allow custom HTML
      .process(content);
    return processedContent.toString();
  } catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

export default async function AboutPage(): Promise<React.ReactElement> {
  try {
    // Path to the about content file
    const aboutContentPath = path.join(process.cwd(), 'src', 'content', 'about.mdx');
    
    // Check if file exists
    try {
      await fs.promises.access(aboutContentPath);
    } catch {
      return (
        <div className="about-container">
          <h1>About Me</h1>
          <p>Content file not found. Please create src/content/about.mdx</p>
        </div>
      );
    }

    // Read and process the content
    const fileContent = await fs.promises.readFile(aboutContentPath, 'utf8');
    const { content, data } = matter(fileContent);
    const htmlContent = await processMarkdown(content);

    return <AboutPageClient title={data.title as string} content={htmlContent} />;
  } catch (error) {
    console.error('Error loading about page:', error);
    return (
      <div className="about-container">
        <h1>Error Loading Content</h1>
        <p>There was an error loading the about page content.</p>
      </div>
    );
  }
}