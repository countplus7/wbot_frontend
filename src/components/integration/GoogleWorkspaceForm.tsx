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

// Interface for the integration status response from backend
interface GoogleIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email: string;
  lastUpdated: string;
}

interface GoogleWorkspaceFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const GoogleWorkspaceForm: React.FC<GoogleWorkspaceFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isIntegrated: boolean;
    email?: string;
    lastUpdated?: string;
    services?: Record<string, boolean>;
  }>({ isIntegrated: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<GoogleWorkspaceConfig | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get integration status directly from the API
      const response = await fetch(`/api/google/config/${businessId}`);
      const data: GoogleIntegrationStatus = await response.json();

      console.log("fetchIntegrationStatus response:", data); // Debug log

      if (data.success && data.isIntegrated) {
        const newStatus = {
          isIntegrated: data.isIntegrated,
          email: data.email,
          lastUpdated: data.lastUpdated,
          services: {
            gmail: true,
            calendar: true,
            drive: true,
            sheets: true,
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

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get OAuth URL directly from the API
      const response = await fetch(`/api/google/auth/${businessId}`);
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

      await GoogleService.deleteGoogleConfig(businessId);
      setIntegrationStatus({ isIntegrated: false });
      setConfig(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error removing integration:", err);
      setError("Failed to remove Google integration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrationStatus();
  }, [businessId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Google Workspace Integration
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
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Integration Status:</span>
                {integrationStatus.isIntegrated ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Connected</Badge>
                )}
              </div>
              {integrationStatus.email && (
                <p className="text-sm text-muted-foreground">
                  Connected as: <span className="text-primary">{integrationStatus.email}</span>
                </p>
              )}
              {integrationStatus.lastUpdated && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(integrationStatus.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            {integrationStatus.isIntegrated ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Gmail</span>
                    <Badge variant="outline" className="text-green-600">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Calendar</span>
                    <Badge variant="outline" className="text-green-600">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm">Sheets</span>
                    <Badge variant="outline" className="text-green-600">
                      Available
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm">Drive</span>
                    <Badge variant="outline" className="text-green-600">
                      Available
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-start gap-2">
                  <Button onClick={handleRemoveIntegration} disabled={loading} variant="destructive" size="sm">
                    {loading ? "Disconnecting..." : "Disconnect"}
                  </Button>
                  <Button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white hover:text-white"
                  >
                    {loading ? "Reconnecting..." : "Reconnect"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect your Google Workspace account to start using Gmail, Calendar, Drive, and Sheets integration.
                </p>
                <Button onClick={handleGoogleAuth} disabled={loading} className="w-full">
                  {loading ? "Connecting..." : "Connect Google"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
