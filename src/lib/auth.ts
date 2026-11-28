import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

export type AuthProviderType = 'google' | 'microsoft' | 'apple' | 'email';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: AuthProviderType;
  avatarUrl?: string;
  createdAt: string;
}

const STORAGE_KEY = 'jogosdehoje_auth_user';

const AUTHORIZED_ADMIN_EMAILS = [
  'klaw.com@gmail.com',
  'klawdhynney@gmail.com',
];

/**
 * Verifica estritamente se o e-mail possui privilégios de gestor
 */
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Retorna o usuário autenticado atualmente armazenado em cache local
 */
export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Salva ou remove o usuário autenticado no cache local
 */
export function setStoredUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event('jogosdehoje_auth_change'));
  } catch (err) {
    console.warn('[Auth] Falha ao persistir usuário:', err);
  }
}

/**
 * Autenticação Social Oficial via Supabase OAuth (Google, Microsoft, Apple)
 */
export async function signInWithSocial(
  provider: 'google' | 'microsoft' | 'apple'
): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  const supabaseProvider = provider === 'microsoft' ? 'azure' : provider;

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider as any,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Erro ao conectar com provedor.',
        };
      }

      if (data?.url) {
        window.location.href = data.url;
        return {
          success: true,
          message: `Redirecionando para login seguro com ${provider.toUpperCase()}...`,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Falha na conexão com serviço de autenticação.',
      };
    }
  }

  return {
    success: false,
    message: 'Serviço de autenticação temporariamente indisponível.',
  };
}

/**
 * Envia código ou link de acesso real para o e-mail informado
 */
export async function sendEmailOtp(
  email: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Por favor, digite um endereço de e-mail válido.',
    };
  }

  if (supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          shouldCreateUser: true,
        },
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Falha ao enviar e-mail de confirmação.',
        };
      }

      return {
        success: true,
        message: `Código ou link de confirmação enviado para ${cleanEmail}! Verifique sua caixa de entrada e spam.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Erro ao solicitar envio de código por e-mail.',
      };
    }
  }

  return {
    success: false,
    message: 'Serviço de e-mail temporariamente indisponível.',
  };
}

/**
 * Valida o código OTP real de 6 dígitos recebido por e-mail
 */
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ success: boolean; user?: UserProfile; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim().replace(/\D/g, '');

  if (!cleanToken || cleanToken.length < 6) {
    return {
      success: false,
      message: 'Digite o código de 6 dígitos recebido.',
    };
  }

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      });

      if (error || !data.user) {
        return {
          success: false,
          message: error?.message || 'Código incorreto ou expirado. Tente solicitar um novo.',
        };
      }

      const supaUser = data.user;
      const user: UserProfile = {
        id: supaUser.id,
        name: supaUser.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: supaUser.email,
        provider: 'email',
        createdAt: supaUser.created_at,
      };

      setStoredUser(user);
      return {
        success: true,
        user,
        message: 'Login realizado com sucesso!',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Falha ao validar código.',
      };
    }
  }

  return {
    success: false,
    message: 'Servidor de autenticação indisponível.',
  };
}

/**
 * Encerra a sessão
 */
export async function signOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignora erro
    }
  }
  setStoredUser(null);
}

/**
 * Hook central de autenticação
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('jogosdehoje_auth_change', handleAuthChange);

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          const supaUser = data.session.user;
          const provider = (supaUser.app_metadata?.provider || 'google') as AuthProviderType;
          const mappedUser: UserProfile = {
            id: supaUser.id,
            name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Torcedor',
            email: supaUser.email,
            provider,
            avatarUrl: supaUser.user_metadata?.avatar_url,
            createdAt: supaUser.created_at,
          };
          setStoredUser(mappedUser);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const supaUser = session.user;
          const provider = (supaUser.app_metadata?.provider || 'google') as AuthProviderType;
          const mappedUser: UserProfile = {
            id: supaUser.id,
            name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'Torcedor',
            email: supaUser.email,
            provider,
            avatarUrl: supaUser.user_metadata?.avatar_url,
            createdAt: supaUser.created_at,
          };
          setStoredUser(mappedUser);
        } else if (_event === 'SIGNED_OUT') {
          setStoredUser(null);
        }
      });

      return () => {
        window.removeEventListener('jogosdehoje_auth_change', handleAuthChange);
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      window.removeEventListener('jogosdehoje_auth_change', handleAuthChange);
    };
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action();
      } else {
        setPendingAction(() => action);
        setIsAuthModalOpen(true);
      }
    },
    [user]
  );

  const handleAuthSuccess = useCallback(
    (newUser: UserProfile) => {
      setUser(newUser);
      setIsAuthModalOpen(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    },
    [pendingAction]
  );

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: isAuthorizedAdmin(user?.email),
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => {
      setIsAuthModalOpen(false);
      setPendingAction(null);
    },
    requireAuth,
    handleAuthSuccess,
    signOut,
  };
}
