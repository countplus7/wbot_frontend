import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Settings, MessageSquare, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBusinesses, useDeleteBusiness, useBusinessTones, businessKeys } from "@/hooks/use-businesses";
import { useQueryClient } from "@tanstack/react-query";
import { BusinessForm } from "./BusinessForm";
import { WhatsAppForm } from "./WhatsAppForm";
import { BusinessToneForm } from "./BusinessToneForm";
import { GoogleWorkspaceForm } from "../integration/GoogleWorkspaceForm";
import { HubSpotForm } from "../integration/HubSpotForm";
import { OdooForm } from "../integration/OdooForm";
import { AirtableForm } from "../integration/AirtableForm";
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

type FormType = "business" | "whatsapp" | "tone" | "chat-history" | "google" | "hubspot" | "odoo" | "airtable" | null;

export const BusinessList: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [formType, setFormType] = useState<FormType>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businesses = [], isLoading, error } = useBusinesses();
  const deleteBusiness = useDeleteBusiness();
  const queryClient = useQueryClient();

  // Only call the hook when tone modal is opened
  const { data: existingTones = [], isLoading: tonesLoading } = useBusinessTones(
    formType === "tone" ? selectedBusiness?.id || 0 : 0
  );

  // Add debug logging
  console.log("BusinessList - selectedBusiness:", selectedBusiness);
  console.log("BusinessList - existingTones:", existingTones);
  console.log("BusinessList - formType:", formType);

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

  const handleHubSpotConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("hubspot");
    setIsFormOpen(true);
  };

  const handleOdooConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("odoo");
    setIsFormOpen(true);
  };

  const handleAirtableConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("airtable");
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

  const closeForm = () => {
    setIsFormOpen(false);
    setFormType(null);
    setSelectedBusiness(null);
  };

  // Custom success handler that invalidates cache and closes form
  const handleFormSuccess = () => {
    // Invalidate the businesses query to refresh the data
    queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
    // Close the modal after successful operation
    closeForm();
  };

  const confirmDelete = async () => {
    if (businessToDelete) {
      await deleteBusiness.mutateAsync(businessToDelete.id);
      setBusinessToDelete(null);
    }
  };

  const renderForm = () => {
    switch (formType) {
      case "business":
        return <BusinessForm business={selectedBusiness} onSuccess={handleFormSuccess} onCancel={closeForm} />;
      case "whatsapp":
        return (
          <WhatsAppForm businessId={selectedBusiness?.id || 0} onSuccess={handleFormSuccess} onCancel={closeForm} />
        );
      case "tone":
        return (
          <BusinessToneForm businessId={selectedBusiness?.id || 0} onSuccess={handleFormSuccess} onCancel={closeForm} />
        );
      case "google":
        return (
          <GoogleWorkspaceForm
            businessId={selectedBusiness?.id || 0}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        );
      case "hubspot":
        return (
          <HubSpotForm businessId={selectedBusiness?.id || 0} onSuccess={handleFormSuccess} onCancel={closeForm} />
        );
      case "odoo":
        return (
          <OdooForm
            key={`odoo-${selectedBusiness?.id}`}
            businessId={selectedBusiness?.id || 0}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        );
      case "airtable":
        return (
          <AirtableForm
            key={`airtable-${selectedBusiness?.id}`}
            businessId={selectedBusiness?.id || 0}
            onSuccess={handleFormSuccess}
            onCancel={closeForm}
          />
        );
      case "chat-history":
        return <ChatHistory businessId={selectedBusiness?.id || 0} businessName={selectedBusiness?.name || ""} />;
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage businesses for your WhatsApp bot.</p>
        </div>
        <Button onClick={handleCreateBusiness} className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Business Cards */}
      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery ? "No businesses found matching your search." : "No businesses yet. Create your first one!"}
          </div>
        </div>
      ) : (
        <div>
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="relative p-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{business.name}</CardTitle>
                  <Badge variant={business.status === "active" ? "default" : "secondary"}>
                    {business.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-start space-y-1">
                  <p className="text-sm">{business.description || "No description"}</p>
                  <p className="text-sm">Created: {new Date(business.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="mt-5 text-start">Basic Configuration</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditBusiness(business)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleWhatsAppConfig(business)}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleToneConfig(business)}>
                      <Settings className="h-3 w-3 mr-1" />
                      Tone
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleChatHistory(business)}>
                      <History className="h-3 w-3 mr-1" />
                      Chat History
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="mt-5 text-start">External System Configuration</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleGoogleConfig(business)}>
                      <div className="w-4 h-4 mr-1 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">G</span>
                      </div>
                      Google
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleHubSpotConfig(business)}>
                      <div className="w-4 h-4 mr-1 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">H</span>
                      </div>
                      HubSpot
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleOdooConfig(business)}>
                      <div className="w-4 h-4 mr-1 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">O</span>
                      </div>
                      Odoo
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleAirtableConfig(business)}>
                      <div className="w-4 h-4 mr-1 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">A</span>
                      </div>
                      Airtable
                    </Button>
                  </div>
                </div>
              </div>
              <div className="absolute right-2 top-2">
                <Button variant="destructive" className="w-8 h-8" onClick={() => handleDeleteBusiness(business)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          className={`${
            formType === "chat-history" ? "max-w-[95vw] w-[95vw] h-[95vh]" : "max-w-4xl"
          } max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle>
              {formType === "business" && (selectedBusiness ? "Edit Business" : "Create Business")}
              {formType === "whatsapp" && "WhatsApp Configuration"}
              {formType === "tone" && "Business Tone Configuration"}
              {formType === "chat-history" && "Chat History"}
              {formType === "google" && "Google Workspace Integration"}
              {formType === "hubspot" && "HubSpot Integration"}
              {formType === "odoo" && "Odoo Integration"}
              {formType === "airtable" && "Airtable Integration"}
            </DialogTitle>
            <DialogDescription>
              {formType === "business" && "Configure your business details"}
              {formType === "whatsapp" && "Set up WhatsApp integration for this business"}
              {formType === "tone" && "Configure the tone and personality for this business"}
              {formType === "chat-history" && "View and manage chat history for this business"}
              {formType === "google" && "Connect your Google Workspace account"}
              {formType === "hubspot" && "Connect your HubSpot CRM"}
              {formType === "odoo" && "Connect your Odoo ERP system"}
              {formType === "airtable" && "Connect your Airtable CRM"}
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!businessToDelete} onOpenChange={() => setBusinessToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{businessToDelete?.name}"? This action cannot be undone.
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
