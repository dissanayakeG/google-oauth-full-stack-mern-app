import api from "../../../api";
import { API_URLS } from "../../../constants/common-constants";
import type { GetEmailsParams } from "../types/index.type";

export const getEmails = async (params: GetEmailsParams) => {
    const { data } = await api.get(API_URLS.EMAIL_LIST, {
        params
    });

    return data;
};