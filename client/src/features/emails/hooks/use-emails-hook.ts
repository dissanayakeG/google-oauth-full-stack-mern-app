import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/common-constants';
import { getEmails } from '@/features/emails/api';
import type { GetEmailsParams } from '@/features/emails/types/index.type';

export const useEmails = (params: GetEmailsParams) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMAILS, params],
    queryFn: () => getEmails(params),
    refetchInterval: 30 * 1000, // fetch every 30 seconds, only for dev testing
    refetchOnWindowFocus: true,
  });
};
