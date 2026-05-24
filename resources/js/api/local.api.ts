import axios from 'axios';
import 'dotenv';

export const localApiBaseUrl = 'http://localhost:8000';

export const localApi = axios.create({
    baseURL: `${localApiBaseUrl}/api`,
    withCredentials: true,
    withXSRFToken: true,
});
