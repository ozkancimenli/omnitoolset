#!/usr/bin/env node

/**
 * Blog Generator Script
 * Run: npm run generate-blog
 * 
 * This script:
 * - Generates high-quality blog posts automatically
 * - Updates existing posts (dates, content)
 * - Ensures all posts are SEO-optimized
 * - Links to relevant tools
 */

import { generateBlogPosts, updateBlogPosts } from '../lib/blog-generator';

async function main() {
  console.log('🚀 Starting blog generation...\n');
  
  try {
    // Generate new posts
    await generateBlogPosts();
    
    // Update existing posts
    await updateBlogPosts();
    
    console.log('\n✅ Blog generation complete!');
    console.log('📝 Blog posts are in: content/blog/');
    console.log('🌐 View at: /blog');
  } catch (error) {
    console.error('❌ Error generating blog:', error);
    process.exit(1);
  }
}

main();

