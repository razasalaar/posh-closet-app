import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Key used to persist the page to return to after Google OAuth
export const OAUTH_RETURN_KEY = 'oauth_return_path';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: (returnPath?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkAdmin(session.user.id), 0);

          // After Google OAuth, redirect back to stored path (e.g. /checkout)
          if (event === 'SIGNED_IN') {
            const returnPath = localStorage.getItem(OAUTH_RETURN_KEY);
            
            // Check if cart has items
            let hasCartItems = false;
            try {
              const cartState = localStorage.getItem('posh-closet-cart');
              if (cartState) {
                const parsed = JSON.parse(cartState);
                if (parsed.state && parsed.state.items && parsed.state.items.length > 0) {
                  hasCartItems = true;
                }
              }
            } catch (e) {}

            if (returnPath) {
              localStorage.removeItem(OAUTH_RETURN_KEY);
              // Only redirect if we're not already on the target page
              if (window.location.pathname !== returnPath) {
                window.location.replace(returnPath);
              }
              return;
            } else if (hasCartItems && window.location.pathname !== '/checkout') {
              window.location.replace('/checkout');
              return;
            }
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Redirect to checkout if there's a pending checkout state
    const hasCheckoutState = localStorage.getItem('checkout_state');
    const redirectPath = hasCheckoutState ? '/checkout' : '';
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}${redirectPath}`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async (returnPath?: string) => {
    // If a returnPath is passed, persist it so onAuthStateChange can navigate there after OAuth
    if (returnPath) {
      localStorage.setItem(OAUTH_RETURN_KEY, returnPath);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
