import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ExternalLink, Award } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  validateRequiredFields, 
  validateUrl,
  combineValidationResults,
  formatValidationErrors,
  type ValidationResult 
} from '@/utils/formValidation';

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date?: string;
  credential_url?: string;
  image?: string;
  description?: string;
  skills?: string[];
  certificate_id?: string;
  expiration_date?: string;
}

interface CertificationFormData {
  name: string;
  issuer: string;
  date: string;
  credential_url: string;
  image: string;
  description: string;
  skills: string;
  certificate_id: string;
  expiration_date: string;
}

export default function CertificationsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    issuer: '',
    date: '',
    credential_url: '',
    image: '',
    description: '',
    skills: '',
    certificate_id: '',
    expiration_date: ''
  });

  // Comprehensive form validation
  const validateCertificationForm = (data: CertificationFormData): ValidationResult => {
    const requiredValidation = validateRequiredFields(data, ['name', 'issuer']);
    const urlValidation = data.credential_url ? validateUrl(data.credential_url, 'Credential URL') : { isValid: true, errors: {} };
    const imageValidation = data.image ? validateUrl(data.image, 'Image URL') : { isValid: true, errors: {} };
    
    return combineValidationResults(requiredValidation, urlValidation, imageValidation);
  };

  const { data: certifications, isLoading } = useQuery({
    queryKey: ['/api/certifications'],
    queryFn: async (): Promise<Certification[]> => {
      const response = await fetch('/api/certifications/');
      if (!response.ok) throw new Error('Failed to fetch certifications');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CertificationFormData) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      const response = await fetch('/api/certifications/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to create certification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      setIsCreateOpen(false);
      resetForm();
      toast({ title: 'Success', description: 'Certification created successfully.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CertificationFormData }) => {
      const token = localStorage.getItem('token');
      const payload = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      const response = await fetch(`/api/certifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error('Failed to update certification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      setEditingCert(null);
      resetForm();
      toast({ title: 'Success', description: 'Certification updated successfully.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/certifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete certification');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      toast({ title: 'Success', description: 'Certification deleted successfully.' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      date: '',
      credential_url: '',
      image: '',
      description: '',
      skills: '',
      certificate_id: '',
      expiration_date: ''
    });
  };

  const handleEdit = (cert: Certification) => {
    setFormData({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date || '',
      credential_url: cert.credential_url || '',
      image: cert.image || '',
      description: cert.description || '',
      skills: cert.skills?.join(', ') || '',
      certificate_id: cert.certificate_id || '',
      expiration_date: cert.expiration_date || ''
    });
    setEditingCert(cert);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCert) {
      updateMutation.mutate({ id: editingCert.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout title="Manage Certifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Certifications</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" onClick={() => { resetForm(); setEditingCert(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCert ? 'Edit Certification' : 'Create New Certification'}</DialogTitle>
                <DialogDescription>
                  Fill out the form below to {editingCert ? 'update' : 'create'} a certification.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Certification Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuer">Issuer *</Label>
                    <Input
                      id="issuer"
                      value={formData.issuer}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description of the certification"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Issue Date</Label>
                    <Input
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g., July 2024"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiration_date">Expiration Date</Label>
                    <Input
                      id="expiration_date"
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificate_id">Certificate ID</Label>
                    <Input
                      id="certificate_id"
                      value={formData.certificate_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificate_id: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credential_url">Credential URL</Label>
                    <Input
                      id="credential_url"
                      value={formData.credential_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, credential_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Certificate Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Related Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="Python, Machine Learning, Data Analysis"
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateOpen(false);
                    setEditingCert(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="text-white">
                    {editingCert ? 'Update' : 'Create'} Certification
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div>Loading certifications...</div>
        ) : (
          <div className="grid gap-4">
            {certifications?.map((cert) => (
              <Card key={cert.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        {cert.name}
                      </CardTitle>
                      <CardDescription>
                        {cert.issuer}
                        {cert.date && ` • Issued: ${cert.date}`}
                        {cert.certificate_id && ` • ID: ${cert.certificate_id}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(cert)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(cert.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {cert.description && (
                    <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                  )}
                  
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium">Skills: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cert.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex gap-4">
                      {cert.expiration_date && (
                        <span>Expires: {new Date(cert.expiration_date).toLocaleDateString()}</span>
                      )}
                    </div>
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Credential
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!editingCert} onOpenChange={(open) => {
        if (!open) {
          setEditingCert(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Certification</DialogTitle>
            <DialogDescription>
              Update the certification information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Certification Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-issuer">Issuer *</Label>
                <Input
                  id="edit-issuer"
                  value={formData.issuer}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Brief description of the certification"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Issue Date</Label>
                <Input
                  id="edit-date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="e.g., July 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expiration_date">Expiration Date</Label>
                <Input
                  id="edit-expiration_date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiration_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-certificate_id">Certificate ID</Label>
                <Input
                  id="edit-certificate_id"
                  value={formData.certificate_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, certificate_id: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-credential_url">Credential URL</Label>
                <Input
                  id="edit-credential_url"
                  value={formData.credential_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, credential_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">Certificate Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-skills">Related Skills (comma-separated)</Label>
              <Input
                id="edit-skills"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="Python, Machine Learning, Data Analysis"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditingCert(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="text-white">
                Update Certification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}