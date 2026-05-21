import { describe, it, expect } from 'vitest';
import { validatePassword } from '../src/utils/security';

describe('validatePassword', () => {
  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePassword('Short1!');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('at least 8 characters');
  });

  it('should reject passwords lacking uppercase letters', () => {
    const result = validatePassword('no_upper_123!');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('one uppercase letter');
  });

  it('should reject passwords lacking lowercase letters', () => {
    const result = validatePassword('NO_LOWER_123!');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('one lowercase letter');
  });

  it('should reject passwords lacking numbers', () => {
    const result = validatePassword('NoNumbers!');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('one number');
  });

  it('should reject passwords lacking special characters', () => {
    const result = validatePassword('NoSpecial123');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('one special character');
  });

  it('should accept valid complex passwords', () => {
    const result = validatePassword('ValidP@ssword123');
    expect(result.valid).toBe(true);
  });
});
