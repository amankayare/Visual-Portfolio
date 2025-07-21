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
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  validateRequiredFields, 
  validateOrderField, 
  validateDateRange,
  combineValidationResults,
  formatValidationErrors,
  type ValidationResult 
} from '@/utils/formValidation';

interface Experience {
  id: number;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  duration?: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
  color?: string;
  order: number;
  is_visible: boolean;
  created_at: string;
}

interface ExperienceFormData {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  duration: string;
  responsibilities: string;
  achievements: string;
  technologies: string;
  color: string;
  order: string;
  is_visible: boolean;
}

export default function ExperienceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ExperienceFormData>({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    duration: '',
    responsibilities: '',
    achievements: '',
    technologies: '',
    color: '',
    order: '0',
    is_visible: true
  });

  const { data: experiences, isLoading } = useQuery({
    queryKey: ['/api/experiences'],
    queryFn: async (): Promise<Experience[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/experiences/?admin=true', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch experiences');
      return response.json();
    },
  });

  // Comprehensive form validation
  const validateExperienceForm = (data: ExperienceFormData): ValidationResult => {
    const requiredValidation = validateRequiredFields(data, ['title', 'company']);
    const orderValidation = validateOrderField(data.order, {
      currentId: editingExperience?.id,
      existingItems: experiences || []
    });
    const dateValidation = validateDateRange(data.start_date, data.end_date);
    
    return combineValidationResults(requiredValidation, orderValidation, dateValidation);
  };

  const createMutation = useMutation({
    mutationFn: async (data: ExperienceFormData) => {
      // Validate form before submission
      const validation = validateExperienceForm(data);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        throw new Error(formatValidationErrors(validation.errors));
      }
      
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        responsibilities: data.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
        achievements: data.achievements.split('\n').map(a => a.trim()).filter(Boolean),
        technologies: data.technologies.split(',').map(t => t.trim()).filter(Boolean),
        order: parseInt(data.order),
      };

      const response = await fetch('/api/experiences/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create experience' }));
        throw new Error(errorData.error || 'Failed to create experience');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setIsCreateOpen(false);
      resetForm();
      setFormErrors({});
      toast({ title: 'Success', description: 'Experience created successfully.' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ExperienceFormData }) => {
      // Validate form before submission
      const validation = validateExperienceForm(data);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        throw new Error(formatValidationErrors(validation.errors));
      }
      
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        responsibilities: data.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
        achievements: data.achievements.split('\n').map(a => a.trim()).filter(Boolean),
        technologies: data.technologies.split(',').map(t => t.trim()).filter(Boolean),
        order: parseInt(data.order),
      };

      const response = await fetch(`/api/experiences/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update experience' }));
        throw new Error(errorData.error || 'Failed to update experience');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      setEditingExperience(null);
      resetForm();
      setFormErrors({});
      toast({ title: 'Success', description: 'Experience updated successfully.' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/experiences/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete experience');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/experiences'] });
      toast({ title: 'Success', description: 'Experience deleted successfully.' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      duration: '',
      responsibilities: '',
      achievements: '',
      technologies: '',
      color: '',
      order: '0',
      is_visible: true
    });
    setFormErrors({});
  };

  const handleEdit = (experience: Experience) => {
    setFormData({
      title: experience.title,
      company: experience.company,
      location: experience.location || '',
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      is_current: experience.is_current,
      duration: experience.duration || '',
      responsibilities: experience.responsibilities?.join('\n') || '',
      achievements: experience.achievements?.join('\n') || '',
      technologies: experience.technologies?.join(', ') || '',
      color: experience.color || '',
      order: experience.order.toString(),
      is_visible: experience.is_visible
    });
    setEditingExperience(experience);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExperience) {
      updateMutation.mutate({ id: editingExperience.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Manage Experience">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" onClick={() => { resetForm(); setEditingExperience(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExperience ? 'Edit Experience' : 'Create New Experience'}</DialogTitle>
                <DialogDescription>
                  Fill out the form below to {editingExperience ? 'update' : 'create'} a work experience entry.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={formErrors.title ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.title && <p className="text-sm text-red-500">{formErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className={formErrors.company ? 'border-red-500' : ''}
                      required
                    />
                    {formErrors.company && <p className="text-sm text-red-500">{formErrors.company}</p>}
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
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className={formErrors.start_date ? 'border-red-500' : ''}
                    />
                    {formErrors.start_date && <p className="text-sm text-red-500">{formErrors.start_date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      disabled={formData.is_current}
                      className={formErrors.end_date ? 'border-red-500' : ''}
                    />
                    {formErrors.end_date && <p className="text-sm text-red-500">{formErrors.end_date}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 2 years 3 months"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color Theme</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g., from-blue-500 to-purple-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                      className={formErrors.order ? 'border-red-500' : ''}
                    />
                    {formErrors.order && <p className="text-sm text-red-500">{formErrors.order}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                  <Textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                    rows={4}
                    placeholder="Led development team of 5 engineers
Architected and implemented microservices architecture
Reduced system response time by 40%"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Key Achievements (one per line)</Label>
                  <Textarea
                    id="achievements"
                    value={formData.achievements}
                    onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                    rows={3}
                    placeholder="Delivered 15+ projects on time and under budget
Improved team productivity by 30%
Mentored 3 junior developers"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technologies">Technologies Used (comma-separated)</Label>
                  <Input
                    id="technologies"
                    value={formData.technologies}
                    onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                    placeholder="React, Node.js, PostgreSQL, AWS"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_current"
                      checked={formData.is_current}
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        is_current: checked,
                        end_date: checked ? '' : prev.end_date
                      }))}
                    />
                    <Label htmlFor="is_current">Current position</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                    />
                    <Label htmlFor="is_visible">Visible on portfolio</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingExperience(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="text-white">
                    {editingExperience ? 'Update' : 'Create'} Experience
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Loading experiences...</div>
        ) : (
          <div className="grid gap-4">
            {experiences?.map((experience) => (
              <Card key={experience.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {experience.title}
                        <Badge variant={experience.is_visible ? "default" : "secondary"}>
                          {experience.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                        {experience.is_current && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {experience.company}
                        {experience.location && ` • ${experience.location}`}
                        {experience.duration && ` • ${experience.duration}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(experience)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(experience.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {experience.responsibilities && experience.responsibilities.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Responsibilities:</span>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                        {experience.responsibilities.map((resp, index) => (
                          <li key={index}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {experience.achievements && experience.achievements.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Key Achievements:</span>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                        {experience.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {experience.technologies && experience.technologies.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Technologies: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {experience.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order: {experience.order}</span>
                    <span>Added: {new Date(experience.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingExperience} onOpenChange={(open) => {
        if (!open) {
          setEditingExperience(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
            <DialogDescription>
              Update the experience information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company *</Label>
                <Input
                  id="edit-company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-start_date">Start Date</Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end_date">End Date</Label>
                <Input
                  id="edit-end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  disabled={formData.is_current}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 2 years 3 months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color Theme</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="e.g., from-blue-500 to-purple-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Display Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-responsibilities">Responsibilities (one per line)</Label>
              <Textarea
                id="edit-responsibilities"
                value={formData.responsibilities}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibilities: e.target.value }))}
                rows={4}
                placeholder="Led development team of 5 engineers
Architected and implemented microservices architecture
Reduced system response time by 40%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-achievements">Key Achievements (one per line)</Label>
              <Textarea
                id="edit-achievements"
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                rows={3}
                placeholder="Delivered 15+ projects on time and under budget
Improved team productivity by 30%
Mentored 3 junior developers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-technologies">Technologies Used (comma-separated)</Label>
              <Input
                id="edit-technologies"
                value={formData.technologies}
                onChange={(e) => setFormData(prev => ({ ...prev, technologies: e.target.value }))}
                placeholder="React, Node.js, PostgreSQL, AWS"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_current"
                  checked={formData.is_current}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    is_current: checked,
                    end_date: checked ? '' : prev.end_date
                  }))}
                />
                <Label htmlFor="edit-is_current">Current position</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                />
                <Label htmlFor="edit-is_visible">Visible on portfolio</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditingExperience(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="text-white">
                Update Experience
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}