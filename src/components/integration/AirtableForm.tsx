import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Trash2,
  AlertCircle,
  Database,
  Save,
  FileText,
  Table,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { AirtableService, type AirtableConfig } from "@/lib/services/airtable-service";

interface AirtableFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AirtableForm: React.FC<AirtableFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isIntegrated: boolean;
    access_token?: string;
    base_id?: string;
    table_name?: string;
    lastUpdated?: string;
  }>({ isIntegrated: false });

  const [formData, setFormData] = useState({
    access_token: "",
    base_id: "",
    table_name: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching Airtable integration status for businessId:", businessId);
      const response = await AirtableService.getConfig(businessId);
      console.log("Airtable integration response:", response);

      if (response.success && response.data) {
        const data = response.data;
        console.log("Setting integration status to integrated:", data);
        const newStatus = {
          isIntegrated: true,
          access_token: data.access_token ? "••••••••••••••••" : undefined,
          base_id: data.base_id,
          table_name: data.table_name,
          lastUpdated: data.updated_at,
        };

        setIntegrationStatus(newStatus);
        setFormData({
          access_token: "",
          base_id: data.base_id,
          table_name: data.table_name,
        });
      } else {
        console.log("Setting integration status to not integrated");
        setIntegrationStatus({ isIntegrated: false });
      }
    } catch (err) {
      console.error("Error fetching integration status:", err);
      setError("Failed to fetch integration status");
      setIntegrationStatus({ isIntegrated: false });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      console.log("Saving Airtable configuration:", formData);
      const response = await AirtableService.saveConfig(businessId, formData);
      console.log("Save response:", response);

      if (response.success) {
        setSuccess("Airtable integration configured successfully");
        await fetchIntegrationStatus();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.error || "Failed to save configuration");
      }
    } catch (err: any) {
      console.error("Error saving configuration:", err);
      setError("Failed to save Airtable configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveIntegration = async () => {
    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      console.log("Removing Airtable integration");
      const response = await AirtableService.deleteConfig(businessId);
      console.log("Remove response:", response);

      if (response.success) {
        setIntegrationStatus({ isIntegrated: false });
        setFormData({
          access_token: "",
          base_id: "",
          table_name: "",
        });
        setSuccess("Airtable integration removed successfully");

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.error || "Failed to remove integration");
      }
    } catch (err: any) {
      console.error("Error removing integration:", err);
      setError("Failed to remove Airtable integration");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    console.log("AirtableForm useEffect triggered, businessId:", businessId);
    fetchIntegrationStatus();
  }, [businessId]);

  // Add debugging for state changes
  useEffect(() => {
    console.log("Integration status changed:", integrationStatus);
  }, [integrationStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-6 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="text-foreground">Airtable Integration</span>
            <CardDescription className="mt-2 text-muted-foreground">
              Connect your Airtable base to enable FAQ management and automated responses.
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {error && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        {/* Integration Status Section */}
        <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg text-foreground">Integration Status</span>
                {integrationStatus.isIntegrated ? (
                  <Badge className="bg-primary text-white border-0 px-3 py-1">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 bg-muted/50 text-muted-foreground">
                    Not Connected
                  </Badge>
                )}
              </div>

              {integrationStatus.base_id && (
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Base ID:</span>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {integrationStatus.base_id}
                  </span>
                </div>
              )}

              {integrationStatus.table_name && (
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Table:</span>
                  <span className="text-sm font-semibold text-foreground">{integrationStatus.table_name}</span>
                </div>
              )}

              {integrationStatus.lastUpdated && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date(integrationStatus.lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        {!integrationStatus.isIntegrated && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-6 border border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Airtable Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="access_token" className="text-sm font-medium">
                    Access Token *
                  </Label>
                  <Input
                    id="access_token"
                    type="password"
                    placeholder="patXXXXXXXXXXXXXX.XXXXXXXXXXXXXX"
                    value={formData.access_token}
                    onChange={(e) => handleInputChange("access_token", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_id" className="text-sm font-medium">
                    Base ID *
                  </Label>
                  <Input
                    id="base_id"
                    type="text"
                    placeholder="appXXXXXXXXXXXXXX"
                    value={formData.base_id}
                    onChange={(e) => handleInputChange("base_id", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table_name" className="text-sm font-medium">
                    Table Name *
                  </Label>
                  <Input
                    id="table_name"
                    type="text"
                    placeholder="FAQs"
                    value={formData.table_name}
                    onChange={(e) => handleInputChange("table_name", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {integrationStatus.isIntegrated && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-6 border border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Available Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">FAQ Management</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Active</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Auto Responses</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Active</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Table className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Real-time Sync</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Active</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Smart Matching</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {integrationStatus.isIntegrated ? (
            <Button
              onClick={handleRemoveIntegration}
              disabled={deleting}
              variant="destructive"
              size="lg"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Removing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Remove Integration
                </div>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSaveConfig}
              disabled={saving}
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
