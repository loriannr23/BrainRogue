export interface AuthUser {
  id: string;
  displayName: string;
}

export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  signInAnonymously(): Promise<AuthUser>;
  signOut(): Promise<void>;
}

export class LocalAuthService implements AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    return null;
  }

  async signInAnonymously(): Promise<AuthUser> {
    // TODO: Replace with Supabase/Firebase auth when online profiles are added.
    return { id: 'local-player', displayName: 'Local Player' };
  }

  async signOut(): Promise<void> {
    return;
  }
}
