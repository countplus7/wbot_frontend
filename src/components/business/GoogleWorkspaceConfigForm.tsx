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
import { api } from "@/lib/api";

interface GoogleIntegrationStatus {
  isIntegrated: boolean;
  email?: string;
  lastUpdated?: string;
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

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/google/status/${businessId}`);

      if (response.data && typeof response.data === "object") {
        setIntegrationStatus(response.data);
      } else {
        // Fallback if response.data is not in expected format
        setIntegrationStatus({ isIntegrated: false });
      }
    } catch (err) {
      console.error("Error fetching integration status:", err);
      setError("Failed to fetch integration status");
      // Set fallback status on error
      setIntegrationStatus({ isIntegrated: false });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/google/auth/${businessId}`);
      if (response.data.success && response.data.authUrl) {
        // Open Google OAuth in a new window
        const authWindow = window.open(
          response.data.authUrl,
          "google-auth",
          "width=500,height=600,scrollbars=yes,resizable=yes"
        );

        // Poll for authentication completion
        const pollAuth = setInterval(() => {
          try {
            if (authWindow?.closed) {
              clearInterval(pollAuth);
              // Check for success in URL parameters (callback might have updated the parent)
              const urlParams = new URLSearchParams(window.location.search);
              if (urlParams.get("google_auth") === "success") {
                fetchIntegrationStatus();
                onSuccess?.();
                // Clean up URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
          } catch (e) {
            // Cross-origin error, continue polling
          }
        }, 1000);

        // Clean up after 5 minutes
        setTimeout(() => {
          clearInterval(pollAuth);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        }, 300000);
      } else {
        setError("Failed to initiate Google authentication");
      }
    } catch (err) {
      console.error("Error initiating Google auth:", err);
      setError("Failed to initiate Google authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveIntegration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.delete(`/google/remove/${businessId}`);
      if (response.data.success) {
        setIntegrationStatus({ isIntegrated: false });
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchIntegrationStatus();
    }
  }, [businessId]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          Google Workspace Integration
        </CardTitle>
        <CardDescription>
          Connect your business to Google Workspace services including Gmail, Calendar, Sheets, and Drive for seamless
          automation.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading integration status...</div>
          </div>
        ) : integrationStatus && integrationStatus.isIntegrated ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Connected to Google Workspace</p>
                  <p className="text-sm text-green-700">
                    Authenticated as: <span className="font-mono">{integrationStatus.email}</span>
                  </p>
                  {integrationStatus.lastUpdated && (
                    <p className="text-xs text-green-600">Last updated: {formatDate(integrationStatus.lastUpdated)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Gmail</p>
                  <p className="text-xs text-gray-600">Send & receive emails</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Calendar</p>
                  <p className="text-xs text-gray-600">Manage events</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Sheets</p>
                  <p className="text-xs text-gray-600">Read & write data</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Drive</p>
                  <p className="text-xs text-gray-600">File management</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Button variant="destructive" size="sm" onClick={handleRemoveIntegration} disabled={loading}>
                <Trash2 className="h-4 w-4" />
                Remove Integration
              </Button>

              <div className="flex gap-2">
                {onCancel && (
                  <Button variant="outline" onClick={onCancel}>
                    Close
                  </Button>
                )}
                <Button onClick={handleGoogleAuth} disabled={loading} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Reconnect
                </Button>
              </div>
            </div>
          </div>
        ) : !integrationStatus || !integrationStatus.isIntegrated ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect to Google Workspace</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Authorize your business to access Google Workspace services. You'll be redirected to Google to grant
                permissions.
              </p>

              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xs">G</span>
                </div>
                {loading ? "Connecting..." : "Connect with Google"}
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-sm">Gmail</p>
                  <p className="text-xs text-gray-600">Send & receive emails</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Calendar</p>
                  <p className="text-xs text-gray-600">Manage events</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Sheets</p>
                  <p className="text-xs text-gray-600">Read & write data</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Drive</p>
                  <p className="text-xs text-gray-600">File management</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
