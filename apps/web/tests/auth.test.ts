import { describe, expect, it } from 'vitest';
import { newPasswordSchema, signUpSchema } from '@/features/auth/model/schemas';
import { authErrorMessage, LINK_EXPIRED } from '@/features/auth/model/authErrors';
import { safeReturnPath, signInPath } from '@/features/auth/model/returnPath';

describe('safeReturnPath', () => {
  it('keeps paths on this site', () => {
    expect(safeReturnPath('/studio/s1/book?uslugi=a')).toBe('/studio/s1/book?uslugi=a');
  });

  it('refuses other origins and falls back', () => {
    for (const next of ['https://evil.com', '//evil.com', '/\\evil.com', '', null, undefined]) {
      expect(safeReturnPath(next)).toBe('/account');
    }
  });

  it('builds the sign-in link with the way back', () => {
    expect(signInPath('/studio/s1/book')).toBe('/sign-in?next=%2Fstudio%2Fs1%2Fbook');
  });
});

describe('signUpSchema', () => {
  const valid = {
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna@example.com',
    password: 'Haslo1234',
    confirmPassword: 'Haslo1234',
  };

  it('accepts a strong password typed twice', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('asks for a capital letter, a digit and matching passwords', () => {
    expect(signUpSchema.safeParse({ ...valid, password: 'haslo1234', confirmPassword: 'haslo1234' }).success).toBe(
      false,
    );
    expect(signUpSchema.safeParse({ ...valid, password: 'HasloHaslo', confirmPassword: 'HasloHaslo' }).success).toBe(
      false,
    );
    const mismatch = signUpSchema.safeParse({ ...valid, confirmPassword: 'Inne1234' });
    expect(mismatch.error?.issues[0].path).toEqual(['confirmPassword']);
  });
});

describe('newPasswordSchema', () => {
  it('uses the sign-up password rule and wants it twice', () => {
    expect(newPasswordSchema.safeParse({ password: 'Haslo1234', confirmPassword: 'Haslo1234' }).success).toBe(true);
    expect(newPasswordSchema.safeParse({ password: 'haslo', confirmPassword: 'haslo' }).success).toBe(false);
    const mismatch = newPasswordSchema.safeParse({ password: 'Haslo1234', confirmPassword: 'Haslo12345' });
    expect(mismatch.error?.issues[0].path).toEqual(['confirmPassword']);
  });
});

describe('authErrorMessage', () => {
  it('translates known codes and old messages', () => {
    expect(authErrorMessage({ code: 'invalid_credentials' })).toBe('Nieprawidłowy e-mail lub hasło.');
    expect(authErrorMessage({ message: 'User already registered' })).toMatch(/już istnieje/);
    expect(authErrorMessage({ code: 'something_else' })).toMatch(/Spróbuj ponownie/);
  });

  it('explains password and link errors', () => {
    expect(authErrorMessage({ code: 'same_password' })).toMatch(/różnić od obecnego/);
    for (const code of ['otp_expired', 'flow_state_expired', 'bad_code_verifier']) {
      expect(authErrorMessage({ code })).toBe(LINK_EXPIRED);
    }
  });
});
