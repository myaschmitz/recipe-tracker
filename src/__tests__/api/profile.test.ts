import { profileSchema } from '@/lib/schemas';

describe('Profile API Data Validation', () => {
  test('should validate profile update data with all new fields', () => {
    const profileUpdateData = {
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

    const result = profileSchema.safeParse(profileUpdateData);
    expect(result.success).toBe(true);

    if (result.success) {
      // Verify all the new fields are properly parsed
      expect(result.data.username).toBe('testuser');
      expect(result.data.name).toBe('Test User');
      expect(result.data.first_name).toBe('Test');
      expect(result.data.last_name).toBe('User');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.phone).toBe('+1234567890');
      expect(result.data.bio).toBe('A passionate cook and recipe enthusiast');
      expect(result.data.date_of_birth).toBe('1990-01-01');
      expect(result.data.timezone).toBe('America/Los_Angeles');
      expect(result.data.language).toBe('en');
      expect(result.data.theme_preference).toBe('dark');
      expect(result.data.dietary_restrictions).toEqual(['vegetarian', 'gluten-free']);
      expect(result.data.is_private).toBe(false);
      expect(result.data.email_notifications).toBe(true);
    }
  });

  test('should validate partial profile updates', () => {
    const partialUpdate = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      bio: 'Updated bio',
      language: 'es',
      dietary_restrictions: ['vegan'],
    };

    const result = profileSchema.safeParse(partialUpdate);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.bio).toBe('Updated bio');
      expect(result.data.language).toBe('es');
      expect(result.data.dietary_restrictions).toEqual(['vegan']);
      // Should have default values for unspecified fields
      expect(result.data.theme_preference).toBe('system');
      expect(result.data.is_private).toBe(false);
      expect(result.data.email_notifications).toBe(true);
    }
  });

  test('should reject invalid profile data', () => {
    const invalidData = {
      id: 'invalid-uuid',
      username: 'ab', // too short
      email: 'invalid-email', // invalid email format
    };

    const result = profileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(issue => issue.path.includes('id'))).toBe(true); // UUID validation
      expect(issues.some(issue => issue.path.includes('username'))).toBe(true); // Length validation
      expect(issues.some(issue => issue.path.includes('email'))).toBe(true); // Email validation
    }
  });

  test('should handle dietary restrictions array correctly', () => {
    let profileWithDietRestrictions = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      dietary_restrictions: [] as string[],
    };

    // Empty array should be valid
    let result = profileSchema.safeParse(profileWithDietRestrictions);
    expect(result.success).toBe(true);

    // Array with items should be valid
    profileWithDietRestrictions = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      dietary_restrictions: ['vegan', 'nut-free', 'lactose-intolerant'],
    };
    result = profileSchema.safeParse(profileWithDietRestrictions);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.dietary_restrictions).toEqual(['vegan', 'nut-free', 'lactose-intolerant']);
    }
  });

  test('should validate theme preferences', () => {
    const validThemes = ['light', 'dark', 'system'];
    
    validThemes.forEach(theme => {
      const profileData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        theme_preference: theme,
      };

      const result = profileSchema.safeParse(profileData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.theme_preference).toBe(theme);
      }
    });
  });

  test('should validate privacy settings', () => {
    const profileData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'testuser',
      is_private: true,
      email_notifications: false,
    };

    const result = profileSchema.safeParse(profileData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.is_private).toBe(true);
      expect(result.data.email_notifications).toBe(false);
    }
  });
});
