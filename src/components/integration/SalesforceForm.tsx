import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ExternalLink, Trash2, AlertCircle, Users, Building, TrendingUp, FileText } from "lucide-react";
import { SalesforceService, type SalesforceConfig } from "@/lib/services/salesforce-service";

// Interface for the integration status response from backend
interface SalesforceIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email: string;
  username: string;
  instance_url: string;
  lastUpdated: string;
}

interface SalesforceFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const SalesforceForm: React.FC<SalesforceFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isIntegrated: boolean;
    email?: string;
    username?: string;
    instance_url?: string;
    lastUpdated?: string;
    services?: Record<string, boolean>;
  }>({ isIntegrated: false });

  const [loading, setLoading] = useState(false);
  const [disLoading, setDisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<SalesforceConfig | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get integration status directly from the API
      const response = await fetch("/api/salesforce/config/");
      const data: SalesforceIntegrationStatus = await response.json();

      console.log("fetchIntegrationStatus response:", data); // Debug log

      if (data.success && data.isIntegrated) {
        const newStatus = {
          isIntegrated: data.isIntegrated,
          email: data.email,
          username: data.username,
          instance_url: data.instance_url,
          lastUpdated: data.lastUpdated,
          services: {
            leads: true,
            contacts: true,
            accounts: true,
            opportunities: true,
            cases: true,
          },
        };

        console.log("Setting integration status:", newStatus); // Debug log
        setIntegrationStatus(newStatus);
      } else {
        console.log("Not integrated, setting not integrated"); // Debug log
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

  const handleSalesforceAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get OAuth URL directly from the API
      const response = await fetch("/api/salesforce/auth/");
      const data = await response.json();

      console.log("OAuth response:", data); // Debug log

      if (data.success && data.authUrl) {
        // Calculate center position
        const left = screen.width / 2 - 250;
        const top = screen.height / 2 - 300;

        // Open OAuth URL in a popup window (centered)
        const popup = window.open(
          data.authUrl,
          "google-oauth",
          `width=500,height=600,scrollbars=yes,resizable=yes,left=${left},top=${top}`
        );

        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            // Refresh integration status after OAuth completion
            fetchIntegrationStatus();
          }
        }, 1000);
      } else {
        setError("Failed to get Salesforce OAuth URL");
      }
    } catch (err) {
      console.error("Error initiating Salesforce auth:", err);
      setError("Failed to initiate Salesforce authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIntegration = async () => {
    try {
      setDisLoading(true);
      setError(null);

      await SalesforceService.deleteSalesforceConfig(businessId);
      setIntegrationStatus({ isIntegrated: false });
      setConfig(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error removing integration:", err);
      setError("Failed to remove Salesforce integration");
    } finally {
      setDisLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStatus();
  }, [businessId]);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Salesforce Integration</h2>
        <p className="text-gray-600">
          Connect your Salesforce CRM to manage leads, contacts, accounts, opportunities, and cases
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Integration Status */}
      {integrationStatus.isIntegrated ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Salesforce Connected</CardTitle>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            <CardDescription className="text-green-700">
              Your Salesforce CRM is successfully connected and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Username</label>
                <p className="text-sm text-gray-900">{integrationStatus.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{integrationStatus.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Instance URL</label>
                <p className="text-sm text-gray-900 break-all">{integrationStatus.instance_url}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-sm text-gray-900">
                  {integrationStatus.lastUpdated ? new Date(integrationStatus.lastUpdated).toLocaleString() : "Unknown"}
                </p>
              </div>
            </div>

            <Separator />

            {/* Available Services */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Available Services</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Leads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Contacts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Accounts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Opportunities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Cases</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRemoveIntegration}
                disabled={disLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {disLoading ? "Removing..." : "Remove Integration"}
              </Button>
              <Button variant="outline" onClick={fetchIntegrationStatus} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh Status"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Connect to Salesforce</CardTitle>
            <CardDescription>
              Connect your Salesforce CRM to enable lead management, contact tracking, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">What you'll get:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Lead Management</h5>
                    <p className="text-xs text-gray-600">Create, update, and track leads from WhatsApp conversations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Contact Management</h5>
                    <p className="text-xs text-gray-600">Sync contact information and communication history</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Account Management</h5>
                    <p className="text-xs text-gray-600">Manage company accounts and relationships</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Opportunity Tracking</h5>
                    <p className="text-xs text-gray-600">Track sales opportunities and pipeline</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Case Management</h5>
                    <p className="text-xs text-gray-600">Create and manage support cases</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Connect Button */}
            <div className="text-center">
              <Button
                onClick={handleSalesforceAuth}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? "Connecting..." : "Connect to Salesforce"}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                You'll be redirected to Salesforce to authorize the connection
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {onSuccess && integrationStatus.isIntegrated && (
          <Button onClick={onSuccess} className="bg-blue-600 hover:bg-blue-700">
            Done
          </Button>
        )}
      </div>
    </div>
  );
};
