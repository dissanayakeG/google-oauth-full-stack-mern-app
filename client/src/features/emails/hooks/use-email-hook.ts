import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/common-constants';
import { getEmail } from '@/features/emails/api';
import type { GetEmailParams } from '@/features/emails/types/index.type';

export const useEmail = (params: GetEmailParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMAIL, params],
    queryFn: () => getEmail(params),
    enabled: !!params.id, // only run the query if id is provided
  });
};
