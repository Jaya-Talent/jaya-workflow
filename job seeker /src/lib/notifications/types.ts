export type NotificationChannel = "telegram" | "email";
export type NotificationType = "instant" | "daily_digest" | "weekly_digest";
export type NotificationStatus = "queued" | "sent" | "failed" | "skipped" | "pending";

export type StoredNotification = {
  notification_id: string;
  applicant_id: string;
  job_id: string;
  match_id: string;
  channel: NotificationChannel;
  notification_type: NotificationType;
  status: NotificationStatus;
  sent_at: string;
  opened_at: string;
  clicked_at: string;
  action: string;
  error: string;
  attempts: number;
  next_retry_at: string;
};

export type StoredInteraction = {
  interaction_id: string;
  applicant_id: string;
  job_id: string;
  interaction_type: "view" | "click" | "save" | "apply" | "not_relevant" | "dismiss" | "feedback";
  timestamp: string;
  detail: string;
};
