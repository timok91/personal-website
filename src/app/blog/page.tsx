// src/app/blog/page.tsx
import path from 'path';
import matter from 'gray-matter';
import { promises as fs } from 'fs';
import BlogClientPage from '@/components/BlogClientPage';

export const revalidate = 3600; // Revalidate every hour

interface PostFrontMatter {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
}

interface Post {
  slug: string;
  frontMatter: PostFrontMatter;
}

async function generateBlogList(): Promise<Post[]> {
  try {
    const postsDirectory = path.join(process.cwd(), 'src', 'posts');
    const filenames = await fs.readdir(postsDirectory);

    // Process each post asynchronously
    const posts: Post[] = await Promise.all(
      filenames.map(async (filename) => {
        const slug = filename.replace(/\.mdx$/, '');
        const fullPath = path.join(postsDirectory, filename);
        const fileContents = await fs.readFile(fullPath, 'utf8');
        const { data: frontMatter } = matter(fileContents);
        return {
          slug,
          frontMatter: frontMatter as PostFrontMatter,
        };
      })
    );

    // Sort posts by date (descending)
    return posts.sort((a, b) => {
      if (a.frontMatter.date < b.frontMatter.date) {
        return 1;
      } else {
        return -1;
      }
    });
  } catch (error) {
    console.error("Error generating blog list:", error);
    return [];
  }
}

export default async function Blog() {
  const posts = await generateBlogList();
  
  // Server component that passes data to the client component
  return <BlogClientPage initialPosts={posts} />;
}