import React, { useState } from 'react';
import { Plus, Edit, Trash2, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusinesses, useDeleteBusiness } from '@/hooks/useBusinesses';
import { BusinessForm } from './BusinessForm';
import { WhatsAppConfigForm } from './WhatsAppConfigForm';
import { BusinessToneForm } from './BusinessToneForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Business } from '@/lib/api';

type FormType = 'business' | 'whatsapp' | 'tone' | null;

export const BusinessList: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [formType, setFormType] = useState<FormType>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  const { data: businesses = [], isLoading, error } = useBusinesses();
  const deleteBusiness = useDeleteBusiness();

  const handleCreateBusiness = () => {
    setSelectedBusiness(null);
    setFormType('business');
    setIsFormOpen(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setFormType('business');
    setIsFormOpen(true);
  };

  const handleWhatsAppConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType('whatsapp');
    setIsFormOpen(true);
  };

  const handleBusinessTone = (business: Business) => {
    setSelectedBusiness(business);
    setFormType('tone');
    setIsFormOpen(true);
  };

  const handleDeleteBusiness = (business: Business) => {
    setBusinessToDelete(business);
  };

  const confirmDelete = async () => {
    if (businessToDelete) {
      await deleteBusiness.mutateAsync(businessToDelete.id);
      setBusinessToDelete(null);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedBusiness(null);
    setFormType(null);
  };

  const renderForm = () => {
    switch (formType) {
      case 'business':
        return (
          <BusinessForm
            business={selectedBusiness}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        );
      case 'whatsapp':
        return (
          <WhatsAppConfigForm
            businessId={selectedBusiness?.id || 0}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        );
      case 'tone':
        return (
          <BusinessToneForm
            businessId={selectedBusiness?.id || 0}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading businesses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Management</h1>
          <p className="text-muted-foreground">
            Manage your businesses, WhatsApp configurations, and AI response tones
          </p>
        </div>
        <Button onClick={handleCreateBusiness}>
          <Plus className="mr-2 h-4 w-4" />
          Add Business
        </Button>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold">No businesses found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first business to get started with WhatsApp AI Bot
              </p>
              <Button onClick={handleCreateBusiness}>
                <Plus className="mr-2 h-4 w-4" />
                Create Business
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {business.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={business.status === 'active' ? 'default' : 'secondary'}>
                    {business.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBusiness(business)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWhatsAppConfig(business)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBusinessTone(business)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Tones
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBusiness(business)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formType === 'business' && (selectedBusiness ? 'Edit Business' : 'Create Business')}
              {formType === 'whatsapp' && 'WhatsApp Configuration'}
              {formType === 'tone' && 'Business Tone'}
            </DialogTitle>
            <DialogDescription>
              {formType === 'business' && (selectedBusiness ? 'Update the business information below.' : 'Create a new business by filling out the form below.')}
              {formType === 'whatsapp' && 'Configure WhatsApp settings for this business.'}
              {formType === 'tone' && 'Set up the communication tone for this business.'}
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!businessToDelete} onOpenChange={() => setBusinessToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the business
              "{businessToDelete?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 