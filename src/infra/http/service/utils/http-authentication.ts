import axios from 'axios';

import { API } from '@/util/constants';

export const httpAuthenticator = axios.create({
  baseURL: API.BASE_URL
});
