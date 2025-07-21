import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, User as UserIcon } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface About {
  id: number;
  name: string;
  headline?: string;
  bio: string;
  photo?: string;
  cover_image?: string;
  location?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  resume_url?: string;
  social_links?: Record<string, string>;
}

interface AboutFormData {
  name: string;
  headline: string;
  bio: string;
  photo: string;
  cover_image: string;
  location: string;
  email: string;
  phone: string;
  birthday: string;
  resume_url: string;
  social_links: string;
}

export default function AboutManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AboutFormData>({
    name: '',
    headline: '',
    bio: '',
    photo: '',
    cover_image: '',
    location: '',
    email: '',
    phone: '',
    birthday: '',
    resume_url: '',
    social_links: ''
  });

  const { data: about, isLoading } = useQuery({
    queryKey: ['/api/about'],
    queryFn: async (): Promise<About> => {
      const response = await fetch('/api/about/');
      if (!response.ok) throw new Error('Failed to fetch about information');
      return response.json();
    },
    onSuccess: (data) => {
      setFormData({
        name: data.name || '',
        headline: data.headline || '',
        bio: data.bio || '',
        photo: data.photo || '',
        cover_image: data.cover_image || '',
        location: data.location || '',
        email: data.email || '',
        phone: data.phone || '',
        birthday: data.birthday || '',
        resume_url: data.resume_url || '',
        social_links: JSON.stringify(data.social_links || {}, null, 2)
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AboutFormData) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        social_links: data.social_links ? JSON.parse(data.social_links) : {},
      };

      const response = await fetch(`/api/about/${about?.id || 1}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to update about information');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/about'] });
      toast({ title: 'Success', description: 'About information updated successfully.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Manage About Information">
        <div>Loading about information...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage About Information">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">About Information</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal and professional information displayed on the portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData(prev => ({ ...prev, headline: e.target.value }))}
                    placeholder="e.g., Full Stack Developer & Tech Enthusiast"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={6}
                  required
                  placeholder="Write a compelling bio that showcases your background, skills, and interests..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="photo">Profile Photo URL</Label>
                  <Input
                    id="photo"
                    value={formData.photo}
                    onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image URL</Label>
                  <Input
                    id="cover_image"
                    value={formData.cover_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resume_url">Resume URL</Label>
                  <Input
                    id="resume_url"
                    value={formData.resume_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_links">Social Links (JSON format)</Label>
                <Textarea
                  id="social_links"
                  value={formData.social_links}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_links: e.target.value }))}
                  rows={8}
                  placeholder={`{
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "twitter": "https://twitter.com/username",
  "website": "https://yourwebsite.com"
}`}
                />
                <p className="text-xs text-muted-foreground">
                  Add your social media links in JSON format. Use keys like "github", "linkedin", "twitter", "website", etc.
                </p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateMutation.isPending} className="text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {about && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how your information currently appears on the portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{about.name}</h3>
                  {about.headline && <p className="text-muted-foreground">{about.headline}</p>}
                </div>
                
                {about.bio && (
                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-sm">{about.bio}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {about.location && (
                    <div>
                      <span className="font-medium">Location:</span> {about.location}
                    </div>
                  )}
                  {about.email && (
                    <div>
                      <span className="font-medium">Email:</span> {about.email}
                    </div>
                  )}
                  {about.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {about.phone}
                    </div>
                  )}
                  {about.birthday && (
                    <div>
                      <span className="font-medium">Birthday:</span> {new Date(about.birthday).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {about.social_links && Object.keys(about.social_links).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Social Links</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(about.social_links).map(([platform, url]) => (
                        <a 
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80"
                        >
                          {platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}