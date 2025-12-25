import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../constants/common-constants";
import { getEmails } from "../api";
import type { GetEmailsParams } from "../types/index.type";

export const useEmails = (params : GetEmailsParams ) => {
    return useQuery({
        queryKey: [QUERY_KEYS.EMAILS, params],
        queryFn: () => getEmails(params),
    });

}