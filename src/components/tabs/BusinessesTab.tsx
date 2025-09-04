import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Business } from "@/types";
import { Building2, Edit2, Trash2, Plus, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessesTabProps {
  businesses: Business[];
  onAdd: (business: Omit<Business, "id" | "created_at">) => void;
  onUpdate: (id: string, business: Partial<Business>) => void;
  onDelete: (id: string) => void;
  onNavigateToTones: () => void;
}

export const BusinessesTab: React.FC<BusinessesTabProps> = ({ 
  businesses, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onNavigateToTones 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Business name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      onUpdate(editingId, {
        name: formData.name,
        description: formData.description,
      });
      toast({
        title: "Success",
        description: "Business updated successfully!",
      });
      setEditingId(null);
    } else {
      onAdd({
        name: formData.name,
        description: formData.description,
        status: "active",
      });
      toast({
        title: "Success",
        description: "Business created successfully!",
      });
    }

    setFormData({ name: "", description: "" });
  };

  const handleEdit = (business: Business) => {
    setFormData({
      name: business.name,
      description: business.description || "",
    });
    setEditingId(business.id);
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This will also delete all associated WhatsApp configs and tones.`
      )
    ) {
      onDelete(id);
      toast({
        title: "Success",
        description: "Business deleted successfully!",
      });
    }
  };

  const handleTones = () => {
    onNavigateToTones();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {editingId ? "Edit Business" : "Add New Business"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter business name"
                className="transition-smooth focus:shadow-glow"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Description</Label>
              <Textarea
                id="businessDescription"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter business description"
                className="transition-smooth focus:shadow-glow resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="shadow-elegant hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                {editingId ? "Update Business" : "Add Business"}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Businesses List */}
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Businesses ({businesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {businesses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No businesses found. Add your first business above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <Card
                  key={business.id}
                  className="bg-background/50 hover:bg-background/80 transition-smooth hover:shadow-card"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2">{business.name}</CardTitle>
                        <Badge variant={business.status === "active" ? "default" : "secondary"}>
                          {business.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {business.description && (
                      <p className="text-sm text-muted-foreground mb-4">{business.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      Created: {new Date(business.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(business)} className="flex-1">
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleTones}
                        className="flex-1"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Tones
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(business.id, business.name)}
                        className="flex-1"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
