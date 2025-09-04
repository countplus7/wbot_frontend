import React, { useState } from "react";
import { Plus, Edit, Trash2, Settings, MessageSquare, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBusinesses, useDeleteBusiness } from "@/hooks/useBusinesses";
import { BusinessForm } from "./BusinessForm";
import { WhatsAppConfigForm } from "./WhatsAppConfigForm";
import { BusinessToneForm } from "./BusinessToneForm";
import { ChatHistory } from "../chat/ChatHistory";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Business } from "@/lib/api";

type FormType = "business" | "whatsapp" | "tone" | "chat-history" | null;

export const BusinessList: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [formType, setFormType] = useState<FormType>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);

  const { data: businesses = [], isLoading, error } = useBusinesses();
  const deleteBusiness = useDeleteBusiness();

  const handleCreateBusiness = () => {
    setSelectedBusiness(null);
    setFormType("business");
    setIsFormOpen(true);
  };

  const handleEditBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("business");
    setIsFormOpen(true);
  };

  const handleWhatsAppConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("whatsapp");
    setIsFormOpen(true);
  };

  const handleBusinessTone = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("tone");
    setIsFormOpen(true);
  };

  const handleChatHistory = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("chat-history");
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
      case "business":
        return <BusinessForm business={selectedBusiness} onSuccess={closeForm} onCancel={closeForm} />;
      case "whatsapp":
        return <WhatsAppConfigForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
      case "tone":
        return <BusinessToneForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading businesses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Error loading businesses: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Management</h1>
          <p className="text-muted-foreground">Manage your businesses, WhatsApp configurations, and AI tones</p>
        </div>
        <Button onClick={handleCreateBusiness} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Business
        </Button>
      </div>

      {/* Businesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{business.name}</CardTitle>
                <Badge variant={business.status === "active" ? "default" : "secondary"}>{business.status}</Badge>
              </div>
              {business.description && <CardDescription>{business.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(business.created_at).toLocaleDateString()}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditBusiness(business)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleWhatsAppConfig(business)}>
                    <Settings className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBusinessTone(business)}>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Tone
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleChatHistory(business)}>
                    <History className="w-3 h-3 mr-1" />
                    Chat History
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteBusiness(business)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Forms Modal */}
      {isFormOpen && (
        <Dialog open={isFormOpen} onOpenChange={closeForm}>
          <DialogContent
            className={`${
              formType === "chat-history" ? "max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh]" : "max-w-4xl max-h-[90vh]"
            } overflow-hidden`}
          >
            {formType === "chat-history" ? (
              // Full screen chat history
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <h2 className="text-2xl font-bold">Chat History - {selectedBusiness?.name}</h2>
                    <p className="text-muted-foreground">View conversation history and messages</p>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatHistory businessId={selectedBusiness?.id || 0} businessName={selectedBusiness?.name || ""} />
                </div>
              </div>
            ) : (
              // Regular modal for other forms
              <>
                <DialogHeader>
                  <DialogTitle>
                    {formType === "business" && (selectedBusiness ? "Edit Business" : "Create Business")}
                    {formType === "whatsapp" && "WhatsApp Configuration"}
                    {formType === "tone" && "Business Tone"}
                  </DialogTitle>
                  <DialogDescription>
                    {formType === "business" && "Manage business information"}
                    {formType === "whatsapp" && "Configure WhatsApp Business API settings"}
                    {formType === "tone" && "Set AI response tone and personality"}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto">{renderForm()}</div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!businessToDelete} onOpenChange={() => setBusinessToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{businessToDelete?.name}"? This action cannot be undone. All associated
              WhatsApp configurations, tones, and chat history will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
