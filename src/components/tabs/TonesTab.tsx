import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Business, BusinessTone } from '@/types';
import { Palette, Edit2, Trash2, Plus, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBusinesses, useAllBusinessTones, useCreateBusinessTone, useUpdateBusinessTone } from '@/hooks/useBusinesses';

export const TonesTab: React.FC = () => {
  const [formData, setFormData] = useState({
    business_id: '',
    name: '',
    description: '',
    tone_instructions: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Use React Query hooks to get real-time data
  const { data: businessesData = [], isLoading: businessesLoading, error: businessesError } = useBusinesses();
  const toneQueries = useAllBusinessTones();
  const createTone = useCreateBusinessTone();
  const updateTone = useUpdateBusinessTone();

  // Debug logging
  console.log('TonesTab Debug:', {
    businessesData,
    businessesLoading,
    businessesError,
    toneQueries: toneQueries.map(q => ({ 
      data: q.data, 
      isLoading: q.isLoading, 
      error: q.error
    }))
  });

  // Show loading state if businesses are still loading
  if (businessesLoading) {
    return <div>Loading businesses...</div>;
  }

  // Show error state if there's an error loading businesses
  if (businessesError) {
    return <div>Error loading businesses: {businessesError.message}</div>;
  }

  // Convert API data to the format expected by the component
  const businesses = businessesData.map(b => ({
    id: b.id.toString(),
    name: b.name,
    description: b.description || '',
    status: b.status,
    created_at: b.created_at,
  }));

  // Get all tones from the queries and convert to consistent format
  const allTones = toneQueries.flatMap(query => query.data || []);
  
  // Check if any tone queries are still loading
  const tonesLoading = toneQueries.some(query => query.isLoading);
  
  if (tonesLoading) {
    return <div>Loading tones...</div>;
  }

  console.log('TonesTab - allTones:', allTones);

  // Convert API tones to the format expected by the component
  const tones = allTones.map(t => ({
    id: t.id.toString(),
    business_id: t.business_id.toString(),
    name: t.name,
    description: t.description || '',
    tone_instructions: t.tone_instructions,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_id || !formData.name || !formData.tone_instructions) {
      toast({
        title: "Error",
        description: "Business, name, and tone instructions are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        await updateTone.mutateAsync({
          id: Number(editingId),
          data: {
            business_id: Number(formData.business_id),
            name: formData.name,
            description: formData.description,
            tone_instructions: formData.tone_instructions,
          }
        });
        setEditingId(null);
      } else {
        await createTone.mutateAsync({
          businessId: Number(formData.business_id),
          data: {
            name: formData.name,
            description: formData.description,
            tone_instructions: formData.tone_instructions,
          }
        });
      }

      setFormData({
        business_id: '',
        name: '',
        description: '',
        tone_instructions: '',
      });
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleEdit = (tone: BusinessTone) => {
    setFormData({
      business_id: tone.business_id.toString(),
      name: tone.name,
      description: tone.description || '',
      tone_instructions: tone.tone_instructions,
    });
    setEditingId(tone.id.toString());
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the tone "${name}"?`)) {
      try {
        await deleteTone.mutateAsync(Number(id));
      } catch (error) {
        // Error handling is done in the mutation hooks
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      business_id: '',
      name: '',
      description: '',
      tone_instructions: '',
    });
  };

  const getBusinessName = (businessId: string) => {
    return businesses.find(b => b.id === businessId)?.name || 'Unknown Business';
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            {editingId ? 'Edit Business Tone' : 'Add Business Tone'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No businesses available. Please create a business first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_id">Business *</Label>
                  <Select
                    value={formData.business_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, business_id: value }))}
                    disabled={!!editingId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Tone Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Professional, Friendly"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the tone (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone_instructions">Tone Instructions *</Label>
                <Textarea
                  id="tone_instructions"
                  value={formData.tone_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, tone_instructions: e.target.value }))}
                  placeholder="Describe how the AI should respond (e.g., 'Be professional and formal', 'Use casual language with emojis')"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2 pt-4">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={createTone.isPending || updateTone.isPending}>
                  {createTone.isPending || updateTone.isPending ? 'Saving...' : (editingId ? 'Update Tone' : 'Create Tone')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Tones List */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Business Tones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No business tones found. Add your first tone above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => {
                const businessTones = tones.filter(t => t.business_id === business.id);
                
                return (
                  <Card key={business.id} className="bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {businessTones.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No tones configured for this business.</p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setFormData(prev => ({ ...prev, business_id: business.id }))}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Tone
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {businessTones.map((tone) => (
                            <Card key={tone.id} className="bg-gradient-secondary hover:bg-background/80 transition-smooth hover:shadow-card border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-semibold">{tone.name}</h4>
                                  </div>
                                  
                                  {tone.description && (
                                    <div>
                                      <span className="text-sm font-medium">Description:</span>
                                      <p className="text-sm text-muted-foreground mt-1">{tone.description}</p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <span className="text-sm font-medium">Instructions:</span>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                      {tone.tone_instructions}
                                    </p>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleEdit(tone)}
                                      className="flex-1"
                                    >
                                      <Edit2 className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDelete(tone.id, tone.name)}
                                      className="flex-1"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};