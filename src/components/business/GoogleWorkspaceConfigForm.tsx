import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  ExternalLink,
  Trash2,
  AlertCircle,
  Mail,
  Calendar,
  FileSpreadsheet,
  HardDrive,
} from "lucide-react";
import { GoogleService, type GoogleWorkspaceConfig } from "@/lib/services/google-service";

interface GoogleIntegrationStatus {
  isIntegrated: boolean;
  email?: string;
  lastUpdated?: string;
  services?: Record<string, boolean>;
}

interface GoogleWorkspaceConfigFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const GoogleWorkspaceConfigForm: React.FC<GoogleWorkspaceConfigFormProps> = ({
  businessId,
  onSuccess,
  onCancel,
}) => {
  const [integrationStatus, setIntegrationStatus] = useState<GoogleIntegrationStatus>({
    isIntegrated: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GoogleWorkspaceConfig | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get configuration
      const configResponse = await GoogleService.getGoogleConfig(businessId);

      if (configResponse.success && configResponse.data) {
        setConfig(configResponse.data);
        setIntegrationStatus({
          isIntegrated: configResponse.data.status === "active",
          email: configResponse.data.client_id, // Using client_id as identifier
          lastUpdated: configResponse.data.last_sync,
          services: {
            gmail: true,
            calendar: true,
            drive: true,
            sheets: true,
          },
        });
      } else {
        setIntegrationStatus({ isIntegrated: false });
        setConfig(null);
      }
    } catch (err) {
      console.error("Error fetching integration status:", err);
      setError("Failed to fetch integration status");
      setIntegrationStatus({ isIntegrated: false });
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get OAuth URL from backend
      const response = await GoogleService.getAuthUrl(businessId);

      if (response.success && response.data?.authUrl) {
        // Open OAuth URL in a popup window
        const popup = window.open(
          response.data.authUrl,
          "google-oauth",
          "width=500,height=600,scrollbars=yes,resizable=yes"
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
        setError("Failed to get Google OAuth URL");
      }
    } catch (err) {
      console.error("Error initiating Google auth:", err);
      setError("Failed to initiate Google authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection
      const response = await GoogleService.testGoogleConnection(businessId);

      if (response.success && response.data) {
        setIntegrationStatus((prev) => ({
          ...prev,
          services: response.data.services,
        }));

        if (response.data.status === "connected") {
          setError(null);
        } else {
          setError("Connection test failed: " + response.data.status);
        }
      } else {
        setError("Failed to test Google connection");
      }
    } catch (err) {
      console.error("Error testing Google connection:", err);
      setError("Failed to test Google connection");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIntegration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Delete configuration
      const response = await GoogleService.deleteGoogleConfig(businessId);

      if (response.success) {
        setIntegrationStatus({ isIntegrated: false });
        setConfig(null);
        onSuccess?.();
      } else {
        setError("Failed to remove Google integration");
      }
    } catch (err) {
      console.error("Error removing Google integration:", err);
      setError("Failed to remove Google integration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchIntegrationStatus();
    }
  }, [businessId]);

  const renderIntegrationStatus = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-muted-foreground">Checking integration status...</span>
        </div>
      );
    }

    if (integrationStatus.isIntegrated) {
      return (
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">Connected</span>
          {integrationStatus.email && (
            <span className="text-sm text-muted-foreground">({integrationStatus.email})</span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <span className="text-sm text-orange-600 font-medium">Not Connected</span>
      </div>
    );
  };

  const renderServiceStatus = (service: string, icon: React.ReactNode) => {
    const isActive = integrationStatus.services?.[service] || false;

    return (
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-sm">{service.charAt(0).toUpperCase() + service.slice(1)}</span>
        <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Google Workspace Integration</span>
          </CardTitle>
          <CardDescription>
            Connect your Google Workspace account to enable Gmail, Calendar, Drive, and Sheets integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Integration Status</h4>
              {renderIntegrationStatus()}
            </div>

            <div className="flex space-x-2">
              {integrationStatus.isIntegrated ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={loading}>
                    Test Connection
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleRemoveIntegration} disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </>
              ) : (
                <Button onClick={handleGoogleAuth} disabled={loading} size="sm">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Connect Google
                </Button>
              )}
            </div>
          </div>

          {integrationStatus.isIntegrated && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Connected Services</h4>
                <div className="grid grid-cols-2 gap-3">
                  {renderServiceStatus("gmail", <Mail className="h-4 w-4" />)}
                  {renderServiceStatus("calendar", <Calendar className="h-4 w-4" />)}
                  {renderServiceStatus("drive", <HardDrive className="h-4 w-4" />)}
                  {renderServiceStatus("sheets", <FileSpreadsheet className="h-4 w-4" />)}
                </div>
              </div>
            </>
          )}

          {config && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Configuration Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>Status:</strong> {config.status}
                  </p>
                  <p>
                    <strong>Client ID:</strong> {config.client_id.substring(0, 20)}...
                  </p>
                  <p>
                    <strong>Scopes:</strong> {config.scopes.join(", ")}
                  </p>
                  {config.last_sync && (
                    <p>
                      <strong>Last Sync:</strong> {new Date(config.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {onSuccess && integrationStatus.isIntegrated && (
          <Button onClick={onSuccess}>
            Continue
          </Button>
        )}
      </div> */}
    </div>
  );
};
