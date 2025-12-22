import axios from 'axios';

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = [];


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});


export const setApiToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401
            && !originalRequest._retry
            && !originalRequest.url?.includes('/auth/refresh')
        ) {


            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            resolve(api(originalRequest));
                        },
                        reject: (err: any) => reject(err),
                    });
                });
            }


            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                setApiToken(data.accessToken);
                originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
                processQueue(null, data.accessToken);


                return api(originalRequest);
            } catch (refreshError) {
                processQueue(err, null);
                setApiToken(null);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
            finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;