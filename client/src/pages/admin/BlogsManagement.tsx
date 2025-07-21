import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface Blog {
  id: number;
  title: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  date: string;
  reading_time?: number;
  featured: boolean;
  author_id?: number;
  tags: Array<{ id: number; name: string }>;
}

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  reading_time: string;
  featured: boolean;
  tag_names: string;
}

export default function BlogsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    excerpt: '',
    content: '',
    cover_image: '',
    reading_time: '',
    featured: false,
    tag_names: ''
  });

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['/api/blogs/admin'],
    queryFn: async (): Promise<Blog[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/blogs/admin', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch blogs');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        reading_time: data.reading_time ? parseInt(data.reading_time) : null,
        tags: data.tag_names.split(',').map(t => t.trim()).filter(Boolean),
      };

      const response = await fetch('/api/blogs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to create blog');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs/admin'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Blog created successfully.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BlogFormData }) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        reading_time: data.reading_time ? parseInt(data.reading_time) : null,
        tags: data.tag_names.split(',').map(t => t.trim()).filter(Boolean),
      };

      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to update blog');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs/admin'] });
      setEditingBlog(null);
      resetForm();
      toast({ title: 'Success', description: 'Blog updated successfully.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete blog');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blogs/admin'] });
      toast({ title: 'Success', description: 'Blog deleted successfully.' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      cover_image: '',
      reading_time: '',
      featured: false,
      tag_names: ''
    });
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      cover_image: blog.cover_image || '',
      reading_time: blog.reading_time?.toString() || '',
      featured: blog.featured,
      tag_names: blog.tags?.map(tag => tag.name).join(', ') || ''
    });
    setEditingBlog(blog);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Manage Blog Posts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" onClick={() => { resetForm(); setEditingBlog(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
                <DialogDescription>
                  Fill out the form below to {editingBlog ? 'update' : 'create'} a blog post.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                    <Input
                      id="reading_time"
                      type="number"
                      value={formData.reading_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, reading_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={2}
                    placeholder="Brief description of the blog post"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    required
                    placeholder="Write your blog content here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cover_image">Cover Image URL</Label>
                    <Input
                      id="cover_image"
                      value={formData.cover_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag_names">Tags (comma-separated)</Label>
                    <Input
                      id="tag_names"
                      value={formData.tag_names}
                      onChange={(e) => setFormData(prev => ({ ...prev, tag_names: e.target.value }))}
                      placeholder="react, javascript, tutorial"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">Featured post</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingBlog(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="text-white">
                    {editingBlog ? 'Update' : 'Create'} Blog Post
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Loading blog posts...</div>
        ) : (
          <div className="grid gap-4">
            {blogs?.map((blog) => (
              <Card key={blog.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {blog.title}
                        {blog.featured && <Star className="w-4 h-4 text-yellow-500" />}
                      </CardTitle>
                      <CardDescription>
                        Published: {new Date(blog.date).toLocaleDateString()}
                        {blog.reading_time && ` • ${blog.reading_time} min read`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(blog.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {blog.excerpt && (
                    <p className="text-sm text-muted-foreground mb-3">{blog.excerpt}</p>
                  )}
                  
                  <p className="text-sm mb-3 line-clamp-2">{blog.content.substring(0, 200)}...</p>
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Tags: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blog.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex gap-2">
                      <Badge variant={blog.featured ? "default" : "secondary"}>
                        {blog.featured ? "Featured" : "Regular"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingBlog} onOpenChange={(open) => {
        if (!open) {
          setEditingBlog(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update the blog post information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reading_time">Reading Time (minutes)</Label>
                <Input
                  id="edit-reading_time"
                  type="number"
                  value={formData.reading_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, reading_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-excerpt">Excerpt</Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="Brief description of the blog post"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
                placeholder="Write your blog content here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cover_image">Cover Image URL</Label>
                <Input
                  id="edit-cover_image"
                  value={formData.cover_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tag_names">Tags (comma-separated)</Label>
                <Input
                  id="edit-tag_names"
                  value={formData.tag_names}
                  onChange={(e) => setFormData(prev => ({ ...prev, tag_names: e.target.value }))}
                  placeholder="react, javascript, tutorial"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="edit-featured">Featured post</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditingBlog(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="text-white">
                Update Blog Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}