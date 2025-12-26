import api from '@/api';
import { API_URLS } from '@/constants/common-constants';
import type { ApiResponse } from '@/types/api-response';
import type { User } from '@/types/user-type';

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<{ user: User }>>(API_URLS.USER_ME);
  return data.data.user;
};
