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
      const response = await fetch(`/api/salesforce/config/${businessId}`);
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

      const response = await SalesforceService.getAuthUrl(businessId);
      if (response.success && response.data) {
        const { authUrl } = response.data;

        // Calculate center position
        const left = screen.width / 2 - 250;
        const top = screen.height / 2 - 300;

        const popup = window.open(
          authUrl,
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
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card via-card/95 to-accent/5 backdrop-blur-sm">
        <CardHeader className="pb-6 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-foreground">Salesforce Integration</span>
              <CardDescription className="mt-2 text-muted-foreground">
                Connect your Salesforce CRM to enable lead management, contact tracking, and more.
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

                {integrationStatus.email && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Connected as:</span>
                    <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {integrationStatus.email}
                    </span>
                  </div>
                )}

                {integrationStatus.username && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
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

          {/* Services Section */}
          <div className="space-y-6">
            {integrationStatus.isIntegrated ? (
              <div className="space-y-6">
                {/* Available Services Grid */}
                <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-6 border border-border/30">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Available Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">Leads</span>
                        <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">Contacts</span>
                        <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Building className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">Accounts</span>
                        <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">Opportunities</span>
                        <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 col-span-1 md:col-span-2">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">Cases</span>
                        <Badge className="ml-2 bg-primary text-white border-0 text-xs">Available</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleRemoveIntegration}
                    disabled={disLoading}
                    variant="destructive"
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {disLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Disconnecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Disconnect
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={handleSalesforceAuth}
                    disabled={loading}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Reconnecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Reconnect
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                  <Building className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Connect Salesforce</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Connect your Salesforce CRM to start using lead management, contact tracking, and more.
                  </p>
                </div>

                <Button
                  onClick={handleSalesforceAuth}
                  disabled={loading}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Connect Salesforce
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
