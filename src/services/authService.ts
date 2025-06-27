import { User, AuthState } from '../types';

class AuthService {
  private users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@btsmonitor.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      username: 'operator1',
      email: 'operator@btsmonitor.com',
      role: 'operator',
      team: 'ip',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      username: 'tech1',
      email: 'tech@btsmonitor.com',
      role: 'technician',
      team: 'power',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  private currentUser: User | null = null;
  private authListeners: ((authState: AuthState) => void)[] = [];

  constructor() {
    // Check for stored auth state
    const storedUser = localStorage.getItem('bts_auth_user');
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.notifyListeners();
      } catch (error) {
        localStorage.removeItem('bts_auth_user');
      }
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple password validation (in production, use proper hashing)
    const user = this.users.find(u => u.username === username && u.isActive);
    
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé ou inactif' };
    }

    // Simple password check (in production, use proper authentication)
    const validPasswords: Record<string, string> = {
      'admin': 'admin123',
      'operator1': 'operator123',
      'tech1': 'tech123'
    };

    if (validPasswords[username] !== password) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.currentUser = user;
    
    // Store in localStorage
    localStorage.setItem('bts_auth_user', JSON.stringify(user));
    
    this.notifyListeners();
    
    console.log(`✅ Connexion réussie: ${user.username} (${user.role})`);
    
    return { success: true };
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('bts_auth_user');
    this.notifyListeners();
    console.log('👋 Déconnexion réussie');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;

    const permissions: Record<string, string[]> = {
      admin: ['view_dashboard', 'manage_users', 'manage_alarms', 'manage_tickets', 'view_admin'],
      operator: ['view_dashboard', 'manage_tickets', 'view_alarms'],
      technician: ['view_dashboard', 'update_tickets', 'view_alarms']
    };

    return permissions[this.currentUser.role]?.includes(permission) || false;
  }

  // User management (admin only)
  getUsers(): User[] {
    if (!this.hasRole('admin')) {
      throw new Error('Accès non autorisé');
    }
    return this.users;
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    if (!this.hasRole('admin')) {
      throw new Error('Accès non autorisé');
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    console.log(`👤 Nouvel utilisateur créé: ${newUser.username}`);
    
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    if (!this.hasRole('admin')) {
      throw new Error('Accès non autorisé');
    }

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    console.log(`👤 Utilisateur mis à jour: ${this.users[userIndex].username}`);
    
    return this.users[userIndex];
  }

  deleteUser(id: string): boolean {
    if (!this.hasRole('admin')) {
      throw new Error('Accès non autorisé');
    }

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    const deletedUser = this.users.splice(userIndex, 1)[0];
    console.log(`👤 Utilisateur supprimé: ${deletedUser.username}`);
    
    return true;
  }

  // Auth state management
  subscribe(listener: (authState: AuthState) => void): () => void {
    this.authListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.authListeners.indexOf(listener);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    const authState: AuthState = {
      user: this.currentUser,
      isAuthenticated: this.currentUser !== null,
      isLoading: false
    };

    this.authListeners.forEach(listener => listener(authState));
  }

  // Get auth state
  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: this.currentUser !== null,
      isLoading: false
    };
  }
}

export const authService = new AuthService();