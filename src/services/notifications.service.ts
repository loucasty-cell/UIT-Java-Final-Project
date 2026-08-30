import { api } from "@/lib/api-client";
import { NotificationResponse, UnreadCountResponse } from "@/types/api";

export const notificationsService = {
  /**
   * Get all notifications for current user
   * GET /api/notifications/me
   */
  async getNotifications(): Promise<NotificationResponse[]> {
    return api.get<NotificationResponse[]>("/api/notifications/me");
  },

  /**
   * Mark a single notification as read
   * POST /api/notifications/{id}/read or PATCH
   */
  async markAsRead(id: string): Promise<NotificationResponse> {
    try {
      return await api.post<NotificationResponse>(`/api/notifications/${id}/read`);
    } catch {
      return api.patch<NotificationResponse>(`/api/notifications/${id}/read`);
    }
  },

  /**
   * Mark all user notifications as read
   * POST /api/notifications/mark-all-read
   */
  async markAllAsRead(): Promise<void> {
    return api.post<void>("/api/notifications/mark-all-read");
  },

  /**
   * Get count of unread notifications
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return api.get<UnreadCountResponse>("/api/notifications/unread-count");
  },

  /**
   * Delete a notification
   * DELETE /api/notifications/{id}
   */
  async deleteNotification(id: string): Promise<void> {
    return api.delete<void>(`/api/notifications/${id}`);
  },
};
