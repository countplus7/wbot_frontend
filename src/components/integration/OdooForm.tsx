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
  Users,
  Building,
  TrendingUp,
  FileText,
  Database,
  Save,
  TestTube,
} from "lucide-react";
import { OdooService, type OdooConfig, type OdooIntegrationStatus } from "@/lib/services/odoo-service";

interface OdooFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const OdooForm: React.FC<OdooFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isIntegrated: boolean;
    instance_url?: string;
    db?: string;
    username?: string;
    lastUpdated?: string;
    services?: Record<string, boolean>;
  }>({ isIntegrated: false });

  const [formData, setFormData] = useState({
    instance_url: "",
    db: "",
    username: "",
    api_key: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching Odoo integration status for businessId:", businessId);
      const response = await OdooService.getConfig(businessId);
      console.log("Odoo integration response:", response);

      if (response.success && response.data?.isIntegrated) {
        const data = response.data;
        console.log("Setting integration status to integrated:", data);
        const newStatus = {
          isIntegrated: data.isIntegrated,
          instance_url: data.instance_url,
          db: data.db,
          username: data.username,
          lastUpdated: data.lastUpdated,
          services: {
            crm: true,
            sales: true,
            accounting: true,
            helpdesk: true,
            inventory: true,
          },
        };

        setIntegrationStatus(newStatus);
        setFormData({
          instance_url: data.instance_url,
          db: data.db,
          username: data.username,
          api_key: "",
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
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    const { instance_url, db, username, api_key } = formData;

    if (!instance_url.trim()) {
      setError("Instance URL is required");
      return false;
    }

    if (!db.trim()) {
      setError("Database name is required");
      return false;
    }

    if (!username.trim()) {
      setError("Username is required");
      return false;
    }

    // Only require API key if we don't have an existing integration
    if (!integrationStatus.isIntegrated && !api_key.trim()) {
      setError("API Key is required");
      return false;
    }

    // Validate URL format
    try {
      new URL(instance_url);
    } catch {
      setError("Invalid instance URL format");
      return false;
    }

    return true;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    try {
      setTesting(true);
      setError(null);
      setSuccess(null);

      // Save the configuration first
      await OdooService.saveConfig(businessId, formData);

      // Then test the connection
      const response = await OdooService.testConnection(businessId);

      if (response.success) {
        setSuccess("Connection successful!");
        fetchIntegrationStatus();
      } else {
        setError("Connection test failed");
      }
    } catch (err: any) {
      console.error("Error testing connection:", err);
      setError(err.response?.data?.error || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await OdooService.saveConfig(businessId, formData);
      setSuccess("Configuration saved successfully");
      fetchIntegrationStatus();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error saving config:", err);
      setError(err.response?.data?.error || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveIntegration = async () => {
    try {
      setDeleting(true);
      setError(null);

      await OdooService.deleteConfig(businessId);
      setIntegrationStatus({ isIntegrated: false });
      setFormData({
        instance_url: "",
        db: "",
        username: "",
        api_key: "",
      });
      setSuccess("Odoo integration removed successfully");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error removing integration:", err);
      setError("Failed to remove Odoo integration");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    console.log("OdooForm useEffect triggered, businessId:", businessId);
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
            <span className="text-foreground">Odoo Integration</span>
            <CardDescription className="mt-2 text-muted-foreground">
              Connect your Odoo ERP system to enable CRM, sales, accounting, and helpdesk functionality.
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

              {integrationStatus.instance_url && (
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Instance:</span>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    {integrationStatus.instance_url}
                  </span>
                </div>
              )}

              {integrationStatus.db && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Database:</span>
                  <span className="text-sm font-semibold text-foreground">{integrationStatus.db}</span>
                </div>
              )}

              {integrationStatus.username && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Username:</span>
                  <span className="text-sm font-semibold text-foreground">{integrationStatus.username}</span>
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
              <h3 className="text-lg font-semibold text-foreground mb-4">Odoo Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instance_url" className="text-sm font-medium">
                    Instance URL *
                  </Label>
                  <Input
                    id="instance_url"
                    type="url"
                    placeholder="https://your-company.odoo.com"
                    value={formData.instance_url}
                    onChange={(e) => handleInputChange("instance_url", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="db" className="text-sm font-medium">
                    Database Name *
                  </Label>
                  <Input
                    id="db"
                    type="text"
                    placeholder="your-database-name"
                    value={formData.db}
                    onChange={(e) => handleInputChange("db", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username *
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin@yourcompany.com"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_key" className="text-sm font-medium">
                    API Key *
                  </Label>
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="Your API Key"
                    value={formData.api_key}
                    onChange={(e) => handleInputChange("api_key", e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <p>* All fields are required. You can generate an API key from your Odoo user preferences.</p>
              </div>
            </div>
          </div>
        )}

        {/* Services Section */}
        {integrationStatus.isIntegrated && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-6 border border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-4">Available Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">CRM & Leads</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Sales Orders</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Invoicing</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Helpdesk</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">Inventory Management</span>
                    <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
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
              disabled={saving || testing}
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

          {/* <Button
            onClick={handleTestConnection}
            disabled={testing || saving}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            {testing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                Testing Connection...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                Test Connection
              </div>
            )}
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
};
