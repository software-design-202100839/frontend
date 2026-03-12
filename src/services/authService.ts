import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  email: string;
  name: string;
  role: 'TEACHER' | 'STUDENT' | 'PARENT';
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

const authService = {
  async login(request: LoginRequest): Promise<TokenResponse> {
    const { data } = await api.post<ApiResponse<TokenResponse>>('/auth/login', request);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getMe(): Promise<UserInfo> {
    const { data } = await api.get<ApiResponse<UserInfo>>('/auth/me');
    return data.data;
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  getStoredUser(): UserInfo | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
