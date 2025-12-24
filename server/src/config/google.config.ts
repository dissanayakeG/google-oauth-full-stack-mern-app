import { google } from 'googleapis';
import Environment from '../config/env.config';

export const createOAuth2Client = () => {
    return new google.auth.OAuth2(
        Environment.GOOGLE_CLIENT_ID,
        Environment.GOOGLE_CLIENT_SECRET,
        Environment.GOOGLE_REDIRECT_URL
    );
};

export const getAuthenticatedClient = (tokens: any) => {
    const client = createOAuth2Client();
    client.setCredentials(tokens);
    return client;
};

export const getGmailClient = (auth: any) => {
    return google.gmail({ version: 'v1', auth });
};