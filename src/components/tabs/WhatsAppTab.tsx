import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Business, WhatsAppConfig } from '@/types';
import { MessageSquare, Edit2, Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppTabProps {
  businesses: Business[];
  configs: WhatsAppConfig[];
  onAdd: (config: Omit<WhatsAppConfig, 'id'>) => void;
  onUpdate: (id: string, config: Partial<WhatsAppConfig>) => void;
  onDelete: (id: string) => void;
}

export const WhatsAppTab: React.FC<WhatsAppTabProps> = ({
  businesses,
  configs,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    business_id: '',
    phone_number_id: '',
    access_token: '',
    verify_token: '',
    webhook_url: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.business_id || !formData.phone_number_id || !formData.access_token) {
      toast({
        title: "Error",
        description: "Business, Phone Number ID, and Access Token are required",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      onUpdate(editingId, {
        business_id: formData.business_id,
        phone_number_id: formData.phone_number_id,
        access_token: formData.access_token,
        verify_token: formData.verify_token,
        webhook_url: formData.webhook_url,
      });
      toast({
        title: "Success",
        description: "WhatsApp configuration updated successfully!",
      });
      setEditingId(null);
    } else {
      onAdd({
        business_id: formData.business_id,
        phone_number_id: formData.phone_number_id,
        access_token: formData.access_token,
        verify_token: formData.verify_token,
        webhook_url: formData.webhook_url,
        status: 'active',
      });
      toast({
        title: "Success",
        description: "WhatsApp configuration created successfully!",
      });
    }

    setFormData({
      business_id: '',
      phone_number_id: '',
      access_token: '',
      verify_token: '',
      webhook_url: '',
    });
  };

  const handleEdit = (config: WhatsAppConfig) => {
    setFormData({
      business_id: config.business_id,
      phone_number_id: config.phone_number_id,
      access_token: config.access_token,
      verify_token: config.verify_token || '',
      webhook_url: config.webhook_url || '',
    });
    setEditingId(config.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this WhatsApp configuration?')) {
      onDelete(id);
      toast({
        title: "Success",
        description: "WhatsApp configuration deleted successfully!",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      business_id: '',
      phone_number_id: '',
      access_token: '',
      verify_token: '',
      webhook_url: '',
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
            <MessageSquare className="w-5 h-5 text-primary" />
            {editingId ? 'Edit WhatsApp Configuration' : 'Add WhatsApp Configuration'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No businesses found. Please add a business first.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="configBusiness">Business *</Label>
                  <Select value={formData.business_id} onValueChange={(value) => setFormData(prev => ({ ...prev, business_id: value }))}>
                    <SelectTrigger className="transition-smooth focus:shadow-glow">
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
                  <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                  <Input
                    id="phoneNumberId"
                    value={formData.phone_number_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number_id: e.target.value }))}
                    placeholder="Enter phone number ID"
                    className="transition-smooth focus:shadow-glow"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token *</Label>
                  <Input
                    id="accessToken"
                    value={formData.access_token}
                    onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                    placeholder="Enter access token"
                    className="transition-smooth focus:shadow-glow"
                    type="password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verifyToken">Verify Token</Label>
                  <Input
                    id="verifyToken"
                    value={formData.verify_token}
                    onChange={(e) => setFormData(prev => ({ ...prev, verify_token: e.target.value }))}
                    placeholder="Enter verify token"
                    className="transition-smooth focus:shadow-glow"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={formData.webhook_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="Enter webhook URL"
                    className="transition-smooth focus:shadow-glow"
                    type="url"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="shadow-elegant hover:shadow-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Configuration' : 'Add Configuration'}
                </Button>
                {editingId && (
                  <Button type="button" variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Configurations List */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            WhatsApp Configurations ({configs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No businesses found. Add a business first.</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No WhatsApp configurations found. Add your first configuration above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => {
                const businessConfigs = configs.filter(c => c.business_id === business.id);
                
                return (
                  <Card key={business.id} className="bg-background/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {businessConfigs.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No WhatsApp configuration found for this business.</p>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setFormData(prev => ({ ...prev, business_id: business.id }))}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Configuration
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {businessConfigs.map((config) => (
                            <Card key={config.id} className="bg-background/50 hover:bg-background/80 transition-smooth hover:shadow-card">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
                                      {config.status}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium">Phone Number ID:</span>
                                      <p className="text-muted-foreground">{config.phone_number_id}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Access Token:</span>
                                      <p className="text-muted-foreground">{"*".repeat(config.access_token.length)}</p>
                                    </div>
                                    {config.webhook_url && (
                                      <div>
                                        <span className="font-medium">Webhook URL:</span>
                                        <p className="text-muted-foreground break-all">{config.webhook_url}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleEdit(config)}
                                      className="flex-1"
                                    >
                                      <Edit2 className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDelete(config.id)}
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