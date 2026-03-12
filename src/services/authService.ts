import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'TEACHER' | 'STUDENT' | 'PARENT';
  roleDetail?: Record<string, unknown>;
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
  async signup(request: SignupRequest): Promise<UserInfo> {
    const { data } = await api.post<ApiResponse<UserInfo>>('/auth/signup', request);
    return data.data;
  },

  async login(request: LoginRequest): Promise<TokenResponse> {
    const { data } = await api.post<ApiResponse<TokenResponse>>('/auth/login', request);
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
