import { NextResponse } from 'next/server';
import { requireRole, handleApiError } from '@/lib/api';

export async function GET() {
  try {
    // Require admin role
    await requireRole('admin');

    const roles = [
      {
        value: 'user',
        label: 'User',
        description: 'Can create and manage their own recipes and collections',
        permissions: [
          'Create recipes',
          'Edit own recipes',
          'Delete own recipes',
          'Create collections',
          'Edit own collections',
          'View public collections'
        ]
      },
      {
        value: 'moderator',
        label: 'Moderator',
        description: 'Extended permissions for content moderation',
        permissions: [
          'All user permissions',
          'View and moderate public content',
          'Content flagging and review',
          'Extended reporting capabilities'
        ]
      },
      {
        value: 'admin',
        label: 'Administrator',
        description: 'Full system access',
        permissions: [
          'All moderator permissions',
          'Manage all recipes and collections',
          'User management',
          'Role assignment',
          'System configuration',
          'Database administration'
        ]
      }
    ];

    return NextResponse.json(roles);
  } catch (error: any) {
    if (error.message.includes('permissions') || error.message.includes('role required')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return handleApiError(error, 'fetching roles');
  }
}
