
import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});

apiClient.interceptors.request.use(
    (config) => {
        console.log("Request sent:", config.url);
        return config;
    },
    (error) => {
        console.error("Request error:", error.message);
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.log("Unauthorized or Forbidden");
        } else if (!error.response) {
            console.error("Network or CORS error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
