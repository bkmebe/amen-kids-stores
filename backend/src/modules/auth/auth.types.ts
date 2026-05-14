export interface User {
  id: string;
  email: string;
  role: string;
  language: string;
  created_at: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}
