import { env } from '@/env';
import axios from 'axios';
import 'dotenv';

export const localApi = axios.create({
    baseURL: env.APP_URL,
    withCredentials: true,
    withXSRFToken: true,
});
