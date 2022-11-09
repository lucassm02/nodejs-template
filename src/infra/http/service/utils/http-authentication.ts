import { API } from '@/util/constants';
import axios from 'axios';

export const httpAuthenticator = axios.create({
  baseURL: API.AUTHENTICATOR,
});
