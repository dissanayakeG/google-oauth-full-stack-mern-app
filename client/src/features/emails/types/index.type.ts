export type GetEmailsParams = {
  offset: number;
  limit: number;
  search?: string;
};

export type GetEmailParams = {
  id: string;
};

export type Email = {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  dateReceived: string;
  isRead: boolean;
};

export type EmailsResponse = {
  emails: Email[];
  total: number;
  hasMore: boolean;
};
