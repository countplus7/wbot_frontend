export interface Business {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
}

export interface WhatsAppConfig {
  id: string;
  business_id: string;
  phone_number_id: string;
  access_token: string;
  verify_token?: string;
  webhook_url?: string;
}

export interface BusinessTone {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  tone_instructions: string;
}
