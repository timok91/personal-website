import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

interface PostFrontMatter {
  title: string;
  date: string;
  excerpt: string;
}

interface Post {
  slug: string;
  frontMatter: PostFrontMatter;
}

async function generateBlogList(): Promise<Post[]> {
  try {
    const postsDirectory = path.join(process.cwd(), 'src', 'posts');
    const filenames = fs.readdirSync(postsDirectory);
    
    const posts = filenames.map(filename => {
      const slug = filename.replace(/\.mdx$/, '');
      
      const fullPath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      const { data: frontMatter } = matter(fileContents);
      
      return {
        slug,
        frontMatter: frontMatter as PostFrontMatter
      };
    });
    
    // Sort posts by date
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
  
  return (
    <div className="blog-container">
      <h1>Blog</h1>
      <div className="posts-grid">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <div className="post-card">
              <h2>{post.frontMatter.title}</h2>
              <p className="date">{post.frontMatter.date}</p>
              <p className="excerpt">{post.frontMatter.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}