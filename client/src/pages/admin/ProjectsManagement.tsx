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
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  validateRequiredFields, 
  validateOrderField, 
  validateDateRange,
  validateJson,
  validatePositiveNumber,
  combineValidationResults,
  formatValidationErrors,
  type ValidationResult 
} from '@/utils/formValidation';

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string[];
  links: Array<{ name: string; url: string }>;
  image?: string;
  gallery?: string[];
  project_type?: string;
  start_date?: string;
  end_date?: string;
  role?: string;
  team_size?: number;
  categories?: string[];
  is_visible: boolean;
  order: number;
  created_at: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  tech: string;
  links: string;
  image: string;
  project_type: string;
  start_date: string;
  end_date: string;
  role: string;
  team_size: string;
  categories: string;
  is_visible: boolean;
  order: string;
}

export default function ProjectsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    tech: '',
    links: '',
    image: '',
    project_type: '',
    start_date: '',
    end_date: '',
    role: '',
    team_size: '',
    categories: '',
    is_visible: true,
    order: '0'
  });

  // Comprehensive form validation
  const validateProjectForm = (data: ProjectFormData): ValidationResult => {
    const requiredValidation = validateRequiredFields(data, ['title', 'description']);
    const orderValidation = validateOrderField(data.order, {
      currentId: editingProject?.id,
      existingItems: projects || []
    });
    const dateValidation = validateDateRange(data.start_date, data.end_date);
    const linksValidation = data.links ? validateJson(data.links, 'Links') : { isValid: true, errors: {} };
    const teamSizeValidation = data.team_size ? validatePositiveNumber(data.team_size, 'Team Size') : { isValid: true, errors: {} };
    
    return combineValidationResults(
      requiredValidation, 
      orderValidation, 
      dateValidation, 
      linksValidation,
      teamSizeValidation
    );
  };

  const { data: projects, isLoading } = useQuery({
    queryKey: ['/api/projects/admin'],
    queryFn: async (): Promise<Project[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/projects/admin', {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch projects');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      // Validate form before submission
      const validation = validateProjectForm(data);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        throw new Error(formatValidationErrors(validation.errors));
      }
      
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        tech: data.tech.split(',').map(t => t.trim()).filter(Boolean),
        links: data.links ? JSON.parse(data.links) : [],
        team_size: data.team_size ? parseInt(data.team_size) : null,
        categories: data.categories.split(',').map(c => c.trim()).filter(Boolean),
        order: parseInt(data.order),
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create project' }));
        throw new Error(errorData.error || 'Failed to create project');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/admin'] });
      setIsCreateOpen(false);
      resetForm();
      setFormErrors({});
      toast({ title: 'Success', description: 'Project created successfully.' });
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
    mutationFn: async ({ id, data }: { id: number; data: ProjectFormData }) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        tech: data.tech.split(',').map(t => t.trim()).filter(Boolean),
        links: data.links ? JSON.parse(data.links) : [],
        team_size: data.team_size ? parseInt(data.team_size) : null,
        categories: data.categories.split(',').map(c => c.trim()).filter(Boolean),
        order: parseInt(data.order),
      };

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/admin'] });
      setEditingProject(null);
      resetForm();
      toast({ title: 'Success', description: 'Project updated successfully.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/admin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: 'Success', description: 'Project deleted successfully.' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tech: '',
      links: '',
      image: '',
      project_type: '',
      start_date: '',
      end_date: '',
      role: '',
      team_size: '',
      categories: '',
      is_visible: true,
      order: '0'
    });
    setFormErrors({});
  };

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      tech: project.tech?.join(', ') || '',
      links: JSON.stringify(project.links || []),
      image: project.image || '',
      project_type: project.project_type || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      role: project.role || '',
      team_size: project.team_size?.toString() || '',
      categories: project.categories?.join(', ') || '',
      is_visible: project.is_visible,
      order: project.order.toString()
    });
    setEditingProject(project);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Manage Projects">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projects</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" onClick={() => { resetForm(); setEditingProject(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogDescription>
                  Fill out the form below to {editingProject ? 'update' : 'create'} a project.
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
                    <Label htmlFor="project_type">Project Type</Label>
                    <Input
                      id="project_type"
                      value={formData.project_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tech">Technologies (comma-separated)</Label>
                    <Input
                      id="tech"
                      value={formData.tech}
                      onChange={(e) => setFormData(prev => ({ ...prev, tech: e.target.value }))}
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categories">Categories (comma-separated)</Label>
                    <Input
                      id="categories"
                      value={formData.categories}
                      onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
                      placeholder="Web Development, Full Stack"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="links">Links (JSON format)</Label>
                  <Textarea
                    id="links"
                    value={formData.links}
                    onChange={(e) => setFormData(prev => ({ ...prev, links: e.target.value }))}
                    placeholder='[{"name": "GitHub", "url": "https://github.com/..."}]'
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team_size">Team Size</Label>
                    <Input
                      id="team_size"
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                  />
                  <Label htmlFor="is_visible">Visible on portfolio</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingProject(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="text-white">
                    {editingProject ? 'Update' : 'Create'} Project
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Loading projects...</div>
        ) : (
          <div className="grid gap-4">
            {projects?.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {project.title}
                        <Badge variant={project.is_visible ? "default" : "secondary"}>
                          {project.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {project.project_type && `${project.project_type} • `}
                        Created: {new Date(project.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(project.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                  
                  {project.tech && project.tech.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Technologies: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.tech.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.links && project.links.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Links: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.links.map((link, index) => (
                          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {link.name}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order: {project.order}</span>
                    {project.role && <span>Role: {project.role}</span>}
                    {project.team_size && <span>Team: {project.team_size}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingProject} onOpenChange={(open) => {
        if (!open) {
          setEditingProject(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project information below.
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
                <Label htmlFor="edit-project_type">Project Type</Label>
                <Input
                  id="edit-project_type"
                  value={formData.project_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tech">Technologies (comma-separated)</Label>
                <Input
                  id="edit-tech"
                  value={formData.tech}
                  onChange={(e) => setFormData(prev => ({ ...prev, tech: e.target.value }))}
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-categories">Categories (comma-separated)</Label>
                <Input
                  id="edit-categories"
                  value={formData.categories}
                  onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
                  placeholder="Web Development, Full Stack"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-links">Links (JSON format)</Label>
              <Textarea
                id="edit-links"
                value={formData.links}
                onChange={(e) => setFormData(prev => ({ ...prev, links: e.target.value }))}
                placeholder='[{"name": "GitHub", "url": "https://github.com/..."}]'
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-team_size">Team Size</Label>
                <Input
                  id="edit-team_size"
                  type="number"
                  value={formData.team_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, team_size: e.target.value }))}
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
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
              <Label htmlFor="edit-is_visible">Visible on portfolio</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditingProject(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="text-white">
                Update Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}