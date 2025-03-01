import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import BlogPostClient from '../../../components/BlogPostClient';

// This function tells Next.js which static pages to generate
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'src', 'posts');

  // Check if directory exists
  if (!fs.existsSync(postsDirectory)) {
    console.warn(`Posts directory not found: ${postsDirectory}`);
    return [];
  }

  try {
    const filenames = await fs.promises.readdir(postsDirectory);

    // Get all .mdx files and convert to slug params
    return filenames
      .filter((filename) => filename.endsWith('.mdx'))
      .map((filename) => ({
        slug: filename.replace(/\.mdx$/, ''),
      }));
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return [];
  }
}

// Process markdown content to HTML asynchronously
async function processMarkdown(content: string): Promise<string> {
  try {
    const processedContent = await remark().use(html).process(content);
    return processedContent.toString();
  } catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

// Define a specific type for the props instead of using 'any'
interface BlogPostParams {
  params: { slug: string } | Promise<{ slug: string }>;
}

// Using a specific type signature and React.ReactElement return type
export default async function BlogPost(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: BlogPostParams | any
): Promise<React.ReactElement> {
  try {
    // Use a type assertion to help TypeScript understand the structure
    const { params } = props as { params: { slug: string } | Promise<{ slug: string }> };
    
    // Await params in case they're a promise 
    const resolvedParams = await Promise.resolve(params);
    const slug = resolvedParams.slug || 'not-found';

    const postsDirectory = path.join(process.cwd(), 'src', 'posts');
    const filePath = path.join(postsDirectory, `${slug}.mdx`);

    // Check if the file exists asynchronously
    try {
      await fs.promises.access(filePath);
    } catch {
      return (
        <div className="blog-post-container">
          <h1>Post Not Found</h1>
          <p>Could not find a post with the slug: {slug}</p>
        </div>
      );
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    const htmlContent = await processMarkdown(content);

    return (
      <BlogPostClient
        title={data.title as string}
        date={data.date as string}
        content={htmlContent}
      />
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    return (
      <div className="blog-post-container">
        <h1>Error Loading Post</h1>
        <p>There was an error loading the blog post.</p>
      </div>
    );
  }
}