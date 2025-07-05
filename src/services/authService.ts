import { User, AuthState } from '../types';
import { emailService } from './emailService';

class AuthService {
  private users: User[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@mtn.cm',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      emailVerified: true
    },
    {
      id: '2',
      username: 'operator1',
      email: 'operator.ip@mtn.cm',
      role: 'operator',
      team: 'ip',
      isActive: true,
      createdAt: new Date().toISOString(),
      emailVerified: true
    },
    {
      id: '3',
      username: 'tech1',
      email: 'tech.power@mtn.cm',
      role: 'technician',
      team: 'power',
      isActive: true,
      createdAt: new Date().toISOString(),
      emailVerified: true
    },
    {
      id: '4',
      username: 'tech2',
      email: 'tech.transmission@mtn.cm',
      role: 'technician',
      team: 'transmission',
      isActive: true,
      createdAt: new Date().toISOString(),
      emailVerified: true
    },
    {
      id: '5',
      username: 'tech3',
      email: 'tech.bss@mtn.cm',
      role: 'technician',
      team: 'bss',
      isActive: true,
      createdAt: new Date().toISOString(),
      emailVerified: true
    }
  ];

  private currentUser: User | null = null;
  private authListeners: ((authState: AuthState) => void)[] = [];
  private pendingVerification: { user: User; code: string; expiresAt: number } | null = null;

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

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  private async sendVerificationEmail(user: User, code: string): Promise<boolean> {
    try {
      // Use the existing email service to send verification code
      const templateParams = {
        to_email: user.email,
        to_name: user.username,
        verification_code: code,
        user_name: user.username,
        expires_in: '10 minutes',
        from_name: 'MTN Cameroon BTS Monitor',
        subject: `🔐 Code de vérification MTN BTS - ${code}`
      };

      console.log(`📧 Envoi du code de vérification à ${user.email}`);
      console.log(`🔐 Code: ${code}`);
      console.log(`👤 Utilisateur: ${user.username}`);
      console.log(`⏰ Expire dans 10 minutes`);

      // For demo purposes, we'll simulate email sending
      // In production, you would use the actual email service
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du code de vérification:', error);
      return false;
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple password validation
    const user = this.users.find(u => u.username === username && u.isActive);
    
    if (!user) {
      return { success: false, error: 'Utilisateur non trouvé ou inactif' };
    }

    // Simple password check
    const validPasswords: Record<string, string> = {
      'admin': 'admin123',
      'operator1': 'operator123',
      'tech1': 'tech123',
      'tech2': 'tech123',
      'tech3': 'tech123'
    };

    if (validPasswords[username] !== password) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    // Generate and send verification code
    const verificationCode = this.generateVerificationCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.pendingVerification = {
      user,
      code: verificationCode,
      expiresAt
    };

    const emailSent = await this.sendVerificationEmail(user, verificationCode);
    
    if (!emailSent) {
      return { success: false, error: 'Erreur lors de l\'envoi du code de vérification' };
    }

    console.log(`✅ Code de vérification envoyé à ${user.email}`);
    console.log(`🔐 Code pour test: ${verificationCode}`);
    
    return { success: true, requiresVerification: true };
  }

  async verifyCode(code: string): Promise<{ success: boolean; error?: string }> {
    if (!this.pendingVerification) {
      return { success: false, error: 'Aucune vérification en cours' };
    }

    if (Date.now() > this.pendingVerification.expiresAt) {
      this.pendingVerification = null;
      return { success: false, error: 'Code de vérification expiré' };
    }

    if (code.toUpperCase() !== this.pendingVerification.code) {
      return { success: false, error: 'Code de vérification incorrect' };
    }

    // Verification successful
    const user = this.pendingVerification.user;
    user.lastLogin = new Date().toISOString();
    this.currentUser = user;
    this.pendingVerification = null;
    
    // Store in localStorage
    localStorage.setItem('bts_auth_user', JSON.stringify(user));
    
    this.notifyListeners();
    
    console.log(`✅ Connexion réussie: ${user.username} (${user.role})`);
    
    return { success: true };
  }

  logout(): void {
    this.currentUser = null;
    this.pendingVerification = null;
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

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'emailVerified'>): User {
    if (!this.hasRole('admin')) {
      throw new Error('Accès non autorisé');
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      emailVerified: false
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

  // Get pending verification info (for UI)
  getPendingVerification(): { email: string; expiresAt: number } | null {
    if (!this.pendingVerification) return null;
    
    return {
      email: this.pendingVerification.user.email,
      expiresAt: this.pendingVerification.expiresAt
    };
  }

  // Resend verification code
  async resendVerificationCode(): Promise<{ success: boolean; error?: string }> {
    if (!this.pendingVerification) {
      return { success: false, error: 'Aucune vérification en cours' };
    }

    const newCode = this.generateVerificationCode();
    const newExpiresAt = Date.now() + 10 * 60 * 1000;

    this.pendingVerification.code = newCode;
    this.pendingVerification.expiresAt = newExpiresAt;

    const emailSent = await this.sendVerificationEmail(this.pendingVerification.user, newCode);
    
    if (!emailSent) {
      return { success: false, error: 'Erreur lors de l\'envoi du code' };
    }

    console.log(`🔄 Nouveau code envoyé: ${newCode}`);
    return { success: true };
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