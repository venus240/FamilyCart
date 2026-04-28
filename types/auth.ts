import type { Session, User } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  fullName: string;
};

export type AuthResult = {
  error: string | null;
};
