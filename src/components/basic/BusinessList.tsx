import React, { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Settings, MessageSquare, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBusinesses, useDeleteBusiness, useBusinessTones } from "@/hooks/use-businesses";
import { BusinessForm } from "./BusinessForm";
import { WhatsAppForm } from "./WhatsAppForm";
import { BusinessToneForm } from "./BusinessToneForm";
import { GoogleWorkspaceForm } from "../integration/GoogleWorkspaceForm";
import { SalesforceForm } from "../integration/SalesforceForm";
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

type FormType = "business" | "whatsapp" | "tone" | "chat-history" | "google" | "salesforce" | null;

export const BusinessList: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [formType, setFormType] = useState<FormType>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: businesses = [], isLoading, error } = useBusinesses();
  const deleteBusiness = useDeleteBusiness();

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

  const handleSalesforceConfig = (business: Business) => {
    setSelectedBusiness(business);
    setFormType("salesforce");
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

  const confirmDelete = async () => {
    if (businessToDelete) {
      await deleteBusiness.mutateAsync(businessToDelete.id);
      setBusinessToDelete(null);
    }
  };

  const renderForm = () => {
    switch (formType) {
      case "business":
        return <BusinessForm business={selectedBusiness} onSuccess={closeForm} onCancel={closeForm} />;
      case "whatsapp":
        return <WhatsAppForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
      case "tone":
        return <BusinessToneForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
      case "google":
        return (
          <GoogleWorkspaceForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />
        );
      case "salesforce":
        return <SalesforceForm businessId={selectedBusiness?.id || 0} onSuccess={closeForm} onCancel={closeForm} />;
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="text-muted-foreground">Manage your WhatsApp bot businesses</p>
        </div>
        <Button onClick={handleCreateBusiness} className="bg-blue-600 hover:bg-blue-700">
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
            <Card key={business.id} className="relative">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{business.name}</CardTitle>
                  <Badge variant={business.status ? "default" : "secondary"}>
                    {business.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm">{business.description || "No description"}</span>
                  <span className="text-sm">Created: {new Date(business.created_at).toLocaleDateString()}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <p className="mt-5 text-start">External System Configuration</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleGoogleConfig(business)}>
                    <div className="w-4 h-4 mr-1 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white font-bold text-[10px]">G</span>
                    </div>
                    Google
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSalesforceConfig(business)}>
                    <div className="w-4 h-4 mr-1 bg-blue-500 rounded-sm flex items-center justify-center">
                      <span className="text-white font-bold text-[10px]">S</span>
                    </div>
                    Salesforce
                  </Button>
                </div>
              </CardContent>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formType === "business" && (selectedBusiness ? "Edit Business" : "Create Business")}
              {formType === "whatsapp" && "WhatsApp Configuration"}
              {formType === "tone" && "Business Tone Configuration"}
              {formType === "google" && "Google Workspace Integration"}
              {formType === "salesforce" && "Salesforce Integration"}
              {formType === "chat-history" && "Chat History"}
            </DialogTitle>
            <DialogDescription>
              {formType === "business" && "Configure your business details"}
              {formType === "whatsapp" && "Set up WhatsApp integration for this business"}
              {formType === "tone" && "Configure the tone and personality for this business"}
              {formType === "google" && "Connect your Google Workspace account"}
              {formType === "salesforce" && "Connect your Salesforce CRM"}
              {formType === "chat-history" && "View conversation history for this business"}
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
