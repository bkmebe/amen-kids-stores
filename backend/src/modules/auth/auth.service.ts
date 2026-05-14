import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { LoginInput, AuthResponse, User } from './auth.types';

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${input.email},email.eq.${input.email}@amenkids.com`)
      .limit(1);

    if (error || !users || users.length === 0) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(input.password, user.password_hash);

    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        language: user.language || 'en',
        created_at: user.created_at,
      },
    };
  },

  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, language, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw ApiError.notFound('User not found');
    }

    return data;
  },

  async updateLanguage(userId: string, language: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ language })
      .eq('id', userId);

    if (error) {
      throw ApiError.internal('Failed to update language');
    }
  },
};
