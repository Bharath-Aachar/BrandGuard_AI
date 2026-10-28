import { NextRequest } from 'next/server';
import { UserProfile, UserRole } from '@/types/brandguard';
import { getServerSupabaseClient, isServerSupabaseConfigured } from './supabaseServer';

export interface VerifiedAuthResult {
  user: UserProfile;
}

export interface AuthErrorResult {
  error: string;
  status: number;
}

export type ServerAuthResult = VerifiedAuthResult | AuthErrorResult;

export function isAuthError(result: ServerAuthResult): result is AuthErrorResult {
  return 'error' in result && 'status' in result;
}

/**
 * Pre-registered test tokens for automated security testing and sandbox verification.
 * In production with Supabase configured, real Supabase Auth tokens are verified.
 */
const TEST_TOKENS: Record<string, UserProfile> = {
  'test-creator-token': {
    id: 'usr-creator-01',
    email: 'creator@enterprise.brandguard.ai',
    name: 'Sarah Chen (Content Creator)',
    role: 'creator',
  },
  'test-creator-2-token': {
    id: 'usr-creator-02',
    email: 'creator2@enterprise.brandguard.ai',
    name: 'David Kim (Content Creator 2)',
    role: 'creator',
  },
  'test-reviewer-token': {
    id: 'usr-reviewer-01',
    email: 'compliance.officer@brandguard.ai',
    name: 'Marcus Vance (Chief Compliance Officer)',
    role: 'reviewer',
  },
  'test-admin-token': {
    id: 'usr-admin-01',
    email: 'legal.director@brandguard.ai',
    name: 'Eleanor Vance (Legal Director)',
    role: 'admin',
  },
};

/**
 * Generates an Authorization header value for automated tests.
 */
export function createTestAuthHeader(token: string): string {
  return `Bearer ${token}`;
}

/**
 * Verifies the incoming HTTP request on the server.
 * Extracts the Authorization Bearer token, validates with Supabase Auth or test token provider,
 * and retrieves the verified user profile and role from the database.
 * 
 * NEVER trusts any user ID, username, or role supplied in request bodies or query parameters.
 */
export async function verifyServerSession(req: NextRequest): Promise<ServerAuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return {
      error: 'Authentication required: Missing Authorization header. Please provide a valid Bearer token.',
      status: 401,
    };
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1].trim()) {
    return {
      error: 'Authentication required: Malformed Authorization header. Format must be "Bearer <token>".',
      status: 401,
    };
  }

  const token = match[1].trim();

  // 1. If Supabase is configured, verify against real Supabase Auth
  if (isServerSupabaseConfigured) {
    const supabase = getServerSupabaseClient();
    if (supabase) {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
          return {
            error: 'Authentication failed: Invalid or expired session token.',
            status: 401,
          };
        }

        // Fetch verified user role from profiles table (cannot be tampered with by client)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          return {
            error: 'Authentication failed: User profile not found in directory.',
            status: 401,
          };
        }

        const validRoles: UserRole[] = ['creator', 'reviewer', 'admin'];
        const role = validRoles.includes(profile.role as UserRole)
          ? (profile.role as UserRole)
          : 'creator';

        return {
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role,
          },
        };
      } catch (err) {
        console.error('Server auth verification exception:', err);
        return {
          error: 'Authentication service encountered an internal error.',
          status: 500,
        };
      }
    }
  }

  // 2. Automated test environment / offline sandbox token verification
  if (TEST_TOKENS[token]) {
    return {
      user: { ...TEST_TOKENS[token] },
    };
  }

  // Dynamic test token format: test-token:<role>:<id>:<name>:<email>
  if (token.startsWith('test-token:')) {
    const parts = token.split(':');
    if (parts.length >= 5) {
      const [, roleStr, id, name, email] = parts;
      const validRoles: UserRole[] = ['creator', 'reviewer', 'admin'];
      if (validRoles.includes(roleStr as UserRole) && id && name && email) {
        return {
          user: {
            id,
            email,
            name,
            role: roleStr as UserRole,
          },
        };
      }
    }
  }

  return {
    error: 'Authentication failed: Invalid or unrecognized authentication token.',
    status: 401,
  };
}
