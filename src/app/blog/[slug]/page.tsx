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
    const filenames = fs.readdirSync(postsDirectory);
    
    // Get all .mdx files and convert to slug params
    return filenames
      .filter(filename => filename.endsWith('.mdx'))
      .map(filename => ({
        slug: filename.replace(/\.mdx$/, '')
      }));
  } catch (error) {
    console.error("Error reading posts directory:", error);
    return [];
  }
}

// Process markdown content to HTML
function processMarkdown(content: string) {
  try {
    // Convert markdown to HTML string
    const processedContent = remark()
      .use(html)
      .processSync(content)
      .toString();
   
    return processedContent;
  } catch (error) {
    console.error('Error processing markdown:', error);
    return '';
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  // We no longer need to await params as we're using a non-async function now
  const slug = params.slug || 'not-found';
 
  try {
    const postsDirectory = path.join(process.cwd(), 'src', 'posts');
    const filePath = path.join(postsDirectory, `${slug}.mdx`);
   
    if (!fs.existsSync(filePath)) {
      return (
        <div className="blog-post-container">
          <h1>Post Not Found</h1>
          <p>Could not find a post with the slug: {slug}</p>
        </div>
      );
    }
   
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    const htmlContent = processMarkdown(content);
   
    return (
      <BlogPostClient
        title={data.title as string}
        date={data.date as string}
        content={htmlContent}
      />
    );
  } catch (error) {
    console.error("Error loading blog post:", error);
    return (
      <div className="blog-post-container">
        <h1>Error Loading Post</h1>
        <p>There was an error loading the blog post.</p>
      </div>
    );
  }
}