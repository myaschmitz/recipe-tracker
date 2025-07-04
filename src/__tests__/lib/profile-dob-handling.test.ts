/**
 * Test case to verify date of birth handling in profile updates
 */

import { profileSchema } from '@/lib/schemas';

describe('Profile Date of Birth Handling', () => {
  test('should accept profile data without date_of_birth', () => {
    const profileData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      name: 'Test User',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      // date_of_birth is intentionally omitted
    };

    const result = profileSchema.safeParse(profileData);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.date_of_birth).toBeUndefined();
    }
  });

  test('should accept profile data with empty string date_of_birth', () => {
    const profileData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      date_of_birth: '', // Empty string should be valid
    };

    const result = profileSchema.safeParse(profileData);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.date_of_birth).toBe('');
    }
  });

  test('should accept profile data with valid date_of_birth', () => {
    const profileData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      date_of_birth: '1990-01-01',
    };

    const result = profileSchema.safeParse(profileData);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.date_of_birth).toBe('1990-01-01');
    }
  });

  test('should simulate form data cleaning for API submission', () => {
    // Simulate the form data cleaning logic from AccountSettings component
    const formData = {
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      date_of_birth: '', // Empty string from form
    };

    // Clean the data as done in handleSubmit
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (key === 'date_of_birth') {
        acc[key] = value || undefined;
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    expect(cleanedData.date_of_birth).toBeUndefined();
    expect(cleanedData.username).toBe('testuser');
    expect(cleanedData.first_name).toBe('Test');
  });
});
