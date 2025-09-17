import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle, XCircle, ExternalLink, Database, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AirtableConfig {
  id?: number;
  business_id: number;
  access_token: string;
  base_id: string;
  table_name: string;
  created_at?: string;
  updated_at?: string;
}

interface AirtableFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AirtableForm: React.FC<AirtableFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [config, setConfig] = useState<AirtableConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    access_token: '',
    base_id: '',
    table_name: ''
  });

  const { toast } = useToast();

  // Fetch existing configuration
  useEffect(() => {
    fetchConfig();
  }, [businessId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/airtable/config/${businessId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setConfig(data.data);
        setFormData({
          access_token: data.data.access_token || '',
          base_id: data.data.base_id || '',
          table_name: data.data.table_name || ''
        });
      }
    } catch (err) {
      console.error('Error fetching Airtable config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const testConnection = async () => {
    if (!formData.access_token || !formData.base_id || !formData.table_name) {
      setError('Please fill in all fields before testing');
      return;
    }

    try {
      setTesting(true);
      setError(null);

      // First save the config temporarily for testing
      await fetch(`/api/airtable/config/${businessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Then test the connection
      const response = await fetch(`/api/airtable/test/${businessId}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Connection Successful',
          description: 'Airtable connection is working properly!',
        });
      } else {
        setError(data.error || 'Connection test failed');
        toast({
          title: 'Connection Failed',
          description: data.error || 'Unable to connect to Airtable',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to test connection';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    if (!formData.access_token || !formData.base_id || !formData.table_name) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/airtable/config/${businessId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
        toast({
          title: 'Configuration Saved',
          description: 'Airtable configuration has been saved successfully!',
        });
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch (err) {
      const errorMessage = 'Failed to save configuration';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteConfig = async () => {
    if (!confirm('Are you sure you want to delete the Airtable configuration?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/airtable/config/${businessId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setConfig(null);
        setFormData({
          access_token: '',
          base_id: '',
          table_name: ''
        });
        toast({
          title: 'Configuration Deleted',
          description: 'Airtable configuration has been deleted successfully!',
        });
      } else {
        setError(data.error || 'Failed to delete configuration');
      }
    } catch (err) {
      const errorMessage = 'Failed to delete configuration';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !config) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading Airtable configuration...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle>Airtable FAQ Integration</CardTitle>
          </div>
          {config && (
            <Badge variant="secondary" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Configured</span>
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect your Airtable base to automatically answer FAQ questions from your customers.
          Your Airtable table should have columns named "Question" and "Answer".
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token *</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="patXXXXXXXXXXXXXX.XXXXXXXXXXXXXX"
              value={formData.access_token}
              onChange={(e) => handleInputChange('access_token', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Your Airtable personal access token. Get it from{' '}
              <a
                href="https://airtable.com/create/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Airtable Developer Hub
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_id">Base ID *</Label>
            <Input
              id="base_id"
              placeholder="appXXXXXXXXXXXXXX"
              value={formData.base_id}
              onChange={(e) => handleInputChange('base_id', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Your Airtable base ID. Find it in your base URL: airtable.com/appXXXXXXXXXXXXXX/...
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="table_name">Table Name *</Label>
            <Input
              id="table_name"
              placeholder="FAQs"
              value={formData.table_name}
              onChange={(e) => handleInputChange('table_name', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              The name of your Airtable table containing FAQs. Must have "Question" and "Answer" columns.
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <Button
              onClick={testConnection}
              disabled={testing || loading}
              variant="outline"
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Testing...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              onClick={saveConfig}
              disabled={loading || testing}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
          </div>

          {config && (
            <Button
              onClick={deleteConfig}
              disabled={loading || testing}
              variant="destructive"
              className="w-full"
            >
              Delete Configuration
            </Button>
          )}

          {onCancel && (
            <Button
              onClick={onCancel}
              disabled={loading || testing}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Create an Airtable base with a table containing your FAQs</li>
              <li>Ensure your table has columns named "Question" and "Answer"</li>
              <li>Generate a personal access token from Airtable Developer Hub</li>
              <li>Copy your base ID from the URL</li>
              <li>Enter the table name (e.g., "FAQs", "Support", etc.)</li>
            </ol>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
