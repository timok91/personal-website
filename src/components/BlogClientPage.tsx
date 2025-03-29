'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface TagCount {
  name: string;
  count: number;
}

interface BlogClientPageProps {
  initialPosts: Post[];
}

export default function BlogClientPage({ initialPosts }: BlogClientPageProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [allPosts] = useState<Post[]>(initialPosts);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Extract and count tags from all posts
  useEffect(() => {
    const tagMap = new Map<string, number>();
    allPosts.forEach(post => {
      const postTags = post.frontMatter.tags || [];
      postTags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    
    // Convert the map to an array of TagCount objects
    const tagArray: TagCount[] = Array.from(tagMap.entries()).map(([name, count]) => ({
      name,
      count
    }));
    
    // Sort tags by count (descending) and then alphabetically
    tagArray.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
    
    setTags(tagArray);
  }, [allPosts]);

  // Filter posts when selected tags change
  useEffect(() => {
    if (selectedTags.length === 0) {
      setPosts(allPosts);
      return;
    }
    
    const filtered = allPosts.filter(post => {
      const postTags = post.frontMatter.tags || [];
      return selectedTags.some(tag => postTags.includes(tag));
    });
    
    setPosts(filtered);
  }, [selectedTags, allPosts]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="blog-container">
      <h1>Blog</h1>
      
      {tags.length > 0 && (
        <div className="blog-tag-filter">
          <h2>Filter by Tags</h2>
          <div className="blog-tags">
            {tags.map(tag => (
              <button
                key={tag.name}
                onClick={() => toggleTag(tag.name)}
                className={`blog-tag ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                aria-pressed={selectedTags.includes(tag.name)}
              >
                {tag.name} ({tag.count})
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <button className="blog-tag-clear" onClick={clearTags}>
              Clear Filters
            </button>
          )}
        </div>
      )}
      
      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts found with the selected tags.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="post-card">
                <h2>{post.frontMatter.title}</h2>
                <p className="date">{post.frontMatter.date}</p>
                {post.frontMatter.tags && post.frontMatter.tags.length > 0 && (
                  <div className="post-tags">
                    {post.frontMatter.tags.map(tag => (
                      <span key={tag} className="post-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <p className="excerpt">{post.frontMatter.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}