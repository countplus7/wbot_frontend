import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Settings, MessageSquare, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBusinesses, useDeleteBusiness } from "@/hooks/use-businesses";
import { BusinessForm } from "./BusinessForm";
import { WhatsAppConfigForm } from "./WhatsAppConfigForm";
import { BusinessToneForm } from "./BusinessToneForm";
import { GoogleWorkspaceConfigForm } from "./GoogleWorkspaceConfigForm";
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
import type { Business } from "@/lib/services/business-service";

type FormType = "business" | "whatsapp" | "tone" | "chat-history" | "google" | null;

export const BusinessList: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [formType, setFormType] = useState<FormType>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businesses = [], isLoading, error } = useBusinesses();
  const deleteBusiness = useDeleteBusiness();

  // Filter businesses based on search query
  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) {
      return businesses;
    }

    return businesses.filter(
      (business) =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [businesses, searchQuery]);

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

  const handleToneConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("tone");
    setIsFormOpen(true);
  };

  const handleGoogleConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("google");
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
    setFormType(null);
    setSelectedBusiness(null);
  };

  const renderForm = () => {
    switch (formType) {
      case "business":
        return <BusinessForm business={selectedBusiness} onSuccess={closeForm} onCancel={closeForm} />;
      case "whatsapp":
        return <WhatsAppConfigForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
      case "tone":
        return <BusinessToneForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
      case "google":
        return (
          <GoogleWorkspaceConfigForm
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
        <div className="text-start">
          <h1 className="text-3xl font-bold">Business Management</h1>
          <p className="text-muted-foreground">
            Manage all Businesses, WhatsApp configurations, AI tones and External System Integrations.
          </p>
        </div>
        <Button onClick={handleCreateBusiness} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Business
        </Button>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search businesses by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <div className="text-sm text-muted-foreground">
            {filteredBusinesses.length} of {businesses.length} businesses
          </div>
        )}
      </div>

      {/* Business Cards */}
      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery
              ? "No businesses found matching your search."
              : "No businesses found. Create your first business to get started."}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="hover:shadow-lg transition-shadow relative">
              <CardHeader>
                <div className="flex items-center">
                  <CardTitle className="text-lg mr-2">{business.name}</CardTitle>
                  <Badge variant={business.status === "active" ? "default" : "secondary"}>{business.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-start">{business.description}</CardDescription>
                  {/* <div className="text-sm text-end text-muted-foreground">
                    Created: {new Date(business.created_at).toLocaleDateString()}
                  </div> */}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-start">Basic Configuration</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditBusiness(business)}>
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleWhatsAppConfig(business)}>
                    <Settings className="w-3 h-3 mr-1" />
                    WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToneConfig(business)}>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Tone
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleChatHistory(business)}>
                    <History className="w-3 h-3 mr-1" />
                    Chat History
                  </Button>
                </div>
                <p className="mt-5 text-start">External System Configuration</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleGoogleConfig(business)}>
                    <div className="w-4 h-4 mr-1 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white font-bold text-[10px]">G</span>
                    </div>
                    Google
                  </Button>
                </div>
                <div className="absolute right-2 top-2">
                  <Button variant="destructive" className="w-8 h-8" onClick={() => handleDeleteBusiness(business)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
              <>
                <DialogHeader className="sr-only">
                  <DialogTitle>Chat History - {selectedBusiness?.name}</DialogTitle>
                  <DialogDescription>View conversation history for this business</DialogDescription>
                </DialogHeader>
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-6">
                    <div>
                      <h2 className="text-2xl font-bold">Chat History - {selectedBusiness?.name}</h2>
                      <p className="text-muted-foreground">View conversation history for this business</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {selectedBusiness && (
                      <ChatHistory businessId={selectedBusiness.id} businessName={selectedBusiness.name} />
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Regular form modal
              <>
                <DialogHeader>
                  <DialogTitle>
                    {formType === "business" && (selectedBusiness ? "Edit Business" : "Create Business")}
                    {formType === "whatsapp" && "WhatsApp Configuration"}
                    {formType === "tone" && "Business Tone Configuration"}
                  </DialogTitle>
                  <DialogDescription>
                    {formType === "business" && "Manage business information and settings."}
                    {formType === "whatsapp" && "Configure WhatsApp Business API settings for this business."}
                    {formType === "tone" && "Set the AI response tone and personality for this business."}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto px-2">{renderForm()}</div>
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
              Are you sure you want to delete "{businessToDelete?.name}"? This action cannot be undone and will also
              delete all associated WhatsApp configurations, tones, and chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
