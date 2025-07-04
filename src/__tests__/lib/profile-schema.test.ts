import { profileSchema, ProfileSchema } from '@/lib/schemas';

describe('Profile Schema Validation', () => {
  test('should validate complete profile data', () => {
    const validProfile: ProfileSchema = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      name: 'Test User',
      first_name: 'Test',
      last_name: 'User',
      avatar_url: 'https://example.com/avatar.jpg',
      location: 'San Francisco, CA',
      email: 'test@example.com',
      phone: '+1234567890',
      bio: 'A passionate cook and recipe enthusiast',
      date_of_birth: '1990-01-01',
      timezone: 'America/Los_Angeles',
      language: 'en',
      theme_preference: 'dark',
      dietary_restrictions: ['vegetarian', 'gluten-free'],
      is_private: false,
      email_notifications: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  test('should validate minimal profile data', () => {
    const minimalProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
    };

    const result = profileSchema.safeParse(minimalProfile);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.language).toBe('en'); // default value
      expect(result.data.theme_preference).toBe('system'); // default value
      expect(result.data.is_private).toBe(false); // default value
      expect(result.data.email_notifications).toBe(true); // default value
    }
  });

  test('should fail validation for invalid username (too short)', () => {
    const invalidProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'ab', // too short (must be at least 3 characters)
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  test('should fail validation for invalid UUID', () => {
    const invalidProfile = {
      id: 'invalid-uuid',
      username: 'testuser',
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  test('should fail validation for invalid email', () => {
    const invalidProfile = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      email: 'invalid-email',
    };

    const result = profileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  test('should allow empty date of birth', () => {
    const profileWithoutDOB = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      date_of_birth: undefined,
    };

    const result = profileSchema.safeParse(profileWithoutDOB);
    expect(result.success).toBe(true);

    // Also test with empty string (which should be filtered out)
    const profileWithEmptyDOB = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      date_of_birth: '',
    };

    const result2 = profileSchema.safeParse(profileWithEmptyDOB);
    expect(result2.success).toBe(true);
  });

  test('should validate dietary restrictions array', () => {
    const profileWithDietaryRestrictions = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      dietary_restrictions: ['vegan', 'nut-free', 'lactose-intolerant'],
    };

    const result = profileSchema.safeParse(profileWithDietaryRestrictions);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.dietary_restrictions).toEqual(['vegan', 'nut-free', 'lactose-intolerant']);
    }
  });
});
