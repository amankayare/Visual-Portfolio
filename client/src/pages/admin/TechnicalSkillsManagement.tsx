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
import { Plus, Edit, Trash2, Code2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  validateRequiredFields, 
  validateOrderField, 
  combineValidationResults,
  formatValidationErrors,
  type ValidationResult 
} from '@/utils/formValidation';

interface TechnicalSkill {
  id: number;
  title: string;
  skills?: string[];
  color?: string;
  icon?: string;
  order: number;
  is_visible: boolean;
  created_at: string;
}

interface TechnicalSkillFormData {
  title: string;
  skills: string;
  color: string;
  icon: string;
  order: string;
  is_visible: boolean;
}

export default function TechnicalSkillsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TechnicalSkill | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<TechnicalSkillFormData>({
    title: '',
    skills: '',
    color: '',
    icon: '',
    order: '0',
    is_visible: true
  });

  // Comprehensive form validation
  const validateTechnicalSkillForm = (data: TechnicalSkillFormData): ValidationResult => {
    const requiredValidation = validateRequiredFields(data, ['title']);
    const orderValidation = validateOrderField(data.order, {
      currentId: editingSkill?.id,
      existingItems: technicalSkills || []
    });
    
    return combineValidationResults(requiredValidation, orderValidation);
  };

  const { data: technicalSkills, isLoading } = useQuery({
    queryKey: ['/api/technical-skills'],
    queryFn: async (): Promise<TechnicalSkill[]> => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/technical-skills/?admin=true', {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch technical skills');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TechnicalSkillFormData) => {
      // Validate form before submission
      const validation = validateTechnicalSkillForm(data);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        throw new Error(formatValidationErrors(validation.errors));
      }
      
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        order: parseInt(data.order),
      };

      const response = await fetch('/api/technical-skills/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create technical skill' }));
        throw new Error(errorData.error || 'Failed to create technical skill');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technical-skills'] });
      setIsCreateOpen(false);
      resetForm();
      setFormErrors({});
      toast({ title: 'Success', description: 'Technical skill created successfully.' });
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
    mutationFn: async ({ id, data }: { id: number; data: TechnicalSkillFormData }) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        order: parseInt(data.order),
      };

      const response = await fetch(`/api/technical-skills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to update technical skill');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technical-skills'] });
      setEditingSkill(null);
      resetForm();
      toast({ title: 'Success', description: 'Technical skill updated successfully.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/technical-skills/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete technical skill');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technical-skills'] });
      toast({ title: 'Success', description: 'Technical skill deleted successfully.' });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      skills: '',
      color: '',
      icon: '',
      order: '0',
      is_visible: true
    });
    setFormErrors({});
  };

  const handleEdit = (skill: TechnicalSkill) => {
    setFormData({
      title: skill.title,
      skills: skill.skills?.join(', ') || '',
      color: skill.color || '',
      icon: skill.icon || '',
      order: skill.order.toString(),
      is_visible: skill.is_visible
    });
    setEditingSkill(skill);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Manage Technical Skills">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Technical Skills</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" onClick={() => { resetForm(); setEditingSkill(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Skill Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSkill ? 'Edit Technical Skill' : 'Create New Technical Skill'}</DialogTitle>
                <DialogDescription>
                  Fill out the form below to {editingSkill ? 'update' : 'create'} a technical skill category.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Category Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      placeholder="e.g., Frontend Development, DevOps"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="e.g., Code, Database, Cloud"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (comma-separated) *</Label>
                  <Textarea
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    rows={3}
                    required
                    placeholder="React, Vue.js, Angular, TypeScript, JavaScript, HTML5, CSS3"
                  />
                  <p className="text-xs text-muted-foreground">
                    List the specific skills or technologies for this category, separated by commas.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color/Gradient</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g., from-blue-500 to-purple-600"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tailwind CSS gradient or color classes for the card styling.
                    </p>
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
                    setEditingSkill(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="text-white">
                    {editingSkill ? 'Update' : 'Create'} Skill Category
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Loading technical skills...</div>
        ) : (
          <div className="grid gap-4">
            {technicalSkills?.map((skill) => (
              <Card key={skill.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="w-5 h-5" />
                        {skill.title}
                        <Badge variant={skill.is_visible ? "default" : "secondary"}>
                          {skill.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {skill.icon && `Icon: ${skill.icon} • `}
                        {skill.skills?.length || 0} skills
                        {skill.color && ` • ${skill.color}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(skill)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(skill.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {skill.skills && skill.skills.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Skills: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {skill.skills.map((skillName, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skillName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order: {skill.order}</span>
                    <span>Added: {new Date(skill.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingSkill} onOpenChange={(open) => {
        if (!open) {
          setEditingSkill(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Technical Skill</DialogTitle>
            <DialogDescription>
              Update the technical skill category information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Category Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="e.g., Frontend Development, DevOps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-icon">Icon Name</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g., Code, Database, Cloud"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-skills">Skills (comma-separated) *</Label>
              <Textarea
                id="edit-skills"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                rows={3}
                required
                placeholder="React, Vue.js, Angular, TypeScript, JavaScript, HTML5, CSS3"
              />
              <p className="text-xs text-muted-foreground">
                List the specific skills or technologies for this category, separated by commas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color/Gradient</Label>
                <Input
                  id="edit-color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="e.g., from-blue-500 to-purple-600"
                />
                <p className="text-xs text-muted-foreground">
                  Tailwind CSS gradient or color classes for the card styling.
                </p>
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
                setEditingSkill(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="text-white">
                Update Skill Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}