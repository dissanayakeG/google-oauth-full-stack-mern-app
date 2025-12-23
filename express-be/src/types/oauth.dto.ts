export type GoogleCallbackRequestQueryDTO = {
    code: string,
    error: string,
    state: string,
    scope: string,
    authuser: boolean,
    prompt: string
};