import { apiClient, type ApiResponse } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";

// Google Calendar interfaces
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  location?: string;
  htmlLink?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  created?: string;
  updated?: string;
}

export interface CreateCalendarEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  attendees?: string[];
  location?: string;
}

export interface UpdateCalendarEventData extends Partial<CreateCalendarEventData> {}

// Google Email interfaces
export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  subject?: string;
  from?: string;
  to?: string;
  body?: string;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
  isUnread: boolean;
}

export interface SendEmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    mimeType: string;
  }>;
}

// Google Workspace Configuration
export interface GoogleIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email: string;
  lastUpdated: string;
}

export interface GoogleWorkspaceConfig {
  id?: number;
  business_id: number;
  client_id: string;
  client_secret: string;
  refresh_token: string;
  access_token?: string;
  token_expiry?: string;
  scopes: string[];
  status: "active" | "inactive" | "error";
  last_sync?: string;
  error_message?: string;
}

// Google Service
export class GoogleService {
  // Google Workspace Configuration
  static async getGoogleConfig(businessId: number): Promise<ApiResponse<GoogleWorkspaceConfig>> {
    return apiClient.get<GoogleWorkspaceConfig>(`/google/config/${businessId}`);
  }

  static async createGoogleConfig(
    businessId: number,
    data: Omit<GoogleWorkspaceConfig, "id" | "business_id">
  ): Promise<ApiResponse<GoogleWorkspaceConfig>> {
    return apiClient.post<GoogleWorkspaceConfig>(`/google/config/${businessId}`, data);
  }

  static async updateGoogleConfig(
    businessId: number,
    data: Partial<Omit<GoogleWorkspaceConfig, "id" | "business_id">>
  ): Promise<ApiResponse<GoogleWorkspaceConfig>> {
    return apiClient.put<GoogleWorkspaceConfig>(`/google/config/${businessId}`, data);
  }

  static async deleteGoogleConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/google/config/${businessId}`);
  }

  // OAuth Integration
  static async getAuthUrl(businessId: number): Promise<ApiResponse<{ authUrl: string }>> {
    return apiClient.get<{ authUrl: string }>(`/google/auth/${businessId}`);
  }

  static async testGoogleConnection(
    businessId: number
  ): Promise<ApiResponse<{ status: string; services: Record<string, boolean> }>> {
    return apiClient.post<{ status: string; services: Record<string, boolean> }>(`/google/test/${businessId}`);
  }

  // Calendar Operations
  static async getCalendarEvents(
    businessId: number,
    params?: {
      maxResults?: number;
      timeMin?: string;
      timeMax?: string;
    }
  ): Promise<ApiResponse<CalendarEvent[]>> {
    const queryParams = new URLSearchParams();
    if (params?.maxResults) queryParams.append("maxResults", params.maxResults.toString());
    if (params?.timeMin) queryParams.append("timeMin", params.timeMin);
    if (params?.timeMax) queryParams.append("timeMax", params.timeMax);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<CalendarEvent[]>(`${API_ENDPOINTS.GOOGLE.CALENDAR.LIST(businessId)}${query}`);
  }

  static async getUpcomingEvents(businessId: number, maxResults: number = 10): Promise<ApiResponse<CalendarEvent[]>> {
    return apiClient.get<CalendarEvent[]>(
      `${API_ENDPOINTS.GOOGLE.CALENDAR.UPCOMING(businessId)}?maxResults=${maxResults}`
    );
  }

  static async createCalendarEvent(
    businessId: number,
    data: CreateCalendarEventData
  ): Promise<ApiResponse<CalendarEvent>> {
    return apiClient.post<CalendarEvent>(API_ENDPOINTS.GOOGLE.CALENDAR.CREATE(businessId), data);
  }

  static async updateCalendarEvent(
    businessId: number,
    eventId: string,
    data: UpdateCalendarEventData
  ): Promise<ApiResponse<CalendarEvent>> {
    return apiClient.put<CalendarEvent>(API_ENDPOINTS.GOOGLE.CALENDAR.UPDATE(businessId, eventId), data);
  }

  static async deleteCalendarEvent(businessId: number, eventId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.GOOGLE.CALENDAR.DELETE(businessId, eventId));
  }

  static async searchCalendarEvents(
    businessId: number,
    query: string,
    maxResults: number = 10
  ): Promise<ApiResponse<CalendarEvent[]>> {
    return apiClient.get<CalendarEvent[]>(
      `${API_ENDPOINTS.GOOGLE.CALENDAR.SEARCH(businessId)}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    );
  }

  // Email Operations
  static async getEmails(
    businessId: number,
    params?: {
      maxResults?: number;
      pageToken?: string;
      q?: string;
      labelIds?: string[];
    }
  ): Promise<ApiResponse<{ messages: EmailMessage[]; nextPageToken?: string; resultSizeEstimate: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.maxResults) queryParams.append("maxResults", params.maxResults.toString());
    if (params?.pageToken) queryParams.append("pageToken", params.pageToken);
    if (params?.q) queryParams.append("q", params.q);
    if (params?.labelIds) params.labelIds.forEach((id) => queryParams.append("labelIds", id));

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<{ messages: EmailMessage[]; nextPageToken?: string; resultSizeEstimate: number }>(
      `${API_ENDPOINTS.GOOGLE.EMAIL.LIST(businessId)}${query}`
    );
  }

  static async getUnreadEmails(businessId: number, maxResults: number = 10): Promise<ApiResponse<EmailMessage[]>> {
    return apiClient.get<EmailMessage[]>(`${API_ENDPOINTS.GOOGLE.EMAIL.UNREAD(businessId)}?maxResults=${maxResults}`);
  }

  static async sendEmail(
    businessId: number,
    data: SendEmailData
  ): Promise<ApiResponse<{ messageId: string; threadId: string }>> {
    return apiClient.post<{ messageId: string; threadId: string }>(API_ENDPOINTS.GOOGLE.EMAIL.SEND(businessId), data);
  }

  static async searchEmails(
    businessId: number,
    query: string,
    maxResults: number = 10
  ): Promise<ApiResponse<EmailMessage[]>> {
    return apiClient.get<EmailMessage[]>(
      `${API_ENDPOINTS.GOOGLE.EMAIL.SEARCH(businessId)}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`
    );
  }

  static async markEmailAsRead(businessId: number, messageId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/google/emails/${businessId}/${messageId}/read`);
  }

  static async markEmailAsUnread(businessId: number, messageId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/google/emails/${businessId}/${messageId}/unread`);
  }

  static async archiveEmail(businessId: number, messageId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/google/emails/${businessId}/${messageId}/archive`);
  }

  static async deleteEmail(businessId: number, messageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/google/emails/${businessId}/${messageId}`);
  }

  // Drive Operations (if needed)
  static async listDriveFiles(
    businessId: number,
    params?: {
      maxResults?: number;
      pageToken?: string;
      q?: string;
      orderBy?: string;
    }
  ): Promise<ApiResponse<{ files: any[]; nextPageToken?: string }>> {
    const queryParams = new URLSearchParams();
    if (params?.maxResults) queryParams.append("maxResults", params.maxResults.toString());
    if (params?.pageToken) queryParams.append("pageToken", params.pageToken);
    if (params?.q) queryParams.append("q", params.q);
    if (params?.orderBy) queryParams.append("orderBy", params.orderBy);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<{ files: any[]; nextPageToken?: string }>(`/google/drive/files/${businessId}${query}`);
  }

  // Sheets Operations (if needed)
  static async readSheet(
    businessId: number,
    spreadsheetId: string,
    range: string
  ): Promise<ApiResponse<{ values: any[][] }>> {
    return apiClient.get<{ values: any[][] }>(
      `/google/sheets/${businessId}/${spreadsheetId}/values/${encodeURIComponent(range)}`
    );
  }

  static async writeSheet(
    businessId: number,
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<ApiResponse<{ updatedCells: number }>> {
    return apiClient.post<{ updatedCells: number }>(
      `/google/sheets/${businessId}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      { values }
    );
  }

  // Bulk operations
  static async bulkCreateCalendarEvents(
    businessId: number,
    events: CreateCalendarEventData[]
  ): Promise<
    ApiResponse<{ created: CalendarEvent[]; failed: Array<{ error: string; data: CreateCalendarEventData }> }>
  > {
    return apiClient.post<{
      created: CalendarEvent[];
      failed: Array<{ error: string; data: CreateCalendarEventData }>;
    }>(`/google/calendar/bulk-create/${businessId}`, { events });
  }

  static async bulkDeleteCalendarEvents(
    businessId: number,
    eventIds: string[]
  ): Promise<ApiResponse<{ deleted: number; failed: number }>> {
    return apiClient.post<{ deleted: number; failed: number }>(`/google/calendar/bulk-delete/${businessId}`, {
      eventIds,
    });
  }

  static async bulkSendEmails(
    businessId: number,
    emails: SendEmailData[]
  ): Promise<
    ApiResponse<{
      sent: Array<{ messageId: string; threadId: string }>;
      failed: Array<{ error: string; data: SendEmailData }>;
    }>
  > {
    return apiClient.post<{
      sent: Array<{ messageId: string; threadId: string }>;
      failed: Array<{ error: string; data: SendEmailData }>;
    }>(`/google/emails/bulk-send/${businessId}`, { emails });
  }

  // Sync operations
  static async syncCalendar(businessId: number): Promise<ApiResponse<{ synchronized: number; errors: number }>> {
    return apiClient.post<{ synchronized: number; errors: number }>(`/google/calendar/sync/${businessId}`);
  }

  static async syncEmails(businessId: number): Promise<ApiResponse<{ synchronized: number; errors: number }>> {
    return apiClient.post<{ synchronized: number; errors: number }>(`/google/emails/sync/${businessId}`);
  }
}

// Export singleton instance
export const googleService = new GoogleService();
