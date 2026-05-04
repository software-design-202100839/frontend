import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OtpSendRequest {
  phone: string;
  purpose: 'ACTIVATE' | 'PW_RESET';
}

export interface ActivateRequest {
  phone: string;
  otpCode: string;
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  phone: string;
}

export interface PasswordResetConfirmRequest {
  phone: string;
  otpCode: string;
  newPassword: string;
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
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  roleEntityId?: number;
  children?: Array<{ id: number; name: string }>;
  roleDetail?: {
    // TEACHER
    department?: string;
    currentClass?: {
      academicYear: number;
      grade: number;
      classNum: number;
      isHomeroom: boolean;
    };
    assignments?: Array<{
      grade: number;
      classNum: number;
      subject: string;
      academicYear: number;
    }>;
    // STUDENT
    currentEnrollment?: {
      academicYear: number;
      grade: number;
      classNum: number;
      studentNum: number;
    };
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

const authService = {
  async sendOtp(phone: string, purpose: 'ACTIVATE' | 'PW_RESET'): Promise<void> {
    await api.post('/auth/otp/send', { phone, purpose });
  },

  async activate(phone: string, otpCode: string, email: string, password: string): Promise<void> {
    await api.post('/auth/activate', { phone, otpCode, email, password } as ActivateRequest);
  },

  async requestPasswordReset(phone: string): Promise<void> {
    await api.post('/auth/password/reset/request', { phone } as PasswordResetRequest);
  },

  async confirmPasswordReset(phone: string, otpCode: string, newPassword: string): Promise<void> {
    await api.post('/auth/password/reset/confirm', {
      phone, otpCode, newPassword,
    } as PasswordResetConfirmRequest);
  },

  async login(request: LoginRequest): Promise<TokenResponse> {
    const { data } = await api.post<ApiResponse<TokenResponse>>('/auth/login', request);
    return data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken }).catch(() => {});
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
    return user ? (JSON.parse(user) as UserInfo) : null;
  },
};

export default authService;
