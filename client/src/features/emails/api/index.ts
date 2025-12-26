import api from '@/api';
import { API_URLS } from '@/constants/common-constants';
import type { GetEmailParams, GetEmailsParams } from '@/features/emails/types/index.type';

export const getEmails = async (params: GetEmailsParams) => {
  const { data } = await api.get(API_URLS.EMAIL_LIST, {
    params,
  });

  return data;
};

export const getEmail = async (params: GetEmailParams) => {
  const { data } = await api.get(`${API_URLS.EMAIL}/${params.id}`);

  return data;
};
