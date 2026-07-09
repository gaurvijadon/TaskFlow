import api from './api';
import type { User } from '../types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: User;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResult> {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginData): Promise<AuthResult> {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.user;
  },
};
