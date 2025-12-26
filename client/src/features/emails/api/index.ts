import api from '@/api';
import { API_URLS } from '@/constants/common-constants';
import type { ApiResponse } from '@/types/api-response';
import type {
  EmailDetail,
  EmailsResponse,
  GetEmailParams,
  GetEmailsParams,
} from '@/features/emails/types/index.type';

export const getEmails = async (params: GetEmailsParams): Promise<EmailsResponse> => {
  const { data } = await api.get<ApiResponse<EmailsResponse>>(API_URLS.EMAILS, {
    params,
  });

  return data.data;
};

export const getEmail = async (params: GetEmailParams): Promise<EmailDetail> => {
  const { data } = await api.get<ApiResponse<EmailDetail>>(`${API_URLS.EMAIL}/${params.id}`);

  return data.data;
};
