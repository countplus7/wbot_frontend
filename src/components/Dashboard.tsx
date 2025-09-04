import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Business, WhatsAppConfig, BusinessTone, TabType } from '@/types';
import { BusinessesTab } from './tabs/BusinessesTab';
import { WhatsAppTab } from './tabs/WhatsAppTab';
import { TonesTab } from './tabs/TonesTab';
import { Building2, MessageSquare, Palette } from 'lucide-react';
import { useBusinesses, useAllBusinessTones } from '@/hooks/useBusinesses';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('businesses');
  
  // Use React Query hooks
  const { data: businessesData = [] } = useBusinesses();
  const toneQueries = useAllBusinessTones();
  
  // Convert API businesses to the format expected by the tabs
  const businesses = businessesData.map(b => ({
    id: b.id.toString(),
    name: b.name,
    description: b.description || '',
    status: b.status,
    created_at: b.created_at,
  }));

  // Get all tones from the queries
  const allTones = toneQueries.flatMap(query => query.data || []);
  
  // Convert API tones to the format expected by the tabs
  const businessTones = allTones.map(t => ({
    id: t.id.toString(),
    business_id: t.business_id.toString(),
    name: t.name,
    description: t.description || '',
    tone_instructions: t.tone_instructions,
  }));

  // Temporary placeholder handlers (these should be removed when tabs are updated)
  const addBusiness = (business: Omit<Business, "id" | "created_at">) => {
    console.log('Add business:', business);
  };

  const updateBusiness = (id: string, business: Partial<Business>) => {
    console.log('Update business:', id, business);
  };

  const deleteBusiness = (id: string) => {
    console.log('Delete business:', id);
  };

  const addWhatsAppConfig = (config: Omit<WhatsAppConfig, 'id'>) => {
    console.log('Add WhatsApp config:', config);
  };

  const updateWhatsAppConfig = (id: string, config: Partial<WhatsAppConfig>) => {
    console.log('Update WhatsApp config:', id, config);
  };

  const deleteWhatsAppConfig = (id: string) => {
    console.log('Delete WhatsApp config:', id);
  };

  // Temporary empty configs array
  const whatsappConfigs: WhatsAppConfig[] = [];

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Card className="bg-gradient-card shadow-card border-0">
            <CardHeader className="pb-6">
              <CardTitle className="text-4xl font-bold text-foreground mb-4">
                🚀 WhatsApp Bot Business Management
              </CardTitle>
              <p className="text-lg text-muted-foreground">
                Manage your multi-tenant WhatsApp bot configurations and business tones
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-background/80 backdrop-blur-sm shadow-card">
            <TabsTrigger value="businesses" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              WhatsApp Configs
            </TabsTrigger>
            <TabsTrigger value="tones" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Business Tones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-6">
            <BusinessesTab
              businesses={businesses}
              onAdd={addBusiness}
              onUpdate={updateBusiness}
              onDelete={deleteBusiness}
              onNavigateToTones={() => setActiveTab('tones')}
            />
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppTab
              businesses={businesses}
              configs={whatsappConfigs}
              onAdd={addWhatsAppConfig}
              onUpdate={updateWhatsAppConfig}
              onDelete={deleteWhatsAppConfig}
            />
          </TabsContent>

          <TabsContent value="tones" className="space-y-6">
            <TonesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;