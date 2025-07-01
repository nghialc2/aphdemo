import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type BlogPost = Tables<'blog_posts'>;
export type BlogPostInsert = TablesInsert<'blog_posts'>;
export type BlogPostUpdate = TablesUpdate<'blog_posts'>;

export interface BlogPostWithAuthor {
  id: number;
  title: string;
  excerpt: string;
  content?: string | null;
  category: string;
  author: {
    name: string;
    avatar: string | null;
    initials: string | null;
  };
  image: string | null;
  date: string;
  featured: boolean;
}

// Helper function to truncate text
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const blogService = {
  async getAllBlogPosts(): Promise<BlogPostWithAuthor[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      throw new Error('Failed to fetch blog posts');
    }

    return data.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: {
        name: post.author_name,
        avatar: post.author_avatar,
        initials: post.author_initials,
      },
      image: post.image_url,
      date: post.created_at,
      featured: post.featured,
    }));
  },

  async createBlogPost(post: Omit<BlogPostWithAuthor, 'id' | 'date'>): Promise<BlogPostWithAuthor> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const insertData: BlogPostInsert = {
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author_name: post.author.name,
      author_avatar: post.author.avatar,
      author_initials: post.author.initials,
      image_url: post.image,
      featured: post.featured,
      created_by: user?.id,
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      throw new Error('Failed to create blog post');
    }

    return {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      author: {
        name: data.author_name,
        avatar: data.author_avatar,
        initials: data.author_initials,
      },
      image: data.image_url,
      date: data.created_at,
      featured: data.featured,
    };
  },

  async updateBlogPost(id: number, updates: Partial<Omit<BlogPostWithAuthor, 'id' | 'date'>>): Promise<BlogPostWithAuthor> {
    const updateData: BlogPostUpdate = {
      ...(updates.title && { title: updates.title }),
      ...(updates.excerpt && { excerpt: updates.excerpt }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.category && { category: updates.category }),
      ...(updates.author?.name && { author_name: updates.author.name }),
      ...(updates.author?.avatar !== undefined && { author_avatar: updates.author.avatar }),
      ...(updates.author?.initials !== undefined && { author_initials: updates.author.initials }),
      ...(updates.image !== undefined && { image_url: updates.image }),
      ...(updates.featured !== undefined && { featured: updates.featured }),
    };

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      throw new Error('Failed to update blog post');
    }

    return {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      author: {
        name: data.author_name,
        avatar: data.author_avatar,
        initials: data.author_initials,
      },
      image: data.image_url,
      date: data.updated_at,
      featured: data.featured,
    };
  },

  async deleteBlogPost(id: number): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      throw new Error('Failed to delete blog post');
    }
  },
};