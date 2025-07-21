import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  date: string;
  reading_time?: number;
  featured: boolean;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  tags?: Array<{
    id: number;
    name: string;
  }>;
}

export default function BlogPost() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/blogs/${id}`],
    queryFn: async (): Promise<BlogPost> => {
      const response = await fetch(`/api/blogs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation('/#blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/#blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </header>

      {/* Blog post content */}
      <main className="container py-8 max-w-4xl">
        <article className="space-y-8">
          {/* Header section */}
          <header className="space-y-6">
            {post.featured && (
              <Badge variant="secondary" className="mb-4">
                Featured Post
              </Badge>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              
              {post.reading_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.reading_time} min read</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Separator />

          {/* Cover image */}
          {post.cover_image && (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <img 
                src={post.cover_image} 
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Blog content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none
                       prose-headings:scroll-m-20 prose-headings:font-semibold
                       prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                       prose-p:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                       prose-blockquote:border-l-primary prose-blockquote:pl-6 prose-blockquote:italic
                       prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                       prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4
                       prose-ul:list-disc prose-ol:list-decimal
                       prose-li:marker:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Back to blog button */}
        <div className="mt-12 pt-8 border-t border-border/40">
          <Button onClick={() => setLocation('/#blog')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Posts
          </Button>
        </div>
      </main>
    </div>
  );
}