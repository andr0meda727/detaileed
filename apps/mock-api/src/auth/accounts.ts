/** A user of the fake Supabase. Demo accounts have a password; other sample people only appear in data. */
export interface AuthUser {
  id: string;
  email: string;
  /** Null for people who can't sign in (team members and customers who only appear in the data). */
  password: string | null;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastSignInAt: string | null;
  /** Supabase `user_metadata` (`first_name`, `last_name`, `needs_password`, …). */
  metadata: Record<string, unknown>;
}

/** The password of every demo account. */
export const DEMO_PASSWORD = 'demo1234';

export const DEMO_EMAILS = {
  owner: 'wlasciciel@demo.detaileed.com',
  employee: 'pracownik@demo.detaileed.com',
  customer: 'klient@demo.detaileed.com',
} as const;

export const fullName = (user: Pick<AuthUser, 'firstName' | 'lastName'>) => `${user.firstName} ${user.lastName}`.trim();

/** Supabase's user object, as `/auth/v1/user` and the token endpoints return it. */
export function toSupabaseUser(user: AuthUser) {
  const confirmedAt = user.createdAt;
  return {
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    email_confirmed_at: confirmedAt,
    phone: '',
    confirmed_at: confirmedAt,
    last_sign_in_at: user.lastSignInAt ?? confirmedAt,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      ...user.metadata,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      email_verified: true,
      phone_verified: false,
      sub: user.id,
    },
    identities: [
      {
        identity_id: user.id,
        id: user.id,
        user_id: user.id,
        identity_data: { email: user.email, email_verified: true, phone_verified: false, sub: user.id },
        provider: 'email',
        last_sign_in_at: user.lastSignInAt ?? confirmedAt,
        created_at: user.createdAt,
        updated_at: user.createdAt,
        email: user.email,
      },
    ],
    created_at: user.createdAt,
    updated_at: user.lastSignInAt ?? user.createdAt,
    is_anonymous: false,
  };
}
