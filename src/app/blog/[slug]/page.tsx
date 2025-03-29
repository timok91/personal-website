import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import supersub from 'remark-supersub';
import BlogPostClient from '../../../components/BlogPostClient';

export const revalidate = 3600; // Revalidate every hour

// Process markdown content to HTML asynchronously
async function processMarkdown(content: string): Promise<string> {
  try {
    // First, protect LaTeX blocks by replacing them with placeholders
    const latexBlocks: string[] = [];
    const latexInline: string[] = [];
    
    // Replace block LaTeX with placeholders
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let protectedContent = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      latexBlocks.push(match);
      return `LATEX_BLOCK_${latexBlocks.length - 1}`;
    });
    
    // Replace inline LaTeX with placeholders
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protectedContent = protectedContent.replace(/\$([^\$]+?)\$/g, (match, formula) => {
      latexInline.push(match);
      return `LATEX_INLINE_${latexInline.length - 1}`;
    });
    
    // Now process with supersub (it won't touch our placeholders)
    const processedContent = await remark()
      .use(supersub)
      .use(html, { sanitize: false })
      .process(protectedContent);
    
    // Convert back to string
    let result = processedContent.toString();
    
    // Restore LaTeX blocks
    latexBlocks.forEach((block, i) => {
      result = result.replace(`LATEX_BLOCK_${i}`, block);
    });
    
    // Restore inline LaTeX
    latexInline.forEach((inline, i) => {
      result = result.replace(`LATEX_INLINE_${i}`, inline);
    });
    
    return result;
  } catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

// Define a specific type for the props
interface BlogPostParams {
  params: { slug: string } | Promise<{ slug: string }>;
}

export default async function BlogPost(props: BlogPostParams): Promise<React.ReactElement> {
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
        tags={data.tags as string[] | undefined}
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