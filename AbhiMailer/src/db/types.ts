export type CampaignStatus =
  | 'DRAFT' | 'VALIDATING' | 'READY' | 'RUNNING'
  | 'PAUSED' | 'COMPLETED' | 'STOPPED' | 'FAILED';

export type MessageStatus =
  | 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED'
  | 'RETRYING' | 'SKIPPED' | 'SUPPRESSED' | 'DELIVERY_UNKNOWN';

export type SuppressionReason = 'UNSUBSCRIBED' | 'BOUNCED' | 'INVALID' | 'MANUAL' | 'OTHER';

export interface Account {
  id: string;
  display_name: string;
  email: string;
  smtp_host: string;
  smtp_port: number;
  security: 'SSL' | 'STARTTLS' | 'NONE';
  username: string;
  password_enc: string;
  daily_limit: number;
  delay_seconds: number;
  created_at: string;
  updated_at: string;
  last_test_at?: string | null;
  last_test_status?: string | null;
}

export interface Lead {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  website?: string | null;
  industry?: string | null;
  source: string;
  raw_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  account_id: string | null;
  subject_template: string;
  body_text_template: string | null;
  body_html_template: string | null;
  reply_to: string | null;
  unsubscribe_footer: boolean;
  daily_limit: number | null;
  delay_seconds: number | null;
  status: CampaignStatus;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  preflight: Record<string, unknown> | null;
}

export interface Message {
  id: string;
  campaign_id: string;
  lead_id: string | null;
  account_id: string | null;
  recipient: string;
  rendered_subject: string | null;
  rendered_text: string | null;
  rendered_html: string | null;
  status: MessageStatus;
  attempt_count: number;
  max_retries: number;
  last_error: string | null;
  smtp_message_id: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  next_attempt_at: string | null;
  locked_at: string | null;
}

export interface Suppression {
  id: string;
  email: string;
  reason: SuppressionReason;
  note: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  campaign_id: string | null;
  message_id: string | null;
  lead_id: string | null;
  type: string;
  detail: Record<string, unknown>;
  created_at: string;
}
