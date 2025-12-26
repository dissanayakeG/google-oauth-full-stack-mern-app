import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/common-constants';
import { getMe } from '@/features/users/api';

export const useMe = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER, 'me'],
    queryFn: getMe,
  });
};
