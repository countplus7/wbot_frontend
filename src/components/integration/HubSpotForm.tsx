import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ExternalLink, Trash2, AlertCircle, Users, Building, TrendingUp, FileText } from "lucide-react";
import { HubSpotService, type HubSpotConfig } from "@/lib/services/hubspot-service";

// Interface for the integration status response from backend
interface HubSpotIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email: string;
  user_id: string;
  lastUpdated: string;
}

interface HubSpotFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const HubSpotForm: React.FC<HubSpotFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isIntegrated: boolean;
    email?: string;
    user_id?: string;
    lastUpdated?: string;
    services?: Record<string, boolean>;
  }>({ isIntegrated: false });

  const [loading, setLoading] = useState(false);
  const [disLoading, setDisLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<HubSpotConfig | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get integration status directly from the API
      const response = await fetch(`/api/hubspot/config/${businessId}`);
      const data: HubSpotIntegrationStatus = await response.json();

      console.log("fetchIntegrationStatus response:", data); // Debug log

      if (data.success && data.isIntegrated) {
        const newStatus = {
          isIntegrated: data.isIntegrated,
          email: data.email,
          user_id: data.user_id,
          lastUpdated: data.lastUpdated,
          services: {
            contacts: true,
            companies: true,
            deals: true,
            search: true,
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

  const handleHubSpotAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await HubSpotService.getAuthUrl(businessId);
      if (response.success && response.data) {
        const { authUrl } = response.data;

        // Calculate center position
        const left = screen.width / 2 - 250;
        const top = screen.height / 2 - 300;

        const popup = window.open(
          authUrl,
          "hubspot-oauth",
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
        setError("Failed to get HubSpot OAuth URL");
      }
    } catch (err) {
      console.error("Error initiating HubSpot auth:", err);
      setError("Failed to initiate HubSpot authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIntegration = async () => {
    try {
      setDisLoading(true);
      setError(null);

      await HubSpotService.deleteConfig(businessId);
      setIntegrationStatus({ isIntegrated: false });
      setConfig(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error removing integration:", err);
      setError("Failed to remove HubSpot integration");
    } finally {
      setDisLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStatus();
  }, [businessId]);

  return (
    <Card>
      <CardHeader className="pb-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl">HubSpot CRM</CardTitle>
              <CardDescription>
                Connect your HubSpot account to manage contacts, companies, and deals
              </CardDescription>
            </div>
          </div>
          {integrationStatus.isIntegrated && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
          </div>
        )}

        {!loading && !integrationStatus.isIntegrated && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Building className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect to HubSpot</h3>
              <p className="text-muted-foreground mb-6">
                Integrate with HubSpot to manage your CRM data directly from WhatsApp conversations.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Make sure your HubSpot OAuth app is configured with the correct scopes and redirect URI.
              </p>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleHubSpotAuth} 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to HubSpot
              </Button>
            </div>
          </div>
        )}

        {!loading && integrationStatus.isIntegrated && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">HubSpot Connected</h3>
              </div>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Email:</strong> {integrationStatus.email}</p>
                <p><strong>User ID:</strong> {integrationStatus.user_id}</p>
                <p><strong>Last Updated:</strong> {new Date(integrationStatus.lastUpdated || '').toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Available Services</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Contacts</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Building className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Companies</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Deals</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Search</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Manage your HubSpot integration settings
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveIntegration}
                disabled={disLoading}
              >
                {disLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3 w-3 mr-2" />
                    Remove Integration
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {onCancel && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <Button variant="outline" onClick={onCancel} className="w-full">
              Back to Integrations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};